import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { Gavel, Clock, Loader2 } from "lucide-react";
import { exhibitionApiSlice } from "../redux/api/exhibition.js";
import { cartApiSlice } from "../redux/api/cart.js";
import { artworkTitle } from "../utils/artworkMeta.js";

function formatMoney(n) {
  if (n == null || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Number(n));
}

export default function ExhibitionAuctionPanel({
  exhibitionId,
  exhibition,
  artworks,
  socket,
  connected,
}) {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((s) => s.auth);
  const myId = userInfo?._id ? String(userInfo._id) : null;

  const soldIds = useMemo(() => {
    const rows = exhibition?.auctionSales;
    if (!Array.isArray(rows)) return new Set();
    return new Set(rows.map((s) => String(s.artworkId)));
  }, [exhibition?.auctionSales]);

  const openArtworks = useMemo(
    () => artworks.filter((a) => a?._id && !soldIds.has(String(a._id))),
    [artworks, soldIds],
  );

  const [selectedId, setSelectedId] = useState("");
  const [auctionState, setAuctionState] = useState(null);
  const [bidAmount, setBidAmount] = useState("");
  const [bidError, setBidError] = useState("");
  const [bidLog, setBidLog] = useState([]);
  const [placing, setPlacing] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (openArtworks.length === 0) {
      setSelectedId("");
      return;
    }
    setSelectedId((prev) => {
      if (prev && openArtworks.some((a) => String(a._id) === prev)) return prev;
      return String(openArtworks[0]._id);
    });
  }, [openArtworks]);

  const requestSnapshot = useCallback(() => {
    if (!socket?.connected || !exhibitionId || !selectedId) return;
    socket.emit("request_auction_snapshot", {
      exhibitionId,
      artworkId: selectedId,
    });
  }, [socket, exhibitionId, selectedId]);

  useEffect(() => {
    if (!socket || !exhibitionId || !selectedId) return;

    const onState = (st) => {
      if (!st?.artworkId || String(st.artworkId) !== String(selectedId)) return;
      if (st.exhibitionId && String(st.exhibitionId) !== String(exhibitionId))
        return;
      setAuctionState(st);
    };

    const onBidPlaced = (ev) => {
      if (
        ev?.artworkId &&
        String(ev.artworkId) === String(selectedId) &&
        String(ev.exhibitionId) === String(exhibitionId)
      ) {
        setBidLog((prev) => [
          ...prev.slice(-40),
          {
            at: ev.at || new Date().toISOString(),
            username: ev.user?.username ?? "Bidder",
            amount: ev.amount,
          },
        ]);
      }
    };

    const onClosed = (ev) => {
      if (String(ev?.exhibitionId) !== String(exhibitionId)) return;
      setBidLog([]);
      const winnerId = ev?.winnerUserId != null ? String(ev.winnerUserId) : "";
      const uid = userInfo?._id != null ? String(userInfo._id) : "";
      if (winnerId && uid && winnerId === uid) {
        const name =
          (ev.winnerUsername && String(ev.winnerUsername).trim()) ||
          userInfo?.username ||
          "you";
        dispatch(cartApiSlice.util.invalidateTags(["Cart"]));
        if (ev.addedToCart) {
          toast.success(
            `Congratulations, ${name}! You won this artwork at ${formatMoney(ev.winningBid)}. It has been added to your cart at that price — open Cart to complete checkout with Stripe.`,
            { autoClose: 10000 },
          );
        } else {
          toast.warning(
            `Congratulations, ${name}! You won at ${formatMoney(ev.winningBid)}, but it could not be added to your cart automatically. Your win is still recorded — try Cart or contact support.`,
            { autoClose: 12000 },
          );
        }
      }
      dispatch(
        exhibitionApiSlice.util.invalidateTags([
          { type: "Exhibition", id: exhibitionId },
        ]),
      );
    };

    socket.on("auction_state", onState);
    socket.on("auction_bid_placed", onBidPlaced);
    socket.on("auction_closed", onClosed);

    requestSnapshot();

    return () => {
      socket.off("auction_state", onState);
      socket.off("auction_bid_placed", onBidPlaced);
      socket.off("auction_closed", onClosed);
    };
  }, [
    socket,
    exhibitionId,
    selectedId,
    requestSnapshot,
    dispatch,
    userInfo?._id,
    userInfo?.username,
  ]);

  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 250);
    return () => clearInterval(t);
  }, []);

  const silenceRemainingMs = useMemo(() => {
    if (!auctionState?.silenceEndsAt) return null;
    const end =
      typeof auctionState.silenceEndsAt === "number"
        ? auctionState.silenceEndsAt
        : new Date(auctionState.silenceEndsAt).getTime();
    return Math.max(0, end - Date.now());
  }, [auctionState, tick]);

  const sessionRemainingMs = useMemo(() => {
    if (!auctionState?.auctionEndsAt) return null;
    const end =
      typeof auctionState.auctionEndsAt === "number"
        ? auctionState.auctionEndsAt
        : new Date(auctionState.auctionEndsAt).getTime();
    return Math.max(0, end - Date.now());
  }, [auctionState, tick]);

  const placeBid = () => {
    setBidError("");
    if (!userInfo?.token) {
      setBidError("Sign in to bid.");
      return;
    }
    if (!socket?.connected) {
      setBidError("Not connected.");
      return;
    }
    const amt = Number(bidAmount);
    if (!Number.isFinite(amt) || amt <= 0) {
      setBidError("Enter a valid amount.");
      return;
    }
    setPlacing(true);
    socket.emit(
      "auction_bid",
      { exhibitionId, artworkId: selectedId, amount: amt },
      (res) => {
        setPlacing(false);
        if (res && !res.ok) {
          setBidError(res.error || "Bid rejected");
          return;
        }
        if (res?.state) setAuctionState(res.state);
        setBidAmount("");
      },
    );
  };

  if (!exhibition?.auctionEnabled) return null;

  if (openArtworks.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-zinc-950/90 backdrop-blur-md p-4 text-center">
        <Gavel className="w-5 h-5 text-amber-400/80 mx-auto mb-2" />
        <p className="text-xs text-zinc-400">
          All listed works in this exhibition have been sold at auction.
        </p>
      </div>
    );
  }

  const st = auctionState;
  const status = st?.status;
  const selectedArt = openArtworks.find((a) => String(a._id) === selectedId);
  const minNext =
    st?.minNextBid ??
    (selectedArt?.price != null ? Number(selectedArt.price) : 0);
  const isSold = status === "sold";
  const isEnded = status === "ended_unsold";
  const isRunning = status === "running";
  const isIdle = status === "idle" || status == null;

  return (
    <div className="rounded-2xl border border-amber-500/20 bg-zinc-950/95 backdrop-blur-md overflow-hidden flex flex-col max-h-[min(42vh,380px)]">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-black/40">
        <div className="flex items-center gap-2 min-w-0">
          <Gavel className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-sm font-semibold text-white truncate">
            Live auction
          </span>
        </div>
        <span className="text-[10px] text-zinc-500 uppercase tabular-nums">
          {exhibition.auctionDurationMinutes ?? 15}m max / 10s quiet
        </span>
      </div>

      <div className="p-3 space-y-3 overflow-y-auto min-h-0 flex-1">
        <div>
          <label className="text-[10px] uppercase tracking-wider text-zinc-500 block mb-1">
            Artwork
          </label>
          <select
            value={selectedId}
            onChange={(e) => {
              setSelectedId(e.target.value);
              setAuctionState(null);
              setBidLog([]);
              setBidError("");
            }}
            className="w-full rounded-xl bg-zinc-900 border border-white/10 text-sm text-white px-3 py-2 outline-none focus:ring-1 focus:ring-amber-500/40"
          >
            {openArtworks.map((a) => (
              <option key={a._id} value={String(a._id)}>
                {artworkTitle(a)} — {formatMoney(a.price)} min
              </option>
            ))}
          </select>
        </div>

        {!connected && (
          <p className="text-xs text-zinc-500 flex items-center gap-2">
            <Loader2 className="w-3 h-3 animate-spin" />
            Connecting…
          </p>
        )}

        {isSold && st?.highBidderUsername && (
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/25 px-3 py-2 text-sm text-emerald-200">
            Sold to <strong>{st.highBidderUsername}</strong> for{" "}
            {formatMoney(st.currentAmount)}
          </div>
        )}

        {isEnded && (
          <div className="rounded-xl bg-zinc-800/80 border border-white/10 px-3 py-2 text-xs text-zinc-400">
            No winning bid (time ended with no qualifying bids).
          </div>
        )}

        {(isIdle || isRunning) && !isSold && !isEnded && (
          <>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-white/5 border border-white/5 p-2">
                <p className="text-zinc-500 mb-0.5">High bid</p>
                <p className="text-white font-semibold tabular-nums">
                  {st?.currentAmount > 0
                    ? formatMoney(st.currentAmount)
                    : "—"}
                </p>
                {st?.highBidderUsername ? (
                  <p className="text-zinc-500 mt-0.5 truncate">
                    {st.highBidderUsername}
                    {myId && st.highBidderId === myId ? " (you)" : ""}
                  </p>
                ) : (
                  <p className="text-zinc-600 mt-0.5">No bids yet</p>
                )}
              </div>
              <div className="rounded-lg bg-white/5 border border-white/5 p-2">
                <p className="text-zinc-500 mb-0.5 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Quiet window
                </p>
                <p className="text-amber-200 font-mono text-sm tabular-nums">
                  {isRunning && silenceRemainingMs != null
                    ? `${(silenceRemainingMs / 1000).toFixed(1)}s`
                    : "—"}
                </p>
                <p className="text-[10px] text-zinc-600 mt-0.5">
                  No higher bid for 10s → sold
                </p>
              </div>
            </div>

            {sessionRemainingMs != null && isRunning && (
              <p className="text-[11px] text-zinc-500">
                Session time left:{" "}
                <span className="text-zinc-300 tabular-nums">
                  {Math.ceil(sessionRemainingMs / 60000)}m{" "}
                  {Math.ceil((sessionRemainingMs % 60000) / 1000)}s
                </span>
              </p>
            )}

            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                min={minNext}
                placeholder={formatMoney(minNext)}
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                disabled={!userInfo?.token}
                className="flex-1 rounded-xl bg-zinc-900/80 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={placeBid}
                disabled={!userInfo?.token || !connected || placing}
                className="shrink-0 px-4 py-2 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-500 disabled:opacity-40"
              >
                {placing ? "…" : "Bid"}
              </button>
            </div>
            {bidError && (
              <p className="text-xs text-rose-400">{bidError}</p>
            )}
            {!userInfo?.token && (
              <p className="text-xs text-zinc-500">Sign in to place bids.</p>
            )}
          </>
        )}

        {bidLog.length > 0 && (
          <div>
            <p className="text-[10px] uppercase text-zinc-500 mb-1.5">
              Recent bids
            </p>
            <ul className="space-y-1 max-h-24 overflow-y-auto text-[11px] text-zinc-400">
              {bidLog
                .slice()
                .reverse()
                .map((b, i) => (
                  <li key={`${b.at}-${i}`} className="truncate">
                    <span className="text-zinc-300">{b.username}</span>{" "}
                    <span className="text-amber-200/90 tabular-nums">
                      {formatMoney(b.amount)}
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
