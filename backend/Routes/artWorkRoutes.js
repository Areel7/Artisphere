import express from "express";
import {
  protect,
  artist,
  artistAndCurator,
} from "../Middlewares/authMiddleware.js";
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
  .get(protect, getAllArtWorks);
router.route("/delete/:id").delete(protect, artistAndCurator, deleteArtWork);
router.route("/:id").get(protect, getSingleArtWork);
router.route("/update/:id").put(protect, artist, updateArtWork);
router.route("/artist/:id").get(protect, getArtWorksByArtistId);

export default router;
