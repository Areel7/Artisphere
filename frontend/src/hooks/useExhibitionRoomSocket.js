import { useEffect, useState } from "react";
import { io } from "socket.io-client";

function apiOrigin() {
  const u = import.meta.env.VITE_BASE_URL;
  if (u) return String(u).replace(/\/$/, "");
  return "http://localhost:3000";
}

/**
 * One Socket.IO client per exhibition room (chat + auctions share it).
 */
export function useExhibitionRoomSocket(exhibitionId, token) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const url = apiOrigin();
    const s = io(url, {
      auth: token ? { token } : {},
      transports: ["websocket", "polling"],
    });

    const onConnect = () => {
      setConnected(true);
      if (exhibitionId) s.emit("join_exhibition", exhibitionId);
    };

    s.on("connect", onConnect);
    s.on("disconnect", () => setConnected(false));
    setSocket(s);
    if (s.connected) onConnect();

    return () => {
      if (exhibitionId) s.emit("leave_exhibition", exhibitionId);
      s.removeAllListeners();
      s.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, [exhibitionId, token]);

  return { socket, connected };
}
