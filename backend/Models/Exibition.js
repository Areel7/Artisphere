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
  /** Live auctions in the exhibition room (optional). */
  auctionEnabled: {
    type: Boolean,
    default: false,
  },
  /** Max window per artwork from first bid until hard deadline (minutes). */
  auctionDurationMinutes: {
    type: Number,
    default: 15,
    min: 1,
    max: 10080,
  },
  /** Persisted wins (3s silence or duration end). */
  auctionSales: [
    {
      artworkId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ArtWork",
        required: true,
      },
      winnerUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      winnerUsername: { type: String, default: "" },
      winningBid: { type: Number, required: true },
      reason: {
        type: String,
        enum: ["silence", "deadline"],
        required: true,
      },
      soldAt: { type: Date, default: Date.now },
    },
  ],
}, {timestamps: true});

const Exibition = mongoose.model("Exibition", exibitionSchema);
export default Exibition;
