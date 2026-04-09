import express from "express";
import {
  getUserCart,
  addToCart,
  removeCartItem,
  clearCart,
} from "../Controllers/cartController.js";
import { protect } from "../Middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getUserCart);
router.post("/add", protect, addToCart);
router.delete("/remove/:id", protect, removeCartItem);
router.delete("/clear", protect, clearCart);

export default router;
