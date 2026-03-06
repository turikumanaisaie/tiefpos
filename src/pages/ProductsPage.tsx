import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Plus, Pencil, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Product } from "@/types/pos";
import { getProducts, addProduct, deleteProduct, updateProduct } from "@/stores/posStore";
import { toast } from "sonner";

const emptyForm = () => ({ name: "", price: 0, barcode: "", category: "", stock: 0 });

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    setLoading(true);
    try {
      setProducts(await getProducts());
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, []);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.includes(search)
  );

  const handleSave = async () => {
    if (!form.name || !form.barcode) {
      toast.error("Name and barcode are required");
      return;
    }
    try {
      if (editing) {
        await updateProduct({ ...editing, ...form });
        toast.success("Product updated");
      } else {
        await addProduct(form);
        toast.success("Product added");
      }
      setDialogOpen(false);
      setEditing(null);
      setForm(emptyForm());
      reload();
    } catch {
      toast.error("Error saving product");
    }
  };

  const handleEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, price: p.price, barcode: p.barcode, category: p.category, stock: p.stock });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      toast.success("Product deleted");
      reload();
    } catch {
      toast.error("Error deleting product");
    }
  };

  return (
    <div className="min-h-screen pb-20 px-4 pt-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Package className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold">Products</h1>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditing(null); setForm(emptyForm()); } }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="w-4 h-4" /> Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Product" : "Add Product"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <div>
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <Label>Barcode / QR Code</Label>
                <Input value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} className="font-mono" />
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
              <Button onClick={handleSave} className="w-full">
                {editing ? "Update" : "Add Product"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products or barcodes..."
          className="pl-9"
        />
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="py-16 text-center text-muted-foreground text-sm">Loading...</div>
        ) : (
          <AnimatePresence>
            {filtered.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground text-sm">
                No products yet. Add your first product!
              </div>
            ) : (
              filtered.map((p) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-card rounded-xl border border-border shadow-card p-3 flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{p.barcode}</p>
                    <div className="flex gap-3 mt-1">
                      <span className="text-xs font-semibold text-primary font-mono">${p.price.toFixed(2)}</span>
                      <span className="text-xs text-muted-foreground">Stock: {p.stock}</span>
                      {p.category && <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{p.category}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(p)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(p.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
