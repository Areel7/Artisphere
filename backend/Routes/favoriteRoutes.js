import express from "express";
import {
  addFavorite,
  removeFavorite,
  getFavorites,
} from "../Controllers/favoriteController.js";
import { protect } from "../Middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, addFavorite);
router.delete("/", protect, removeFavorite);
router.get("/", protect, getFavorites);

export default router;
