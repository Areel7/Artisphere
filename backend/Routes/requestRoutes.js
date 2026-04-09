import express from "express";
import { createRequest, getRequests, approveRequest } from "../Controllers/requestController.js";
import { protect, curator } from "../Middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createRequest);
router.get("/", protect, curator, getRequests);
router.put("/approve", protect, curator, approveRequest);

export default router;
