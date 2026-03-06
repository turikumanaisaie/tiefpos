import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Plus, Minus, ScanBarcode, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CartItem } from "@/types/pos";
import { findProductByBarcode, saveSale } from "@/stores/posStore";
import { generateReceipt } from "@/utils/receiptPdf";
import BarcodeScanner from "@/components/BarcodeScanner";
import { toast } from "sonner";

const SalesPage = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [loading, setLoading] = useState(false);

  const addToCart = async (barcode: string) => {
    try {
      const product = await findProductByBarcode(barcode);
      if (!product) {
        toast.error("Product not found for this barcode");
        return;
      }
      setCart((prev) => {
        const existing = prev.find((c) => c.product.id === product.id);
        if (existing) {
          return prev.map((c) =>
            c.product.id === product.id ? { ...c, quantity: c.quantity + 1 } : c
          );
        }
        return [...prev, { product, quantity: 1 }];
      });
      toast.success(`Added ${product.name}`);
    } catch {
      toast.error("Error looking up product");
    }
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) =>
          c.product.id === id ? { ...c, quantity: Math.max(0, c.quantity + delta) } : c
        )
        .filter((c) => c.quantity > 0)
    );
  };

  const total = cart.reduce((s, c) => s + c.product.price * c.quantity, 0);

  const completeSale = async () => {
    if (cart.length === 0 || loading) return;
    setLoading(true);
    try {
      await saveSale(cart, total);
      generateReceipt(cart, total);
      setCart([]);
      toast.success("Sale completed! Receipt downloaded.");
    } catch {
      toast.error("Error completing sale");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 px-4 pt-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
          <ShoppingCart className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Tief POS</h1>
          <p className="text-xs text-muted-foreground">Point of Sale</p>
        </div>
      </div>

      {/* Scanner */}
      <div className="mb-4">
        {scanning ? (
          <BarcodeScanner
            onScan={(code) => {
              addToCart(code);
              setScanning(false);
            }}
            onClose={() => setScanning(false)}
          />
        ) : (
          <div className="flex gap-2">
            <Button onClick={() => setScanning(true)} className="gap-2 flex-1">
              <ScanBarcode className="w-4 h-4" /> Scan Barcode
            </Button>
            <form
              className="flex gap-2 flex-1"
              onSubmit={(e) => {
                e.preventDefault();
                if (manualCode.trim()) {
                  addToCart(manualCode.trim());
                  setManualCode("");
                }
              }}
            >
              <Input
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Enter code..."
                className="font-mono text-sm"
              />
              <Button type="submit" variant="outline" size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </form>
          </div>
        )}
      </div>

      {/* Cart */}
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/50">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Cart ({cart.length} items)
          </h2>
        </div>
        <AnimatePresence>
          {cart.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              Scan a barcode to add items
            </div>
          ) : (
            <div className="divide-y divide-border">
              {cart.map((item) => (
                <motion.div
                  key={item.product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      ${item.product.price.toFixed(2)} each
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-7 w-7"
                      onClick={() => updateQty(item.product.id, -1)}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-6 text-center text-sm font-semibold font-mono">
                      {item.quantity}
                    </span>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-7 w-7"
                      onClick={() => updateQty(item.product.id, 1)}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                    <span className="text-sm font-semibold w-16 text-right font-mono">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Total & Checkout */}
      {cart.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 bg-card rounded-xl border border-border shadow-card p-4"
        >
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-bold">Total</span>
            <span className="text-2xl font-bold font-mono text-primary">
              ${total.toFixed(2)}
            </span>
          </div>
          <Button
            onClick={completeSale}
            disabled={loading}
            className="w-full gap-2 h-12 text-base gradient-primary text-primary-foreground hover:opacity-90"
          >
            <Receipt className="w-5 h-5" /> {loading ? "Processing..." : "Complete Sale & Print Receipt"}
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default SalesPage;
