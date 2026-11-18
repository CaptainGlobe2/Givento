-- ==============================================================================
-- GIVENTO.IN - PHASE 1 MASTER SCHEMA EXTENSION (Additive-Only Migration)
-- Normalized PostgreSQL extension supporting:
--  - Subcategories (Resin Art, Bouquets, Jewellery, Hampers)
--  - Bouquet Sizes & Extra Decorations (Satin Bows, Fairy Lights, Crown Charms)
--  - Reusable Customization Types & Options (Resin art, Frames, Hampers)
--  - Inventory Transactions Audit Log (Stock in, Stock out, Order restock)
--  - Order Status History Audit Trail
--  - Dynamic Shipping Rules Engine (Adirampattinam, Tamil Nadu, Interstate, Pickup)
--  - Expo Events Manager
--  - Studio Expenses & True Net Profit Accounting
--  - AI Gift Assistant Conversations & Message Logs
-- ==============================================================================

-- 1. SUBCATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.subcategories (
    id TEXT PRIMARY KEY,
    category_id TEXT REFERENCES public.categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active subcategories" ON public.subcategories FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access subcategories" ON public.subcategories FOR ALL USING (auth.role() = 'authenticated');

-- 2. BOUQUET SIZES TABLE
CREATE TABLE IF NOT EXISTS public.bouquet_sizes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL, -- 'Small', 'Medium', 'Large'
    max_pieces INTEGER NOT NULL, -- 6, 12, 20
    base_charge NUMERIC NOT NULL DEFAULT 0,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.bouquet_sizes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active bouquet sizes" ON public.bouquet_sizes FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access bouquet sizes" ON public.bouquet_sizes FOR ALL USING (auth.role() = 'authenticated');

-- 3. BOUQUET & GIFT DECORATIONS TABLE
CREATE TABLE IF NOT EXISTS public.decorations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 50,
    image_url TEXT,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.decorations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active decorations" ON public.decorations FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access decorations" ON public.decorations FOR ALL USING (auth.role() = 'authenticated');

-- 4. REUSABLE CUSTOMIZATION ENGINE (Resin, Frames, Hampers)
CREATE TABLE IF NOT EXISTS public.customization_types (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL, -- 'resin_craft', 'personalised_frame', 'hamper_bundle'
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.customization_options (
    id TEXT PRIMARY KEY,
    type_id TEXT REFERENCES public.customization_types(id) ON DELETE CASCADE,
    group_name TEXT NOT NULL, -- 'Shape', 'Flakes', 'Alphabet Text', 'Ribbon'
    name TEXT NOT NULL,
    price_modifier NUMERIC NOT NULL DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 100,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.customization_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customization_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view customization types" ON public.customization_types FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view customization options" ON public.customization_options FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access customization types" ON public.customization_types FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access customization options" ON public.customization_options FOR ALL USING (auth.role() = 'authenticated');

-- 5. INVENTORY TRANSACTIONS LOG
CREATE TABLE IF NOT EXISTS public.inventory_transactions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    item_type TEXT NOT NULL, -- 'product', 'wrapping_sheet', 'decoration'
    item_id TEXT NOT NULL,
    item_name TEXT NOT NULL,
    change_quantity INTEGER NOT NULL, -- positive for restock, negative for deduction
    reason TEXT NOT NULL, -- 'order_confirmed', 'manual_restock', 'order_cancelled', 'damage_adjustment'
    reference_id TEXT, -- order ID or admin note
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access inventory transactions" ON public.inventory_transactions FOR ALL USING (auth.role() = 'authenticated');

-- 6. ORDER STATUS AUDIT HISTORY
CREATE TABLE IF NOT EXISTS public.order_status_history (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    notes TEXT,
    changed_by TEXT DEFAULT 'artisan_admin',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access order status history" ON public.order_status_history FOR ALL USING (auth.role() = 'authenticated');

-- 7. SHIPPING RULES ENGINE
CREATE TABLE IF NOT EXISTS public.shipping_rules (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    region TEXT NOT NULL, -- 'local_adiram', 'tamil_nadu', 'interstate', 'pickup'
    base_charge NUMERIC NOT NULL DEFAULT 0,
    free_threshold NUMERIC DEFAULT 999,
    estimated_days TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.shipping_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active shipping rules" ON public.shipping_rules FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access shipping rules" ON public.shipping_rules FOR ALL USING (auth.role() = 'authenticated');

-- 8. EXPO EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.expo_events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    dates TEXT NOT NULL,
    location TEXT NOT NULL,
    city TEXT NOT NULL,
    booth TEXT,
    note TEXT,
    is_upcoming BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.expo_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view expo events" ON public.expo_events FOR SELECT USING (true);
CREATE POLICY "Admin full access expo events" ON public.expo_events FOR ALL USING (auth.role() = 'authenticated');

-- 9. STUDIO EXPENSES TABLE (Net Profit Calculator)
CREATE TABLE IF NOT EXISTS public.expenses (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    category TEXT NOT NULL, -- 'raw_materials', 'packaging', 'courier_dispatch', 'marketing', 'studio_tools'
    amount NUMERIC NOT NULL,
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access expenses" ON public.expenses FOR ALL USING (auth.role() = 'authenticated');

-- 10. AI GIFT ASSISTANT SESSIONS & MESSAGES
CREATE TABLE IF NOT EXISTS public.ai_conversations (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    session_id TEXT UNIQUE NOT NULL,
    customer_name TEXT,
    customer_phone TEXT,
    occasion TEXT,
    budget_range TEXT,
    summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ai_messages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    conversation_id TEXT REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    recommended_product_ids TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can insert ai conversations" ON public.ai_conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert ai messages" ON public.ai_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin full access ai conversations" ON public.ai_conversations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access ai messages" ON public.ai_messages FOR ALL USING (auth.role() = 'authenticated');

-- ==============================================================================
-- INITIAL SEED DATA FOR NEW TABLES
-- ==============================================================================

-- Seed Bouquet Sizes
INSERT INTO public.bouquet_sizes (id, name, max_pieces, base_charge, description, is_active, sort_order)
VALUES
    ('size-sm', 'Petite Bouquet (Small)', 6, 0, 'Dainty arrangement, holds up to 6 pieces.', true, 1),
    ('size-md', 'Classic Bouquet (Medium)', 12, 0, 'Most popular size, holds up to 12 pieces.', true, 2),
    ('size-lg', 'Grand Statement (Large)', 20, 50, 'Lush celebration bouquet, holds up to 20 pieces.', true, 3)
ON CONFLICT (id) DO NOTHING;

-- Seed Decorations
INSERT INTO public.decorations (id, name, price, stock, description, is_active)
VALUES
    ('dec-ribbon', 'Double Satin Ribbon Bow', 25, 100, 'Hand-tied two-tone satin bow in gold & maroon.', true),
    ('dec-lights', 'Warm Fairy Lights (Battery Included)', 49, 45, 'Tiny twinkling warm wire lights entwined in flowers.', true),
    ('dec-card', 'Handwritten Calligraphy Card in Wax Envelope', 30, 200, 'Ink handwritten message on deckle-edge paper.', true),
    ('dec-crown', 'Mini Golden Princess Crown Pick', 35, 30, 'Cute sparkling golden topper charm.', true)
ON CONFLICT (id) DO NOTHING;

-- Seed Shipping Rules
INSERT INTO public.shipping_rules (id, name, region, base_charge, free_threshold, estimated_days, is_active, sort_order)
VALUES
    ('ship-local', 'Adirampattinam Express Local Delivery', 'local_adiram', 30, 499, 'Same-day or next-day', true, 1),
    ('ship-pickup', 'Direct Studio Pickup (Adirampattinam)', 'pickup', 0, 0, 'Ready in 2–4 hours', true, 2),
    ('ship-tn', 'Tamil Nadu Standard Express', 'tamil_nadu', 50, 899, '1–2 working days', true, 3),
    ('ship-all-india', 'Pan-India Insured Courier (Delhivery / DTDC)', 'interstate', 70, 999, '3–5 working days', true, 4)
ON CONFLICT (id) DO NOTHING;
