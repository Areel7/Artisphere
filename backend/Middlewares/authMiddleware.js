import jwt from "jsonwebtoken";
import User from "../Models/User.js";

const readToken = (req) => {
  if (req.cookies?.jwt) return req.cookies.jwt;
  const h = req.headers.authorization;
  if (typeof h === "string" && h.startsWith("Bearer ")) {
    return h.slice(7).trim();
  }
  return null;
};

const protect = async (req, res, next) => {
  const token = readToken(req);

  if (!token) {
    return res
      .status(401)
      .json({ errors: [{ msg: "Not authorized, no token" }] });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select("-password");
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ errors: [{ msg: "Not authorized, token failed" }] });
  }
};

const curator = (req, res, next) => {
  if (!req.user || req.user.role !== "curator") {
    return res
      .status(403)
      .json({ errors: [{ msg: "Not authorized as a curator" }] });
  }
  next();
};

const artist = (req, res, next) => {
  if (!req.user || req.user.role !== "artist") {
    return res
      .status(403)
      .json({ errors: [{ msg: "Not authorized as an artist" }] });
  }
  next();
};

const artistAndCurator = (req, res, next) => {
  if (
    !req.user ||
    (req.user.role !== "artist" && req.user.role !== "curator")
  ) {
    return res
      .status(403)
      .json({ errors: [{ msg: "Not authorized as an artist or curator" }] });
  }
  next();
};

export { protect, curator, artist, artistAndCurator };
