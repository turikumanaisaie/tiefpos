import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, DollarSign, ShoppingBag, Package, Calendar } from "lucide-react";
import { getSales, getProducts } from "@/stores/posStore";
import { Sale, Product } from "@/types/pos";
import { toast } from "sonner";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

type Period = "daily" | "weekly" | "monthly";

const CHART_COLORS = [
  "hsl(160, 84%, 39%)",
  "hsl(37, 95%, 55%)",
  "hsl(210, 100%, 56%)",
  "hsl(0, 84%, 60%)",
  "hsl(280, 60%, 50%)",
];

const DashboardPage = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [period, setPeriod] = useState<Period>("daily");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, p] = await Promise.all([getSales(), getProducts()]);
        setSales(s);
        setProducts(p);
      } catch {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalRevenue = sales.reduce((s, sale) => s + sale.total, 0);
  const totalSales = sales.length;
  const totalProducts = products.length;
  const avgSale = totalSales > 0 ? totalRevenue / totalSales : 0;

  const todayRevenue = useMemo(() => {
    const today = new Date().toDateString();
    return sales
      .filter((s) => new Date(s.date).toDateString() === today)
      .reduce((acc, s) => acc + s.total, 0);
  }, [sales]);

  // Revenue chart data
  const revenueData = useMemo(() => {
    if (sales.length === 0) return [];
    const grouped: Record<string, number> = {};

    sales.forEach((sale) => {
      const d = new Date(sale.date);
      let key: string;
      if (period === "daily") {
        key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      } else if (period === "weekly") {
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        key = weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      } else {
        key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      }
      grouped[key] = (grouped[key] || 0) + sale.total;
    });

    return Object.entries(grouped)
      .map(([name, revenue]) => ({ name, revenue: Math.round(revenue * 100) / 100 }))
      .slice(-12);
  }, [sales, period]);

  // Top products by revenue
  const topProducts = useMemo(() => {
    const map: Record<string, { name: string; revenue: number; qty: number }> = {};
    sales.forEach((s) =>
      s.items.forEach((item) => {
        const key = item.product.name;
        if (!map[key]) map[key] = { name: key, revenue: 0, qty: 0 };
        map[key].revenue += item.product.price * item.quantity;
        map[key].qty += item.quantity;
      })
    );
    return Object.values(map)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [sales]);

  // Sales count by day for bar chart
  const salesCountData = useMemo(() => {
    const grouped: Record<string, number> = {};
    sales.forEach((s) => {
      const key = new Date(s.date).toLocaleDateString("en-US", { weekday: "short" });
      grouped[key] = (grouped[key] || 0) + 1;
    });
    return Object.entries(grouped).map(([name, count]) => ({ name, count }));
  }, [sales]);

  if (loading) {
    return (
      <div className="min-h-screen pb-20 px-4 pt-4 max-w-lg mx-auto flex items-center justify-center">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 px-4 pt-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Dashboard</h1>
          <p className="text-xs text-muted-foreground">Sales analytics overview</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { label: "Today", value: `$${todayRevenue.toFixed(2)}`, icon: Calendar, color: "text-primary" },
          { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: "text-primary" },
          { label: "Total Sales", value: String(totalSales), icon: ShoppingBag, color: "text-accent" },
          { label: "Avg Sale", value: `$${avgSale.toFixed(2)}`, icon: TrendingUp, color: "text-accent" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-card rounded-xl border border-border shadow-card p-3"
          >
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider">{stat.label}</span>
            </div>
            <p className="text-lg font-bold font-mono">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Period Selector */}
      <div className="flex gap-1 mb-4 bg-muted rounded-lg p-1">
        {(["daily", "weekly", "monthly"] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`flex-1 text-xs font-medium py-2 rounded-md transition-colors capitalize ${
              period === p
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-card rounded-xl border border-border shadow-card p-4 mb-4">
        <h3 className="text-sm font-semibold mb-3">Revenue Trend</h3>
        {revenueData.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No sales data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 88%)" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(220, 10%, 46%)" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(220, 10%, 46%)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(0, 0%, 100%)",
                  border: "1px solid hsl(220, 14%, 88%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(160, 84%, 39%)"
                strokeWidth={2}
                fill="url(#revGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Sales Count Bar Chart */}
      {salesCountData.length > 0 && (
        <div className="bg-card rounded-xl border border-border shadow-card p-4 mb-4">
          <h3 className="text-sm font-semibold mb-3">Sales by Day</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={salesCountData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 88%)" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(220, 10%, 46%)" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(220, 10%, 46%)" allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(0, 0%, 100%)",
                  border: "1px solid hsl(220, 14%, 88%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="count" fill="hsl(37, 95%, 55%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Products */}
      {topProducts.length > 0 && (
        <div className="bg-card rounded-xl border border-border shadow-card p-4 mb-4">
          <h3 className="text-sm font-semibold mb-3">Top Products</h3>
          <div className="flex gap-4">
            <div className="w-32 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topProducts}
                    dataKey="revenue"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={50}
                    strokeWidth={2}
                  >
                    {topProducts.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-2 text-xs">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                  />
                  <span className="truncate flex-1">{p.name}</span>
                  <span className="font-mono font-semibold">${p.revenue.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Product Stats */}
      <div className="bg-card rounded-xl border border-border shadow-card p-4">
        <div className="flex items-center gap-2 mb-1">
          <Package className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Inventory</span>
        </div>
        <p className="text-2xl font-bold font-mono">{totalProducts}</p>
        <p className="text-xs text-muted-foreground">products in catalog</p>
      </div>
    </div>
  );
};

export default DashboardPage;
