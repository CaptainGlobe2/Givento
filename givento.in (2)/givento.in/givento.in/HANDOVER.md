# 🌸 GIVENTO.IN — Studio Owner Handover & Operations Guide

Welcome to your production-ready e-commerce platform and artisan studio operations suite for **Givento.in**! 

This guide is written specifically for you (the store owner and artisan team in Adirampattinam). It explains step-by-step how to manage your products, custom builders, orders, shipping rules, studio expenses, AI assistant, and deployment without writing any code.

---

## 📑 Table of Contents
1. [Admin Dashboard Access](#1-admin-dashboard-access)
2. [Adding & Editing Products (With "Ask Us" Pricing)](#2-adding--editing-products-with-ask-us-pricing)
3. [Managing Custom Builders (Bouquet, Resin, Frames, Hampers)](#3-managing-custom-builders)
4. [Shipping Charges & Free Delivery Thresholds](#4-shipping-charges--free-delivery-thresholds)
5. [Omnichannel Order Management & WhatsApp Pipeline](#5-omnichannel-order-management--whatsapp-pipeline)
6. [Logging Manual Orders (Expos & Instagram DMs)](#6-logging-manual-orders-expos--instagram-dms)
7. [Studio Expenses & CSV Spreadsheet Exports](#7-studio-expenses--csv-spreadsheet-exports)
8. [AI Gift Assistant Controls & Recommendations](#8-ai-gift-assistant-controls--recommendations)
9. [Activating Online Razorpay (When Ready)](#9-activating-online-razorpay-when-ready)
10. [Updating WhatsApp Number & Social Handles](#10-updating-whatsapp-number--social-handles)
11. [Deploying on Vercel with Supabase](#11-deploying-on-vercel-with-supabase)

---

## 1. Admin Dashboard Access

- **Admin URL:** `https://givento.in/admin` (or `http://localhost:3000/admin` locally)
- **Login Credentials:**
  - **Password:** `givento2026` (or `admin`)
- **Security:** The admin dashboard is protected by server-side credentials and an authenticated session cookie. It is automatically blocked from search engine crawlers in `robots.txt`.

---

## 2. Adding & Editing Products (With "Ask Us" Pricing)

Under the **Products** tab in your admin dashboard:

### Adding a New Product
1. Click **"+ Add Product"** at the top right.
2. Fill in:
   - **Product Name:** e.g., *Sunflower & Ferrero Hazelnut Bouquet*
   - **Category & Subcategory:** Select from your master categories (e.g., *Bouquets*).
   - **Pricing Mode:** Choose **Numeric (₹)** or **Price on Request ("ask us")**.
     - If numeric: Enter price (e.g., `499`).
     - If "ask us": Leave price blank. The product card will display **"Price on request"** and open a prefilled WhatsApp inquiry.
   - **Inventory Stock:** Enter available pieces. When stock reaches $\le 5$, a low-stock alert appears automatically.
   - **Photo URL:** Enter image path or uploaded photo URL.
   - **Bouquet Builder Toggle:** Check *"Include in Build Your Own Bouquet"* if this item can be added as a stem/treat in custom bouquets.
   - **Personalisation Badge:** Check if names, photos, or dates can be inscribed.
3. Click **"Save Product"**.

---

## 3. Managing Custom Builders

Under the **Bouquet Builder** & **Custom Options** tabs in Admin:

### 3A. Build Your Own Bouquet
- **Wrapping Sheets:**
  - Add or edit wrapping sheets with Name, Swatch Colors (Base & Trim), and Gold Foil dots toggle.
  - Set real sheet inventory. When sheet stock $\le 5$, the builder displays *"Only N left"*. If stock is 0, the sheet is hidden from customers.
- **Bouquet Sizes & Capacities:**
  - **Petite Bouquet (Small):** Default max 6 pieces.
  - **Classic Bouquet (Medium):** Default max 12 pieces.
  - **Grand Milestone (Large):** Default max 20 pieces (with optional base crafting charge).
  - You can edit piece caps and base fees directly in the table.
- **Bouquet Treats & Stems:**
  - Set which chocolates (KitKat, Ferrero), flowers (satin roses, sunflowers), photos, or jewellery can be selected.
- **Decorations & Extras:**
  - Double satin ribbons (₹25), fairy lights (₹49), golden crown picks (₹59), handwritten calligraphy card & wax seal (₹30).

### 3B. Resin, Keepsake Frames & Hampers
- Open `/customize` on the storefront to test all 4 interactive studios:
  - **Bouquet Studio:** `/customize?type=bouquet`
  - **Resin Studio:** `/customize?type=resin` (Initial keychains, bookmarks, trays with Arabic/English calligraphy and 24K gold foil flakes)
  - **Frame Studio:** `/customize?type=frame` (Nikah vows, anniversary frames, Ayatul Kursi with wax seal wraps)
  - **Hamper Studio:** `/customize?type=hamper` (Signature keepsake boxes with curated treats and capacity meter)

---

## 4. Shipping Charges & Free Delivery Thresholds

Under the **Shipping** tab in Admin:
Your store comes pre-configured with 4 regional delivery tiers:
1. **Adirampattinam Local Delivery:** ₹30 base charge · **Free above ₹499** · Same-day or next-day delivery.
2. **Direct Studio Pickup:** ₹0 base charge · Ready in 2–4 hours.
3. **Tamil Nadu Standard Express:** ₹50 base charge · **Free above ₹899** · 1–2 working days.
4. **Pan-India Insured Courier:** ₹70 base charge · **Free above ₹999** · 3–5 working days (Delhivery / ST Courier).

> You can edit any base charge or free delivery threshold in seconds by clicking **"Edit"** next to any rule.

---

## 5. Omnichannel Order Management & WhatsApp Pipeline

Under the **Orders** tab in Admin:

All orders from **Website**, **WhatsApp**, **Instagram DMs**, and **Expo Stalls** flow into a single unified table.

### 7-Stage Status Pipeline
1. **Pending WhatsApp Confirmation:** Customer submitted cart; order details sent to studio WhatsApp.
2. **Confirmed:** You confirmed availability, design, and advance payment.
3. **In Crafting:** Artisan team is handcrafting the bouquet/resin/frame.
4. **Quality Check & Proof Sent:** Photo/video proof sent to customer on WhatsApp.
5. **Packed & Ready:** Sealed in rigid carton with wax stamp and ribbon.
6. **Dispatched / In Transit:** Courier booked; tracking number entered.
7. **Delivered:** Order successfully handed over to customer.

### Instant WhatsApp Notifications & Packing Slips
- **WhatsApp Notification Generator:** Click **"Generate WhatsApp Message"** on any order card. The system instantly generates a warm, personalized template matching the current stage with customer name, order number, and tracking link.
- **Printable Packing Slip:** Click **"Print Packing Slip"** to print or save a clean workshop slip for your crafting table.
- **Live Courier Tracking:** Enter courier name (*Delhivery, ST Courier, Professional*) and tracking code; Givento auto-generates live tracking URLs that customers can open at `/track`.

---

## 6. Logging Manual Orders (Expos & Instagram DMs)

When a customer orders via Instagram DM, phone, or visits your Expo Stall:
1. Go to **Orders** tab and click **"+ Log Manual Order"**.
2. Select the sales channel:
   - `Instagram DM`
   - `WhatsApp Direct`
   - `Expo & Exhibition Stall`
   - `Walk-in Studio`
3. Enter customer name, phone number, and delivery city.
4. Add items using the multi-row picker (select product and quantity).
5. Enter payment method (*WhatsApp UPI, Cash on Delivery, Cash at Stall, Direct GPay*).
6. Click **"Log Order"**.
   - The order is logged into your records, and item inventory is **automatically decremented** from the database!

---

## 7. Studio Expenses & CSV Spreadsheet Exports

Under the **Profit & Analytics** tab in Admin:

### Logging Studio Expenses
1. Click **"Log Studio Expense"**.
2. Select one of the 7 official studio categories:
   - **Raw Materials:** Floral kraft paper, satin ribbons, resin, gold flakes, chocolates.
   - **Packaging:** Rigid cartons, bubble wrap, wax beads, tissue wrap.
   - **Marketing & Ads:** Instagram boosted posts, promotional flyers, banners.
   - **Shipping & Courier:** Bulk parcel slips, courier account recharge.
   - **Studio Tools & Equipment:** Hot glue guns, heating mats, silicone letter molds.
   - **Expo Stall Fees:** Exhibition booth rent, display tables.
   - **Miscellaneous:** Studio utilities, refreshments, maintenance.
3. Enter amount (₹) and date, then click **"Log Expense Record"**.

### Financial Indicators & Unit Economics
- **Gross Revenue:** Total order sales.
- **COGS (Cost of Goods Sold):** Raw materials + direct packaging costs.
- **Gross Artisan Margin:** Gross Revenue minus COGS (and %).
- **Operating Overheads:** Marketing, tools, expo fees.
- **Net Artisan Profit:** True bottom-line profit after all studio expenses.
- **Per-Order Unit Economics Ledger:** View every order's sale price, materials cost, packing cost, courier incurred, and individual profit margin.

### 1-Click CSV Exports
Click any of the top export buttons to download clean CSV files compatible with Excel and Google Sheets:
- 📥 **Orders CSV:** Complete customer list, phone numbers, delivery addresses, items, and payment status.
- 📥 **Expenses CSV:** Chronological expense ledger by category.
- 📥 **Profit Summary CSV:** Financial KPIs, channel revenue split, and per-order profit breakdowns.

---

## 8. AI Gift Assistant Controls & Recommendations

Under the **AI Chats** tab in Admin:

- **Assistant Guidelines & Persona:**
  - View and customize instructions: *“Warm, helpful boutique artisan tone. Recommend only real products. Direct customer to WhatsApp for personalisation proofs.”*
  - Click **"Save Guidelines"** to update in real time.
- **Recommendability Matrix:**
  - Under the product table, toggle **"Recommendable by AI"** for any product.
  - If a limited VIP product or out-of-stock item is toggled off, the AI will **never** recommend it.
- **Review Conversations:**
  - Inspect customer sessions, questions asked, occasions requested (Nikah, Birthday, Anniversary), and which real products the AI recommended.

---

## 9. Activating Online Razorpay (When Ready)

The store launches with **WhatsApp UPI Confirmation & Direct Ordering** (the standard for Indian boutique craft studios).

When you are ready to accept debit cards, credit cards, and netbanking:
1. Open `.env.local` (or Vercel Environment Variables).
2. Set your Razorpay keys:
   ```env
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_your_key_id
   RAZORPAY_KEY_SECRET=your_live_key_secret
   ```
3. In `/checkout`, customers will see Razorpay as an instant online payment option alongside WhatsApp order confirmation.

---

## 10. Updating WhatsApp Number & Social Handles

To change your business WhatsApp number or contact details:
1. In `.env.local`:
   ```env
   NEXT_PUBLIC_WHATSAPP_NUMBER=919876543210
   ```
   *(Always use country code `91` followed by your 10-digit mobile number, with no spaces or symbols).*
2. In Admin under **Store Settings**:
   - Update festival banner text (e.g. *“🌸 Wedding Season Orders are OPEN! Dispatch in 48 hours.”*).
   - Update default bouquet piece limits.

---

## 11. Deploying on Vercel with Supabase

### Step 1: Connect Supabase (PostgreSQL Database)
1. Create a free account at [supabase.com](https://supabase.com).
2. Create a new project named `givento`.
3. Go to **Project Settings -> API** and copy:
   - `Project URL`
   - `anon / public key`
4. Run the SQL schema from `src/lib/schema.sql` inside the Supabase **SQL Editor**.

### Step 2: Deploy to Vercel
1. Push this repository to GitHub.
2. Sign in to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your `givento.in` repository.
4. Under **Environment Variables**, add:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ADMIN_PASSWORD=your_secure_password
   NEXT_PUBLIC_WHATSAPP_NUMBER=919876543210
   AI_API_KEY=your_gemini_or_openai_api_key
   ```
5. Click **"Deploy"**.
6. In Vercel Domains, attach your custom domain: `givento.in` and `www.givento.in`.

---

✨ *Crafted with love for the Givento artisan studio in Adirampattinam. May your business bloom!* 🌸
