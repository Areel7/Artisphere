import React from "react";
import { useGetAdminOrdersQuery } from "../../redux/api/admin.js";

const fmtMoney = (n) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(
    Number(n) || 0,
  );

const AdminAnalytics = () => {
  const { data, isLoading, isError, refetch } = useGetAdminOrdersQuery();

  if (isLoading) {
    return (
      <p className="text-zinc-500 dark:text-white/50 text-sm">Loading analytics…</p>
    );
  }
  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/30 p-4 text-sm">
        Could not load orders.{" "}
        <button type="button" onClick={() => refetch()} className="underline">
          Retry
        </button>
      </div>
    );
  }

  const summary = data?.summary || {};
  const orders = data?.orders || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white tracking-tight">
          Analytics
        </h1>
        <p className="text-sm text-zinc-500 dark:text-white/45 mt-1">
          Purchases and revenue across all accounts.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total orders", value: summary.totalOrders ?? 0 },
          { label: "Completed", value: summary.completedOrders ?? 0 },
          { label: "Pending", value: summary.pendingOrders ?? 0 },
          {
            label: "Revenue (completed)",
            value: fmtMoney(summary.totalRevenue ?? 0),
            emphasize: true,
          },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white/90 dark:bg-zinc-900/70 p-5"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-white/45">
              {card.label}
            </p>
            <p
              className={`mt-2 text-2xl font-semibold text-zinc-900 dark:text-white ${
                card.emphasize ? "text-violet-600 dark:text-violet-400" : ""
              }`}
            >
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-zinc-200 dark:border-white/10 overflow-hidden bg-white/90 dark:bg-zinc-900/70">
        <div className="px-4 py-3 border-b border-zinc-200 dark:border-white/8">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
            All orders
          </h2>
        </div>
        <div className="overflow-x-auto max-h-[55vh] overflow-y-auto">
          <table className="w-full text-sm text-left">
            <thead className="sticky top-0 z-10 bg-zinc-100/95 dark:bg-zinc-800/95 text-zinc-600 dark:text-white/60 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Buyer</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Items</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-white/8">
              {orders.map((o) => (
                <tr key={o._id} className="hover:bg-zinc-50/80 dark:hover:bg-white/[0.03]">
                  <td className="px-4 py-2 text-zinc-600 dark:text-white/60 whitespace-nowrap text-xs">
                    {o.createdAt
                      ? new Date(o.createdAt).toLocaleString()
                      : "—"}
                  </td>
                  <td className="px-4 py-2">
                    <div className="font-medium text-zinc-900 dark:text-white">
                      {o.userId?.username || "User"}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-white/40 truncate max-w-[180px]">
                      {o.userId?.email}
                    </div>
                  </td>
                  <td className="px-4 py-2 font-medium">
                    {fmtMoney(o.amount)}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        o.paymentStatus === "completed"
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                          : "bg-amber-500/15 text-amber-800 dark:text-amber-300"
                      }`}
                    >
                      {o.paymentStatus || "pending"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-zinc-600 dark:text-white/60 text-xs">
                    {(o.artworkId || []).length} artwork(s)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
