import Order from "../Models/Order.js";
import Cart from "../Models/Cart.js";

const proceedToCheckout = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch the user's cart items
    const cartItems = await Cart.find({ userId });

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ errors: [{ msg: "Cart is empty" }] });
    }

    // Extract artwork IDs and calculate total amount
    const artworkId = cartItems.map(item => item.artworkId);
    const amount = cartItems.reduce((acc, item) => acc + item.price, 0);

    // Create the order
    const order = new Order({
      userId,
      artworkId,
      amount,
      paymentStatus: "completed", // We can default to completed for this dummy checkout
    });

    await order.save();

    // Clear the user's cart after successful checkout
    await Cart.deleteMany({ userId });

    res.status(201).json({ msg: "Checkout successful", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errors: [{ msg: "Server error during checkout" }] });
  }
};

const getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user._id }).populate({
            path: "artworkId",
            select: "title price image"
        }).sort({ createdAt: -1 });

        res.status(200).json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ errors: [{ msg: "Server error fetching orders" }] });
    }
};

export { proceedToCheckout, getUserOrders };
