import express from "express";
import { proceedToCheckout, getUserOrders, createPaymentIntent } from "../Controllers/orderController.js";
import { protect } from "../Middlewares/authMiddleware.js";

const router = express.Router();

router.post("/checkout", protect, proceedToCheckout);
router.post("/create-payment-intent", protect, createPaymentIntent);
router.get("/", protect, getUserOrders);

export default router;
