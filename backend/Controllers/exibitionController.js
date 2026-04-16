import mongoose from "mongoose";
import Exibition from "../Models/Exibition.js";
import ArtWork from "../Models/ArtWork.js";
import User from "../Models/User.js";
import ExhibitionMessage from "../Models/ExhibitionMessage.js";

/**
 * Nested populate on `artworkIds.artistId` is unreliable on Mongoose docs; use `.lean()`
 * then populate `artistId` on the plain artwork objects.
 */
function flattenArtworkForClient(art) {
  if (!art || typeof art !== "object") return art;
  const uid = art.artistId;
  const artistName =
    uid && typeof uid === "object" && uid.username != null
      ? String(uid.username).trim()
      : uid && typeof uid === "object" && uid.email
        ? String(uid.email).trim()
        : "";
  return {
    ...art,
    artistName,
    artworkTitle: art.title != null ? String(art.title).trim() : "",
  };
}

async function leanPopulateArtworkArtists(exhibitionRowOrRows) {
  const rows = Array.isArray(exhibitionRowOrRows)
    ? exhibitionRowOrRows
    : [exhibitionRowOrRows];
  for (const row of rows) {
    if (!row?.artworkIds?.length) continue;
    row.artworkIds = row.artworkIds.filter(Boolean);
    if (row.artworkIds.length === 0) continue;
    await ArtWork.populate(row.artworkIds, {
      path: "artistId",
      model: User,
      select: "username email",
    });
    row.artworkIds = row.artworkIds.map(flattenArtworkForClient);
  }
}

export const normalizeArtworkIds = (raw) => {
  if (raw == null) return [];
  if (Array.isArray(raw)) {
    return [...new Set(raw.map((id) => String(id).trim()).filter(Boolean))];
  }
  if (typeof raw === "string") {
    return [
      ...new Set(
        raw
          .split(/[,\s]+/)
          .map((s) => s.trim())
          .filter(Boolean),
      ),
    ];
  }
  return [];
};

const createExibition = async (req, res) => {
  try {
    const { title, description, startDate, endDate, artworkIds } = req.body;

    if (!title?.trim() || !description?.trim()) {
      return res
        .status(400)
        .json({ errors: [{ msg: "Title and description are required" }] });
    }
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ errors: [{ msg: "Start date and end date are required" }] });
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({ errors: [{ msg: "Invalid dates" }] });
    }
    if (end <= start) {
      return res
        .status(400)
        .json({ errors: [{ msg: "End date must be after start date" }] });
    }

    const ids = normalizeArtworkIds(artworkIds);
    if (ids.length === 0) {
      return res.status(400).json({
        errors: [{ msg: "Select at least one artwork" }],
      });
    }
    for (const id of ids) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res
          .status(400)
          .json({ errors: [{ msg: `Invalid artwork id: ${id}` }] });
      }
    }

    const found = await ArtWork.countDocuments({ _id: { $in: ids } });
    if (found !== ids.length) {
      return res.status(400).json({
        errors: [{ msg: "One or more selected artworks were not found" }],
      });
    }

    const exibition = new Exibition({
      title: title.trim(),
      description: description.trim(),
      startDate: start,
      endDate: end,
      curatorId: req.user._id,
      artworkIds: ids,
    });
    await exibition.save();
    res.status(201).json(exibition);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

const getAllExibitions = async (req, res) => {
  try {
    const exibitions = await Exibition.find({})
      .sort({ createdAt: -1 })
      .populate("curatorId", "username")
      .populate({
        path: "artworkIds",
        model: "ArtWork",
        select: "title image story artistId",
      })
      .lean();
    await leanPopulateArtworkArtists(exibitions);
    res.status(200).json(exibitions);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

const getExibitionById = async (req, res) => {
  try {
    const exibition = await Exibition.findById(req.params.id)
      .populate("curatorId", "username")
      .populate({
        path: "artworkIds",
        model: "ArtWork",
        select: "title image description story price tags artistId",
      })
      .lean();
    if (!exibition) {
      return res.status(404).json({ errors: [{ msg: "Exibition not found" }] });
    }
    await leanPopulateArtworkArtists(exibition);
    res.status(200).json(exibition);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

const getExhibitionMessages = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ errors: [{ msg: "Invalid exhibition id" }] });
    }
    const exists = await Exibition.exists({ _id: id });
    if (!exists) {
      return res.status(404).json({ errors: [{ msg: "Exibition not found" }] });
    }
    const rows = await ExhibitionMessage.find({ exhibitionId: id })
      .sort({ createdAt: 1 })
      .limit(400)
      .populate("userId", "username email")
      .lean();

    const messages = rows.map((m) => ({
      _id: m._id,
      body: m.body,
      createdAt: m.createdAt,
      user: m.userId
        ? {
            _id: m.userId._id,
            username: m.userId.username,
            email: m.userId.email,
          }
        : { username: "User", email: "" },
    }));
    res.json(messages);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

const getMyCuratorExhibitions = async (req, res) => {
  try {
    const exibitions = await Exibition.find({ curatorId: req.user._id })
      .sort({ createdAt: -1 })
      .populate("curatorId", "username")
      .populate({
        path: "artworkIds",
        model: "ArtWork",
        select: "title image story artistId",
      })
      .lean();
    await leanPopulateArtworkArtists(exibitions);
    res.status(200).json(exibitions);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

const deleteExhibition = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ errors: [{ msg: "Invalid exhibition id" }] });
    }

    const exibition = await Exibition.findById(id);
    if (!exibition) {
      return res.status(404).json({ errors: [{ msg: "Exhibition not found" }] });
    }

    const isSuper = req.user.role === "superadmin";
    if (
      String(exibition.curatorId) !== String(req.user._id) &&
      !isSuper
    ) {
      return res
        .status(403)
        .json({ errors: [{ msg: "Not authorized to delete this exhibition" }] });
    }

    await Exibition.findByIdAndDelete(id);
    res.status(200).json({ message: "Exhibition deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

const superAdminUpdateExhibition = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ errors: [{ msg: "Invalid exhibition id" }] });
    }
    const exibition = await Exibition.findById(id);
    if (!exibition) {
      return res.status(404).json({ errors: [{ msg: "Exhibition not found" }] });
    }

    const { title, description, startDate, endDate, artworkIds } = req.body;

    if (title != null && String(title).trim()) {
      exibition.title = String(title).trim();
    }
    if (description != null && String(description).trim()) {
      exibition.description = String(description).trim();
    }
    if (startDate != null) {
      const start = new Date(startDate);
      if (Number.isNaN(start.getTime())) {
        return res.status(400).json({ errors: [{ msg: "Invalid start date" }] });
      }
      exibition.startDate = start;
    }
    if (endDate != null) {
      const end = new Date(endDate);
      if (Number.isNaN(end.getTime())) {
        return res.status(400).json({ errors: [{ msg: "Invalid end date" }] });
      }
      exibition.endDate = end;
    }
    if (exibition.endDate <= exibition.startDate) {
      return res
        .status(400)
        .json({ errors: [{ msg: "End date must be after start date" }] });
    }

    if (artworkIds != null) {
      const ids = normalizeArtworkIds(artworkIds);
      if (ids.length === 0) {
        return res.status(400).json({
          errors: [{ msg: "Select at least one artwork" }],
        });
      }
      for (const oid of ids) {
        if (!mongoose.Types.ObjectId.isValid(oid)) {
          return res
            .status(400)
            .json({ errors: [{ msg: `Invalid artwork id: ${oid}` }] });
        }
      }
      const found = await ArtWork.countDocuments({ _id: { $in: ids } });
      if (found !== ids.length) {
        return res.status(400).json({
          errors: [{ msg: "One or more selected artworks were not found" }],
        });
      }
      exibition.artworkIds = ids;
    }

    await exibition.save();
    const updated = await Exibition.findById(id)
      .populate("curatorId", "username")
      .populate({
        path: "artworkIds",
        model: "ArtWork",
        select: "title image description story price tags artistId",
      })
      .lean();
    await leanPopulateArtworkArtists(updated);
    res.status(200).json(updated);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

export {
  createExibition,
  getAllExibitions,
  getExibitionById,
  getExhibitionMessages,
  getMyCuratorExhibitions,
  deleteExhibition,
  superAdminUpdateExhibition,
};
