import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetUserCartQuery } from "../../redux/api/cart";
import { useCheckoutOrderMutation } from "../../redux/api/order";
import {
  CreditCard,
  Calendar,
  Lock,
  CheckCircle2,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";

const Order = () => {
  const navigate = useNavigate();
  const { data, isLoading: isCartLoading } = useGetUserCartQuery();
  const [checkoutOrder, { isLoading: isCheckingOut }] =
    useCheckoutOrderMutation();

  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    expiry: "",
    cvc: "",
    nameOnCard: "",
  });

  const { cartItems = [], totalPrice = 0 } = data || {};

  const handleInputChange = (e) => {
    setPaymentDetails((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    // Basic validation
    if (
      !paymentDetails.cardNumber ||
      !paymentDetails.expiry ||
      !paymentDetails.cvc
    ) {
      toast.error("Please fill in all payment details");
      return;
    }

    try {
      await checkoutOrder().unwrap();
      toast.success("Payment successful! Order placed.");
      navigate("/"); // Navigate to profile after placing order, or anywhere else
    } catch (err) {
      toast.error(err?.data?.errors?.[0]?.msg || "Failed to process payment");
    }
  };

  if (isCartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  const inputClasses =
    "w-full bg-zinc-900/60 border border-zinc-800 text-zinc-100 placeholder-zinc-600 rounded-xl px-4 py-3 pl-11 text-sm focus:outline-none focus:border-zinc-600 focus:bg-zinc-900 transition-all duration-200 mt-2";

  return (
    <div className="min-h-screen text-zinc-100 p-6 pt-28">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-light tracking-tighter text-white mb-2">
            SECURE{" "}
            <span className="font-serif italic text-white/50">CHECKOUT</span>
          </h1>
          <p className="text-zinc-500">
            Complete your payment details to finalize the order.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Payment Form */}
          <div
            className="p-8 rounded-3xl relative overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, rgba(24,24,27,0.97) 0%, rgba(15,15,18,0.99) 100%)",
              border: "1px solid rgba(255,255,255,0.07)",
              boxShadow:
                "0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03) inset",
            }}
          >
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

            <form
              onSubmit={handlePlaceOrder}
              className="relative z-10 space-y-6"
            >
              <h2 className="text-xl font-medium flex items-center gap-2 border-b border-zinc-800 pb-4 mb-4">
                <CreditCard className="w-5 h-5 text-violet-400" />
                Payment Information
              </h2>

              <div className="relative">
                <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                  Name on Card
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3.5 top-[1.15rem] w-4 h-4 text-zinc-600" />
                  <input
                    type="text"
                    name="nameOnCard"
                    value={paymentDetails.nameOnCard}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className={inputClasses}
                  />
                </div>
              </div>

              <div className="relative">
                <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                  Card Number
                </label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3.5 top-[1.15rem] w-4 h-4 text-zinc-600" />
                  <input
                    type="text"
                    name="cardNumber"
                    value={paymentDetails.cardNumber}
                    onChange={handleInputChange}
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                    className={inputClasses}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                    Expiry Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-[1.15rem] w-4 h-4 text-zinc-600" />
                    <input
                      type="text"
                      name="expiry"
                      value={paymentDetails.expiry}
                      onChange={handleInputChange}
                      placeholder="MM/YY"
                      maxLength={5}
                      className={inputClasses}
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                    CVC
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-[1.15rem] w-4 h-4 text-zinc-600" />
                    <input
                      type="text"
                      name="cvc"
                      value={paymentDetails.cvc}
                      onChange={handleInputChange}
                      placeholder="123"
                      maxLength={4}
                      className={inputClasses}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isCheckingOut}
                className="w-full mt-6 bg-white text-black font-semibold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all disabled:opacity-50"
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" /> Pay ${totalPrice}
                  </>
                )}
              </button>

              <div className="text-center text-xs text-zinc-600 mt-4 flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" /> Payments are securely processed.
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-medium text-white mb-2">
                Order Summary
              </h2>
              <p className="text-zinc-500 text-sm">
                Review the items in your order.
              </p>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-zinc-900/40 border border-white/5"
                >
                  <img
                    src={`${import.meta.env.VITE_BASE_URL}${item.artworkId.image}`}
                    alt={item.artworkId.title}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-white truncate">
                      {item.artworkId.title}
                    </h3>
                    <p className="text-sm text-zinc-400 mt-1">${item.price}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 border-t border-zinc-800 pt-6">
              <div className="flex justify-between items-center text-zinc-400 mb-2">
                <span>Subtotal</span>
                <span>${totalPrice}</span>
              </div>
              <div className="flex justify-between items-center text-zinc-400 mb-6">
                <span>Shipping</span>
                <span className="text-emerald-400">Free</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
                  Total to pay
                </span>
                <span className="text-3xl font-light text-white">
                  ${totalPrice}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Order;
