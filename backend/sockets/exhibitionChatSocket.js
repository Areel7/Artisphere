import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../Models/User.js";
import Exibition from "../Models/Exibition.js";
import ExhibitionMessage from "../Models/ExhibitionMessage.js";

function roomName(exhibitionId) {
  return `exhibition:${exhibitionId}`;
}

export function attachExhibitionChat(io) {
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
      /* optional auth — guests can watch */
    }
    next();
  });

  io.on("connection", (socket) => {
    socket.on("join_exhibition", async (payload) => {
      const exhibitionId =
        typeof payload === "string"
          ? payload
          : payload && typeof payload.exhibitionId === "string"
            ? payload.exhibitionId
            : null;
      if (!exhibitionId || !mongoose.Types.ObjectId.isValid(exhibitionId)) {
        return;
      }
      const exists = await Exibition.exists({ _id: exhibitionId });
      if (!exists) return;
      socket.join(roomName(exhibitionId));
    });

    socket.on("leave_exhibition", (payload) => {
      const exhibitionId =
        typeof payload === "string"
          ? payload
          : payload && typeof payload.exhibitionId === "string"
            ? payload.exhibitionId
            : null;
      if (exhibitionId) socket.leave(roomName(exhibitionId));
    });

    socket.on("chat_message", async (payload, ack) => {
      try {
        if (!socket.user) {
          ack?.({ ok: false, error: "Sign in to send messages" });
          return;
        }
        const exhibitionId = payload?.exhibitionId;
        const body = String(payload?.body ?? "").trim();
        if (!exhibitionId || !mongoose.Types.ObjectId.isValid(exhibitionId)) {
          ack?.({ ok: false, error: "Invalid exhibition" });
          return;
        }
        if (body.length < 1 || body.length > 2000) {
          ack?.({ ok: false, error: "Message must be 1–2000 characters" });
          return;
        }
        const exists = await Exibition.exists({ _id: exhibitionId });
        if (!exists) {
          ack?.({ ok: false, error: "Exhibition not found" });
          return;
        }
        const doc = await ExhibitionMessage.create({
          exhibitionId,
          userId: socket.user._id,
          body,
        });
        const out = {
          _id: doc._id.toString(),
          body: doc.body,
          createdAt: doc.createdAt,
          user: {
            _id: socket.user._id,
            username: socket.user.username,
            email: socket.user.email,
          },
        };
        io.to(roomName(exhibitionId)).emit("chat_message", out);
        ack?.({ ok: true, message: out });
      } catch (e) {
        console.log(e);
        ack?.({ ok: false, error: "Failed to send" });
      }
    });
  });
}
