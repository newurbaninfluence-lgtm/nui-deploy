# NUI PRINT WORKFLOW
# Last updated: 2026-02-22
# Complete end-to-end flow for both print entry points

---

## ── ENTRY POINT 1: BRANDING CLIENT UPSELL ────────────────────────────
# Triggered automatically when Faren marks a project delivered in admin

STEP 1 — Admin marks project complete
  → Faren clicks "✓ Mark Delivered" in /nui-complete-app.html
  → markDelivered(orderId) fires
  → order.status = 'delivered', order.deliveredAt = now()

STEP 2 — Auto SMS to client (triggerOrderDelivered)
  → Reads client.industry from client record
  → Builds personalized URL: /print?industry={slug}&client={FirstName}
  → Calls /.netlify/functions/send-sms
  → Client receives text: "Hey Marcus! Your Brand Identity Package is done.
    Ready to print? $10 overnight anywhere in Michigan.
    See your options: newurbaninfluence.com/print?industry=tech&client=Marcus"

STEP 3 — Client clicks link
  → Lands on /print page, pre-filtered for their industry
  → Hero tag shows: "✓ Marcus — Your Design Is Complete"
  → Hero copy personalizes for their industry type

STEP 4 — Client requests a product
  → Taps "Request" on any product card
  → Modal opens (no login, no account)
  → Fills: Name, Phone, Delivery Address, Qty/Size, Notes

STEP 5 — Form submits
  → POST to /.netlify/functions/print-request
  → Supabase: saves to print_requests table (status: 'new')
  → OpenPhone: texts Faren instantly with full order details
  → Client sees: "Request Sent! We'll reach out within a few hours."

STEP 6 — Faren receives ping
  → OpenPhone notification with:
    Product, Price, Client Name, Phone, Ship Address, Qty/Size, Notes, Industry
    Request ID: PRINT-XXXXXX

STEP 7 — Faren fulfills
  → Log into Signs365 account
  → Upload client's approved design files
  → Place order using wholesale pricing
  → Signs365 blind drop-ships to client address
  → Update print_requests table: status → 'in_production' → 'shipped'

---

## ── ENTRY POINT 2: PRINT-FIRST CLIENT ────────────────────────────────
# Client comes for print only, no prior branding project

STEP 1 — Send client the print link
  → Use: newurbaninfluence.com/print
  → Or industry-specific: newurbaninfluence.com/print?industry=trades
  → Works as standalone product catalog

STEP 2 — Same flow as Steps 3–7 above

---

## ── INDUSTRY URL SLUGS ────────────────────────────────────────────────
| Industry       | URL Slug     | Auto-filters to  |
|----------------|--------------|------------------|
| Trades         | trades       | Vehicle tab      |
| Marine         | marine       | Signs tab        |
| Farming        | farming      | Signs tab        |
| Manufacturing  | manufacturing| Signs tab        |
| Bars           | bars         | Signs tab        |
| Authors        | authors      | Cards tab        |
| Apparel        | apparel      | Apparel tab      |
| Tax/Financial  | tax          | Cards tab        |
| Tech           | tech         | Cards tab        |
| Events/Comedy  | events       | Signs tab        |

---

## ── PRODUCT CATALOG (current) ─────────────────────────────────────────
| Product               | Retail Price     | Category  |
|-----------------------|------------------|-----------|
| Yard Signs (10pk)     | $83 starting     | signs     |
| Vehicle Magnets       | $30 starting     | vehicle   |
| HD Banner             | $25 starting     | signs     |
| Business Cards (110)  | $10 starting     | cards     |
| Window Cling          | $43 starting     | vehicle   |
| Retractable Stand     | $225–$350        | signs     |
| PVC Signs             | $125 starting    | signs     |
| Vehicle Wrap          | $12.48/sqft      | vehicle   |
| Aluminum Cards (55)   | $100 starting    | cards     |
| Mesh Banner           | $78 starting     | signs     |
| DTF Heat Transfer     | $1.25/linear in  | apparel   |
| Acrylic Sign          | $36 starting     | signs     |

## ── BUNDLES ───────────────────────────────────────────────────────────
| Bundle         | Price  | Margin  | Contents                                   |
|----------------|--------|---------|--------------------------------------------|
| Pop-Up Starter | $450   | ~$285   | Banner, 10 yard signs, 110 cards, 2 magnets|
| Standard Kit   | $850   | ~$510   | Bigger banner, 25 signs, 275 cards, stand  |
| Premium Kit    | $1,500 | ~$900   | Full kit: banner, 50 signs, stand, cling   |

---

## ── PRICING RULES ─────────────────────────────────────────────────────
- Markup: 2.5x wholesale baseline
- Floor: never below 2x
- Ceiling: never above 3x on Google-able items
- Real margin: volume + bundles, not individual markup

---

## ── FULFILLMENT: SIGNS365 ─────────────────────────────────────────────
- Account: trade-only wholesale (Faren's account)
- Production: 24hr turnaround
- Shipping: $10 overnight, all Michigan
- Drop-ship: blind (no Signs365 branding on package)
- Coverage: statewide Michigan (key advantage over local agencies)

## ── OPEN QUESTION ─────────────────────────────────────────────────────
- T-shirt fulfillment: Signs365 does DTF transfers but not blank shirts
  Options: (1) Source Bella+Canvas blanks separately
           (2) Client provides blanks, NUI applies transfer only
           (3) Remove apparel until resolved
  STATUS: Unresolved
