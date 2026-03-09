import express from "express";
import { createUser, loginUser, logoutUser } from "../Controllers/userController.js";
import { registerValidation, loginValidation } from "../Helper/validations.js";

const router = express.Router();

router.post("/auth/signup", registerValidation, createUser);
router.post("/auth/login", loginValidation, loginUser);
router.post("/auth/logout", logoutUser);

export default router;