import React from "react";
import { Link } from "react-router-dom";
import { useGetUserOrdersQuery } from "../../redux/api/order";
import { PackageOpen, Calendar, DollarSign, CheckCircle2, Clock, Loader2, AlertCircle } from "lucide-react";

const OrderDetail = () => {
  const { data: orders, isLoading, isError, refetch } = useGetUserOrdersQuery();

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
        <p className="font-semibold text-lg">Failed to load order history</p>
        <button
          onClick={refetch}
          className="px-6 py-2 bg-zinc-800 rounded-full hover:bg-zinc-700 text-white transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-zinc-100 p-6 pt-28">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-light tracking-tighter text-white mb-2 flex items-center justify-center gap-3">
            YOUR <span className="font-serif italic text-white/50">ORDERS</span>
            <PackageOpen className="w-8 h-8 text-violet-500" />
          </h1>
          <p className="text-zinc-500">View your complete order history spanning back to your first purchase.</p>
        </div>

        {!orders || orders.length === 0 ? (
          <div className="p-12 border border-dashed border-zinc-800 rounded-3xl flex flex-col items-center text-center">
            <PackageOpen className="w-16 h-16 text-zinc-800 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No orders found</h2>
            <p className="text-zinc-500 mb-6">You haven't placed any orders yet.</p>
            <Link
              to="/"
              className="px-8 py-3 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200 transition-colors"
            >
              Browse Artworks
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="p-6 rounded-3xl relative overflow-hidden group hover:border-white/20 transition-all border border-white/5"
                style={{
                  background: "linear-gradient(135deg, rgba(24,24,27,0.8) 0%, rgba(15,15,18,0.9) 100%)",
                }}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/50 pb-6 mb-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-1">
                      Order ID
                    </p>
                    <p className="font-mono text-zinc-300 text-sm">{order._id}</p>
                  </div>
                  <div className="flex flex-wrap gap-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-violet-400" />
                      <span className="text-sm text-zinc-400">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm text-zinc-400 font-medium">${order.amount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {order.paymentStatus === "completed" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-500" />
                      )}
                      <span className="text-sm capitalize text-zinc-400">{order.paymentStatus}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {order.artworkId?.map((artwork) => (
                    <div
                      key={artwork._id}
                      className="flex items-center gap-4 p-3 rounded-xl bg-black/20"
                    >
                      <img
                        src={`${import.meta.env.VITE_BASE_URL}${artwork.image}`}
                        alt={artwork.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div>
                        <h3 className="font-medium text-white">{artwork.title}</h3>
                        <p className="text-sm text-zinc-500">${artwork.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetail;
