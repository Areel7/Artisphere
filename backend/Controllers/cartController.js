import Cart from "../Models/Cart.js";
import ArtWork from "../Models/ArtWork.js";

const getUserCart = async (req, res) => {
  try {
    const cartItems = await Cart.find({ userId: req.user._id }).populate({
      path: "artworkId",
      select: "title price image",
    });

    if (!cartItems || cartItems.length === 0) {
      return res.status(200).json({ cartItems: [], totalPrice: 0 });
    }

    const totalPrice = cartItems.reduce((acc, item) => acc + item.price, 0);
    res.status(200).json({ cartItems, totalPrice });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

const addToCart = async (req, res) => {
    try {
        const { artworkId } = req.body;
        
        const artwork = await ArtWork.findById(artworkId);
        if (!artwork) {
            return res.status(404).json({ errors: [{ msg: "Artwork not found" }] });
        }

        const existingCartItem = await Cart.findOne({ userId: req.user._id, artworkId });
        
        if (existingCartItem) {
            return res.status(400).json({ errors: [{ msg: "Item already in cart" }] });
        }

        const price = artwork.price;

        const cartItem = new Cart({ userId: req.user._id, artworkId, price });
        await cartItem.save();
        res.status(201).json(cartItem);
    } catch (error) {
        console.log(error);
        res.status(500).json({ errors: [{ msg: "Server error" }] });
    }
}; 

const removeCartItem = async (req, res) => {
    try {
        const { artworkId } = req.params; // It's best if we check params first
        const idToRemove = artworkId || req.body.artworkId;

        const cartItem = await Cart.findOne({ userId: req.user._id, artworkId: idToRemove });
        if (!cartItem) {
            return res.status(404).json({ errors: [{ msg: "Cart item not found" }] });
        }
        
        await Cart.findByIdAndDelete(cartItem._id);
        res.status(200).json({ msg: "Item removed from cart successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ errors: [{ msg: "Server error" }] });
    }
};

const clearCart = async (req, res) => {
    try {
        await Cart.deleteMany({ userId: req.user._id });
        res.status(200).json({ msg: "Cart cleared successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ errors: [{ msg: "Server error" }] });
    }
};

export { getUserCart, addToCart, removeCartItem, clearCart };
