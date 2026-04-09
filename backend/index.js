import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

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

//Configuration
dotenv.config();

connectDB();

const app = express();

//Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

//Routes

app.use("/api/users", userRoutes);
app.use("/api/artworks", artWorkRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/exibitions", exibitionRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/requests", requestRoutes);

const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname + "/uploads")));

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
