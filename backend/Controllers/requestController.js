import Request from "../Models/Request.js";
import User from "../Models/User.js";
import bcrypt from "bcryptjs";

/**
 * POST /api/requests/apply  — protected, for logged-in visitors
 * Lets a visitor apply for artist or curator role without re-submitting credentials.
 */
const applyAsRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!role || !["artist", "curator"].includes(role)) {
      return res
        .status(400)
        .json({ errors: [{ msg: "Role must be artist or curator" }] });
    }

    const user = req.user;

    // Already has the requested role
    if (user.role === role) {
      return res
        .status(400)
        .json({ errors: [{ msg: `You are already a ${role}` }] });
    }

    // Not a visitor
    if (user.role !== "visitor") {
      return res
        .status(400)
        .json({ errors: [{ msg: "Only visitors can apply for a role upgrade" }] });
    }

    // Check for an existing pending request from this email
    const existingRequest = await Request.findOne({
      email: user.email,
      status: "pending",
    });
    if (existingRequest) {
      return res.status(400).json({
        errors: [{ msg: "You already have a pending request. Please wait for superadmin review." }],
      });
    }

    // We store a placeholder password — user's real hash is in User model.
    // Approving will look up req.email → User already exists → just upgrade role.
    await new Request({
      username: user.username,
      email: user.email,
      password: user.password || "__existing_user__",  // user already exists
      role,
      status: "pending",
    }).save();

    res.status(201).json({
      msg: `Your application to become a ${role} has been submitted. You'll be notified once approved.`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

/** POST /api/requests  — public, no auth needed (user doesn't exist yet) */
const createRequest = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username?.trim() || !email?.trim() || !password || !role) {
      return res
        .status(400)
        .json({ errors: [{ msg: "All fields are required" }] });
    }

    if (!["artist", "curator"].includes(role)) {
      return res
        .status(400)
        .json({ errors: [{ msg: "Role must be artist or curator" }] });
    }

    // Check if a user with this email already exists
    const existingUser = await User.findOne({
      email: email.trim().toLowerCase(),
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ errors: [{ msg: "An account with this email already exists" }] });
    }

    // Check if a pending request with this email already exists
    const existingRequest = await Request.findOne({
      email: email.trim().toLowerCase(),
      status: "pending",
    });
    if (existingRequest) {
      return res.status(400).json({
        errors: [{ msg: "A pending request with this email already exists" }],
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await new Request({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role,
    }).save();

    res.status(201).json({
      msg: `Your application to join as ${role} has been submitted. Please wait for superadmin approval.`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

/** GET /api/requests  — superadmin only */
const getRequests = async (req, res) => {
  try {
    const requests = await Request.find({ status: "pending" }).sort({
      createdAt: -1,
    });
    res.status(200).json(requests);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

/** PUT /api/requests/approve/:id  — superadmin only */
const approveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await Request.findById(id);
    if (!request) {
      return res
        .status(404)
        .json({ errors: [{ msg: "Request not found" }] });
    }
    if (request.status !== "pending") {
      return res
        .status(400)
        .json({ errors: [{ msg: "Request has already been processed" }] });
    }

    // If user already exists (e.g. applied via CTA from profile) — just upgrade role
    const existingUser = await User.findOne({ email: request.email });
    if (existingUser) {
      existingUser.role = request.role;
      await existingUser.save();
      await Request.findByIdAndDelete(id);
      return res.status(200).json({
        msg: `Request approved – ${request.username} is now a ${request.role}.`,
      });
    }

    // New user — create account with requested role
    await User.create({
      username: request.username,
      email: request.email,
      password: request.password,
      role: request.role,
    });

    await Request.findByIdAndDelete(id);

    res.status(200).json({
      msg: `Request approved – ${request.username} is now a ${request.role}.`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

/** DELETE /api/requests/reject/:id  — superadmin only */
const rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await Request.findById(id);
    if (!request) {
      return res
        .status(404)
        .json({ errors: [{ msg: "Request not found" }] });
    }

    await Request.findByIdAndDelete(id);
    res.status(200).json({ msg: "Request rejected and removed." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

export { createRequest, getRequests, approveRequest, rejectRequest, applyAsRole };