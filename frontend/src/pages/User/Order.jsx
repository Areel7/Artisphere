import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGetUserCartQuery } from "../../redux/api/cart";
import { useCheckoutOrderMutation, useCreatePaymentIntentMutation } from "../../redux/api/order";
import { CreditCard, Lock, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

// Initialize Stripe Promise globally
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ totalPrice, onProcessing, cartItems, navigate, checkoutOrder }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;
    if (cartItems.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    setIsProcessing(true);
    onProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required', // Avoid full page refresh redirect unless 3D Secure triggers
    });

    if (error) {
      toast.error(error.message || "Payment failed");
      setIsProcessing(false);
      onProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      try {
        // Execute the backend checkout order mutation after successful Stripe response
        await checkoutOrder().unwrap();
        toast.success("Payment successful! Order placed.");
        navigate("/order-detail");
      } catch (err) {
        toast.error(err?.data?.errors?.[0]?.msg || "Failed to finalize order log in system");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
      <h2 className="text-xl font-medium flex items-center gap-2 border-b border-zinc-800 pb-4 mb-4">
        <CreditCard className="w-5 h-5 text-violet-400" />
        Payment Information
      </h2>
      
      {/* Stripe Payment Element automatically generates PCI compliant secure credit card fields */}
      <div className="bg-white/5 p-4 rounded-xl border border-white/5 min-h-[250px]">
        <PaymentElement id="payment-element" options={{ 
            layout: 'tabs',
        }} />
      </div>

      <button
        type="submit"
        disabled={isProcessing || !stripe}
        className="w-full mt-6 bg-white text-black font-semibold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all disabled:opacity-50"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" /> Processing Securely...
          </>
        ) : (
          <>
            <CheckCircle2 className="w-5 h-5" /> Pay ${totalPrice}
          </>
        )}
      </button>

      <div className="text-center text-xs text-zinc-600 mt-4 flex items-center justify-center gap-1">
        <Lock className="w-3 h-3" /> Payments are centrally processed & encrypted securely via Stripe.
      </div>
    </form>
  );
};

const Order = () => {
  const navigate = useNavigate();
  const { data, isLoading: isCartLoading } = useGetUserCartQuery();
  const [checkoutOrder] = useCheckoutOrderMutation();
  const [createPaymentIntent] = useCreatePaymentIntentMutation();

  const [clientSecret, setClientSecret] = useState("");
  const [isIntentLoading, setIsIntentLoading] = useState(true);

  const { cartItems = [], totalPrice = 0 } = data || {};

  // Request the clientSecret strictly when cart populates
  useEffect(() => {
    const fetchIntent = async () => {
      if (cartItems.length > 0) {
        setIsIntentLoading(true);
        try {
          const res = await createPaymentIntent().unwrap();
          setClientSecret(res.clientSecret);
        } catch {
          toast.error("Failed to initialize payment gateway");
        } finally {
          setIsIntentLoading(false);
        }
      } else {
        setIsIntentLoading(false);
      }
    };
    fetchIntent();
  }, [cartItems.length, createPaymentIntent]);

  if (isCartLoading || isIntentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-zinc-100 p-6 pt-28">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-light tracking-tighter text-white mb-2">
            SECURE <span className="font-serif italic text-white/50">CHECKOUT</span>
          </h1>
          <p className="text-zinc-500">
            Complete your payment securely with Stripe to finalize the order.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Payment Form wrapped in Stripe Elements */}
          <div
            className="p-8 rounded-3xl relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(24,24,27,0.97) 0%, rgba(15,15,18,0.99) 100%)",
              border: "1px solid rgba(255,255,255,0.07)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03) inset",
            }}
          >
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

            {clientSecret && (
              <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
                <CheckoutForm 
                  totalPrice={totalPrice} 
                  cartItems={cartItems} 
                  navigate={navigate} 
                  checkoutOrder={checkoutOrder} 
                  onProcessing={() => {}} 
                />
              </Elements>
            )}
            
            {!clientSecret && cartItems.length > 0 && (
                <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
                    Re-establishing secure connection...
                </div>
            )}
            {!clientSecret && cartItems.length === 0 && (
                <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
                    Your cart is empty. Nothing to checkout!
                </div>
            )}
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
