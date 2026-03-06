import { Product, CartItem, Sale } from "@/types/pos";

const PRODUCTS_KEY = "tief_pos_products";
const SALES_KEY = "tief_pos_sales";

export function getProducts(): Product[] {
  const data = localStorage.getItem(PRODUCTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveProducts(products: Product[]) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

export function addProduct(product: Product) {
  const products = getProducts();
  products.push(product);
  saveProducts(products);
}

export function updateProduct(product: Product) {
  const products = getProducts().map((p) => (p.id === product.id ? product : p));
  saveProducts(products);
}

export function deleteProduct(id: string) {
  saveProducts(getProducts().filter((p) => p.id !== id));
}

export function findProductByBarcode(barcode: string): Product | undefined {
  return getProducts().find((p) => p.barcode === barcode);
}

export function getSales(): Sale[] {
  const data = localStorage.getItem(SALES_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveSale(sale: Sale) {
  const sales = getSales();
  sales.push(sale);
  localStorage.setItem(SALES_KEY, JSON.stringify(sales));
  // Update stock
  const products = getProducts();
  sale.items.forEach((item) => {
    const p = products.find((pr) => pr.id === item.product.id);
    if (p) p.stock = Math.max(0, p.stock - item.quantity);
  });
  saveProducts(products);
}
