import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../Models/User.js";

const ALLOWED_ROLES = ["artist", "visitor", "curator", "superadmin"];

const countSuperAdmins = async () =>
  User.countDocuments({ role: "superadmin" });

const adminListUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

const adminCreateUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        errors: [{ msg: "Username, email, and password are required" }],
      });
    }
    const nextRole = ALLOWED_ROLES.includes(role) ? role : "visitor";

    const exists = await User.findOne({ email: email.trim().toLowerCase() });
    if (exists) {
      return res.status(400).json({ errors: [{ msg: "Email already in use" }] });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: nextRole,
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

const adminDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ errors: [{ msg: "Invalid user id" }] });
    }
    if (String(req.user._id) === id) {
      return res.status(400).json({ errors: [{ msg: "You cannot delete your own account" }] });
    }

    const target = await User.findById(id);
    if (!target) {
      return res.status(404).json({ errors: [{ msg: "User not found" }] });
    }

    if (target.role === "superadmin") {
      const n = await countSuperAdmins();
      if (n <= 1) {
        return res.status(400).json({
          errors: [{ msg: "Cannot delete the only remaining super admin" }],
        });
      }
    }

    await User.findByIdAndDelete(id);
    res.status(200).json({ message: "User deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

const adminPatchUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ errors: [{ msg: "Invalid user id" }] });
    }
    if (!role || !ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({
        errors: [{ msg: `Role must be one of: ${ALLOWED_ROLES.join(", ")}` }],
      });
    }

    const target = await User.findById(id);
    if (!target) {
      return res.status(404).json({ errors: [{ msg: "User not found" }] });
    }

    if (target.role === "superadmin" && role !== "superadmin") {
      const n = await countSuperAdmins();
      if (n <= 1) {
        return res.status(400).json({
          errors: [{ msg: "Cannot demote the only remaining super admin" }],
        });
      }
    }

    target.role = role;
    await target.save();

    res.status(200).json({
      _id: target._id,
      username: target.username,
      email: target.email,
      role: target.role,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

export { adminListUsers, adminCreateUser, adminDeleteUser, adminPatchUserRole };
