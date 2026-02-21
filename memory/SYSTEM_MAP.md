# NUI SYSTEM MAP
# Last updated: 2026-02-22
# Source of truth for all systems, entry points, and dependencies

## ── SITE ARCHITECTURE ─────────────────────────────────────────────────

### Hosting
- Platform: Netlify
- Repo: GitHub (auto-deploy on push to main)
- Live URL: https://newurbaninfluence.com
- Staging: https://soft-rolypoly-668214.netlify.app

### Tech Stack
- Frontend: Vanilla HTML/CSS/JS (no build step)
- Backend: Netlify Functions (Node.js)
- Database: Supabase (Postgres)
- Animations: GSAP + Lenis smooth scroll
- Fonts: Syne (headings 700/800/900), Montserrat (body 400/500/600)
- Colors: #000000 true black bg, #dc2626 red accent, #ffffff white

---

## ── SYSTEMS ───────────────────────────────────────────────────────────

### 1. MARKETING SITE
Entry: /index.html
Pages: /, /about, /portfolio, /contact, /blog, /services/*, /locations/*, /work/*
Shared deps: env.js, sw.js, manifest.json

### 2. CLIENT PORTAL + ADMIN (SPA)
Entry: /nui-complete-app.html
Auth: localStorage-based (clients + admin logins)
Key functions:
  - markDelivered(orderId) → triggers print upsell SMS to client
  - triggerOrderDelivered(orderId) → sends OpenPhone SMS + logs comm
  - saveOrders(), saveClients(), saveLeads()
Admin panels: Orders, Delivery, Leads, Communications, SEO, Analytics

### 3. PRINT SYSTEM
Entry: /print/index.html
URL params:
  - ?industry=trades|marine|farming|manufacturing|bars|authors|apparel|tax|financial|tech|events|comedy
  - ?client=FirstName (personalizes hero tag)
Products: Yard Signs, Vehicle Magnets, HD Banner, Business Cards, Window Cling,
          Retractable Stand, PVC Signs, Vehicle Wrap, Aluminum Cards,
          Mesh Banner, DTF Heat Transfer, Acrylic Sign
Bundles: Pop-Up Starter $450, Standard $850, Premium $1,500
Fulfillment: Signs365 (trade wholesale, $10 overnight Michigan, blind drop-ship)
Markup: 2.5x wholesale baseline, never below 2x

### 4. NETLIFY FUNCTIONS
Path: /netlify/functions/
| File                  | Purpose                                      |
|-----------------------|----------------------------------------------|
| print-request.js      | Receives print form → Supabase + OpenPhone SMS to Faren |
| send-sms.js           | Generic OpenPhone SMS sender                 |
| openphone-webhook.js  | Handles inbound SMS → Supabase               |
| save-submission.js    | Service intake → Supabase submissions + leads|
| send-email.js         | Email notifications                          |
| create-payment.js     | Stripe payment intent                        |
| stripe-webhook.js     | Stripe event handler                         |
| save-booking.js       | Consultation booking                         |
| upload-image.js       | Asset uploads                                |
| get-communications.js | Fetch comm history                           |
| google-reviews.js     | Google Reviews API                           |
| poll-email.js         | Email polling                                |
| sync-data.js          | Data sync utility                            |
| oauth-callback.js     | OAuth flow handler                           |
| pexels-search.js      | Stock photo search                           |

### 5. SUPABASE TABLES
Project: jcgvkyizoimwbolhfpta
| Table           | Purpose                              |
|-----------------|--------------------------------------|
| submissions     | Service intake form data             |
| leads           | CRM leads from intake                |
| communications  | All inbound/outbound SMS log         |
| print_requests  | Client print orders from /print page |

### 6. PRINT SYSTEM FILES
Path: /print-system/
| File                    | Contents                          |
|-------------------------|-----------------------------------|
| signs365-pricing.md     | Wholesale cost catalog            |
| nui-retail-pricing.md   | 2.5x retail pricing sheet         |
| industry-bundles.md     | 10 client types, starter + pro    |

### 7. SUPABASE MIGRATIONS
Path: /supabase/
| File                       | Table Created     | Status  |
|----------------------------|-------------------|---------|
| 001_print_requests.sql     | print_requests    | ✅ Live |

---

## ── ENV VARS (Netlify Dashboard) ──────────────────────────────────────
| Var                   | Used By                                  |
|-----------------------|------------------------------------------|
| OPENPHONE_API_KEY     | send-sms.js, print-request.js            |
| OPENPHONE_PHONE_NUMBER| send-sms.js, print-request.js (from ID)  |
| FAREN_PHONE           | print-request.js (Faren's cell to ping)  |
| SUPABASE_URL          | all functions                            |
| SUPABASE_SERVICE_KEY  | all functions                            |
| SUPABASE_ANON_KEY     | client-side supabase-client.js           |
| STRIPE_SECRET_KEY     | create-payment.js, stripe-webhook.js     |

---

## ── GEO PAGES (13 live) ───────────────────────────────────────────────
/locations/detroit, /locations/southfield, /locations/farmington-hills,
/locations/royal-oak, /locations/troy, /locations/dearborn,
/locations/ann-arbor, /locations/sterling-heights, /locations/livonia,
/locations/warren, /locations/birmingham, /locations/novi, /locations/pontiac

Pending (2): /locations/highland-park, /locations/hamtramck
