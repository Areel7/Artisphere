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

const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname + "/uploads")));

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
