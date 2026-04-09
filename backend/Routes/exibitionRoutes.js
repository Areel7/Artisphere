import express from "express";
import {
  createExibition,
  getAllExibitions,
  getExibitionById,
  getExhibitionMessages,
} from "../Controllers/exibitionController.js";
import { protect, curator } from "../Middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, curator, createExibition);
router.get("/", getAllExibitions);
router.get("/:id/messages", getExhibitionMessages);
router.get("/:id", getExibitionById);

export default router;