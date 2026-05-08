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
- [ ] About Us page (/about)
- [ ] Contact page (/contact)
- [ ] Vendor Program / Become a Seller page (/vendor-program)
- [ ] API Documentation page (/api-docs)
- [ ] Changelog page (/changelog)
- [ ] Status page (/status)
- [ ] Careers page (/careers)

### UX Upgrades
- [ ] Mobile bottom navigation bar (visible on mobile only)
- [ ] Search autocomplete with debounce in Navbar
- [ ] Skeleton loaders for Marketplace and Dashboard pages
- [ ] PWA manifest.json + service worker registration
- [ ] Floating live chat widget (AI-powered)

### Dashboard Enhancements
- [ ] Vendor analytics: revenue chart, top products, conversion rate
- [ ] Login history page (/dashboard/security)
- [ ] Security alerts and device management
- [ ] Referral leaderboard section
- [ ] Loyalty rewards / points system

### AI Features
- [ ] AI chatbot support widget (floating, context-aware)
- [ ] AI product description generator in Vendor dashboard

### Admin Enhancements
- [ ] Announcement system (create/manage site-wide banners)
- [ ] Promo banner manager
- [ ] Vendor approval workflow (approve/reject/KYC)
- [ ] Fraud detection alerts panel
