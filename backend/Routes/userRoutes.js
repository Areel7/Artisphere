import express from "express";
import {
  createUser,
  getAllUsers,
  getCurrentUserProfile,
  loginUser,
  logoutUser,
  updateCurrentUserProfile,
  getArtists,
  getAllCurators,
} from "../Controllers/userController.js";
import { registerValidation, loginValidation } from "../Helper/validations.js";
import { protect, curator } from "../Middlewares/authMiddleware.js";

const router = express.Router();

router.post("/auth/signup", registerValidation, createUser);
router.post("/auth/login", loginValidation, loginUser);
router.post("/auth/logout", logoutUser);
router.get("/all_users", protect, curator, getAllUsers);
router.get("/profile", protect, getCurrentUserProfile);
router.put("/profile_update", protect, updateCurrentUserProfile);
router.get("/artists", getArtists);
router.get("/curators", getAllCurators);

export default router;
