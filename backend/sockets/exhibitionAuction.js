import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../Models/User.js";
import Exibition from "../Models/Exibition.js";
import ArtWork from "../Models/ArtWork.js";
import { putAuctionWinInCart } from "../Utils/putAuctionWinInCart.js";

const SILENCE_MS = 10_000;

function roomName(exhibitionId) {
  return `exhibition:${exhibitionId}`;
}

function sessionKey(exhibitionId, artworkId) {
  return `${exhibitionId}:${artworkId}`;
}

/** @type {Map<string, ReturnType<typeof createEmptySession>>} */
const sessions = new Map();

function createEmptySession(exhibitionId, artworkId, reservePrice, durationMs) {
  return {
    exhibitionId,
    artworkId,
    reservePrice,
    durationMs,
    status: "idle",
    currentAmount: 0,
    highBidderId: null,
    highBidderUsername: null,
    auctionEndsAt: null,
    finalized: false,
    silenceTimer: null,
    deadlineTimer: null,
  };
}

function clearTimers(s) {
  if (s.silenceTimer) {
    clearTimeout(s.silenceTimer);
    s.silenceTimer = null;
  }
  if (s.deadlineTimer) {
    clearTimeout(s.deadlineTimer);
    s.deadlineTimer = null;
  }
}

function saleForArtwork(exhibition, artworkId) {
  const rows = exhibition?.auctionSales;
  if (!Array.isArray(rows)) return null;
  const sid = String(artworkId);
  for (let i = rows.length - 1; i >= 0; i--) {
    if (String(rows[i].artworkId) === sid) return rows[i];
  }
  return null;
}

function artworkInExhibition(exhibition, artworkId) {
  return (exhibition?.artworkIds ?? []).some((id) => String(id) === String(artworkId));
}

function publicState(s, now = Date.now()) {
  return {
    exhibitionId: s.exhibitionId,
    artworkId: s.artworkId,
    status: s.status,
    reservePrice: s.reservePrice,
    currentAmount: s.currentAmount,
    highBidderId: s.highBidderId,
    highBidderUsername: s.highBidderUsername,
    auctionEndsAt: s.auctionEndsAt,
    silenceEndsAt:
      s.status === "running" && s.highBidderId ? now + SILENCE_MS : null,
    minNextBid:
      s.currentAmount > 0
        ? s.currentAmount + 0.01
        : s.reservePrice,
  };
}

async function persistSale(exhibitionId, artworkId, winnerUserId, winnerUsername, winningBid, reason) {
  await Exibition.updateOne(
    { _id: exhibitionId },
    {
      $push: {
        auctionSales: {
          artworkId,
          winnerUserId,
          winnerUsername: winnerUsername || "User",
          winningBid,
          reason,
          soldAt: new Date(),
        },
      },
    },
  );
}

export function attachExhibitionAuction(io) {
  io.use(async (socket, next) => {
    socket.user = null;
    try {
      const token =
        socket.handshake.auth?.token ||
        (typeof socket.handshake.headers?.authorization === "string"
          ? socket.handshake.headers.authorization.replace(/^Bearer\s+/i, "")
          : null);
      if (!token) return next();
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const u = await User.findById(decoded.userId).select("username email");
      if (u) {
        socket.user = {
          _id: u._id.toString(),
          username: u.username,
          email: u.email,
        };
      }
    } catch {
      /* optional */
    }
    next();
  });

  io.on("connection", (socket) => {
    const finalize = async (exhibitionId, artworkId, reason, ioRef) => {
      const key = sessionKey(exhibitionId, artworkId);
      const s = sessions.get(key);
      if (!s || s.finalized) return;
      if (s.status === "sold" || s.status === "ended_unsold") return;

      clearTimers(s);

      if (s.status !== "running") {
        return;
      }

      if (!s.highBidderId || s.currentAmount <= 0) {
        s.finalized = true;
        s.status = "ended_unsold";
        ioRef.to(roomName(exhibitionId)).emit("auction_state", {
          ...publicState(s),
          endedReason: reason,
        });
        return;
      }

      s.finalized = true;
      s.status = "sold";
      try {
        await persistSale(
          exhibitionId,
          artworkId,
          s.highBidderId,
          s.highBidderUsername,
          s.currentAmount,
          reason,
        );
      } catch (e) {
        console.error("auction persistSale", e);
        s.finalized = false;
        s.status = "running";
        scheduleSilence(exhibitionId, artworkId);
        if (s.auctionEndsAt) {
          scheduleDeadlineOnce(exhibitionId, artworkId, s.auctionEndsAt);
        }
        return;
      }

      let addedToCart = false;
      try {
        await putAuctionWinInCart(s.highBidderId, artworkId, s.currentAmount);
        addedToCart = true;
      } catch (cartErr) {
        console.error("auction putAuctionWinInCart", cartErr);
      }

      const payload = {
        exhibitionId,
        artworkId,
        winnerUserId: s.highBidderId,
        winnerUsername: s.highBidderUsername,
        winningBid: s.currentAmount,
        reason,
        addedToCart,
      };
      ioRef.to(roomName(exhibitionId)).emit("auction_closed", payload);
      ioRef.to(roomName(exhibitionId)).emit("auction_state", publicState(s));
    };

    const scheduleSilence = (exhibitionId, artworkId) => {
      const key = sessionKey(exhibitionId, artworkId);
      const s = sessions.get(key);
      if (!s || s.finalized || s.status !== "running") return;
      if (s.silenceTimer) clearTimeout(s.silenceTimer);
      s.silenceTimer = setTimeout(() => {
        finalize(exhibitionId, artworkId, "silence", io).catch((e) =>
          console.error(e),
        );
      }, SILENCE_MS);
    };

    const scheduleDeadlineOnce = (exhibitionId, artworkId, endsAt) => {
      const key = sessionKey(exhibitionId, artworkId);
      const s = sessions.get(key);
      if (!s) return;
      if (s.deadlineTimer) {
        clearTimeout(s.deadlineTimer);
        s.deadlineTimer = null;
      }
      const ms = Math.max(0, endsAt - Date.now());
      s.deadlineTimer = setTimeout(() => {
        finalize(exhibitionId, artworkId, "deadline", io).catch((e) =>
          console.error(e),
        );
      }, ms);
    };

    socket.on("request_auction_snapshot", async (payload) => {
      try {
        const exhibitionId = payload?.exhibitionId;
        const artworkId = payload?.artworkId;
        if (
          !exhibitionId ||
          !artworkId ||
          !mongoose.Types.ObjectId.isValid(exhibitionId) ||
          !mongoose.Types.ObjectId.isValid(artworkId)
        ) {
          return;
        }
        const ex = await Exibition.findById(exhibitionId)
          .select("auctionEnabled auctionDurationMinutes auctionSales artworkIds")
          .lean();
        if (!ex || !ex.auctionEnabled) {
          socket.emit("auction_state", {
            exhibitionId,
            artworkId,
            status: "disabled",
            message: "Auctions are not enabled for this exhibition",
          });
          return;
        }
        if (!artworkInExhibition(ex, artworkId)) {
          socket.emit("auction_state", {
            exhibitionId,
            artworkId,
            status: "invalid",
            message: "Artwork is not in this exhibition",
          });
          return;
        }
        const existingSale = saleForArtwork(ex, artworkId);
        if (existingSale) {
          socket.emit("auction_state", {
            exhibitionId,
            artworkId,
            status: "sold",
            currentAmount: existingSale.winningBid,
            highBidderId: String(existingSale.winnerUserId),
            highBidderUsername: existingSale.winnerUsername,
            sale: existingSale,
          });
          return;
        }

        const key = sessionKey(exhibitionId, artworkId);
        let s = sessions.get(key);
        if (!s) {
          const art = await ArtWork.findById(artworkId).select("price").lean();
          if (!art) {
            socket.emit("auction_state", {
              exhibitionId,
              artworkId,
              status: "invalid",
              message: "Artwork not found",
            });
            return;
          }
          const durationMs = Math.max(60_000, (ex.auctionDurationMinutes || 15) * 60_000);
          s = createEmptySession(
            exhibitionId,
            artworkId,
            Number(art.price) || 0,
            durationMs,
          );
          sessions.set(key, s);
        }
        socket.emit("auction_state", publicState(s));
      } catch (e) {
        console.error("request_auction_snapshot", e);
      }
    });

    socket.on("auction_bid", async (payload, ack) => {
      try {
        if (!socket.user) {
          ack?.({ ok: false, error: "Sign in to place a bid" });
          return;
        }
        const exhibitionId = payload?.exhibitionId;
        const artworkId = payload?.artworkId;
        const amount = Number(payload?.amount);
        if (
          !exhibitionId ||
          !artworkId ||
          !mongoose.Types.ObjectId.isValid(exhibitionId) ||
          !mongoose.Types.ObjectId.isValid(artworkId)
        ) {
          ack?.({ ok: false, error: "Invalid exhibition or artwork" });
          return;
        }
        if (!Number.isFinite(amount) || amount <= 0) {
          ack?.({ ok: false, error: "Enter a valid bid amount" });
          return;
        }

        const ex = await Exibition.findById(exhibitionId)
          .select("auctionEnabled auctionDurationMinutes auctionSales artworkIds")
          .lean();
        if (!ex || !ex.auctionEnabled) {
          ack?.({ ok: false, error: "Auctions are not enabled for this exhibition" });
          return;
        }
        if (!artworkInExhibition(ex, artworkId)) {
          ack?.({ ok: false, error: "This artwork is not in this exhibition" });
          return;
        }
        if (saleForArtwork(ex, artworkId)) {
          ack?.({ ok: false, error: "This artwork is already sold" });
          return;
        }

        const key = sessionKey(exhibitionId, artworkId);
        let s = sessions.get(key);
        if (!s) {
          const art = await ArtWork.findById(artworkId).select("price").lean();
          if (!art) {
            ack?.({ ok: false, error: "Artwork not found" });
            return;
          }
          const durationMs = Math.max(60_000, (ex.auctionDurationMinutes || 15) * 60_000);
          s = createEmptySession(
            exhibitionId,
            artworkId,
            Number(art.price) || 0,
            durationMs,
          );
          sessions.set(key, s);
        }

        if (s.finalized || s.status === "sold" || s.status === "ended_unsold") {
          ack?.({ ok: false, error: "This auction has ended" });
          return;
        }

        const reserve = s.reservePrice;
        const minBid = s.currentAmount > 0 ? s.currentAmount + 0.01 : reserve;
        if (amount < minBid - 1e-9) {
          ack?.({
            ok: false,
            error:
              s.currentAmount > 0
                ? `Bid must be higher than ${s.currentAmount.toFixed(2)}`
                : `Opening bid must be at least ${reserve.toFixed(2)}`,
          });
          return;
        }

        if (s.status === "idle") {
          s.status = "running";
          s.auctionEndsAt = Date.now() + s.durationMs;
          scheduleDeadlineOnce(exhibitionId, artworkId, s.auctionEndsAt);
        }

        if (s.auctionEndsAt && Date.now() > s.auctionEndsAt) {
          ack?.({ ok: false, error: "Bidding time has ended" });
          return;
        }

        s.currentAmount = amount;
        s.highBidderId = socket.user._id;
        s.highBidderUsername = socket.user.username || "User";

        scheduleSilence(exhibitionId, artworkId);

        const state = publicState(s);
        io.to(roomName(exhibitionId)).emit("auction_state", state);
        io.to(roomName(exhibitionId)).emit("auction_bid_placed", {
          exhibitionId,
          artworkId,
          amount,
          user: {
            _id: socket.user._id,
            username: socket.user.username,
          },
          at: new Date().toISOString(),
        });

        ack?.({ ok: true, state });
      } catch (e) {
        console.error("auction_bid", e);
        ack?.({ ok: false, error: "Could not place bid" });
      }
    });
  });
}
