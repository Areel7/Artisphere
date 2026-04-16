import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { attachExhibitionChat } from "./sockets/exhibitionChatSocket.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

//Files
import connectDB from "./Config/db.js";
import userRoutes from "./Routes/userRoutes.js";
import artWorkRoutes from "./Routes/artWorkRoutes.js";
import uploadRoutes from "./Routes/uploadRoutes.js";
import exibitionRoutes from "./Routes/exibitionRoutes.js";
import favoriteRoutes from "./Routes/favoriteRoutes.js";
import cartRoutes from "./Routes/cartRoutes.js";
import orderRoutes from "./Routes/orderRoutes.js";
import requestRoutes from "./Routes/requestRoutes.js";
import adminRoutes from "./Routes/adminRoutes.js";

//Configuration — load the root .env regardless of executing directory
dotenv.config({ path: path.resolve(__dirname, "../.env") });

connectDB();

const app = express();

function isAllowedCorsOrigin(origin) {
  if (origin === process.env.FRONTEND_URL) return true;
  if (origin.endsWith(".vercel.app")) return true;
  try {
    const { protocol, hostname } = new URL(origin);
    const okProto = protocol === "http:" || protocol === "https:";
    if (okProto && (hostname === "localhost" || hostname === "127.0.0.1"))
      return true;
  } catch {
    /* ignore */
  }
  return false;
}

//Middleware
app.use(express.json());
app.use(cookieParser());
// Dynamic CORS: checked live on each request so env vars are always current
const corsOptions = {
  credentials: true,
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (isAllowedCorsOrigin(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked: ${origin}`));
  },
};

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

//Routes

app.use("/api/users", userRoutes);
app.use("/api/artworks", artWorkRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/exhibitions", exibitionRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/admin", adminRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (isAllowedCorsOrigin(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST"],
  },
});
attachExhibitionChat(io);

httpServer.listen(PORT, () =>
  console.log(`Server is running on port ${PORT} (HTTP + Socket.IO)`),
);
