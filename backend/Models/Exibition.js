import mongoose from "mongoose";

const exibitionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  curatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  artworkIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ArtWork",
    },
  ],
}, {timestamps: true});

const Exibition = mongoose.model("Exibition", exibitionSchema);
export default Exibition;
