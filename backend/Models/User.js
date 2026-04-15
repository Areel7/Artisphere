import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["artist", "visitor", "curator"],
      default: "visitor",
    },
    recentlyViewedArtworks: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "ArtWork",
      default: [],
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);
export default User;
