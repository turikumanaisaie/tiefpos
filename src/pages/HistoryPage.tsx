import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSales } from "@/stores/posStore";
import { generateReceipt } from "@/utils/receiptPdf";
import { Sale } from "@/types/pos";

const HistoryPage = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  useEffect(() => setSales(getSales().reverse()), []);

  const todayTotal = sales
    .filter((s) => new Date(s.date).toDateString() === new Date().toDateString())
    .reduce((acc, s) => acc + s.total, 0);

  return (
    <div className="min-h-screen pb-20 px-4 pt-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Sales History</h1>
          <p className="text-xs text-muted-foreground">View past transactions</p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-card p-4 mb-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Today's Revenue</p>
        <p className="text-3xl font-bold font-mono text-primary">${todayTotal.toFixed(2)}</p>
      </div>

      <div className="space-y-2">
        {sales.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground text-sm">
            No sales recorded yet
          </div>
        ) : (
          sales.map((sale, i) => (
            <motion.div
              key={sale.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-card rounded-xl border border-border shadow-card p-3"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(sale.date).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {sale.items.length} item{sale.items.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold font-mono">${sale.total.toFixed(2)}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => generateReceipt(sale.items, sale.total)}
                  >
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {sale.items.map((item) => (
                  <span key={item.product.id} className="mr-2">
                    {item.product.name} ×{item.quantity}
                  </span>
                ))}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
