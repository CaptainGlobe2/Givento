# Antigravity build prompt: fantasy gift shop (e-commerce)

Paste everything below the line into Antigravity. Build in the phases listed, and ask me to review after each phase.

---

## Project
Build a full e-commerce website for **Givento.in** (Instagram: @givento.in). We sell:
- Bouquets: sunflower (₹119), rose 7 flowers (₹325), rose 17 flowers (₹599), KitKat chocolate bouquet, photo bouquet
- Personalised frames: nikah frames and photo frames with names, date and a verse
- Gift hampers: gift for her (perfume, chain, chocolate), chocolate and rose set, blind date with a book
- Resin art: wall clocks; resin name keychains (Arabic or English names, pearls, gold flakes)
- Stainless steel jewellery: chains from ₹199, bracelets and anklets from ₹179, mehandi hand chains from ₹249, rings, traditional sets from ₹499
- Girls accessories: crochet alligator clips, hibiscus mini clutchers, banana clips, organic henna cones
- Car toys and small toys
Many products have no price on Instagram yet, so the site must support "price on request" items, "from" prices, and price ranges. Customers often order through Instagram DM, so the order flow must work without payment: the basket builds an order message to send on WhatsApp or Instagram, and online payment is optional.
We also sell at local expos, so add an "Find us at expos" section the owner can edit with dates and places.
Personalisation matters a lot (names, dates, Arabic text, photos): every personalised product needs a form for the text, a photo upload, and a preview note before ordering.

Customers are mostly girls and young women in India buying gifts for birthdays, anniversaries and surprises. Many order on mobile and are used to WhatsApp and UPI.

## Look and feel: "storybook scrapbook" (must feel hand-made, never like a template)
- Blush paper background with a faint grain texture. Ink colour is deep plum, not black. Brand colours from the Givento logo: gold and maroon. Other accents: rose, mint, sky blue, peach.
- Fonts: Caprasimo (headings), Caveat (handwritten notes, prices, links), DM Sans (body).
- Product art is flat illustration with a thick ink outline, shown as stickers with a white outline.
- Hero: a collage of 5 tilted stickers (tapping one opens that category), a handwritten "hello", a yellow sticky note from the shop owner.
- Categories are luggage tags in different colours and slight tilts, not a grid of identical cards.
- Product cards are paper cards with a strip of tape on top, each tilted a little differently, with a handwritten price tag stuck on the picture.
- "How to order" is a ruled notebook page with hand-ticked checkboxes.
- Buttons have a thick ink border and a hard offset shadow. No soft glows, no glass effects, no neon, no purple-blue gradients.
- Motion is small: stickers pop in once on load, twinkling stars, cards straighten on hover. Nothing floats constantly.
- Write all copy like a real person talking to a friend. No "elevate your gifting experience" style text.
- Each category is a "realm" with a fantasy name next to the plain label:
  Bloom Glade (Bouquets), Keepsake Cottage (Frames), Hamper Hollow (Gift hampers), Resin Grotto (Resin art), Keyring Keep (Keychains), Starlight Chains (Chains and rings), Charm Cove (Bracelets), Henna Haven (Hand chains), Pixie Parlour (Girls accessories), Wheel Sprites (Car toys).
- Keep plain labels visible so nobody has to decode a fantasy name to shop.
- Respect `prefers-reduced-motion`. Mobile first (works at 360px wide). Visible keyboard focus.

## Tech stack
- Next.js (App Router) + TypeScript + Tailwind CSS
- Framer Motion for page and drawer motion; a small canvas component for fireflies
- Supabase for database, auth (admin only) and image storage
- Razorpay for UPI, cards and netbanking, with Cash on Delivery as an option
- WhatsApp order button as a fallback (`wa.me` link with the order text)
- Deploy on Vercel

## Customer features
1. Home: hero, realms grid, featured treasures, how-to-order steps, reviews, Instagram feed link
2. Shop page: category filter, price sort, search, in-stock only toggle
3. Product page: photo gallery with zoom, price, description, variants (colour, size, bead style), stock status, "Add to basket"
4. Personalisation on the product page where it applies: name or initial on resin keychains, message card for bouquets and hampers, photo upload for resin frames
5. Gift options at checkout: gift wrap, gift note, "send to someone else" address, hide price on invoice
6. Basket drawer with quantity controls and live total
7. Checkout without forced sign-up: name, phone, address, pincode check, delivery fee by pincode, Razorpay or COD
8. Order tracking page by order number and phone
9. Wishlist, saved in the browser
10. Reviews with photos (moderated by admin)
11. Custom order request form (bulk gifts, wedding favours, birthday return gifts)
12. Pages: About, Delivery and returns, Contact, FAQ

## Admin panel (password protected)
- Add, edit and hide products; upload photos; set variants, stock and price
- Manage categories and the realm names
- Orders list with status: Received, Making, Packed, Shipped, Delivered; send status update on WhatsApp
- Coupons, delivery fee rules, festival banners
- Customer messages and custom order requests
- Simple sales summary by day and by category

## Data model (start with this)
products, variants, categories, orders, order_items, customers, reviews, coupons, custom_requests, site_settings

## Phases
1. Design system and home page (colours, fonts, fireflies, hero, realms)
2. Shop, product page, basket drawer (use sample data first)
3. Supabase: products, images, admin login and product management
4. Checkout, Razorpay, COD, order emails and WhatsApp messages
5. Personalisation, reviews, wishlist, custom order form
6. SEO (titles, meta, product schema), image optimisation, speed, deploy and custom domain

## Quality bar
- Lighthouse performance 85+ on mobile
- Images served in WebP, lazy-loaded
- All text readable (contrast), all buttons reachable by keyboard
- No fake reviews or invented offers anywhere in the live site
