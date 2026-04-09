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

//Configuration — load the root .env regardless of executing directory
dotenv.config({ path: path.resolve(__dirname, "../.env") });

connectDB();

const app = express();

//Middleware
app.use(express.json());
app.use(cookieParser());
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    credentials: true,
    origin: allowedOrigins,
  }),
);
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

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"],
  },
});
attachExhibitionChat(io);

httpServer.listen(PORT, () =>
  console.log(`Server is running on port ${PORT} (HTTP + Socket.IO)`),
);
