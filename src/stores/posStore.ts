import { supabase } from "@/integrations/supabase/client";
import { Product, CartItem, Sale } from "@/types/pos";

// Products
export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    barcode: p.barcode,
    category: p.category ?? "",
    stock: p.stock,
    createdAt: p.created_at,
  }));
}

export async function addProduct(product: Omit<Product, "id" | "createdAt">) {
  const { error } = await supabase.from("products").insert({
    name: product.name,
    price: product.price,
    barcode: product.barcode,
    category: product.category,
    stock: product.stock,
  });
  if (error) throw error;
}

export async function updateProduct(product: Product) {
  const { error } = await supabase
    .from("products")
    .update({
      name: product.name,
      price: product.price,
      barcode: product.barcode,
      category: product.category,
      stock: product.stock,
    })
    .eq("id", product.id);
  if (error) throw error;
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

export async function findProductByBarcode(barcode: string): Promise<Product | undefined> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("barcode", barcode)
    .maybeSingle();
  if (error) throw error;
  if (!data) return undefined;
  return {
    id: data.id,
    name: data.name,
    price: Number(data.price),
    barcode: data.barcode,
    category: data.category ?? "",
    stock: data.stock,
    createdAt: data.created_at,
  };
}

// Sales
export async function getSales(): Promise<Sale[]> {
  const { data, error } = await supabase
    .from("sales")
    .select("*, sale_items(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((s) => ({
    id: s.id,
    total: Number(s.total),
    date: s.created_at,
    items: (s.sale_items ?? []).map((si: any) => ({
      product: {
        id: si.product_id,
        name: si.product_name,
        price: Number(si.product_price),
        barcode: "",
        category: "",
        stock: 0,
        createdAt: "",
      },
      quantity: si.quantity,
    })),
  }));
}

export async function saveSale(cart: CartItem[], total: number) {
  // Create sale
  const { data: sale, error: saleError } = await supabase
    .from("sales")
    .insert({ total })
    .select()
    .single();
  if (saleError) throw saleError;

  // Create sale items
  const items = cart.map((c) => ({
    sale_id: sale.id,
    product_id: c.product.id,
    product_name: c.product.name,
    product_price: c.product.price,
    quantity: c.quantity,
  }));
  const { error: itemsError } = await supabase.from("sale_items").insert(items);
  if (itemsError) throw itemsError;

  // Update stock
  for (const c of cart) {
    await supabase
      .from("products")
      .update({ stock: Math.max(0, c.product.stock - c.quantity) })
      .eq("id", c.product.id);
  }
}
