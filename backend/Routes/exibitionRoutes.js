import express from "express";
import { createExibition, getAllExibitions, getExibitionById } from "../Controllers/exibitionController.js";
import { protect, curator } from "../Middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, curator, createExibition);
router.get("/", protect, getAllExibitions);
router.get("/:id", protect, getExibitionById);

export default router;