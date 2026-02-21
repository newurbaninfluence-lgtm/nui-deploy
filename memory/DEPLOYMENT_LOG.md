# NUI DEPLOYMENT LOG
# Last updated: 2026-02-22
# Chronological record of every major build, refactor, and feature shipped

---

## 2026-02-22 — Print SMS Pipeline
Commits: 19f0ef9, 17a1924

### Built
- /netlify/functions/print-request.js
    → Receives print form POST
    → Saves to Supabase print_requests table
    → Texts Faren instantly via OpenPhone with full order details
    → mailto fallback if function unreachable

- /print/index.html (updated)
    → Wired to print-request.js function (replaced mailto)
    → Industry URL param: ?industry=trades auto-filters products + personalizes copy
    → Client URL param: ?client=FirstName personalizes hero tag
    → Submit button loading state ("Sending...")

- nui-complete-app.html — triggerOrderDelivered() updated
    → Now fires send-sms function when admin marks project delivered
    → Builds personalized /print?industry=X&client=Y URL from client record
    → Client gets text: project done + print link in one message

- /supabase/001_print_requests.sql
    → print_requests table schema
    → RLS: service role full access, anon blocked
    → Indexes on status, phone, industry, created_at
    → Auto updated_at trigger

- /memory/ folder created
    → SYSTEM_MAP.md
    → PRINT_WORKFLOW.md
    → DEPLOYMENT_LOG.md (this file)

### Env Vars Required (Netlify Dashboard)
- FAREN_PHONE — add this (format: +12484878747)
- OPENPHONE_API_KEY — already set
- OPENPHONE_PHONE_NUMBER — already set

---

## 2026-02-21 — Print Upsell Page
Commit: 695c9c7

### Built
- /print/index.html (694 lines, production-ready)
    → Hero: "Your design is complete. Now put it to work."
    → Filter tabs: All / Signs / Vehicle / Cards / Apparel / Bundles
    → 12 product cards + 3 bundle cards
    → Request modal: name, phone, address, qty, notes
    → Success screen with phone number

### Pricing files created
- /print-system/signs365-pricing.md — wholesale catalog
- /print-system/nui-retail-pricing.md — 2.5x retail pricing
- /print-system/industry-bundles.md — 10 client types, starter + pro

---

## 2026-02-10 — Great Split (Monolith Refactor)
### Completed
- Broke 27,429-line monolithic HTML into modular architecture
- Extracted: global.css, marketing.js, blog.js, auth.js, admin.js, core.js
- /locations/ — all 13 Michigan geo pages live
- SYSTEM_MAP.md, ROUTES.md, LINK_AUDIT.csv, VERIFY.md created
- GSAP animations, Lenis smooth scroll, parallax — fully built
- FOUC fixes applied
- True black (#000000) backgrounds, Syne/Montserrat font system
- Section padding increased to 140px for luxury feel

### Pending from refactor
- /locations/highland-park — not yet created
- /locations/hamtramck — not yet created
- Portal logos still broken
- Navigation overlap issue on mobile (flagged)

---

## 2026-02-22 — Jobs Board + Agency Workflow Unification

### Completed
- Admin orders panel rebuilt as unified Jobs Board kanban (4 columns)
- Columns: New → In Progress → Review → Delivered
- Moodboard connected: "🎨 Moodboard" button on New jobs — sends SMS link or copies to clipboard
- Brand Guide connected: "📘 Brand Guide" on In Progress — opens existing or auto-creates for client
- Review column shows live Brand Guide approval status on card (Approved / Awaiting / Revision)
- Delivered column: Print SMS resend button
- Brand Guide panel: "← Back to Jobs" button added
- Nav simplified: Projects + Proofs + Delivery → collapsed into "🗂️ Jobs Board"
- Workflow legend displayed on board: Moodboard → Start → Brand Guide → Review → Deliver + Print SMS
- JS syntax audit: fixed 34 escaped backticks, 3 nested template literals, 2 multiline strings
- All functions verified: loadAdminOrdersPanel, advanceJob, openBrandGuideForJob, sendMoodboardLink, resendPrintSMS
- Committed: b1abecf (Jobs Board), pending commit (workflow + syntax fixes)

### Pending
- git push to deploy
- Test moodboard link flow with real client
- Test brand guide auto-create for new client
