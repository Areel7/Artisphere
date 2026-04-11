import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Trash2,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  useGetUserCartQuery,
  useRemoveCartItemMutation,
  useClearCartMutation,
} from "../../redux/api/cart";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

const Cart = () => {
  const userInfo = useSelector((state) => state.auth.userInfo);
  const { data, isLoading, isError, refetch } = useGetUserCartQuery(undefined, {
    skip: !userInfo?.token,
  });
  const [removeCartItem, { isLoading: isRemoving }] = useRemoveCartItemMutation();
  const [clearCart, { isLoading: isClearing }] = useClearCartMutation();
  const navigate = useNavigate();

  const handleRemoveItem = async (id) => {
    try {
      await removeCartItem(id).unwrap();
      toast.success("Item removed from cart");
      refetch();
    } catch (err) {
      toast.error(err?.data?.errors?.[0]?.msg || "Failed to remove item");
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart().unwrap();
      toast.success("Cart cleared successfully");
      refetch();
    } catch {
      toast.error("Failed to clear cart");
    }
  };

  const handleCheckout = () => {
    navigate("/order");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-rose-400 gap-4">
        <AlertCircle className="w-12 h-12" />
        <p className="font-semibold text-lg">Failed to load cart</p>
        <button
          onClick={refetch}
          className="px-6 py-2 bg-zinc-800 rounded-full hover:bg-zinc-700 text-white transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { cartItems = [], totalPrice = 0 } = data || {};

  return (
    <div className="min-h-screen text-zinc-900 dark:text-zinc-100 p-6 pt-28">
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* Cart Items Section */}
        <div className="flex-1">
          <div className="mb-8">
            <h1 className="text-4xl font-light tracking-tighter text-zinc-900 dark:text-white mb-2 flex items-center gap-3">
              YOUR <span className="font-serif italic text-zinc-500 dark:text-white/50">CART</span>
              <ShoppingCart className="w-8 h-8 text-violet-500 ml-2" />
            </h1>
            <p className="text-zinc-600 dark:text-zinc-500">
              {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in your cart.
            </p>
          </div>

          {cartItems.length === 0 ? (
            <div className="p-12 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-3xl flex flex-col items-center text-center">
              <ShoppingCart className="w-16 h-16 text-zinc-400 dark:text-zinc-800 mb-4" />
              <h2 className="text-xl font-semibold mb-2 text-zinc-900 dark:text-white">Your cart is empty</h2>
              <p className="text-zinc-500 mb-6">Looks like you haven't added any artwork yet.</p>
              <Link
                to="/"
                className="px-8 py-3 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200 transition-colors"
              >
                Browse Artworks
              </Link>
            </div>
          ) : (
            <div className="space-y-4 relative">
              {/* Subtle visual element */}
              <div className="absolute top-0 -left-10 w-40 h-40 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />

              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center gap-6 p-4 rounded-2xl bg-white/80 border border-zinc-200 hover:border-zinc-300 dark:bg-zinc-900/40 dark:border-white/5 dark:hover:border-white/10 transition-colors group relative overflow-hidden shadow-sm dark:shadow-none"
                >
                  <div className="shrink-0 relative overflow-hidden rounded-xl">
                    <img
                      src={`${import.meta.env.VITE_BASE_URL}${item.artworkId.image}`}
                      alt={item.artworkId.title}
                      className="w-28 h-28 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20 pointer-events-none group-hover:bg-transparent transition-colors" />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* <Link
                      to={`/artwork/${item.artworkId._id}`}
                      className="text-xl font-medium truncate block hover:text-violet-400 transition-colors"
                    >
                      {item.artworkId.title}
                    </Link> */}
                    <p className="text-2xl text-zinc-900 dark:text-white mt-1">{item.artworkId.title}</p>
                    <p className="text-lg text-zinc-600 dark:text-white/70 mt-1">${item.price}</p>
                  </div>

                  <button
                    onClick={() => handleRemoveItem(item._id)}
                    disabled={isRemoving}
                    className="p-3 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all mr-2"
                    title="Remove item"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary Section */}
        {cartItems.length > 0 && (
          <div className="w-full lg:w-[380px]">
            <div className="sticky top-28 p-8 rounded-3xl border border-zinc-200 bg-white/90 shadow-xl text-zinc-900 dark:border-white/10 dark:bg-gradient-to-br dark:from-zinc-900/97 dark:to-zinc-950/99 dark:text-white dark:shadow-[0_24px_60px_rgba(0,0,0,0.4)]">
              <h2 className="text-xl font-medium mb-6 flex items-center justify-between">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                  <span>Subtotal</span>
                  <span className="text-zinc-900 dark:text-white">${totalPrice}</span>
                </div>
                <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                  <span>Shipping</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">Free</span>
                </div>
              </div>

              <div className="h-px bg-zinc-200 dark:bg-zinc-800 mb-6" />

              <div className="flex justify-between items-end mb-8">
                <span className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
                  Total
                </span>
                <span className="text-3xl font-light text-zinc-900 dark:text-white">{`$${totalPrice}`}</span>
              </div>

              <button 
                onClick={handleCheckout}
                className="w-full bg-white text-black font-semibold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all group mb-4">
                Proceed to Checkout
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={handleClearCart}
                disabled={isClearing}
                className="w-full py-3 text-sm text-zinc-500 hover:text-rose-400 transition-colors"
              >
                {isClearing ? "Clearing cart..." : "Clear entire cart"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
