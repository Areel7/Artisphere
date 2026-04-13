import mongoose from "mongoose";

const DEFAULT_STORY =
  "This painting captures a quiet moment suspended between reality and emotion. " +
  "Through layered brushstrokes and carefully blended colors, the artist explores " +
  "the complexity of inner thoughts that often go unspoken. Each stroke feels " +
  "intentional yet free, reflecting the balance between control and spontaneity " +
  "in the creative process.\n\n" +
  "At the heart of the composition lies a central form—subtle yet commanding—" +
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
  "emotions—making each encounter with the artwork a deeply personal experience.";

const artworkScheema = new mongoose.Schema(
  {
    artistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
    },
    story: {
      type: String,
      default: DEFAULT_STORY,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    tags: {
      type: [String],
      required: true,
    },
  },
  { timestamps: true }
);

const ArtWork = mongoose.model("ArtWork", artworkScheema);
export default ArtWork;