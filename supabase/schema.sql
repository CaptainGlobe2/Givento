-- ==============================================================================
-- GIVENTO.IN - SUPABASE DATABASE SCHEMA
-- Storybook Gift Shop Data Model
-- ==============================================================================

-- 1. CATEGORIES / REALMS TABLE
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  fantasy_name TEXT NOT NULL,
  plain_name TEXT NOT NULL,
  description TEXT,
  tag_color TEXT DEFAULT 'peach',
  icon TEXT DEFAULT '✨',
  tilt_deg NUMERIC DEFAULT 0,
  highlight_item TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  price_type TEXT NOT NULL DEFAULT 'fixed', -- 'fixed', 'from', 'range', 'on_request'
  price NUMERIC,
  price_from NUMERIC,
  price_to NUMERIC,
  original_price NUMERIC,
  short_description TEXT,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  badge TEXT,
  in_stock BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT FALSE,
  is_personalised BOOLEAN DEFAULT FALSE,
  personalisation_fields JSONB DEFAULT '[]'::jsonb,
  variants JSONB DEFAULT '[]'::jsonb,
  tilt_deg NUMERIC DEFAULT 0,
  tape_color TEXT DEFAULT 'yellow',
  story_snippet TEXT,
  is_hidden BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY DEFAULT ('GVN-' || floor(random() * 900000 + 100000)::text),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  status TEXT DEFAULT 'Received', -- 'Received', 'Making', 'Packed', 'Shipped', 'Delivered'
  payment_method TEXT DEFAULT 'whatsapp', -- 'whatsapp', 'cod', 'razorpay'
  payment_status TEXT DEFAULT 'Pending', -- 'Pending', 'Paid', 'Failed'
  subtotal NUMERIC NOT NULL,
  gift_wrap BOOLEAN DEFAULT FALSE,
  gift_note TEXT,
  send_as_gift BOOLEAN DEFAULT FALSE,
  recipient_name TEXT,
  recipient_phone TEXT,
  delivery_fee NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL,
  tracking_number TEXT,
  tracking_courier TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  selected_variants JSONB DEFAULT '{}'::jsonb,
  personalisation_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. REVIEWS TABLE (Moderated)
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  city TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  photo_url TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. COUPONS TABLE
CREATE TABLE IF NOT EXISTS coupons (
  code TEXT PRIMARY KEY,
  discount_type TEXT NOT NULL DEFAULT 'percentage', -- 'percentage' or 'flat'
  discount_value NUMERIC NOT NULL,
  min_order_amount NUMERIC DEFAULT 0,
  max_discount NUMERIC,
  expiry_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CUSTOM ORDER REQUESTS & MESSAGES
CREATE TABLE IF NOT EXISTS custom_requests (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  email TEXT,
  event_type TEXT, -- 'wedding_favours', 'birthday_bulk', 'custom_frame', 'other'
  quantity INTEGER DEFAULT 1,
  budget_range TEXT,
  notes TEXT,
  status TEXT DEFAULT 'New', -- 'New', 'Contacted', 'Quoted', 'Confirmed', 'Closed'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. SITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public can view active categories and unhidden products
CREATE POLICY "Public can view categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public can view products" ON products FOR SELECT USING (is_hidden = false);
CREATE POLICY "Public can view approved reviews" ON reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Public can create orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can create order items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can submit custom requests" ON custom_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can submit reviews" ON reviews FOR INSERT WITH CHECK (true);

-- Authenticated admins can do anything
CREATE POLICY "Admin full access categories" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access products" ON products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access orders" ON orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access order_items" ON order_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access reviews" ON reviews FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access coupons" ON coupons FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access custom_requests" ON custom_requests FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access site_settings" ON site_settings FOR ALL USING (auth.role() = 'authenticated');
