import express from "express";
import {
  createRequest,
  getRequests,
  approveRequest,
  rejectRequest,
  applyAsRole,
} from "../Controllers/requestController.js";
import { protect, superadmin } from "../Middlewares/authMiddleware.js";

const router = express.Router();

// Public — no login needed (applicant doesn't have an account yet)
router.post("/", createRequest);

// Protected — logged-in visitor applying from profile CTA
router.post("/apply", protect, applyAsRole);

// Superadmin only
router.get("/", protect, superadmin, getRequests);
router.put("/approve/:id", protect, superadmin, approveRequest);
router.delete("/reject/:id", protect, superadmin, rejectRequest);

export default router;
