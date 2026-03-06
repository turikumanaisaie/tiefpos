import { useState } from "react";
import { ScanBarcode, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import BarcodeScanner from "@/components/BarcodeScanner";
import { addProduct, findProductByBarcode } from "@/stores/posStore";
import { toast } from "sonner";

const ScanAddPage = () => {
  const [scannedCode, setScannedCode] = useState("");
  const [form, setForm] = useState({ name: "", price: 0, category: "", stock: 0 });
  const [showScanner, setShowScanner] = useState(true);

  const handleScan = (code: string) => {
    const existing = findProductByBarcode(code);
    if (existing) {
      toast.info(`Product "${existing.name}" already exists with this barcode`);
    }
    setScannedCode(code);
    setShowScanner(false);
  };

  const handleSave = () => {
    if (!scannedCode || !form.name) {
      toast.error("Scan a barcode and enter a name");
      return;
    }
    addProduct({
      id: crypto.randomUUID(),
      barcode: scannedCode,
      name: form.name,
      price: form.price,
      category: form.category,
      stock: form.stock,
      createdAt: new Date().toISOString(),
    });
    toast.success("Product registered!");
    setScannedCode("");
    setForm({ name: "", price: 0, category: "", stock: 0 });
    setShowScanner(true);
  };

  return (
    <div className="min-h-screen pb-20 px-4 pt-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
          <ScanBarcode className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Scan & Register</h1>
          <p className="text-xs text-muted-foreground">Scan barcode to add a new product</p>
        </div>
      </div>

      {showScanner ? (
        <BarcodeScanner onScan={handleScan} />
      ) : (
        <div className="bg-card rounded-xl border border-border shadow-card p-4 space-y-4">
          <div className="bg-muted rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Scanned Code</p>
            <p className="font-mono font-bold text-lg">{scannedCode}</p>
          </div>
          <div>
            <Label>Product Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Price ($)</Label>
              <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} className="font-mono" />
            </div>
            <div>
              <Label>Stock</Label>
              <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} className="font-mono" />
            </div>
          </div>
          <div>
            <Label>Category</Label>
            <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1 gap-2">
              <Check className="w-4 h-4" /> Register Product
            </Button>
            <Button variant="outline" onClick={() => { setShowScanner(true); setScannedCode(""); }}>
              Rescan
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScanAddPage;
