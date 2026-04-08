import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    artworkId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ArtWork",
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    isPurchased: {
        type: Boolean,
        default: false,
    },

}, { timestamps: true });

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;