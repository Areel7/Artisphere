import mongoose from "mongoose";
import User from "../Models/User.js";
import ArtWork from "../Models/ArtWork.js";
import bcrypt from "bcryptjs";
import genrateToken from "../Utils/createToken.js";
import { validationResult } from "express-validator";
import { fillStory } from "./artWorkController.js";

const MAX_RECENTLY_VIEWED = 5;

const populateRecentArtworks = () => ({
  path: "recentlyViewedArtworks",
  populate: { path: "artistId", select: "username" },
});

const respondWithRecentArtworks = async (res, userId) => {
  const fresh = await User.findById(userId)
    .select("recentlyViewedArtworks")
    .populate(populateRecentArtworks());
  const list = fresh?.recentlyViewedArtworks || [];
  res.status(200).json(list.map((doc) => fillStory(doc)));
};

const createUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ errors: [{ msg: "User already exists" }] });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const token = genrateToken(res, newUser._id);

    res.status(201).json({
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

const loginUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ errors: [{ msg: "User not found" }] });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ errors: [{ msg: "Invalid credentials" }] });
    }

    const token = genrateToken(res, user._id);

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

const logoutUser = async (req, res) => {
  try {
    res.cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(0),
    });
    res.status(200).json({ msg: "User logged out successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

const getCurrentUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

const updateCurrentUserProfile = async (req, res) => {
  try {
    // Fetch WITHOUT excluding password so the existing hash is available
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ errors: [{ msg: "User not found" }] });
    }

    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;

    // Only hash and update password when a new one is explicitly sent
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    await user.save();

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

const getArtists = async (req, res) => {
  try {
    const artists = await User.find({ role: "artist" });
    res.status(200).json(artists);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

const getAllCurators = async (req, res) => {
  try {
    const curators = await User.find({ role: "curator" });
    res.status(200).json(curators);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

const getRecentlyViewedArtworks = async (req, res) => {
  try {
    await respondWithRecentArtworks(res, req.user._id);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

const recordRecentlyViewedArtwork = async (req, res) => {
  try {
    const { artworkId } = req.body;
    if (!artworkId || !mongoose.isValidObjectId(artworkId)) {
      return res.status(400).json({ errors: [{ msg: "Valid artworkId required" }] });
    }
    const exists = await ArtWork.exists({ _id: artworkId });
    if (!exists) {
      return res.status(404).json({ errors: [{ msg: "Artwork not found" }] });
    }
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ errors: [{ msg: "User not found" }] });
    }
    const prev = (user.recentlyViewedArtworks || []).map((id) => id.toString());
    const next = [
      artworkId,
      ...prev.filter((id) => id !== String(artworkId)),
    ].slice(0, MAX_RECENTLY_VIEWED);
    user.recentlyViewedArtworks = next;
    await user.save();
    await respondWithRecentArtworks(res, user._id);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

const syncRecentlyViewedArtworks = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) {
      return res.status(400).json({ errors: [{ msg: "ids must be an array" }] });
    }
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ errors: [{ msg: "User not found" }] });
    }
    const uniqueOrder = [];
    const seen = new Set();
    for (const raw of ids) {
      if (!raw || !mongoose.isValidObjectId(raw)) continue;
      const idStr = String(raw);
      if (seen.has(idStr)) continue;
      seen.add(idStr);
      uniqueOrder.push(idStr);
    }
    const candidateIds = uniqueOrder
      .slice(0, MAX_RECENTLY_VIEWED * 3)
      .map((idStr) => new mongoose.Types.ObjectId(idStr));
    const existingDocs = await ArtWork.find({ _id: { $in: candidateIds } })
      .select("_id")
      .lean();
    const existing = new Set(existingDocs.map((d) => String(d._id)));
    const ordered = [];
    for (const idStr of uniqueOrder) {
      if (!existing.has(idStr)) continue;
      ordered.push(new mongoose.Types.ObjectId(idStr));
      if (ordered.length >= MAX_RECENTLY_VIEWED) break;
    }
    user.recentlyViewedArtworks = ordered;
    await user.save();
    await respondWithRecentArtworks(res, user._id);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

export {
  createUser,
  loginUser,
  logoutUser,
  getAllUsers,
  getCurrentUserProfile,
  updateCurrentUserProfile,
  getArtists,
  getAllCurators,
  getRecentlyViewedArtworks,
  recordRecentlyViewedArtwork,
  syncRecentlyViewedArtworks,
};
