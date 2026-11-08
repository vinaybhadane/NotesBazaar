# NotesBazaar by AbhyasMitra — Master Website Build Prompt

> **Purpose:** Build a production-ready, SEO-focused, secure digital notes marketplace for SPPU engineering students.  
> **Brand:** NotesBazaar by AbhyasMitra  
> **Primary reference assets:** Attach both supplied images to Antigravity:
> 1. The NotesBazaar visual-design reference screenshot (white layout, black typography, lemon-yellow accents, soft grey surfaces, rounded cards).
> 2. The official AbhyasMitra logo (blue/cyan/navy book-and-laptop mark with the “AbhyasMitra” wordmark).
>
> Use the supplied AbhyasMitra logo as the actual brand logo. Do not redraw, distort, recolor, crop, or replace it with a generic icon. Use an optimized version while preserving its appearance.

---

## 1. Your role and execution rules

Act as a senior product designer, UX engineer, full-stack architect, security engineer, SEO specialist, and QA engineer.

Build the complete website—not just a landing-page mockup. All pages, forms, filters, authentication flows, checkout states, downloads, admin operations, responsive behavior, and empty/error/loading states must be implemented and connected to real backend logic.

### Mandatory execution rules

1. First inspect the existing repository, its framework, package manager, folder structure, current components, environment variables, and existing implementation. Do not overwrite working code blindly.
2. Read and follow all project instructions such as `AGENTS.md`, `README.md`, and existing architecture documentation.
3. Use the attached screenshots as visual references. The first image defines the website's visual language; the second image is the official brand logo.
4. Preserve existing working functionality unless a change is explicitly required.
5. Do not use mock data, fake testimonials, fake ratings, fake purchase counts, fake download counts, fake payment success, or invented product availability in production UI. Use real database records. Use clearly labeled seed data only in development.
6. Do not expose secrets, service-role credentials, database passwords, Razorpay secret keys, or privileged Firebase credentials in frontend code.
7. Do not claim a payment is successful based only on a frontend redirect or client-side callback. Verify payment on the server.
8. Build accessible, responsive interfaces with keyboard support, semantic HTML, visible focus states, and reduced-motion support.
9. Complete the implementation in phases, but do not stop after scaffolding. Run tests, lint, type checks, and production build; fix issues before declaring completion.
10. If a required credential is unavailable, build the integration boundary and a clear setup guide. Never fake a successful integration.

---

## 2. Product overview

**NotesBazaar by AbhyasMitra** is an online marketplace where SPPU engineering students can discover, purchase, and securely download academic notes.

Students must be able to:

- Browse notes by engineering branch, year, subject, and academic pattern.
- View note details, description, preview pages (if enabled), file format, file size, and price.
- See clearly marked **COMING SOON!** products that cannot be purchased yet.
- Register or log in securely.
- Purchase notes using Razorpay.
- Access purchased notes in their account and download them after server-side payment verification.
- View their order history and payment status.
- Receive relevant notifications about products they purchased, such as updated files or important corrections.

Administrators must be able to manage the entire catalog, pricing, banners, offers, orders, users, and notifications through a protected admin panel.

**Core positioning:** SPPU engineering notes for the 2024 Pattern, organized branch-wise, year-wise, and subject-wise.

Do not imply official affiliation with SPPU or the university unless the business has formal authorization. Add an appropriate independent-resource disclaimer.

---

## 3. Brand identity and visual design system

### 3.1 Visual direction

Follow the supplied travel-website reference for layout quality and visual language, but adapt it to an education/notes marketplace.

The website should feel:

- Premium, clean, modern, trustworthy, and student-friendly.
- Spacious, with strong typography and clear visual hierarchy.
- Minimal rather than crowded.
- Bright and readable, with carefully controlled accent colors.
- Consistent across desktop, tablet, and mobile.

### 3.2 Color system

Use the first uploaded screenshot as the primary UI reference:

- **Primary background:** pure white / near-white.
- **Main text:** near-black.
- **Accent:** bright lemon yellow, similar to the highlighted labels and active navigation in the reference.
- **Secondary surfaces:** very light cool grey.
- **Borders:** subtle light grey.
- **Muted text:** medium grey.
- **Success:** accessible green.
- **Warning:** accessible amber.
- **Error:** accessible red.

Use the AbhyasMitra logo's blue/cyan/navy colors as secondary brand colors in restrained places such as the logo, small brand details, selected icons, or subtle gradients. Do not allow the logo colors to overpower the reference screenshot's white/black/lemon-yellow visual system.

Create design tokens as CSS variables. Sample the exact logo colors from the supplied asset if useful; do not guess that the logo must be recolored.

### 3.3 Typography and components

- Use a modern, highly legible sans-serif typeface.
- Large, bold hero headings; medium-weight section headings; readable body copy.
- Rounded cards, rounded search controls, pill labels, and soft shadows.
- Use consistent border radii and spacing tokens.
- Buttons must have clear hover, active, disabled, loading, and focus states.
- Use custom inline SVG icons or a consistent tree-shakeable icon library. Do not use emoji as interface icons.
- Use the supplied logo in the header, footer, login screens, and admin sign-in where appropriate. Preserve its aspect ratio.

### 3.4 Motion

Use subtle, polished animations:

- Gentle fade/slide entrance for sections.
- Small card lift and border/accent glow on hover.
- Smooth carousel and filter transitions.
- Button press feedback and loading indicators.
- Small page-transition effects only if they do not harm navigation or performance.

Avoid excessive parallax, long entrance delays, scroll-jacking, distracting motion, or animations that reduce accessibility. Respect `prefers-reduced-motion`.

---

## 4. Recommended technical architecture

Inspect the current project first. If no stack is already established, use the following architecture:

### Frontend

- Next.js with App Router and TypeScript.
- React components with server components by default; use client components only where interaction requires them.
- Tailwind CSS with a documented design-token system.
- Use server-side rendering or static generation for public catalog and SEO landing pages.
- Use Zod (or an equivalent schema validator) for form and API input validation.

### Backend

- Next.js Route Handlers or a dedicated secure backend API.
- All privileged operations must execute server-side.
- Separate public catalog reads from protected account/admin operations.
- Apply authentication, authorization, validation, rate limiting, and structured logging to protected endpoints.

### Authentication

- Firebase Authentication for students and administrators.
- Support email/password and optionally Google sign-in if configured.
- Verify Firebase ID tokens on the backend for every protected API request.
- Use secure, HttpOnly, SameSite cookies for server-managed sessions where appropriate.
- Assign admin privileges through trusted server-side role management or Firebase custom claims. Never let a user grant themselves the admin role from the client.
- Provide account logout, session expiry handling, and password reset.

### Database and file storage

Use **Azure SQL Database** as the source of truth for application data and **Azure Blob Storage** for note files.

Important distinction:
- Store note metadata, prices, product relationships, orders, payment records, offer rules, banners, notification records, and audit logs in Azure SQL.
- Store actual PDF/document files in private Azure Blob Storage containers.
- Do not store large PDFs as database blobs unless there is a specific, justified requirement.
- Keep storage containers private. Never expose permanent public blob URLs for paid notes.
- Generate short-lived, server-authorized download links or stream files through a protected download endpoint after checking ownership and payment status.

Suggested Azure Blob containers:
- `notes-private` — paid original PDFs and other protected files.
- `notes-previews` — optional watermarked preview files intended for public access.
- `site-assets` — approved public banners and other public images, if Azure is used for assets.

### Payments

- Razorpay Checkout for payment collection.
- Create Razorpay orders only from the backend.
- Store the Razorpay order ID and internal order ID before opening checkout.
- Verify the payment signature on the backend.
- Verify webhook signatures using the raw request body and Razorpay webhook secret.
- Treat verified webhooks as an authoritative payment-state input.
- Make webhook processing idempotent.
- Never fulfill an order twice.
- Never unlock a download based only on a query parameter, client-side state, screenshot, or unverified callback.
- Store only necessary payment references and status. Do not store card numbers, CVV, UPI PINs, or other sensitive payment credentials.

### Notifications

Support:
- In-app notifications.
- Email notifications through a configured transactional email provider.
- Optional web push notifications only after explicit permission.

Admin should be able to send notifications to:
- All users, if the announcement is genuinely general.
- Users who purchased a particular note.
- Users who purchased notes in a particular branch/year/subject.
- A selected eligible audience.

Show a confirmation step with recipient count and message preview before sending. Log the campaign and delivery outcomes. Respect user notification preferences and applicable consent requirements.

---

## 5. Academic catalog structure

Create the catalog hierarchy below.

### 5.1 Branches

1. Computer Engineering
2. Information Technology
3. Electronics and Tele-Communication
4. Artificial Intelligence and Data Science
5. Electrical Engineering
6. Mechanical Engineering
7. Civil Engineering

Each branch must have:
- A dedicated SEO-friendly landing page.
- Branch description and relevant keywords.
- Year selection.
- Subject-wise notes listing.
- Search and filters.
- Product counts derived from actual published products.
- Empty state when no notes are available.

### 5.2 Years

The initial catalog must support:

- Second Year
- Third Year

Design the data model so that First Year and Final Year can be enabled later without restructuring the database. Admin must be able to configure available years and patterns.

### 5.3 Pattern

Initial focus:
- SPPU 2024 Pattern

Store pattern as structured product metadata, not merely as text embedded in the title.

### 5.4 Subject and note fields

Each note/product should support:

- Product title.
- URL slug.
- Branch.
- Year.
- Semester (configurable).
- Subject name.
- Subject code (optional).
- Academic pattern.
- Short description.
- Full description.
- Topics covered.
- File format (PDF initially).
- File size.
- Page count (optional).
- Preview file (optional).
- Main private file reference.
- Price in INR.
- Compare-at/original price (optional; only show a discount when valid).
- Publication status: Draft, Published, Archived.
- Availability status.
- `Coming Soon` boolean toggle.
- SEO title.
- SEO description.
- SEO keywords.
- Canonical slug/URL.
- Created/updated timestamps.
- Admin creator/updater IDs.

Do not expose private storage keys or internal blob paths to the browser.

---

## 6. Student-facing website pages

Build all pages below with complete content, responsive layouts, validation, loading states, and error states.

### 6.1 Home page `/`

Create a premium landing page inspired by the supplied reference.

**Header**
- AbhyasMitra logo and NotesBazaar wordmark.
- Navigation: Home, Browse Notes, Branches, Offers, About.
- Search icon or compact search field.
- Login button.
- Primary CTA: Browse Notes.
- Mobile hamburger menu with accessible focus and close behavior.

**Hero section**
- Strong headline, for example: “Your SPPU Notes. One Smarter Place.”
- Supporting line explaining branch-wise and year-wise engineering notes for the SPPU 2024 Pattern.
- Main search bar: Search subject, branch, or notes.
- CTA: Explore Notes.
- Secondary CTA: Browse Branches.
- A clean educational visual or tasteful abstract document/notes illustration. Avoid generic fake university seals or misleading official imagery.
- Optional floating product/category chips, but keep the hero uncluttered.

**Trust/value section**
Use truthful, verifiable benefits such as:
- Branch-wise organization.
- Secure online payments.
- Access to purchased downloads.
- Clearly listed note details.
Do not invent user counts, ratings, testimonials, or claims like “100% exam guaranteed.”

**Browse by branch**
Display all seven branches in clean icon-led cards. Use inline SVG icons or consistent vector icons.

**Browse by year**
Show Second Year and Third Year, with pattern information.

**Featured notes**
- Populate from published, available database records.
- Include title, branch, year, subject, pattern, price, and availability.
- Show a Coming Soon label where enabled.
- Do not render fake products if the database is empty.

**Offers and banners**
- Render only active, scheduled banners and offers from the database.
- Validate start/end times server-side.
- Clearly show offer terms.

**How it works**
1. Find your branch and subject.
2. Review the note details.
3. Pay securely using Razorpay.
4. Download from your account after payment verification.

**FAQ preview**
Include common questions about payment, downloads, file access, refunds, and account issues.

**Footer**
- Logo and short brand description.
- Browse branches.
- Important links.
- Contact/support details sourced from admin settings.
- Privacy Policy, Terms, Refund/Cancellation Policy, Shipping/Delivery Policy (clarify digital delivery), Cookie Policy, FAQ.
- Social links only when configured.
- Independent-resource disclaimer.

### 6.2 Browse notes `/notes`

- Search notes by title, subject, subject code, or keyword.
- Filters: branch, year, semester, pattern, price range, availability.
- Sorting: relevance, newest, price low-to-high, price high-to-low.
- Pagination or crawlable pagination strategy.
- Shareable filter URLs where appropriate.
- Clear all filters.
- Useful empty state with suggestions.
- Avoid indexing thin, empty, or duplicate filtered URLs indiscriminately.

### 6.3 Branch pages `/branches/[branch-slug]`

Create a dedicated page for each branch with:
- Branch-specific title and introduction.
- Second Year and Third Year sections.
- Subject cards and note counts from actual data.
- SPPU 2024 Pattern context.
- Internal links to subjects and products.
- Unique metadata and canonical URL.

### 6.4 Year pages `/branches/[branch-slug]/[year-slug]`

- List available subjects and notes for that branch/year.
- Show pattern and semester filters.
- Include breadcrumb navigation.
- Unique page title and meta description.

### 6.5 Subject pages `/subjects/[subject-slug]`

- Subject overview.
- Related notes.
- Branch/year/pattern context.
- Internal links to relevant catalog pages.

### 6.6 Product detail page `/notes/[product-slug]`

Show:
- Product title.
- Branch, year, semester, subject, subject code, and SPPU 2024 Pattern.
- Full description and topics covered.
- PDF format, file size, page count when available.
- Preview pages only if a preview has been uploaded and approved.
- Price in INR.
- Valid offer price and original price only when backed by an active offer.
- Availability and Coming Soon label.
- Purchase button for available products.
- Login prompt if a student is not authenticated.
- Related notes based on actual catalog metadata.
- FAQ and support link.

For Coming Soon products:
- Disable purchase action.
- Show a clear “Coming Soon!” badge.
- Optionally offer “Notify me when available” after obtaining consent and storing the request.
- Never allow checkout for a Coming Soon product.

### 6.7 Offers page `/offers`

- Display only active offers.
- Include validity, eligibility, coupon rules, and exclusions.
- Do not show expired offers as active.
- Coupon validation must happen on the server.
- Prevent price manipulation from the browser.

### 6.8 Authentication pages

- `/login`
- `/register`
- `/forgot-password`
- `/reset-password` if required by the selected Firebase flow
- `/verify-email` if email verification is enabled

Provide clear validation, password visibility control, accessible errors, and secure session handling.

### 6.9 Student dashboard `/account`

Protected pages:
- Overview.
- My Purchases.
- My Downloads.
- Order Details.
- Notifications.
- Profile and account settings.
- Support/help.

**My Purchases**
- Show orders with product, date, amount, and payment status.
- Provide order detail view.
- Do not mark pending or failed orders as paid.

**My Downloads**
- Show only products for which the authenticated user has a verified, fulfilled purchase.
- Download action must request a fresh authorization from the backend.
- Use short-lived download URLs or a protected streaming endpoint.
- Show clear messages for expired links, unavailable files, or revoked access.

**Notifications**
- Show read/unread state.
- Allow users to mark notifications as read.
- Respect notification preferences.

### 6.10 Static information pages

Create:
- `/about`
- `/contact`
- `/faq`
- `/privacy-policy`
- `/terms-and-conditions`
- `/refund-policy`
- `/cancellation-policy`
- `/digital-delivery-policy`
- `/cookie-policy`
- `/disclaimer`

Use clear, plain-language content. Do not invent a legal business name, address, GSTIN, phone number, email, or registration details. Provide clearly marked admin-configurable placeholders until the owner supplies verified business information.

For Razorpay review and customer trust, make the following easy to find:
- What is being sold (digital academic notes).
- Pricing and applicable taxes, if any.
- How digital delivery works.
- When access is granted.
- Refund/cancellation terms for digital products.
- Customer support contact details.
- Business identity and address details where legally required.
- Privacy and data-handling practices.

Do not promise Razorpay approval. The implementation should support a transparent, policy-compliant merchant website, but final approval is determined by Razorpay's review and the merchant's submitted documents and business details.

---

## 7. Admin panel

Create a fully protected admin area under `/admin`.

### 7.1 Admin security

- Admin routes must be protected on the server.
- Verify Firebase ID token/session and admin role for every admin API operation.
- Use role-based access control.
- Do not rely on hiding admin links in the UI.
- Prevent students from calling admin endpoints directly.
- Log sensitive admin actions.
- Add session expiry and logout.
- Consider separate permissions such as Super Admin, Catalog Manager, and Support Manager if useful, while keeping the initial setup manageable.

### 7.2 Admin dashboard

Show real metrics from Azure SQL:
- Total published notes.
- Draft notes.
- Coming Soon notes.
- Total orders.
- Successful payments.
- Pending/failed payments.
- Revenue totals over selectable date ranges.
- Recent orders.
- Recent admin activity.
- Low-storage or failed-upload warnings where measurable.

Never fabricate metrics. Show a proper empty state for a new installation.

### 7.3 Notes management

Admin must be able to:
- Add a note.
- Edit a note.
- Delete/archive a note with confirmation and dependency checks.
- Upload/replace PDF.
- Upload optional preview PDF/pages.
- Set branch, year, semester, subject, and pattern.
- Add/edit description and topics.
- Set and update price.
- Set optional compare-at price.
- Save as draft.
- Publish/unpublish.
- Preview the public product page.
- Search, filter, sort, and paginate notes.

**Coming Soon toggle**
- Add a clearly visible ON/OFF toggle named `Coming Soon`.
- ON: show the Coming Soon badge on the public product card and detail page; disable purchasing and prevent order creation.
- OFF: allow purchase only if the product is published, has a valid file, and passes all availability checks.
- Log changes to this field.
- The server must enforce the same rule; frontend disabling is not sufficient.

**File upload safety**
- Allow only approved MIME types and file extensions (PDF initially).
- Verify actual file signatures; do not trust the filename or browser MIME type alone.
- Enforce configurable file-size limits.
- Generate random storage object names.
- Scan uploads for malware where a suitable scanning service is configured.
- Reject malformed, encrypted (if unsupported), or unsafe files.
- Keep original files private.
- Do not allow arbitrary executable uploads.
- Replace files safely and preserve audit history as appropriate.

### 7.4 Branch/year/subject management

- Add/edit/disable branches.
- Add/edit available years.
- Add/edit semesters.
- Add/edit patterns.
- Add/edit subjects and subject codes.
- Prevent accidental deletion when products or orders reference a record.
- Seed the seven specified branches and Second Year/Third Year.

### 7.5 Banner management

Admin can:
- Upload banner image.
- Set heading, subtitle, CTA label, CTA destination.
- Set start and end date/time.
- Enable/disable banner.
- Set display order.
- Preview desktop and mobile.
- Add alt text.
- Validate destination URLs.
- Avoid showing expired or disabled banners.

### 7.6 Offer and coupon management

Admin can:
- Create/edit/disable offers.
- Configure percentage or fixed discounts.
- Set start/end dates.
- Set eligible products, branches, years, or users if needed.
- Set minimum order amount, maximum discount, usage limit, and per-user limit.
- Configure coupon code where applicable.
- View usage and redemption history.
- Prevent stacking unless explicitly configured.
- Calculate and validate final prices server-side.

### 7.7 Orders and payments

Admin can:
- View and search orders.
- Filter by date, user, branch, product, and payment status.
- View internal order ID and Razorpay references.
- Inspect payment verification/webhook state.
- See fulfillment/download entitlement status.
- Initiate a refund through a supported server-side Razorpay API workflow only after authorization and confirmation.
- Record refund status and reason.
- Never manually mark an unverified payment as successful without a controlled, audited reconciliation workflow.

### 7.8 User management

Admin can:
- Search users.
- View basic account details and purchase history.
- View notification preferences.
- Disable access only through a documented, audited process.
- Never view passwords, authentication secrets, card data, or unnecessary sensitive data.

### 7.9 Notifications and announcements

Admin can compose:
- Title.
- Message.
- Optional CTA.
- Audience segment.
- Related product/branch/year.
- Delivery channels (in-app/email/push if configured).
- Schedule or send now.

Audience options:
- All opted-in users.
- Purchasers of a selected note.
- Purchasers in a selected branch/year.
- Selected users.

Before sending:
- Show audience count.
- Show preview.
- Require explicit confirmation.
- Prevent duplicate campaign sends.
- Record sent/failed/skipped counts.
- Respect unsubscribe and consent rules for marketing messages. Transactional messages must remain limited to relevant service information.

### 7.10 Site settings

Admin-configurable settings:
- Site name and logo.
- Support email and contact information.
- Social links.
- Default SEO metadata.
- Announcement bar.
- Currency (INR initially).
- Tax display/configuration, if applicable.
- Download link expiry.
- Maximum upload size.
- Notification defaults.
- Cookie consent configuration and policy version.
- Maintenance mode.

---

## 8. Razorpay payment and fulfillment flow

Implement a robust payment lifecycle.

### Required purchase flow

1. Student signs in.
2. Student opens an available product page.
3. Frontend requests checkout initialization from the backend using the product ID and optional coupon code.
4. Backend loads the current product price from Azure SQL. Never accept the amount as authoritative from the browser.
5. Backend verifies product is published, available, not Coming Soon, and has a valid protected file.
6. Backend calculates eligible discounts and final amount.
7. Backend creates an internal pending order and Razorpay order.
8. Backend stores internal order ID, Razorpay order ID, user ID, product ID, amount, currency, and status.
9. Frontend opens Razorpay Checkout using the server-created order details.
10. On checkout completion, frontend sends the returned payment references to the backend.
11. Backend verifies the Razorpay signature using the secret key stored only in server environment variables.
12. Razorpay webhook endpoint independently verifies webhook signature using the raw body and webhook secret.
13. Backend reconciles payment state and processes events idempotently.
14. Only after verified success does the backend mark the order paid/fulfilled and create the user's download entitlement.
15. Student sees a success page and the product appears in My Purchases/My Downloads.
16. If payment fails, remains pending, or verification is uncertain, do not grant download access. Show an understandable status and allow safe retry/reconciliation.

### Payment states

Use explicit states such as:
- `created`
- `pending`
- `authorized`
- `captured` (where applicable)
- `paid`
- `failed`
- `cancelled`
- `refund_pending`
- `refunded`
- `partially_refunded` (if supported)

Define permitted transitions and prevent invalid state changes.

### Razorpay security requirements

- Keep `RAZORPAY_KEY_SECRET` and webhook secret server-side only.
- The public key ID may be exposed to the checkout client as intended by Razorpay.
- Verify checkout signature on the backend.
- Verify webhook signatures.
- Use idempotency and unique constraints to avoid duplicate fulfillment.
- Validate currency and amount.
- Protect against replay and order substitution.
- Log payment events without logging secrets or sensitive payment data.
- Use HTTPS in production.
- Build a documented test-mode setup and a production-mode checklist.

### Important

Never claim Razorpay approval is guaranteed. Include the merchant's actual legal/business information and required policy pages before submitting the website for review. Do not fabricate company registration, address, GST, support details, or business history.

---

## 9. Database design

Create migrations and a documented relational schema. Suggested tables:

- `users` — Firebase UID, email, display name, role reference, status, timestamps.
- `roles` — role names and permission mapping.
- `branches` — branch name, slug, description, active flag.
- `academic_years` — year name, slug, sort order, active flag.
- `semesters` — semester label, year/pattern relationships as needed.
- `patterns` — pattern name, slug, active flag.
- `subjects` — subject name, slug, subject code, branch/year/semester/pattern references.
- `products` — note metadata, price, publication state, availability, `coming_soon`, SEO fields.
- `product_files` — private blob key, file type, size, checksum, version, upload status.
- `product_previews` — preview blob key and visibility settings.
- `orders` — user, amount, currency, order status, timestamps.
- `order_items` — product, quantity (default 1), unit price, discount, final price.
- `payments` — Razorpay order/payment references, verification state, event references.
- `payment_webhook_events` — unique event ID, signature verification result, processing status.
- `download_entitlements` — user/product/order, grant/revoke timestamps and status.
- `download_audit_logs` — user, product, time, result, non-sensitive request metadata.
- `banners` — content, image reference, schedule, status, display order.
- `offers` — discount rules, schedule, eligibility, usage limits.
- `coupon_redemptions` — coupon, user, order, discount, timestamp.
- `notifications` — recipient, content, channel, read state, delivery state.
- `notification_campaigns` — audience definition, schedule, send summary.
- `notification_preferences` — user preferences and consent timestamps.
- `cookie_consent_records` — consent categories, policy version, timestamp, where needed.
- `admin_audit_logs` — actor, action, target, timestamp, safe metadata.
- `site_settings` — configurable public/admin settings.

Use:
- Foreign keys.
- Unique constraints.
- Appropriate indexes for catalog filters, slugs, user orders, payment IDs, and webhook event IDs.
- Decimal-safe money representation (e.g. integer paise for INR amounts or an appropriate fixed precision type).
- UTC timestamps stored consistently and localized for display.
- Soft deletion/archive for records that must remain referenced by historical orders.
- Database transactions for order creation, payment reconciliation, and entitlement creation.

Document the relationship between Azure SQL user records and Firebase Authentication UIDs.

---

## 10. SEO requirements — high priority

Build SEO into the data model, templates, routing, and content—not as an afterthought.

### 10.1 Technical SEO

- Server-render public pages.
- Unique title and meta description for every indexable page.
- Canonical URLs.
- XML sitemap with only canonical, published, indexable URLs.
- `robots.txt`.
- Open Graph and social sharing metadata.
- Descriptive, readable URL slugs.
- Correct heading hierarchy.
- Semantic HTML.
- Breadcrumbs.
- Internal links between branches, years, subjects, and notes.
- Image alt text.
- Optimized images and fonts.
- Good Core Web Vitals.
- Avoid layout shift.
- Use pagination correctly.
- Noindex admin, account, checkout, order, login, and other private pages.
- Noindex draft, unpublished, empty, duplicate, or thin pages.
- Do not expose private PDFs in search engine indexes.
- Add structured data only when the page content genuinely qualifies.

### 10.2 Structured data

Implement appropriate JSON-LD where valid:
- `Organization` or the most accurate applicable organization type, using verified business details only.
- `WebSite` and `SearchAction` if the site search qualifies.
- `BreadcrumbList`.
- `Product` and `Offer` for genuine purchasable note products, with accurate price, currency, and availability.
- `FAQPage` only when visible FAQ content and current search-engine eligibility support it.

Do not add fabricated ratings, review counts, aggregate ratings, or false availability.

### 10.3 Keyword strategy

Use natural, useful content around these phrases and close variants:

**Core keywords**
- SPPU 2024 Pattern notes
- SPPU 2024 Pattern engineering notes
- SPPU engineering notes
- Pune University engineering notes
- SPPU study material
- SPPU subject-wise notes
- Engineering notes PDF
- SPPU notes PDF download
- Second Year engineering notes SPPU
- Third Year engineering notes SPPU

**Branch-specific keyword patterns**
Create natural page titles and descriptions using:
- Computer Engineering notes SPPU 2024 Pattern
- Information Technology notes SPPU 2024 Pattern
- Electronics and Tele-Communication notes SPPU 2024 Pattern
- Artificial Intelligence and Data Science notes SPPU 2024 Pattern
- Electrical Engineering notes SPPU 2024 Pattern
- Mechanical Engineering notes SPPU 2024 Pattern
- Civil Engineering notes SPPU 2024 Pattern

**Year-specific variants**
- Second Year [Branch] notes SPPU 2024 Pattern
- Third Year [Branch] notes SPPU 2024 Pattern

**Subject-specific variants**
- [Subject Name] notes SPPU 2024 Pattern
- [Subject Code] notes PDF
- [Branch] [Year] [Subject] notes

Do not keyword-stuff. Use phrases naturally in page titles, H1s, descriptions, introductory copy, product metadata, image alt text where relevant, and internal link text. Each branch/year/subject/product page must have unique content rather than duplicated templates with only a keyword swapped.

### 10.4 Suggested metadata examples

Homepage title:
`NotesBazaar by AbhyasMitra | SPPU 2024 Pattern Engineering Notes`

Homepage description:
`Explore branch-wise and year-wise engineering notes for the SPPU 2024 Pattern. Find subject-wise study material, purchase securely, and access your notes online.`

Branch page title example:
`Computer Engineering Notes – SPPU 2024 Pattern | NotesBazaar`

Branch page description example:
`Browse Second Year and Third Year Computer Engineering notes for the SPPU 2024 Pattern. Explore subject-wise study material on NotesBazaar by AbhyasMitra.`

Product title template:
`[Subject Name] Notes – [Branch], [Year] | SPPU 2024 Pattern`

Generate metadata from real product data and allow admin overrides.

---

## 11. Cookie consent and privacy

Implement a clear cookie consent banner and preference center.

### Consent categories

- **Strictly necessary:** always active; explain that these support authentication, security, checkout, and essential site functionality.
- **Analytics:** optional; off until consent where required.
- **Marketing:** optional; off until consent where required.
- **Functional preferences:** optional where applicable.

Requirements:
- Provide Accept All, Reject Optional, and Customize actions with equal clarity.
- Do not preselect optional categories.
- Provide a persistent footer link to reopen cookie settings.
- Store consent choice, timestamp, and policy version where appropriate.
- Respect the user's choice on subsequent visits.
- Do not load optional analytics/marketing scripts before the required consent.
- Do not use a dark-pattern design.
- Keep the banner responsive and keyboard accessible.
- Explain cookies and relevant data processing in the Cookie Policy and Privacy Policy.
- Align implementation with applicable Indian privacy requirements, including the Digital Personal Data Protection framework as applicable, and obtain qualified legal review before launch.

---

## 12. Security checklist

Treat security as a core acceptance criterion.

### Authentication and authorization
- Verify Firebase tokens server-side.
- Enforce role checks on every protected API route.
- Use secure session cookies where applicable.
- Protect admin operations from privilege escalation.
- Add rate limiting to login, password reset, checkout, coupon validation, and download endpoints.
- Use CSRF protection where cookie-authenticated state-changing requests require it.
- Apply secure CORS rules.

### Application security
- Validate and sanitize all input server-side.
- Use parameterized SQL queries or a safe ORM.
- Prevent SQL injection, XSS, CSRF, SSRF, IDOR, and open redirects.
- Use a restrictive Content Security Policy where practical.
- Set security headers: HSTS in production, frame restrictions, MIME sniffing protection, Referrer Policy, and appropriate Permissions Policy.
- Avoid leaking stack traces or internal identifiers in production errors.
- Keep dependencies updated and scan for known vulnerabilities.
- Never commit `.env` files or secrets.

### Digital file security
- Private Blob Storage containers.
- Authorization check on every download request.
- Verify a paid entitlement for the exact product.
- Short-lived signed URL or protected streaming.
- No permanent public links to paid notes.
- Rate-limit downloads and log suspicious patterns.
- Avoid exposing blob account names, keys, or storage paths.
- Consider PDF watermarking with order/user-specific identifiers if legally and operationally appropriate; do not claim it prevents all copying.

### Payment security
- Server-side amount calculation.
- Server-side Razorpay order creation.
- Checkout signature verification.
- Webhook signature verification.
- Idempotent webhook processing.
- Atomic fulfillment.
- No client-only payment success.
- Refund actions restricted and audited.

### Operational security
- Separate development, staging, and production environments.
- Back up Azure SQL and define restore procedures.
- Configure Azure monitoring and alerts.
- Keep audit logs for admin and payment actions.
- Avoid logging passwords, tokens, full payment payloads, or sensitive personal data.
- Document incident response and key rotation.

---

## 13. Performance and accessibility

### Performance
- Optimize images using modern formats and responsive sizes.
- Lazy-load below-the-fold imagery.
- Use route-level code splitting.
- Avoid unnecessary client-side JavaScript.
- Cache public catalog queries safely.
- Do not cache private account, payment, or download responses in shared caches.
- Use database indexes and pagination.
- Use loading skeletons only where they improve perceived performance.
- Target strong Core Web Vitals on mobile and desktop.

### Accessibility
- Aim for WCAG 2.2 AA.
- Semantic landmarks and headings.
- Full keyboard navigation.
- Visible focus rings.
- Accessible form labels and error announcements.
- Sufficient text and UI contrast.
- Alt text for meaningful images.
- Do not communicate status through color alone.
- Reduced-motion support.
- Accessible dialogs, dropdowns, menus, tabs, and cookie controls.

---

## 14. Suggested URL structure

Use readable, stable routes such as:

```text
/
 /notes
 /notes/[product-slug]
 /branches
 /branches/computer-engineering
 /branches/computer-engineering/second-year
 /branches/computer-engineering/third-year
 /subjects/[subject-slug]
 /offers
 /about
 /contact
 /faq
 /login
 /register
 /forgot-password
 /account
 /account/purchases
 /account/downloads
 /account/orders/[order-id]
 /account/notifications
 /account/settings
 /checkout/[order-id]
 /payment/success
 /payment/failure
 /admin
 /admin/notes
 /admin/notes/new
 /admin/notes/[id]/edit
 /admin/branches
 /admin/years
 /admin/subjects
 /admin/orders
 /admin/payments
 /admin/users
 /admin/banners
 /admin/offers
 /admin/notifications
 /admin/settings
```

Private routes must be protected and excluded from indexing.

---

## 15. Environment variables and setup documentation

Create `.env.example` with names only and safe placeholders. Never put real secrets in it.

Include variables appropriate to the selected implementation, such as:

```env
# App
NEXT_PUBLIC_SITE_URL=
NODE_ENV=

# Firebase client configuration (public Firebase web config)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin SDK (server only; use secure deployment secrets)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# Azure SQL (server only)
AZURE_SQL_SERVER=
AZURE_SQL_DATABASE=
AZURE_SQL_USER=
AZURE_SQL_PASSWORD=

# Azure Blob Storage (server only)
AZURE_STORAGE_ACCOUNT_NAME=
AZURE_STORAGE_ACCOUNT_KEY=
AZURE_STORAGE_CONTAINER_NOTES=notes-private
AZURE_STORAGE_CONTAINER_PREVIEWS=notes-previews

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# Transactional email provider (choose and document one)
EMAIL_PROVIDER_API_KEY=
EMAIL_FROM_ADDRESS=

# Optional analytics — load only according to consent
ANALYTICS_PROVIDER=
ANALYTICS_ID=
```

Use the deployment platform's secret manager for production. Do not expose server-only variables with a `NEXT_PUBLIC_` prefix.

Document:
- Firebase project creation and authorized domains.
- Firebase Authentication setup.
- Admin role bootstrap procedure.
- Azure SQL provisioning and migrations.
- Azure Blob Storage private container setup and access policy.
- Razorpay test-mode credentials and webhook URL configuration.
- Email provider configuration.
- Local development commands.
- Staging and production deployment steps.
- Backup and recovery.
- How to rotate secrets.

Do not create a hardcoded default admin password. Provide a secure one-time admin bootstrap process using a verified owner account and a server-side allowlist or controlled administrative command.

---

## 16. Testing and quality gates

Create automated tests for critical flows.

### Unit tests
- Price calculation.
- Coupon eligibility and limits.
- Coming Soon availability rules.
- Product publication rules.
- Payment state transitions.
- Razorpay signature verification.
- Webhook idempotency.
- Download entitlement checks.
- Role/permission checks.
- SEO metadata generation.

### Integration tests
- Firebase token verification.
- Azure SQL data access.
- Private Blob Storage upload and download authorization.
- Order creation.
- Razorpay test payment verification.
- Webhook processing.
- Entitlement creation.
- Admin note creation/update.
- Banner and offer scheduling.
- Notification audience selection.

### End-to-end tests
- Browse branch → year → subject → product.
- Register/login.
- Purchase a product in Razorpay test mode.
- Confirm verified payment.
- Download purchased note.
- Attempt unauthorized download and confirm it is denied.
- Confirm Coming Soon product cannot be purchased.
- Admin login and create/edit/publish a note.
- Admin changes price.
- Admin schedules a banner and offer.
- Admin sends a test notification to a controlled test audience.
- Cookie consent preferences persist.
- Mobile navigation and checkout usability.

### Required final checks
- TypeScript type check.
- ESLint.
- Unit/integration/E2E tests.
- Production build.
- Dependency/security audit.
- Mobile responsive checks.
- Lighthouse checks for representative public pages.
- Manual review of all public policy pages and Razorpay checkout flow.

Do not claim a test passed unless it was actually executed and passed.

---

## 17. Suggested implementation phases

### Phase 1 — Foundation
- Inspect repository.
- Establish architecture and design tokens.
- Configure Next.js, TypeScript, Tailwind, linting, formatting, and test framework.
- Set up Firebase client/server authentication foundations.
- Set up Azure SQL schema/migrations and Azure Blob Storage service boundary.
- Add `.env.example` and setup documentation.

### Phase 2 — Public website and catalog
- Header, footer, homepage.
- Branch/year/subject catalog.
- Search, filters, sorting, pagination.
- Product detail pages.
- Responsive and accessible UI.
- SEO metadata, canonical URLs, sitemap, robots, structured data.

### Phase 3 — Student accounts
- Login/register/password reset.
- Student dashboard.
- Purchase history and notifications.
- Account settings.

### Phase 4 — Admin panel
- Protected admin shell.
- Notes CRUD and secure file uploads.
- Coming Soon toggle.
- Branch/year/subject management.
- Banner management.
- Offer/coupon management.
- Orders/users/settings.
- Notification campaigns and audit logs.

### Phase 5 — Payments and downloads
- Razorpay order creation.
- Checkout integration.
- Signature verification.
- Webhooks and idempotency.
- Payment reconciliation.
- Download entitlement and protected file delivery.
- Refund workflow if enabled.

### Phase 6 — Hardening and launch
- Cookie consent.
- Policy pages and verified business details.
- Security review.
- Performance and accessibility review.
- Automated tests.
- Production deployment checklist.
- Razorpay merchant review readiness checklist.

---

## 18. Definition of done

The project is complete only when all of the following are true:

- [ ] The public website follows the supplied white/black/lemon-yellow reference design.
- [ ] The supplied AbhyasMitra logo is used without distortion.
- [ ] The site is fully responsive on mobile, tablet, and desktop.
- [ ] All seven engineering branches are seeded.
- [ ] Second Year and Third Year are supported for every branch.
- [ ] SPPU 2024 Pattern is represented as structured catalog data.
- [ ] Students can browse, search, filter, and view real note products.
- [ ] Admin can create, edit, publish, archive, and price notes.
- [ ] Admin has a working ON/OFF Coming Soon toggle.
- [ ] Coming Soon products cannot be purchased through either UI or API.
- [ ] Notes are stored in private Azure Blob Storage.
- [ ] Metadata, orders, payment references, and entitlements are stored in Azure SQL.
- [ ] Firebase Authentication works for students and admins.
- [ ] Admin authorization is enforced server-side.
- [ ] Razorpay test checkout and server-side verification work.
- [ ] Webhooks are verified and idempotent.
- [ ] A successful verified purchase creates a download entitlement.
- [ ] An unpaid or failed order cannot access a paid note.
- [ ] Admin can manage banners and scheduled offers.
- [ ] Admin can send notifications to a selected, eligible purchaser audience.
- [ ] Cookie consent works and optional scripts respect consent.
- [ ] Public pages have unique SEO metadata and crawlable internal links.
- [ ] Sitemap and robots rules are correct.
- [ ] Private pages and paid files are not publicly indexed.
- [ ] Privacy, terms, refund, cancellation, digital delivery, cookie, disclaimer, and contact pages exist.
- [ ] Business/legal placeholders are clearly identified and replaced with verified owner details before launch.
- [ ] No secrets are committed or exposed to the browser.
- [ ] Automated tests, lint, type check, and production build pass.
- [ ] README explains local setup, deployment, integrations, and operational maintenance.

---

## 19. Final instruction to Antigravity

Build **NotesBazaar by AbhyasMitra** as a real, maintainable, secure digital-notes commerce platform—not a static design demo.

Prioritize correctness of payments, access control, file privacy, admin authorization, and SEO architecture. The visual design should closely follow the first uploaded reference screenshot while using the second uploaded image as the official AbhyasMitra logo.

Before finishing, provide:
1. A concise implementation summary.
2. The final project architecture and important routes.
3. Database schema/migration summary.
4. Required environment variables and where each is used.
5. Firebase, Azure, and Razorpay setup instructions.
6. Test commands and actual test/build results.
7. Any remaining items that require owner-provided credentials, verified business details, legal review, or external account configuration.

Do not mark unfinished integrations as complete. Do not invent credentials or business details. Make the application production-oriented, but clearly distinguish implemented functionality from external configuration and merchant approval that still require the owner's action.
