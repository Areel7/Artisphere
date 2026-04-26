import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import { MessageCircle, Send, Wifi, WifiOff } from "lucide-react";

function apiOrigin() {
  const u = import.meta.env.VITE_BASE_URL;
  if (u) return String(u).replace(/\/$/, "");
  return "http://localhost:3000";
}

export default function ExhibitionChatPanel({
  exhibitionId,
  socket: sharedSocket,
  connected: sharedConnected,
  tall = true,
}) {
  const { userInfo } = useSelector((s) => s.auth);
  const token = userInfo?.token;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sendError, setSendError] = useState("");
  const [localConnected, setLocalConnected] = useState(false);
  const socketRef = useRef(null);
  const listRef = useRef(null);
  const connected = sharedSocket ? !!sharedConnected : localConnected;

  const scrollBottom = useCallback(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const base = apiOrigin();
        const res = await fetch(
          `${base}/api/exibitions/${exhibitionId}/messages`,
        );
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        if (Array.isArray(data)) setMessages(data);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [exhibitionId]);

  useEffect(() => {
    if (sharedSocket != null) {
      socketRef.current = sharedSocket;
      const onChat = (msg) => {
        if (!msg?._id) return;
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      };
      sharedSocket.on("chat_message", onChat);
      return () => {
        sharedSocket.off("chat_message", onChat);
        socketRef.current = null;
      };
    }

    if (sharedSocket === null) {
      socketRef.current = null;
      return;
    }

    const url = apiOrigin();
    const socket = io(url, {
      auth: token ? { token } : {},
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    const onConnect = () => {
      setLocalConnected(true);
      socket.emit("join_exhibition", exhibitionId);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", () => setLocalConnected(false));
    socket.on("chat_message", (msg) => {
      if (!msg?._id) return;
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    });

    if (socket.connected) onConnect();

    return () => {
      setLocalConnected(false);
      socket.emit("leave_exhibition", exhibitionId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [exhibitionId, token, sharedSocket]);

  useEffect(() => {
    scrollBottom();
  }, [messages, scrollBottom]);

  const send = () => {
    setSendError("");
    const body = input.trim();
    if (!body) return;
    if (!token) {
      setSendError("Sign in to post.");
      return;
    }
    const s = socketRef.current;
    if (!s?.connected) {
      setSendError("Not connected — try again.");
      return;
    }
    s.emit("chat_message", { exhibitionId, body }, (res) => {
      if (res && !res.ok) setSendError(res.error || "Could not send");
    });
    setInput("");
  };

  const heightClass = tall
    ? "h-[420px] md:h-[520px] xl:h-[min(70vh,680px)]"
    : "min-h-[240px] flex-1 max-h-[min(52vh,560px)]";

  return (
    <div
      className={`flex flex-col rounded-2xl border border-white/10 bg-zinc-950/95 backdrop-blur-md overflow-hidden shadow-xl ${heightClass}`}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/40">
        <div className="flex items-center gap-2 min-w-0">
          <MessageCircle className="w-4 h-4 text-violet-400 shrink-0" />
          <span className="text-sm font-semibold text-white truncate">
            Exhibition chat
          </span>
        </div>
        <div
          className={`flex items-center gap-1 text-[10px] uppercase tracking-wider shrink-0 ${
            connected ? "text-emerald-400" : "text-zinc-500"
          }`}
        >
          {connected ? (
            <Wifi className="w-3.5 h-3.5" />
          ) : (
            <WifiOff className="w-3.5 h-3.5" />
          )}
          {connected ? "Live" : "…"}
        </div>
      </div>

      <div
        ref={listRef}
        className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0"
      >
        {messages.length === 0 ? (
          <p className="text-xs text-zinc-500 text-center py-8">
            No messages yet. Say hello.
          </p>
        ) : (
          messages.map((m) => (
            <div
              key={m._id}
              className="rounded-xl bg-white/5 border border-white/5 px-3 py-2.5"
            >
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="text-sm font-semibold text-white">
                  {m.user?.username ?? "User"}
                </span>
                <span className="text-xs text-zinc-500 break-all">
                  {m.user?.email ?? ""}
                </span>
              </div>
              <p className="text-sm text-zinc-200 mt-1.5 whitespace-pre-wrap break-words">
                {m.body}
              </p>
              <p className="text-[10px] text-zinc-600 mt-1">
                {m.createdAt
                  ? new Date(m.createdAt).toLocaleString(undefined, {
                      dateStyle: "short",
                      timeStyle: "short",
                    })
                  : ""}
              </p>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-white/10 p-3 bg-black/30">
        {sendError && (
          <p className="text-xs text-rose-400 mb-2">{sendError}</p>
        )}
        {!token && (
          <p className="text-xs text-zinc-500 mb-2">
            Sign in to join the conversation.
          </p>
        )}
        <div className="flex gap-2">
          <textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={
              token ? "Write a comment…" : "Sign in to comment"
            }
            disabled={!token}
            className="flex-1 resize-none rounded-xl bg-zinc-900/80 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-violet-500/50 disabled:opacity-50"
          />
          <button
            type="button"
            onClick={send}
            disabled={!token || !input.trim()}
            className="self-end shrink-0 p-3 rounded-xl bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            aria-label="Send"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
