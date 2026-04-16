import express from "express";
import { protect, artist } from "../Middlewares/authMiddleware.js";
import {
  createArtWork,
  deleteArtWork,
  getAllArtWorks,
  getSingleArtWork,
  updateArtWork,
  getArtWorksByArtistId,
} from "../Controllers/artWorkController.js";

const router = express.Router();

router
  .route("/")
  .post(protect, artist, createArtWork)
  .get(getAllArtWorks);
router.route("/delete/:id").delete(protect, deleteArtWork);
router.route("/:id").get(getSingleArtWork);
router.route("/update/:id").put(protect, updateArtWork);
router.route("/artist/:id").get(protect, getArtWorksByArtistId);

export default router;
