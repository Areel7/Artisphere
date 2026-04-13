import ArtWork from "../Models/ArtWork.js";

const DEFAULT_STORY =
  "This painting captures a quiet moment suspended between reality and emotion. " +
  "Through layered brushstrokes and carefully blended colors, the artist explores " +
  "the complexity of inner thoughts that often go unspoken. Each stroke feels " +
  "intentional yet free, reflecting the balance between control and spontaneity " +
  "in the creative process.\n\n" +
  "At the heart of the composition lies a central form\u2014subtle yet commanding\u2014" +
  "symbolizing the human presence. It is neither fully defined nor entirely " +
  "abstract, allowing viewers to project their own interpretations onto it. " +
  "The background flows around this figure in soft transitions, suggesting the " +
  "passage of time and the fluid nature of memory.\n\n" +
  "The use of color is deeply expressive. Warm hues seem to glow from within, " +
  "evoking comfort and familiarity, while cooler tones drift across the canvas, " +
  "introducing a sense of distance and contemplation. The interplay of light and " +
  "shadow adds depth, guiding the viewer's eye and creating an almost meditative rhythm.\n\n" +
  "Texture plays a significant role in the painting's impact. Thick, visible " +
  "brushstrokes in some areas contrast with smooth, delicate blending in others, " +
  "inviting the viewer to not only see but almost feel the artwork. This tactile " +
  "quality reinforces the emotional weight carried within the piece.\n\n" +
  "Rather than telling a fixed story, the painting opens a space for reflection. " +
  "It invites the viewer to slow down, to observe, and to connect with their own " +
  "emotions\u2014making each encounter with the artwork a deeply personal experience.";

const fillStory = (artwork) => {
  const obj = artwork.toObject ? artwork.toObject() : { ...artwork };
  if (!obj.story) obj.story = DEFAULT_STORY;
  return obj;
};

const createArtWork = async (req, res) => {
  try {
    const { title, description, story, image, price, tags } = req.body;

    if (!title || !description || !image || !price || !tags) {
      return res
        .status(400)
        .json({ errors: [{ msg: "Please fill all the fields" }] });
    }

    const artwork = await ArtWork.create({
      artistId: req.user._id,
      title,
      description,
      story,
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
    res.json(artworks.map(fillStory));
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
    res.json(fillStory(artwork));
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
      artwork.story = req.body.story !== undefined ? req.body.story : artwork.story;
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
    res.json(artworks.map(fillStory));
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
