import React, { useMemo } from "react";
import { useGetAdminOrdersQuery } from "../../redux/api/admin.js";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

const COLORS = ['#10b981', '#f59e0b', '#8b5cf6'];

const fmtMoney = (n) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(
    Number(n) || 0,
  );

const AdminAnalytics = () => {
  const { data, isLoading, isError, refetch } = useGetAdminOrdersQuery();

  const chartData = useMemo(() => {
    const orders = data?.orders || [];
    if (!orders.length) return { revenueByDate: [], ordersByDate: [], status: [] };
    
    const revMap = {};
    const countMap = {};
    let completedCount = 0;
    let pendingCount = 0;

    orders.forEach((o) => {
      if (o.paymentStatus === "completed") {
        completedCount++;
      } else {
        pendingCount++;
      }

      if (o.createdAt) {
        const dateObj = new Date(o.createdAt);
        const dateStr = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        
        if (o.paymentStatus === "completed") {
          revMap[dateStr] = (revMap[dateStr] || 0) + (o.amount || 0);
        }
        countMap[dateStr] = (countMap[dateStr] || 0) + 1;
      }
    });

    return {
      revenueByDate: Object.entries(revMap).map(([date, amount]) => ({ date, amount })),
      ordersByDate: Object.entries(countMap).map(([date, count]) => ({ date, count })),
      status: [
        { name: "Completed", value: completedCount },
        { name: "Pending", value: pendingCount }
      ]
    };
  }, [data]);

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

      {/* Revenue Graph */}
      {chartData.revenueByDate.length > 0 && (
        <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white/90 dark:bg-zinc-900/70 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-violet-500"></div>
            Revenue Over Time
          </h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.revenueByDate} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#52525b" strokeOpacity={0.15} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#71717a' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={(val) => `$${val}`}
                  tick={{ fontSize: 12, fill: '#71717a' }}
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: 'rgba(24, 24, 27, 0.95)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                  itemStyle={{ color: '#a78bfa' }}
                  formatter={(value) => [fmtMoney(value), "Revenue"]}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Orders & Status Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {chartData.ordersByDate.length > 0 && (
          <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white/90 dark:bg-zinc-900/70 p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              Order Volume
            </h2>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.ordersByDate} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#52525b" strokeOpacity={0.15} />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#71717a' }} 
                    dy={10}
                  />
                  <YAxis 
                    allowDecimals={false}
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#71717a' }}
                  />
                  <Tooltip
                    cursor={{ fill: '#a1a1aa', opacity: 0.1 }}
                    contentStyle={{ 
                      backgroundColor: 'rgba(24, 24, 27, 0.95)', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                    itemStyle={{ color: '#60a5fa' }}
                    formatter={(value) => [value, "Orders"]}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]} 
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {chartData.status.length > 0 && chartData.status.some(s => s.value > 0) && (
          <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white/90 dark:bg-zinc-900/70 p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              Payment Status
            </h2>
            <div className="h-[250px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.status}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.status.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(24, 24, 27, 0.95)', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
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
