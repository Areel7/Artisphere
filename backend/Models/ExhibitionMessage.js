import mongoose from "mongoose";

const exhibitionMessageSchema = new mongoose.Schema(
  {
    exhibitionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exibition",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
  },
  { timestamps: true },
);

exhibitionMessageSchema.index({ exhibitionId: 1, createdAt: 1 });

const ExhibitionMessage = mongoose.model(
  "ExhibitionMessage",
  exhibitionMessageSchema,
);
export default ExhibitionMessage;
