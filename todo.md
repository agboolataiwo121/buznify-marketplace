# Buznify — Project TODO

## Phase 1: Database Schema & Migrations
- [x] Extend users table with role (user/vendor/admin), balance, referral code
- [x] Create products table (id, vendorId, category, title, description, price, stock, deliveryData, status, rating)
- [x] Create orders table (id, userId, productId, status, deliveryData, amount, couponId)
- [x] Create wallet_transactions table (id, userId, type, amount, description, referenceId)
- [x] Create virtual_numbers table (id, userId, number, countryCode, expiresAt, status)
- [x] Create sms_messages table (id, numberId, sender, message, receivedAt)
- [x] Create referrals table (id, referrerId, referredId, rewardAmount, status)
- [x] Create coupons table (id, code, discountType, discountValue, usageLimit, usedCount, expiresAt)
- [x] Create reviews table (id, userId, productId, rating, comment)
- [x] Create support_tickets table (id, userId, subject, status, priority)
- [x] Create ticket_messages table (id, ticketId, userId, message, isStaff)
- [x] Create notifications table (id, userId, type, title, message, isRead)
- [x] Create growth_services table (id, platform, serviceType, quantity, price, description)
- [x] Push all migrations with pnpm db:push

## Phase 2: Global Theme, Layout & Landing Page
- [x] Set dark cyber-tech theme in index.css (black/deep-blue/purple gradients, glassmorphism)
- [x] Add Google Fonts (Inter + Space Grotesk) in index.html
- [x] Build Navbar component with logo, nav links, auth state, mobile menu
- [x] Build Footer component
- [x] Build landing page Hero section with animated gradient and CTA
- [x] Build Features section with glassmorphism cards
- [x] Build Categories section with icon cards
- [x] Build Trust Badges section
- [x] Build Live Orders popup notification component
- [x] Build Customer Reviews/Testimonials section
- [x] Build Stats/numbers section
- [x] Build CTA banner section

## Phase 3: Backend Routers
- [x] Products router: list, getById, create, update, delete, search/filter
- [x] Orders router: create, getByUser, getById, updateStatus, automated delivery
- [x] Wallet router: getBalance, deposit, withdraw, getTransactions
- [x] Referrals router: getReferralCode, getReferrals, claimReward
- [x] Coupons router: validate, apply
- [x] Support router: createTicket, getTickets, addMessage, updateStatus
- [x] Notifications router: getAll, markRead, markAllRead
- [x] Growth services router: list, purchase
- [x] Virtual numbers router: list, purchase, getSmsInbox, refreshSms
- [x] Admin router: getStats, manageUsers, manageProducts, manageOrders
- [x] Vendor router: getProducts, createProduct, updateProduct, deleteProduct, getOrders
- [x] Reviews router: create, getByProduct

## Phase 4: Marketplace & Product Pages
- [x] Marketplace page with category tabs, search, filter sidebar
- [x] Product card component with glassmorphism style
- [x] Product detail page with buy button, reviews, delivery info
- [x] Social Growth Services page with platform tabs and package cards
- [x] Virtual Numbers page with country filter and number purchase flow
- [x] Category pages (Social Media, Streaming, Gaming, Virtual Numbers, Growth)

## Phase 5: User Dashboard
- [x] Dashboard layout with sidebar navigation
- [x] Wallet page: balance display, deposit/withdraw, transaction history
- [x] Orders page: order list with status badges and tracking
- [x] Referrals page: referral link, stats, earnings
- [x] Notifications page: notification list with read/unread states
- [x] SMS Inbox page: virtual number list, SMS messages, auto-refresh
- [x] Profile settings page

## Phase 6: Vendor Dashboard
- [x] Vendor dashboard overview with stats
- [x] Product listing management (create, edit, delete)
- [x] Order management for vendor products
- [x] Reviews received page
- [x] Earnings overview

## Phase 7: Admin Panel
- [x] Admin analytics dashboard with charts (revenue, orders, users)
- [x] User management table (list, role change, ban)
- [x] Product management table (approve, reject, delete)
- [x] Order management table (view, update status)
- [x] Support tickets management
- [x] Coupon management (create, edit, delete)

## Phase 8: Support Center & Polish
- [x] Support center page with ticket submission form
- [x] Ticket detail page with message thread
- [x] Live order popup notification (animated, auto-dismiss)
- [x] Page transition animations
- [x] Loading skeleton components
- [x] SEO meta tags and Open Graph
- [x] Mobile responsive polish
- [x] Trust badges component
- [x] 404 page with cyber-tech style

## Phase 9: Tests & Delivery
- [x] Vitest tests for core routers (products, orders, wallet, support, admin, coupons, referrals, virtual numbers) — 19 tests passing
- [x] Save checkpoint
- [x] Deliver to user

## Phase 10: Review Feedback Improvements

### Homepage
- [x] Stronger hero headline + subtitle (speed + automation + security)
- [x] Live stats bar (orders completed, active users, available services)
- [x] "Why Choose Buznify" section
- [x] FAQ accordion section
- [x] Trusted payment icons (Visa, Mastercard, Crypto, PayPal)
- [x] Animated gradient hero background

### Marketplace
- [x] Account condition tags (Fresh, Aged, Verified, PVA) on product cards
- [x] Delivery time badge on product cards
- [x] "Trending Services" section on marketplace
- [x] Instant pricing calculator on growth services

### Virtual Numbers
- [x] Expiry countdown timer on active numbers
- [x] OTP auto-refresh indicator
- [x] Number availability status badge

### Trust & Legal Pages
- [x] Terms of Service page (/terms)
- [x] Privacy Policy page (/privacy)
- [x] Refund Policy page (/refund)
- [x] Security page (/security)
- [x] Escrow/protection badges in checkout
- [x] Anti-fraud message section

### Design Upgrades
- [x] Sticky navbar with blur backdrop
- [x] Dark/light mode toggle
- [x] Animated gradient backgrounds (keyframe animations)
- [x] Better mobile responsiveness audit
- [x] Floating UI elements / depth effects

## Phase 11: Advanced Feature Upgrade

### Missing Pages
- [x] About Us page (/about)
- [x] Contact page (/contact)
- [x] Vendor Program / Become a Seller page (/vendor-program)
- [x] API Documentation page (/api-docs)
- [x] Changelog page (/changelog)
- [x] Status page (/status)
- [x] Careers page (/careers)

### UX Upgrades
- [x] Mobile bottom navigation bar (visible on mobile only)
- [x] Search autocomplete with debounce in Navbar
- [x] Skeleton loaders for Marketplace and Dashboard pages
- [x] PWA manifest.json + service worker registration
- [x] Floating live chat widget (AI-powered)

### Dashboard Enhancements
- [x] Vendor analytics: revenue chart, top products, conversion rate
- [x] Login history page (/dashboard/security)
- [x] Security alerts and device management
- [x] Referral leaderboard section
- [x] Loyalty rewards / points system

### AI Features
- [x] AI chatbot support widget (floating, context-aware)
- [x] AI product description generator in Vendor dashboard

### Admin Enhancements
- [x] Announcement system (create/manage site-wide banners)
- [x] Promo banner manager
- [x] Vendor approval workflow (approve/reject/KYC)
- [x] Fraud detection alerts panel

## Phase 12: Full Ecosystem Upgrade

### Marketplace Engine
- [ ] Dynamic product inventory with stock count per product
- [ ] Auto sold-out detection and badge
- [ ] Wishlist/favorites system (add/remove, persisted per user)
- [ ] Recently viewed products (localStorage + backend)
- [ ] Related products section on ProductDetail
- [ ] Advanced filtering (price range, condition, delivery time, rating)
- [ ] Product recommendations on homepage and dashboard

### Automation System
- [ ] Auto wallet deduction on order placement (already partial — make atomic)
- [ ] Auto order status progression (pending → processing → delivered)
- [ ] Auto refund workflow (request → admin review → wallet credit)
- [ ] AI auto-reply suggestions for support tickets
- [ ] Delivery confirmation system with timestamp

### Advanced Wallet
- [ ] Full transaction log with type filters (deposit/withdraw/order/refund/bonus)
- [ ] Escrow balance (held during active order)
- [ ] Bonus/reward balance (separate from main balance)
- [ ] Crypto wallet support UI (BTC, ETH, USDT deposit addresses)
- [ ] Withdraw system with destination address

### SMM Panel Upgrades
- [ ] Drip-feed orders (spread delivery over time with interval selector)
- [ ] Refill system (request refill for dropped followers)
- [ ] Mass order tool (bulk order multiple services at once)
- [ ] Order speed labels (Slow / Medium / Fast / Instant)
- [ ] Cancel/refund request flow for growth orders
- [ ] Real-time order status tracking with animated progress bar

### Vendor Ecosystem
- [ ] Vendor onboarding form with KYC fields
- [ ] Commission system (platform % per sale shown in vendor dashboard)
- [ ] Vendor payout request system
- [ ] Vendor reputation score (based on ratings + fulfillment rate)
- [ ] Vendor badges (Verified, Top Seller, New)

### AI Features
- [ ] AI product recommendations widget (based on category/history)
- [ ] AI search assistant (natural language → product results)
- [ ] Smart analytics insights on admin dashboard (AI summary)
- [ ] AI auto-reply suggestions for support ticket responses

### Conversion Optimization
- [x] Countdown timers on limited-stock products
- [x] "X people viewing this" indicator on product pages
- [ ] Abandoned cart recovery reminder (notification after 30 min)
- [x] Gamified loyalty points display on dashboard

### Admin Upgrades
- [ ] Real-time order monitoring with live refresh (polling)
- [ ] Revenue analytics with interactive Recharts (daily/weekly/monthly)
- [ ] Push notification sender to all users
- [ ] Service category enable/disable controls
- [ ] API key management panel for vendors

### Polish & Performance
- [ ] Consistent spacing and shadow audit across all pages
- [ ] Interactive Recharts on all analytics pages (vendor + admin)
- [ ] Dashboard micro-interactions (hover states, count-up animations)
- [ ] Rate limiting middleware on tRPC procedures
- [ ] WebSocket-style polling for live order/SMS updates

## Phase 13: Service Catalog Expansion
- [x] Virtual Numbers page: 1,431 unique services across 13 categories (Social Media, Messaging Apps, AI Platforms, Dating Apps, Gaming, Crypto & Trading, Streaming Services, Shopping & Marketplace, Delivery & Food, Business Tools, Survey & Rewards, Banking & Finance, Travel & Transport)
- [x] Live search across all 1,431 services
- [x] Category filter tabs with service counts
- [x] Country picker with 40+ countries and per-country pricing
- [x] Sort by: Most Popular, Cheapest, Fastest OTP, Highest Success Rate, A-Z
- [x] Price filter (max price cap)
- [x] Speed badges (Instant / Fast / Medium / Slow) per service
- [x] Success rate and stock availability per service card
- [x] My Numbers tab with SMS inbox and OTP copy button

## Phase 14 — 5sim API Integration (Virtual Numbers)

- [x] Add FIVESIM_API_KEY secret to environment
- [x] Create server/fivesim.ts helper with all 5sim API calls
- [x] Procedure: virtualNumbers.getProducts — fetch live products/prices from 5sim
- [x] Procedure: virtualNumbers.getCountries — fetch list of countries from 5sim
- [x] Procedure: virtualNumbers.getPrices — get prices for country + product
- [x] Procedure: virtualNumbers.purchase — buy real activation number via 5sim (deduct wallet, store order)
- [x] Procedure: virtualNumbers.checkSms — poll order status and sync SMS to DB
- [x] Procedure: virtualNumbers.cancelOrder — cancel pending order (refund if no SMS)
- [x] Procedure: virtualNumbers.finishOrder — mark order as finished
- [x] Procedure: virtualNumbers.banNumber — report number as banned (get refund)
- [x] Procedure: virtualNumbers.getApiBalance — admin: check 5sim account balance
- [x] Update VirtualNumbers.tsx to use live 5sim countries and products
- [x] Update SMS inbox to poll checkSms every 5s for live OTP delivery
- [x] Show real-time stock count and price from 5sim API
- [x] Add purchase flow: select country → search service → buy (wallet deduction)
- [x] Add active orders panel showing phone number, expiry countdown, live SMS
- [x] Handle cancel/ban/finish actions in UI with refund logic
- [x] Add schema migration: apiOrderId, operator fields on virtual_numbers table

## Phase 15 — Social Growth API Integration (SMMKings + Peakerr)

- [x] Create server/smm.ts helper (universal SMM API v2 client for SMMKings + Peakerr)
- [x] Add growth_orders table to schema (apiOrderId, panel, serviceId, link, quantity, startCount, remains, status)
- [x] Push schema migration with pnpm db:push
- [x] Procedure: growth.getServices — fetch & cache live services from both panels
- [x] Procedure: growth.placeOrder — place real SMM order (deduct wallet, store in DB)
- [x] Procedure: growth.getOrderStatus — check live status from panel
- [x] Procedure: growth.getMyOrders — list user's growth orders with live status
- [x] Procedure: growth.getBalance — admin: check panel account balances
- [x] Procedure: growth.refillOrder — request refill for dropped followers
- [x] Procedure: growth.cancelOrder — cancel eligible order
- [x] Rewrite GrowthServices.tsx with live services from both panels
- [x] Add platform filter tabs (Instagram, TikTok, YouTube, Facebook, Twitter/X, Telegram, Spotify, etc.)
- [x] Add service type filter (Followers, Likes, Views, Comments, Shares, etc.)
- [x] Show real min/max quantity, rate per 1000, refill/cancel badges
- [x] Add order placement modal (link input, quantity slider, price preview)
- [x] Add My Orders tab with live status polling
- [x] Add order progress bar (start count → current → target)
- [x] Write vitest tests for SMM procedures

## Phase 16 — Paystack Payment Integration
- [x] Create server/paystack.ts helper (initializeTransaction, verifyTransaction, validateWebhookSignature)
- [x] Add payments table to drizzle/schema.ts
- [ ] Push schema migration with pnpm db:push
- [x] Add payment tRPC procedures: payment.initiate, payment.verify, payment.history
- [x] Add Paystack webhook Express route for charge.success events
- [x] Install @paystack/inline-js on client
- [x] Build PaystackDepositModal component with preset amounts and custom amount input
- [x] Integrate Paystack Popup JS in the deposit modal (resumeTransaction flow)
- [x] Wire deposit button in DashboardWallet.tsx to the new modal
- [x] Show payment history in wallet page
- [x] Write vitest for Paystack secret key validation
