import express from "express";
import { proceedToCheckout, getUserOrders } from "../Controllers/orderController.js";
import { protect } from "../Middlewares/authMiddleware.js";

const router = express.Router();

router.post("/checkout", protect, proceedToCheckout);
router.get("/", protect, getUserOrders);

export default router;
