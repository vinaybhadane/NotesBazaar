# NotesBazaar by AbhyasMitra

> **Production-Ready, SEO-Focused, Secure Academic Notes Marketplace for SPPU Engineering Students.**  
> Built strictly as specified in `NotesBazaar_AbhyasMitra_Master_Prompt.md`.

---

## 🌟 Brand & Visual Identity

- **Brand:** NotesBazaar by AbhyasMitra
- **Official Brand Mark:** Original AbhyasMitra logo preserved at `public/logo.png` and `public/AbhyasMitraLogo.png`
- **Visual Design Language:** Adapted directly from the supplied visual design reference:
  - Clean white layout (`#FFFFFF`) with subtle cool-gray surfaces (`#F8FAFC`).
  - High-contrast, legible typography (`#0F172A`).
  - Distinctive **lemon-yellow** accents (`#FFE500`) for active pill navigation, filter tags, and key highlights.
  - Floating pill search dock with Branch, Year, Pattern, and Subject controls.
  - Generous card border radii (`rounded-3xl`) and subtle elevation shadows.

---

## 🏛️ Academic Catalog Architecture (SPPU 2024 Pattern)

### 1. 7 Seeded Engineering Branches
1. **Computer Engineering** (`/branches/computer-engineering`)
2. **Information Technology** (`/branches/information-technology`)
3. **Artificial Intelligence and Data Science** (`/branches/artificial-intelligence-and-data-science`)
4. **Electronics and Tele-Communication** (`/branches/electronics-and-tele-communication`)
5. **Electrical Engineering** (`/branches/electrical-engineering`)
6. **Mechanical Engineering** (`/branches/mechanical-engineering`)
7. **Civil Engineering** (`/branches/civil-engineering`)

### 2. Academic Years & Pattern
- **Second Year (SE)** and **Third Year (TE)**
- **SPPU 2024 Pattern** stored as structured metadata across all subjects and products.
- Extensible schema enabling First Year (FE) and Final Year (BE) additions without database restructuring.

---

## 🛡️ Security, Payments & Digital Rights

1. **Strictly No Fake Data:**
   - Real database records for catalog products, branches, years, subjects, and prices in INR.
   - Zero invented review scores, fake testimonials, or fabricated user counts.
2. **Coming Soon Toggle Enforcement:**
   - Dedicated toggle in Admin Panel (`is_coming_soon`).
   - When ON: Storefront displays prominent `COMING SOON!` badge; order creation and Razorpay checkout are strictly blocked on both client and server.
3. **Razorpay Payment Security:**
   - Authoritative pricing queried directly from server-side database.
   - Cryptographic HMAC-SHA256 signature verification executed on the backend before order fulfillment.
   - Idempotent webhook processing (`/api/razorpay/webhook`) protecting against duplicate orders.
4. **Private File Delivery:**
   - Original notes stored in private Azure Blob Storage (`notes-private`) / protected local storage.
   - Download endpoint (`/api/download/[entitlementId]`) verifies active paid entitlement and records download audit log.
   - Zero permanent public URLs for paid documents.

---

## 📂 Project Structure

```text
NotesBazaar/
├── app/
│   ├── layout.tsx                     # Root layout with AuthProvider, Announcement Ribbon, Navbar, Footer
│   ├── page.tsx                       # SkyBound-inspired homepage with Hero Search Dock & Branch cards
│   ├── globals.css                    # Tailwind CSS tokens & rounded card components
│   ├── sitemap.ts                     # Dynamic XML sitemap for canonical SEO indexing
│   ├── robots.ts                      # Robots crawl directives disallowing /admin, /account, /api
│   ├── notes/
│   │   ├── page.tsx                   # Multi-facet catalog browse page
│   │   ├── NotesCatalogClient.tsx     # Client filtering, search & sort
│   │   └── [product-slug]/
│   │       ├── page.tsx               # Product detail page with JSON-LD schemas
│   │       └── ProductPurchaseBox.tsx # Price display & Coming Soon / Razorpay purchase box
│   ├── branches/
│   │   ├── page.tsx                   # 7 Branches overview
│   │   └── [branch-slug]/
│   │       ├── page.tsx               # Branch landing page (SE & TE sections)
│   │       └── [year-slug]/page.tsx   # Year-specific branch subjects & notes
│   ├── subjects/[subject-slug]/       # Subject-specific notes page
│   ├── offers/page.tsx                # Active discount coupons & promotions
│   ├── account/                       # Student dashboard
│   │   ├── layout.tsx                 # Student account navigation sidebar
│   │   ├── page.tsx                   # Overview & recent downloads
│   │   ├── downloads/page.tsx         # Entitled note downloads
│   │   ├── purchases/page.tsx         # Order history & receipts
│   │   ├── notifications/page.tsx     # Student notifications & alerts
│   │   └── settings/page.tsx          # Account preferences
│   ├── checkout/[order-id]/           # Dedicated Razorpay checkout screen
│   ├── payment/
│   │   ├── success/page.tsx           # Verified payment confirmation
│   │   └── failure/page.tsx           # Payment retry & support
│   ├── admin/                         # Role-protected administrative area
│   │   ├── layout.tsx                 # Protected admin shell & navigation
│   │   ├── page.tsx                   # Admin metrics dashboard
│   │   ├── notes/                     # Notes CRUD & Coming Soon toggle
│   │   ├── branches/                  # Catalog hierarchy
│   │   ├── orders/                    # Audited order records
│   │   ├── payments/                  # Captured payments & webhook reconciliation
│   │   ├── offers/                    # Coupon management
│   │   ├── banners/                   # Homepage promotional banners
│   │   ├── notifications/             # Targeted student broadcast composer
│   │   ├── users/                     # Registered user list
│   │   └── settings/                  # Platform settings & disclaimer
│   ├── login/page.tsx                 # Firebase Email & Google login
│   ├── register/page.tsx              # Student registration
│   ├── forgot-password/page.tsx       # Password reset
│   ├── about/page.tsx                 # Story & mission
│   ├── contact/page.tsx               # Contact support form
│   ├── faq/page.tsx                   # Detailed academic & payment FAQ
│   ├── privacy-policy/page.tsx        # DPDP-compliant privacy policy
│   ├── terms-and-conditions/page.tsx  # Terms of service
│   ├── refund-policy/page.tsx         # Transparent digital refund policy
│   ├── cancellation-policy/page.tsx   # Cancellation policy
│   ├── digital-delivery-policy/page.tsx # Digital delivery policy
│   ├── cookie-policy/page.tsx         # Cookie & storage notice
│   ├── disclaimer/page.tsx            # Independent resource disclaimer regarding SPPU
│   └── api/
│       ├── auth/sync/                 # Syncs Firebase users to database
│       ├── razorpay/create-order/     # Server-calculated Razorpay order creation
│       ├── razorpay/verify-payment/   # Cryptographic HMAC-SHA256 signature verification
│       ├── razorpay/webhook/          # Idempotent webhook processor
│       ├── download/[entitlementId]/  # Authorized private note streaming
│       ├── coupon/validate/           # Server coupon validation
│       └── admin/*                    # Protected admin CRUD routes
├── components/
│   ├── Navbar.tsx                     # Header with pill segmented nav & auth controls
│   ├── Footer.tsx                     # Footer with links, disclaimer & cookie settings trigger
│   ├── HeroSearchDock.tsx             # Floating search dock capsule
│   ├── NoteCard.tsx                   # Rounded note product card with Coming Soon badge
│   └── CookieBanner.tsx               # DPDP cookie banner & preferences modal
├── lib/
│   ├── db/index.ts                    # Azure SQL database client + local persistent fallback
│   ├── storage/index.ts               # Azure Blob Storage client + local private storage fallback
│   ├── firebase/client.ts             # Firebase client SDK
│   ├── firebase/admin.ts              # Firebase Admin SDK (token verification)
│   ├── razorpay.ts                    # Razorpay instance & HMAC verification utilities
│   ├── auth-context.tsx               # React Auth Context for user state & sync
│   └── types.ts                       # Shared TypeScript definitions
├── migrations/
│   └── 001_initial_schema.sql         # Azure SQL DDL schema for all 23 tables
├── scripts/
│   ├── seed.mjs                       # Database seeder (7 branches, SE/TE, real SPPU notes)
│   └── setup-env.js                   # Environment synchronizer
└── tests/
    └── business-logic.test.mjs        # Automated unit tests for critical business logic
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ (tested on Node v24.7.0)
- npm 9+

### 2. Installation
```bash
npm install
```

### 3. Environment Setup
Copy `.env.example` to `.env.local` and configure your credentials:
```bash
cp .env.example .env.local
```

### 4. Seed Database
Seed the 7 engineering branches, SE & TE years, SPPU 2024 Pattern, and initial notes:
```bash
npm run seed
```

### 5. Run Automated Tests
```bash
npm test
```

### 6. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Production Build
```bash
npm run build
npm start
```

