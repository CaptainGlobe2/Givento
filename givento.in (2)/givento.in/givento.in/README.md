# Givento.in 🌸 Storybook Scrapbook E-Commerce Platform

A bespoke, handcrafted e-commerce storefront for **Givento.in** ([@givento.in](https://instagram.com/givento.in)), designed with a warm **"Storybook Scrapbook"** aesthetic: blush paper tones, deep plum ink, brand gold & maroon accents, washi tape labels, tilted cards with subtle straightening animations, and dual fantasy/plain realm naming.

Built in 6 comprehensive phases according to `ANTIGRAVITY_PROMPT.md`.

---

## 🎨 Brand Identity & Design System

- **Palette**:
  - Blush Paper: `#FFF7F4` (background) & `#FAF2EC` (cards)
  - Deep Plum Ink: `#2D1527` (text and ink borders)
  - Logo Maroon: `#7A1C30` & Dark Maroon: `#581020`
  - Brand Gold: `#D4AF37`
  - Pastel Accents: Rose (`#E88299`), Mint (`#7BBFA6`), Sky (`#76BBE3`), Peach (`#F6A98A`), Yellow (`#FEF08A`)
- **Typography**:
  - Headings: `Caprasimo`
  - Handwritten notes, prices, tags: `Caveat`
  - Body: `DM Sans`
- **Visual Texture**: Hard offset ink shadows (`shadow-ink` & `shadow-ink-sm`), washi tape stickers, firefly particles canvas, and hand-ticked notebook pages.

---

## 🏰 The 10 Realms (Catalog Categories)

Each realm features a fantasy name alongside its everyday plain label so customers can browse intuitively:

1. **🌻 Bloom Glade** — Forever Bouquets (Sunflowers, 7-Rose, 17-Rose, KitKat bouquets, Photo bouquets)
2. **🖼️ Keepsake Cottage** — Personalised Frames (Nikah frames, Polaroid wooden frames, anniversary verses)
3. **🎀 Hamper Hollow** — Gift Hampers ("Gift for Her", Chocolate & Rose set, Blind Date with a Book)
4. **✨ Resin Grotto** — Hand-Poured Resin Art (Ocean wave wall clocks, custom coasters)
5. **🗝️ Keyring Keep** — Name Keychains (English & Arabic calligraphy, pearls, gold flakes)
6. **⭐ Starlight Chains** — Stainless Steel Chains & Rings (Tarnish-free chains from ₹199)
7. **💫 Charm Cove** — Bracelets & Anklets (Dewdrop anklets from ₹179)
8. **🌸 Henna Haven** — Mehandi Hand Chains (Hathphool from ₹249 & organic henna cones)
9. **🦋 Pixie Parlour** — Girls Accessories (Crochet clips, hibiscus mini clutchers, banana clips)
10. **🚗 Wheel Sprites** — Miniature Diecast Cars (Retro Beetles, vintage cars, novelty collectibles)

---

## 🚀 Key Features

### For Customers
- **Dynamic Storybook Product Detail**: Variant selectors, photo zoom modal, rich personalization inputs (custom text, Arabic name calligraphy, photo reference upload preview, date & verse fields), and a live order preview note.
- **Frictionless Dual Order Flow**:
  - **Online Payment**: Razorpay integration (UPI, Cards, Netbanking) + Cash on Delivery (COD).
  - **WhatsApp Direct Order**: One-click order message builder (`wa.me`) formatted with customer address, item list, gift wrap preference, and direct surprise instructions.
- **Interactive Basket Drawer & Page**: Add gift wrap (+₹49) with wax seal stamp, handwritten gift message in envelope, direct surprise (hide invoice price), and real-time pan-India pincode lookup.
- **Live Order Tracking**: Visual 5-step parcel timeline (`Received ➔ Making ➔ Packed ➔ Shipped ➔ Delivered`) with courier name, tracking AWB number, and direct WhatsApp support button.
- **Self-Serve Parcel Lookup**: Track any parcel at `/track` using order ID and phone number.
- **Persistent Wishlist**: Save favorite gifts in local storage at `/wishlist`.
- **Bulk Custom Order Form**: Custom quote builder for wedding favours, return gifts, and party hampers at `/custom-order`.
- **Core Brand Pages**: `/about`, `/faq`, `/delivery-returns`, `/contact`.

### For the Shop Owner / Artisan Admin
- **Studio Control Room (`/admin`)**: Password protected (`givento2026`).
  - **Overview Dashboard**: Today's revenue, active parcels, low stock alerts, quick links.
  - **Order Manager**: Filter orders, update parcel status (`Received`, `Making`, `Packed`, `Shipped`, `Delivered`), add tracking AWB number, send status update to customer on WhatsApp.
  - **Crafts Catalog**: Add, edit, or hide crafts; toggle in-stock status; upload image URLs; set variants.
  - **Realms & Categories**: Rename fantasy or plain names, toggle visibility, adjust tag colors.
  - **Coupons & Pincodes**: Manage discount codes (`GIVENTO10`, `FIRSTLOVE`) and delivery fees.
  - **Expo Popups Manager**: Add upcoming exhibition dates, booth numbers, and cities to display on the home page.
  - **Review Moderation**: Approve or hide customer photo reviews.
  - **Custom Requests**: View bulk/wedding requests with direct WhatsApp reply buttons.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router + Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + Custom Scrapbook Theme
- **Database / Backend**: Supabase (PostgreSQL with RLS) + LocalStorage Fallback
- **Animations**: Framer Motion + HTML5 Canvas Fireflies
- **Icons**: Lucide React + Custom SVG Brand Icons
- **Payments**: Razorpay SDK + WhatsApp Order Direct API

---

## 💻 Local Development

1. **Clone & Install**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env.local` and add your keys:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ADMIN_PASSWORD=givento2026
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_yourkey
   RAZORPAY_KEY_SECRET=your_secret_key
   NEXT_PUBLIC_WHATSAPP_NUMBER=919895000000
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) or [http://localhost:3001](http://localhost:3001).

4. **Production Build**:
   ```bash
   npm run build
   ```

---

## ☁️ Deployment to Vercel

1. Push your code to GitHub.
2. Import the repository into **Vercel**.
3. In **Project Settings ➔ Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ADMIN_PASSWORD`
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
   - `NEXT_PUBLIC_WHATSAPP_NUMBER`
4. In **Project Settings ➔ Domains**, add your custom domain: `givento.in`.
5. Point your domain DNS records:
   - **A Record**: `@` ➔ `76.76.21.21`
   - **CNAME Record**: `www` ➔ `cname.vercel-dns.com`

---

## 🔒 Supabase Setup

Run the SQL script located at `supabase/schema.sql` in your Supabase SQL Editor. It automatically provisions all 10 tables, Row Level Security policies, public review submissions, and sample products.
