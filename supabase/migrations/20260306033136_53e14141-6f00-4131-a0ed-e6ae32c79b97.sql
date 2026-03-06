
-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  barcode TEXT NOT NULL,
  category TEXT DEFAULT '',
  stock INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sales table
CREATE TABLE public.sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sale_items table
CREATE TABLE public.sale_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  product_price NUMERIC(10,2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;

-- Allow public access (no auth required for this POS app)
CREATE POLICY "Allow all access to products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to sales" ON public.sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to sale_items" ON public.sale_items FOR ALL USING (true) WITH CHECK (true);

-- Index for barcode lookups
CREATE INDEX idx_products_barcode ON public.products(barcode);
-- Index for sales date queries
CREATE INDEX idx_sales_created_at ON public.sales(created_at);
