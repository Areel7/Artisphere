import express from "express";
import {
  createExibition,
  getAllExibitions,
  getExibitionById,
  getExhibitionMessages,
  getMyCuratorExhibitions,
  deleteExhibition,
} from "../Controllers/exibitionController.js";
import { protect, curator } from "../Middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, curator, createExibition);
router.get("/", getAllExibitions);
router.get("/my/exhibitions", protect, curator, getMyCuratorExhibitions);
router.delete("/:id", protect, curator, deleteExhibition);
router.get("/:id/messages", getExhibitionMessages);
router.get("/:id", getExibitionById);

export default router;