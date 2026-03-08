import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

//Files
import connectDB from "./Config/db.js";


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





app.listen(PORT, ()=> console.log(`Server is running on port ${PORT}`));