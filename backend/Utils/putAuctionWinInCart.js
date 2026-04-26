import mongoose from "mongoose";
import Cart from "../Models/Cart.js";

/**
 * Puts the auctioned artwork in the winner's cart at the winning bid price
 * (upsert so checkout / Stripe use the agreed amount).
 */
export async function putAuctionWinInCart(winnerUserId, artworkId, winningBid) {
  if (!mongoose.Types.ObjectId.isValid(winnerUserId)) {
    throw new Error("Invalid winner user id");
  }
  if (!mongoose.Types.ObjectId.isValid(artworkId)) {
    throw new Error("Invalid artwork id");
  }
  const price = Number(winningBid);
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error("Invalid winning bid");
  }
  const uid = new mongoose.Types.ObjectId(winnerUserId);
  const aid = new mongoose.Types.ObjectId(artworkId);

  await Cart.findOneAndUpdate(
    { userId: uid, artworkId: aid },
    {
      $set: {
        userId: uid,
        artworkId: aid,
        price,
        isPurchased: false,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}
