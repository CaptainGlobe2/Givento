-- Additive migration: Build Your Own Bouquet Feature
-- Safe, additive-only migration. Never drops, renames or rewrites existing tables.

-- 1. Wrapping Sheets Table
CREATE TABLE IF NOT EXISTS public.wrapping_sheets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL DEFAULT 50,
    stock INTEGER NOT NULL DEFAULT 10,
    base_color TEXT NOT NULL DEFAULT '#2A1226',
    trim_color TEXT NOT NULL DEFAULT '#F0B43C',
    has_dots BOOLEAN NOT NULL DEFAULT FALSE,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS for wrapping_sheets
ALTER TABLE public.wrapping_sheets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active wrapping sheets"
    ON public.wrapping_sheets FOR SELECT
    USING (is_active = true);
CREATE POLICY "Admin can manage wrapping sheets"
    ON public.wrapping_sheets FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- 2. Add Bouquet fields to existing products table
ALTER TABLE public.products 
    ADD COLUMN IF NOT EXISTS bouquet_enabled BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS bouquet_price NUMERIC,
    ADD COLUMN IF NOT EXISTS bouquet_group TEXT,
    ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 15;

-- 3. Custom Bouquets & Items (ordered bouquets reference)
CREATE TABLE IF NOT EXISTS public.custom_bouquets (
    id TEXT PRIMARY KEY,
    order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
    sheet_id TEXT REFERENCES public.wrapping_sheets(id),
    sheet_name TEXT NOT NULL,
    total NUMERIC NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.custom_bouquets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can view custom bouquets"
    ON public.custom_bouquets FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE TABLE IF NOT EXISTS public.custom_bouquet_items (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    custom_bouquet_id TEXT REFERENCES public.custom_bouquets(id) ON DELETE CASCADE,
    product_id TEXT,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.custom_bouquet_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can view custom bouquet items"
    ON public.custom_bouquet_items FOR SELECT
    USING (auth.role() = 'authenticated');

-- 4. Initial Seed Data for Wrapping Sheets
INSERT INTO public.wrapping_sheets (id, name, price, stock, base_color, trim_color, has_dots, is_active)
VALUES
    ('s1', 'Black & gold', 60, 12, '#2a1226', '#f0b43c', false, true),
    ('s2', 'Polka-dot white', 60, 9, '#fffafc', '#2a1226', true, true),
    ('s3', 'Blush pink', 50, 15, '#ffc4d2', '#fffafc', false, true),
    ('s4', 'Kraft brown', 40, 3, '#c9a171', '#a8324f', false, true),
    ('s5', 'Lilac shimmer', 70, 0, '#c3a6e8', '#fffafc', false, true)
ON CONFLICT (id) DO NOTHING;
