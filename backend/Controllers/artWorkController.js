import ArtWork from "../Models/ArtWork.js";

const createArtWork = async (req, res) => {
  try {
    const { title, description, image, price, tags } = req.body;

    if (!title || !description || !image || !price || !tags) {
      return res
        .status(400)
        .json({ errors: [{ msg: "Please fill all the fields" }] });
    }

    const artwork = await ArtWork.create({
      artistId: req.user._id,
      title,
      description,
      image,
      price,
      tags,
    });
    res.status(201).json(artwork);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: "Internal server error" }] });
  }
};

const deleteArtWork = async (req, res) => {
  try {
    const artwork = await ArtWork.findById(req.params.id);
    if (!artwork) {
      return res.status(404).json({ errors: [{ msg: "Artwork not found" }] });
    }
    if (
      artwork.artistId.toString() === req.user._id.toString() ||
      req.user.role === "curator"
    ) {
      await artwork.deleteOne();
      res.json({ msg: "Artwork removed" });
    } else {
      return res
        .status(403)
        .json({ errors: [{ msg: "Not authorized to delete this artwork" }] });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: "Internal server error" }] });
  }
};

const getAllArtWorks = async (req, res) => {
  try {
    const artworks = await ArtWork.find().populate("artistId", "username");
    res.json(artworks);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: "Internal server error" }] });
  }
};

const getSingleArtWork = async (req, res) => {
  try {
    const artwork = await ArtWork.findById(req.params.id).populate(
      "artistId",
      "username",
    );
    if (!artwork) {
      return res.status(404).json({ errors: [{ msg: "Artwork not found" }] });
    }
    res.json(artwork);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: "Internal server error" }] });
  }
};

const updateArtWork = async (req, res) => {
  try {
    const artwork = await ArtWork.findById(req.params.id);
    if (!artwork) {
      return res.status(404).json({ errors: [{ msg: "Artwork not found" }] });
    }
    if (artwork.artistId.toString() === req.user._id.toString()) {
      artwork.title = req.body.title || artwork.title;
      artwork.description = req.body.description || artwork.description;
      artwork.image = req.body.image || artwork.image;
      artwork.price = req.body.price || artwork.price;
      artwork.tags = req.body.tags || artwork.tags;
      await artwork.save();
      res.json(artwork);
    } else {
      return res
        .status(403)
        .json({ errors: [{ msg: "Not authorized to update this artwork" }] });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: "Internal server error" }] });
  }
};

const getArtWorksByArtistId = async (req, res) => {
  try {
    const artworks = await ArtWork.find({ artistId: req.params.id }).populate(
      "artistId",
      "username",
    );
    res.json(artworks);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: "Internal server error" }] });
  }
};

export {
  createArtWork,
  deleteArtWork,
  getAllArtWorks,
  getSingleArtWork,
  updateArtWork,
  getArtWorksByArtistId,
};
