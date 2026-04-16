import Order from "../Models/Order.js";
import Cart from "../Models/Cart.js";
import Stripe from "stripe";

let stripe;

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

const createPaymentIntent = async (req, res) => {
  try {
    if (!stripe) {
      stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    }

    const userId = req.user._id;
    const cartItems = await Cart.find({ userId });

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ errors: [{ msg: "Cart is empty" }] });
    }

    // Calculate absolute order threshold entirely on server to eliminate UI manipulation
    const amount = cartItems.reduce((acc, item) => acc + item.price, 0);

    // Create a PaymentIntent with the final calculated cart threshold amount
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects cents, not floating dollars
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errors: [{ msg: "Failed to generate secure payment intent" }] });
  }
};

const getAllOrdersForAdmin = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "username email role")
      .populate({
        path: "artworkId",
        select: "title price image",
      })
      .sort({ createdAt: -1 })
      .lean();

    const completed = orders.filter((o) => o.paymentStatus === "completed");
    const revenue = completed.reduce((acc, o) => acc + (Number(o.amount) || 0), 0);
    const pending = orders.filter((o) => o.paymentStatus === "pending").length;

    res.status(200).json({
      orders,
      summary: {
        totalOrders: orders.length,
        completedOrders: completed.length,
        pendingOrders: pending,
        totalRevenue: revenue,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errors: [{ msg: "Server error fetching orders" }] });
  }
};

export { proceedToCheckout, getUserOrders, createPaymentIntent, getAllOrdersForAdmin };
