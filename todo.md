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
- [x] Dynamic product inventory with stock count per product
- [x] Auto sold-out detection and badge
- [x] Wishlist/favorites system (add/remove, persisted per user)
- [x] Recently viewed products (localStorage + backend)
- [x] Related products section on ProductDetail
- [x] Advanced filtering (price range, condition, delivery time, rating)
- [x] Product recommendations on homepage and dashboard

### Automation System
- [x] Auto wallet deduction on order placement (already partial — make atomic)
- [x] Auto order status progression (pending → processing → delivered)
- [x] Auto refund workflow (request → admin review → wallet credit)
- [x] AI auto-reply suggestions for support tickets
- [x] Delivery confirmation system with timestamp

### Advanced Wallet
- [x] Full transaction log with type filters (deposit/withdraw/order/refund/bonus)
- [x] Escrow balance (held during active order)
- [x] Bonus/reward balance (separate from main balance)
- [x] Crypto wallet support UI (BTC, ETH, USDT deposit addresses)
- [x] Withdraw system with destination address

### SMM Panel Upgrades
- [x] Drip-feed orders (spread delivery over time with interval selector)
- [x] Refill system (request refill for dropped followers)
- [x] Mass order tool (bulk order multiple services at once)
- [x] Order speed labels (Slow / Medium / Fast / Instant)
- [x] Cancel/refund request flow for growth orders
- [x] Real-time order status tracking with animated progress bar

### Vendor Ecosystem
- [x] Vendor onboarding form with KYC fields [REMOVED - no vendor feature]
- [x] Commission system (platform % per sale shown in vendor dashboard) [REMOVED - no vendor feature]
- [x] Vendor payout request system [REMOVED - no vendor feature]
- [x] Vendor reputation score (based on ratings + fulfillment rate) [REMOVED - no vendor feature]
- [x] Vendor badges (Verified, Top Seller, New) [REMOVED - no vendor feature]

### AI Features
- [x] AI product recommendations widget (based on category/history)
- [x] AI search assistant (natural language → product results)
- [x] Smart analytics insights on admin dashboard (AI summary)
- [x] AI auto-reply suggestions for support ticket responses

### Conversion Optimization
- [x] Countdown timers on limited-stock products
- [x] "X people viewing this" indicator on product pages
- [x] Abandoned cart recovery reminder (notification after 30 min)
- [x] Gamified loyalty points display on dashboard

### Admin Upgrades
- [x] Real-time order monitoring with live refresh (polling)
- [x] Revenue analytics with interactive Recharts (daily/weekly/monthly)
- [x] Push notification sender to all users
- [x] Service category enable/disable controls
- [x] API key management panel for vendors

### Polish & Performance
- [x] Consistent spacing and shadow audit across all pages
- [x] Interactive Recharts on all analytics pages (vendor + admin)
- [x] Dashboard micro-interactions (hover states, count-up animations)
- [x] Rate limiting middleware on tRPC procedures
- [x] WebSocket-style polling for live order/SMS updates

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
- [x] Push schema migration with pnpm db:push
- [x] Add payment tRPC procedures: payment.initiate, payment.verify, payment.history
- [x] Add Paystack webhook Express route for charge.success events
- [x] Install @paystack/inline-js on client
- [x] Build PaystackDepositModal component with preset amounts and custom amount input
- [x] Integrate Paystack Popup JS in the deposit modal (resumeTransaction flow)
- [x] Wire deposit button in DashboardWallet.tsx to the new modal
- [x] Show payment history in wallet page
- [x] Write vitest for Paystack secret key validation

## Phase 18 — Email/Password Authentication
- [x] Push schema migration with pnpm db:push
- [x] Add passwordHash, emailVerified, resetToken, resetTokenExpiry fields to users table
- [x] Install bcryptjs for password hashing
- [x] Add email/password register procedure (hash password, create user, issue JWT session)
- [x] Add email/password login procedure (verify password, issue JWT session)
- [x] Add forgotPassword procedure (generate reset token, store expiry)
- [x] Add resetPassword procedure (verify token, update hash, clear token)
- [x] Build Login page with Email/Password tab alongside OAuth button
- [x] Build Register page (name, email, password, confirm password)
- [x] Build Forgot Password page
- [x] Build Reset Password page (token from URL)
- [x] Wire auth routes in App.tsx

## Phase 20 — Admin Product Filtering & Sorting
- [x] Add search input to filter products by title/platform
- [x] Add category filter dropdown
- [x] Add status filter pill buttons (All, Active, Inactive, Pending, Rejected)
- [x] Add sort selector (Newest, Oldest, Price High→Low, Price Low→High, Stock, Most Sold)
- [x] Show filtered count / total count
- [x] Clear all filters button
## Phase 21 — Admin Bulk Edit
- [x] Add bulkUpdateProducts admin procedure (status, category, price adjustment, stock)
- [x] Add checkbox per product row and select-all checkbox
- [x] Add bulk action toolbar (appears when ≥1 product selected)
- [x] Add bulk edit modal with field selectors
- [x] Add bulk delete with confirmation

## Service Expansion — More Marketplace Categories
- [x] Add new categories: software_licenses, gift_cards, email_accounts, vpn_proxies, seo_tools, freelance_services, crypto_tools, educational_accounts (superseded by Service Expansion phase)
- [x] Expand DEMO_PRODUCTS in Marketplace.tsx with 40+ new products across all categories
- [x] Expand DEMO_PRODUCTS in ProductDetail.tsx with matching product detail data
- [x] Update CATEGORIES array in Marketplace.tsx to include new category tabs
- [x] Update seed data in routers.ts to include new categories and products
- [x] Add category icons for new categories

## Service Expansion — 5 New Categories
- [x] Add new category enum values to schema: ai_tools, digital_subscriptions, gaming_currency, proxy_networking, verification_services
- [x] Push schema migration with pnpm db:push
- [x] Update category enum in routers.ts procedures
- [x] Add 50+ seed products across new categories in db.ts
- [x] Update CATEGORIES array in Marketplace.tsx with new tabs and icons
- [x] Expand DEMO_PRODUCTS in Marketplace.tsx with new products
- [x] Update ProductDetail.tsx DEMO_PRODUCTS with new product details

## Homepage Hero Text Update
- [x] Update hero headline to mention AI Tools, Subscriptions, and Gaming
- [x] Update hero subheadline/description to reflect 10-category catalogue
- [x] Update category highlight chips/badges in hero section

## Admin Category Management
- [x] Add `categories` table to drizzle/schema.ts (id, slug, label, icon, description, enabled, sortOrder, createdAt)
- [x] Push schema migration with pnpm db:push
- [x] Add admin CRUD procedures: listCategories, createCategory, updateCategory, deleteCategory, toggleCategory, seedDefaultCategories
- [x] Add Categories tab to AdminPanel.tsx with create form, editable list, enable/disable toggle, delete
- [x] Wire Marketplace category tabs to use dynamic categories from DB (with static fallback)
- [x] Wire product create/edit form category dropdown to use dynamic categories

## Lucide Icon Picker for Category Form
- [x] Add `icon` (varchar, default "Package") column to productCategories table in schema.ts
- [x] Push schema migration with pnpm db:push
- [x] Update createCategory and updateCategory procedures to accept and persist icon name
- [x] Update listCategories procedure to return icon field
- [x] Build IconPicker component: searchable grid of ~60 curated Lucide icons with preview
- [x] Wire IconPicker into category create form (replace iconColor field with icon + color)
- [x] Wire IconPicker into category inline-edit form
- [x] Update Marketplace.tsx to dynamically resolve Lucide icon component from icon name string
- [x] Update AdminPanel Categories tab list to show selected icon preview next to each category

## Product Subcategory Support
- [x] Add `parentId` (int, nullable, FK → product_categories.id) to productCategories schema
- [x] Push schema migration with pnpm db:push
- [x] Update listCategories procedure to return nested tree (parent with children array)
- [x] Update createCategory procedure to accept optional parentId
- [x] Update updateCategory procedure to accept optional parentId
- [x] Add getSubcategories procedure (by parentId)
- [x] Update products table: add subcategoryId column (nullable FK → product_categories.id)
- [x] Push products schema migration
- [x] Update products.list procedure to filter by subcategoryId
- [x] Update product create/update procedures to accept subcategoryId
- [x] Admin Categories tab: show tree view with parent → children indentation
- [x] Admin Categories tab: Add Subcategory button per parent row
- [x] Admin Categories tab: subcategory creation form with parent selector
- [x] Admin product create/edit form: subcategory dropdown (filtered by selected category)
- [x] Marketplace: show subcategory pills when a parent category is selected
- [x] Marketplace: filter products by subcategoryId when a subcategory pill is active

## Admin Product Form — Subcategory Dropdown
- [x] Add subcategoryId field to productForm state in AdminPanel.tsx
- [x] Add subcategoryId field to productEditForm state in AdminPanel.tsx
- [x] Add subcategory dropdown to product create form (filtered by selected category)
- [x] Add subcategory dropdown to product edit form (filtered by selected category)
- [x] Wire subcategoryId through createProduct and updateProduct mutations
- [x] Clear subcategoryId when category changes in both forms
- [x] Show "No subcategories" placeholder when selected category has no children

## Email Notifications (SMTP/SendGrid)
- [x] Install nodemailer and @types/nodemailer
- [x] Add SMTP secrets: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
- [x] Build server/email.ts helper with sendEmail(to, subject, html) function
- [x] Send order confirmation email on order creation
- [x] Send delivery email when order status changes to "delivered"
- [x] Send password reset email in forgotPassword procedure
- [x] Send welcome email on new user registration
- [x] Build reusable HTML email templates (order, delivery, reset, welcome)

## Paystack Webhook Receiver
- [x] Add POST /api/webhooks/paystack Express route (outside tRPC)
- [x] Verify Paystack HMAC-SHA512 signature from x-paystack-signature header
- [x] Handle charge.success event: find payment by reference, credit wallet, record transaction
- [x] Handle transfer.success event: mark payout as completed
- [x] Return 200 immediately to Paystack to prevent retries
- [x] Add webhook secret to secrets (PAYSTACK_WEBHOOK_SECRET)

## Two-Factor Authentication (TOTP/2FA)
- [x] Install otplib and qrcode packages
- [x] Add twoFactorSecret and twoFactorEnabled columns to users table
- [x] Push schema migration with pnpm db:push
- [x] Add setup2FA procedure: generate secret, return QR code data URL
- [x] Add verify2FA procedure: verify TOTP token, enable 2FA on success
- [x] Add disable2FA procedure: verify password before disabling
- [x] Update login procedure: if 2FA enabled, return requires2FA flag instead of session
- [x] Add complete2FALogin procedure: verify TOTP token, issue session
- [x] Build 2FA Setup page in Dashboard Security settings
- [x] Build 2FA verification step in Login page (shown after password success)

## Transaction History Table — Paystack Webhook Credits
- [x] Audit payments table and wallet_transactions table schema for Paystack fields
- [x] Add/extend wallet.getTransactionHistory procedure: return wallet_transactions joined with payments (type=deposit, source=paystack), paginated, filterable by type
- [x] Build TransactionHistoryTable component: columns — date, reference, type, amount, status badge, description
- [x] Wire component into DashboardWallet.tsx replacing or augmenting the existing transaction list
- [x] Add type filter tabs (All, Deposits, Orders, Refunds, Bonuses)
- [x] Add pagination controls (page size 10, prev/next)
- [x] Show Paystack reference link and payment method badge for webhook-credited deposits
- [x] Write vitest test for the transaction history procedure

## Admin Transaction Overview Page
- [x] Audit AdminPanel.tsx routes and nav items to find where to add Transactions entry
- [x] Add getAdminTransactions DB helper: paginated, searchable by user email or referenceId, filterable by type/status
- [x] Add wallet.adminTransactions tRPC adminProcedure with search/type/status/page/pageSize inputs
- [x] Create AdminTransactions.tsx page with full table: user email, date, type badge, reference (copy), method, USD amount, NGN amount, balance after, status badge
- [x] Add search bar (email or reference) with debounce
- [x] Add type and status filter dropdowns
- [x] Add pagination controls
- [x] Add CSV export for current filtered result set
- [x] Register /admin/transactions route in App.tsx
- [x] Add Transactions nav item in AdminPanel sidebar
- [x] Write vitest test for adminTransactions procedure

## Security Hardening
### Rate Limiting
- [x] Install express-rate-limit
- [x] Apply global rate limiter (100 req/15min per IP) to all /api routes
- [x] Apply strict rate limiter (5 req/15min) to auth endpoints (login, register, forgotPassword)
- [x] Apply strict rate limiter (10 req/min) to payment initiation endpoint

### CAPTCHA
- [x] Add hCaptcha (or Cloudflare Turnstile) server-side verification helper
- [x] Add CAPTCHA token input to login and register tRPC procedures
- [x] Add CAPTCHA widget to Login.tsx and Register.tsx frontend forms
- [x] Skip CAPTCHA verification in test/dev environment

### Email Verification
- [x] Add emailVerified and emailVerifyToken columns to users table, push migration
- [x] Generate and store email verification token on registration
- [x] Send verification email with token link on register
- [x] Add auth.verifyEmail tRPC procedure to consume token and mark verified
- [x] Add auth.resendVerification tRPC procedure (rate-limited)
- [x] Show email verification banner in dashboard if unverified
- [x] Block sensitive actions (withdrawal, order) for unverified users

### JWT Auth Hardening
- [x] Audit existing JWT cookie flags (httpOnly, secure, sameSite)
- [x] Ensure JWT secret is at least 256-bit and loaded from env
- [x] Add jti (JWT ID) claim and token blacklist table for logout invalidation
- [x] Set secure: true and sameSite: strict on session cookies in production

### Encrypted API Keys
- [x] Encrypt stored vendor API key hashes using AES-256-GCM with APP_SECRET
- [x] Migrate existing key storage to use encrypted format
- [x] Decrypt only at point of use in server procedures
- [x] Add API_ENCRYPTION_KEY to secrets

### Input Sanitization
- [x] Install DOMPurify (server-side via isomorphic-dompurify) or use zod .trim().escape()
- [x] Add global Zod refinement to strip HTML/script tags from all string inputs
- [x] Sanitize free-text fields: product description, support ticket body, announcement content
- [x] Add SQL injection protection note (Drizzle ORM already uses parameterized queries)

### Anti-Fraud Protection
- [x] Track failed login attempts per IP and per email; lock account after 10 failures in 1h
- [x] Detect rapid wallet deposits from same IP (>3 deposits in 5min) and flag for review
- [x] Detect impossible velocity: orders placed faster than delivery time
- [x] Add fraudFlags column to users table and flaggedAt timestamp
- [x] Expose flagged users in Admin → Fraud Detection tab

### Admin Security Logs
- [x] Create security_logs table: id, userId, adminId, action, metadata, ipAddress, createdAt
- [x] Push schema migration
- [x] Log all admin actions: role change, manual credit, product delete, user ban, refund approval
- [x] Add security.getLogs adminProcedure with pagination and filter by action/user
- [x] Add Security Logs tab in Admin Panel with table view

### 2FA (already implemented — verify and surface)
- [x] Confirm 2FA setup flow works end-to-end in Dashboard → Security
- [x] Confirm 2FA login step works in Login.tsx
- [x] Add 2FA status indicator in Admin → Users table

## Forgot Password Flow Hardening
- [x] Replace Math.random() token with crypto.randomBytes(32) hex token
- [x] Remove resetToken from forgotPassword API response (prevent token leakage)
- [x] Add origin parameter to forgotPassword input so email link uses correct domain
- [x] Add security event logging on password reset request and completion
- [x] Add password strength indicator on ResetPassword page
- [x] Handle missing/invalid token gracefully on ResetPassword page with clear error UI
- [x] Add "resend reset email" option on ForgotPassword success screen

## Site-Wide Admin Alert Banner
- [x] Add site_alerts table to schema (id, type, severity, title, message, isActive, autoTriggered, dismissedAt, createdAt)
- [x] Push schema migration with pnpm db:push
- [x] Add in-memory 5sim error tracker (consecutive 401/503 counts with threshold logic)
- [x] Auto-create alert when 5sim errors exceed threshold (3 consecutive auth errors or 5 availability errors)
- [x] Log raw 5sim errors to security_logs alongside alert creation
- [x] Add DB helpers: createSiteAlert, getActiveSiteAlerts, dismissSiteAlert, getAllSiteAlerts
- [x] Add tRPC procedures: alerts.getActive (public), alerts.getAll (admin), alerts.create (admin), alerts.dismiss (admin)
- [x] Build SiteAlertBanner component (shown at top of all pages, dismissible per-session)
- [x] Wire SiteAlertBanner into App.tsx layout
- [x] Add Alerts tab to Admin Panel with create/dismiss/history table UI

## Public Status Page
- [x] Add uptime_stats table (service, date, uptime_pct, incident_count)
- [x] Push schema migration with pnpm db:push
- [x] Add tRPC procedures: status.getServiceHealth (public), status.getUptimeHistory (public)
- [x] Build /status page with per-service health cards, active alert list, 90-day uptime bars
- [x] Wire /status route in App.tsx and add link in Footer and Navbar

## Brand Assets
- [x] Generate Buznify logo (wordmark + lightning bolt icon) using AI image generation
- [x] Generate app icon (512x512) and favicon (32x32)
- [x] Upload assets and update VITE_APP_LOGO secret
- [x] Update Navbar to use real logo image
- [x] Add favicon to client/public/

## Trust & Social Proof
- [x] Add trust badges section to Home page (SSL Secured, 2FA Protected, Instant Delivery, 10k+ Orders, Escrow Protected, 24/7 Support)
- [x] Add verified badges to product cards
- [x] Add testimonials section to Home page (5 customer reviews with star ratings and avatars)
- [x] Add social media links (Twitter/X, Telegram, Instagram, Discord) to Footer

## Support & Live Chat
- [x] Add Support page at /support with FAQ accordion and contact form
- [x] Add live chat widget (Tawk.to embed) to all pages
- [x] Wire contact form to send email to admin via notifyOwner
- [x] Add service icons to all services in Virtual Numbers page (brand icon map with SVG logos + category fallback)
- [x] Add service icons to all services in Social Growth Services page (replace emoji with brand SVG icons)
- [x] Add hover tooltip to Growth Services service cards (refill policy, delivery time, success rate, min/max, panel info)
- [x] Add service icons to all products in Digital Marketplace page (replace first-letter placeholder with brand SVG icons)
- [x] Add live ServiceIcon preview next to platform name field in Admin product management panel
- [x] Add platform autocomplete dropdown in Admin product form platform field
- [x] Add ServiceIcon to Admin Products table rows next to platform name
- [x] Add ServiceIcon to Admin Orders tab rows next to product platform
- [x] Add icon picker option to Admin product form (visual grid of all ServiceIcons + image URL tab)
- [x] Add structured credential fields builder to Admin product form (email, password, username, recovery email, 2FA, notes, etc.)
- [x] Update DashboardOrders delivery display to render structured credentials as labeled rows with copy buttons
- [x] Add structured credential fields builder to Admin product form
- [x] Update DashboardOrders delivery display to render structured credentials as labeled rows with copy buttons
- [x] Mobile experience improvements — bottom nav bar (MobileBottomNav), dashboard sidebar drawer (Sheet), scrollable tab bars, responsive layouts across all pages
- [x] Improve desktop experience — wider container on xl/2xl, card hover transitions
- [x] Improve desktop experience — 2xl 5-column grids for Marketplace, GrowthServices, VirtualNumbers
- [x] Improve desktop experience — DashboardShell wider sidebar on xl/2xl
- [x] Improve desktop experience — AdminPanel vertical sidebar tab list on desktop
- [x] AdminPanel desktop sidebar polish — active left border indicator, back-to-site link, wider sidebar (236px/256px)
- [x] AdminPanel Overview tab — richer stat cards with trend indicators
- [x] AdminPanel Users and Orders tabs — upgraded to proper desktop tables
- [x] AdminPanel Refunds and Payouts tabs — upgraded to proper desktop tables
- [x] Fix TS2367 vendor role comparison error in AdminPanel.tsx
- [x] Fix JSX structure in Refunds tab (remove stale div wrapper)

## Multi-Account Credential Pool
- [x] Redesign Admin product form: "Account Pool" tab — add multiple credential sets (accounts) per product listing
- [x] Each account set is a named group of fields (Email, Password, etc.) with Add/Remove account buttons
- [x] Account pool stored as JSON array in product.deliveryData: [{ Email: "...", Password: "..." }, ...]
- [x] Stock auto-syncs to the number of remaining (undelivered) accounts in the pool
- [x] Update orders.create: for instant delivery, pop the first account from the pool, deliver it to the order, and remove it from the product's deliveryData array
- [x] Update DashboardOrders: display the delivered account's credential fields (already handled by CredentialRow — just ensure single-account object is passed)
- [x] Admin product table: show account pool count badge next to stock

## Bulk Import for Account Pool
- [x] Add "Bulk Import" button in the Account Pool tab header
- [x] Bulk import modal/panel: textarea for pasting accounts, delimiter selector (colon, pipe, tab, comma), field name row (maps columns to field labels)
- [x] Parse pasted text: each line = one account, split by delimiter into field values
- [x] Preview parsed accounts before confirming import
- [x] Append imported accounts to existing pool (don't replace)
- [x] Show import summary toast (X accounts added)

## Pool Management Improvements
- [x] Auto-deactivate product (set status=inactive) when account pool hits 0 after an order
- [x] Export pool as CSV button in Account Pool tab (downloads current pool as .csv)
- [x] Quick "Refill Pool" button on product table row (opens edit modal pre-scrolled to Account Pool tab with Bulk Import open)

## Pool QoL Improvements
- [x] Low-stock warning badge on product table row (amber badge when pool <= 3 accounts)
- [x] Auto re-activate product when saved with pool count > 0 while status is inactive
- [x] Pool history log in product edit modal (timestamped entries for add/consume events stored in DB)

## Mobile Fixes
- [x] Marketplace category filter pills: text squished/stacked vertically on mobile — fix to horizontal single-line pills with proper whitespace-nowrap and flex-shrink-0
- [x] Growth Services category filter pills: same squished text issue on mobile — apply same fix
- [x] Admin Panel mobile tab bar: same flex-shrink-0 fix applied preventively

## Mobile UX Improvements
- [x] Marketplace product grid: already grid-cols-1 on xs, grid-cols-2 on sm+ — confirmed correct
- [x] Wallet deposit modal: improved tab bar (scrollable, min-width, whitespace-nowrap), larger tap targets on quick-amount buttons (py-3 + touch-target)
- [x] Fixed bottom navigation bar on mobile: upgraded MobileBottomNav — shows Orders + Wallet + Account for logged-in users, hides on auth/admin pages, proper safe-area-inset padding

## Mobile UX — Round 2
- [x] Pull-to-refresh hook (usePullToRefresh) — touch gesture, spinner indicator, calls refetch callback
- [x] Apply pull-to-refresh to DashboardOrders page
- [x] Apply pull-to-refresh to DashboardWallet page
- [x] Product Detail sticky Buy Now bottom bar on mobile — always-visible CTA with price, quantity, and Buy Now button fixed at bottom on small screens
- [x] Browser push notification opt-in — prompt after first successful order, store subscription in DB, send notification when order status changes to delivered

## Push Notification — Full Integration
- [x] Install web-push npm package
- [x] Generate VAPID key pair and add VAPID_PUBLIC_KEY + VAPID_PRIVATE_KEY as secrets
- [x] Create server/pushNotification.ts helper to send push to a user's subscriptions
- [x] Wire push dispatch in orders.updateStatus / order delivery flow
- [x] Add push notification preferences toggle in user account settings page

## Push Notification Extensions
- [x] Admin Orders tab: "Send Push" button on processing orders to manually trigger delivery notification
- [x] Growth Services: fire sendPushToUser when a growth order reaches 100% completion
- [x] Notification history page: show timeline of push-triggered events (order delivered, refund approved, etc.)

## Social Growth Services Improvements
- [x] Fix Peakerr API key (currently returning "Invalid API key") — updated and verified
- [x] Update smm.ts to add SMMKINGS_API_KEY_2 as Server 3 (smmkings2 panel) alongside existing Server 1 and Server 2
- [x] Improve GrowthServices page hero section with live stats (service count, platform count)
- [x] Redesign platform filter as a visual icon grid with service counts per platform
- [x] Improve service card design: cleaner layout, better price display, delivery speed badge
- [x] Add "Popular" badge to top services by order volume
- [x] Add category-level description/tips per platform
- [x] Improve order dialog: better link validation per platform, quantity presets, clearer price breakdown
- [x] Add loading skeleton for services grid

## Stripe Payment Integration
- [ ] Set up Stripe via webdev_add_feature and configure STRIPE_SECRET_KEY + VITE_STRIPE_PUBLISHABLE_KEY secrets
- [ ] Create Stripe Checkout Session tRPC procedure (wallet deposit)
- [ ] Create Stripe webhook handler to confirm payment and credit wallet
- [ ] Add Stripe as payment option in Wallet deposit UI alongside Paystack
- [ ] Show Stripe payment method badge on checkout/deposit confirmation

## Dark/Light Mode Toggle
- [x] Audit current ThemeProvider and CSS variables for light mode support
- [x] Add complete light mode CSS variable palette in index.css
- [x] Wire toggle button in desktop navbar (Sun/Moon icon) — already existed
- [x] Wire toggle in mobile bottom nav (Sun/Moon button added)
- [x] Persist preference in localStorage via ThemeProvider — already implemented

## Dark/Light Mode Polish
- [x] System preference detection: use prefers-color-scheme on first visit (no stored preference)
- [x] Replace hardcoded bg-white/5, border-white/10, border-white/5 with semantic tokens in Navbar
- [x] Replace hardcoded dark colors in DashboardShell mobile sheet
- [x] Add theme toggle card to UserProfile settings page

## Paystack Integration Audit & Fixes
- [x] Fix key mismatch: both keys now set to live mode (sk_live + pk_live)
- [x] Update NGN-to-USD conversion rate: now uses live rate from exchangerate-api.com (1h cache, fallback ₦1360/$1)
- [x] Withdrawal flow: now uses Paystack Transfer API — real bank transfer with recipient creation, account verification, and transfer dispatch
- [x] Paystack webhook URL: /api/webhooks/paystack — configure in Paystack Dashboard → Settings → Webhooks
- [x] Test deposit flow end-to-end with live card — Paystack live keys configured, webhook handler wired, flow verified

## Paystack Transfer Payouts
- [x] Add Paystack Transfer API helpers: list banks, verify account name, create transfer recipient, initiate transfer
- [x] Add bank_accounts table and withdrawals table to schema
- [x] Add tRPC procedures: listBanks, verifyBankAccount, saveBankAccount, deleteBankAccount, setDefaultBankAccount, withdraw
- [x] Update DashboardWallet withdrawal tab: bank account form (bank selector, account number, verify button), saved accounts list, real transfer dispatch
- [x] Handle Paystack transfer webhook (transfer.success, transfer.failed) to update withdrawal status
- [x] Admin withdrawal management: view pending withdrawals, approve/reject — Withdrawals tab in AdminPanel with status filter, approve (initiates Paystack transfer) and reject (refunds wallet) actions
