import express from "express";
import { protect, superadmin } from "../Middlewares/authMiddleware.js";
import {
  adminListUsers,
  adminCreateUser,
  adminDeleteUser,
  adminPatchUserRole,
} from "../Controllers/adminController.js";
import { superAdminUpdateExhibition } from "../Controllers/exibitionController.js";
import { getAllOrdersForAdmin } from "../Controllers/orderController.js";

const router = express.Router();

router.use(protect, superadmin);

router.get("/users", adminListUsers);
router.post("/users", adminCreateUser);
router.delete("/users/:id", adminDeleteUser);
router.patch("/users/:id/role", adminPatchUserRole);

router.put("/exhibitions/:id", superAdminUpdateExhibition);

router.get("/orders", getAllOrdersForAdmin);

export default router;
