# Almaden Voices - Website Architecture

## Overview

**Website:** [almadenvoices.org](https://almadenvoices.org)
**Purpose:** Non-profit website for Almaden Voices — empowering youth through public speaking programs in Almaden Valley, San Jose.
**Deployment:** Google Cloud Run (project: `almaden-voices-486006`, region: `us-west1`)

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Material-UI (MUI) 7, Framer Motion, Swiper, React Router v7 |
| Backend | Node.js, Express 4.19 |
| Styling | CSS Modules, MUI Theme |
| Payments | PayPal SDK |
| Email | Nodemailer (Gmail SMTP) |
| Storage | Local CSV + Google Cloud Storage |
| Secrets | GCP Secret Manager |
| Deployment | Docker multi-stage build → GCP Cloud Run |

---

## Directory Structure

```
almaden-voices/
├── client/                       # React frontend
│   ├── public/
│   │   ├── index.html
│   │   ├── images/               # Compressed site images
│   │   └── docs/                 # Terms of service, privacy policy
│   └── src/
│       ├── App.js                # Router setup
│       ├── index.js              # React entry point
│       ├── styles/globals.css    # Global styles
│       ├── Layout/
│       │   └── AppLayout.js      # Navbar + page content + Footer wrapper
│       ├── Pages/
│       │   ├── Home/HomePage.js
│       │   ├── About/AboutPage.js
│       │   ├── Contact/ContactPage.js + Contact.module.css
│       │   ├── Courses/CoursesPage1.js + Courses.module.css
│       │   ├── Donate/DonatePage.js + Donate.module.css
│       │   ├── Events/EventsPage.js
│       │   ├── FAQ/FAQPage.js + faqData.js + FAQ.module.css
│       │   ├── Impact/ImpactPage.js
│       │   ├── Register/RegisterPage.js + Register.module.css
│       │   └── Sessions/SessionPage.js
│       ├── components/
│       │   ├── Navbar/Navbar.js
│       │   ├── Footer/Footer.js
│       │   ├── HeroVideo/HeroVideo.js + HeroVideo.module.css
│       │   ├── Testimonial/TestimonialsGridSlider.js
│       │   ├── Sections/VisionMission.js
│       │   └── ThemeSwitcher/ThemeSwitcher.js
│       └── Theme/
│           ├── Theme.js          # MUI theme config
│           └── ColorModeContext.js
├── server.js                     # Express backend (all API routes)
├── config.js                     # Environment/secret loader
├── Dockerfile                    # Multi-stage Docker build
├── package.json                  # Backend dependencies
├── subscribers.csv               # Newsletter subscriber list
└── registrations.csv             # Session registrations (synced to GCS)
```

---

## Frontend Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | → `/home` | Redirect to home |
| `/home` | HomePage | Hero slideshow, testimonials, features |
| `/about` | AboutPage | Mission, team, board of directors |
| `/courses1` | CoursesPage1 | Course catalog, upcoming sessions |
| `/impact` | ImpactPage | Past sessions, metrics, student video testimonials |
| `/register` | RegisterPage | Multi-student session registration form |
| `/donate` | DonatePage | PayPal donation (one-time & monthly) |
| `/contact` | ContactPage | Contact form with validation |
| `/events` | EventsPage | Upcoming and past events |
| `/faq` | FAQPage | Frequently asked questions |
| `/*` | → `/home` | Catch-all redirect |

---

## Backend API Endpoints

### Contact

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/contact` | Submit contact form → sends email to admin + confirmation to sender |

**Body:** `{ firstName, lastName, email, phone, country, message }`
**Returns:** `{ success, confirmationNumber }`

### Newsletter

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/subscribe` | Subscribe to newsletter → stores in `subscribers.csv`, sends welcome email |
| GET | `/unsubscribe?email=&token=` | Unsubscribe → removes from CSV, shows confirmation page |

### Registration

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Register students for a session → stores in CSV + GCS, sends confirmation emails |
| GET | `/api/sessions/enrollment` | Returns enrollment counts per session `{ sessionId: count }` |

**Body:** `{ students[], parentFirstName, parentLastName, email, phone, sessionType, address fields, additionalInfo }`
**Validation:** 1-5 students, duplicate detection, parent/student name conflict check

### PayPal Donations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/paypal/orders` | Create PayPal order with amount and frequency |
| POST | `/api/paypal/orders/:orderID/capture` | Capture/complete PayPal payment |
| GET | `/api/paypal/debug` | Debug PayPal config (dev only) |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Returns `{ status: "ok" }` |

---

## Data Storage

| Data | Local File | Cloud Sync | Format |
|------|-----------|------------|--------|
| Registrations | `registrations.csv` | GCS bucket `almaden-voices-data` | CSV (15 columns) |
| Subscribers | `subscribers.csv` | None | CSV (email, timestamp) |

Registrations sync to GCS on startup (download) and after each new registration (upload).

---

## Email System

**Provider:** Gmail SMTP via Nodemailer (`smtp.gmail.com:587`)

**Emails sent:**

| Trigger | To Admin | To User |
|---------|----------|---------|
| Contact form | Message details | Confirmation with their message |
| Newsletter subscribe | New subscriber alert | Welcome email with unsubscribe link |
| Registration | Student + parent details | Confirmation with session info |
| Unsubscribe | Unsubscribe notification | — (shown HTML page instead) |

**Unsubscribe tokens:** SHA-256 hash of `email + UNSUBSCRIBE_SECRET`

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | `development` or `production` |
| `PORT` | No | Server port (default: 5001, Cloud Run: 8080) |
| `PAYPAL_CLIENT_ID` | Yes | PayPal OAuth client ID |
| `PAYPAL_CLIENT_SECRET` | Yes | PayPal OAuth secret |
| `PAYPAL_ENV` | No | `sandbox` or `live` (default: sandbox) |
| `EMAIL_USER` | Yes | Gmail sender address |
| `EMAIL_PASS` | Yes | Gmail app password |
| `EMAIL_TO` | No | Admin email (default: almadenvoices@gmail.com) |
| `BASE_URL` | No | Production URL for email links (default: almadenvoices.org in prod) |
| `UNSUBSCRIBE_SECRET` | No | Secret for token generation |
| `USE_GCP_SECRETS` | Prod | `true` to load from GCP Secret Manager |
| `GCP_PROJECT_ID` | Prod | GCP project ID for secrets |

**Loading:** `config.js` loads from `.env.dev` (local) or GCP Secret Manager (production).

---

## Deployment

### Docker Build (multi-stage)

**Stage 1 — Client Build:**
- `node:20-alpine`
- `npm ci` + `npm run build` → produces `client/build/`

**Stage 2 — Production:**
- `node:20-alpine`
- Copies `server.js`, `config.js`, `client/build/`
- Runs as non-root user (`nodejs:1001`)
- Exposes port 8080

### Deploy Command

```bash
gcloud run deploy almaden-voices \
  --source . \
  --platform managed \
  --region us-west1 \
  --project almaden-voices-486006 \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production,USE_GCP_SECRETS=true,GCP_PROJECT_ID=almaden-voices-486006"
```

### Local Development

```bash
npm run dev
# Runs concurrently:
#   Backend: nodemon server.js (port 5001)
#   Frontend: React dev server (port 3000, proxies API to 5001)
```

---

## Design System

| Element | Value |
|---------|-------|
| Primary color | `#2563EB` (blue) |
| Dark text | `#111827` |
| Muted text | `#6B7280` |
| Light background | `#F9FAFB` |
| Border color | `#E5E7EB` |
| Heading font | Playfair Display |
| Body font | DM Sans |
| Border radius | 12px |

---

## Key Features

1. **Homepage** — Hero image slideshow with text shadows, parent testimonial carousel
2. **Registration** — Multi-student form (up to 5), duplicate detection, photo consent checkbox
3. **Donations** — PayPal (wallet + card), processing fee coverage option, check-by-mail instructions
4. **Impact** — Past session timeline with photo galleries, student video testimonials, metrics
5. **Contact** — Validated form with inline errors, success overlay
6. **Newsletter** — Subscribe/unsubscribe with secure token-based links
7. **About** — Team profiles, board of directors with circular photos
8. **Responsive** — Mobile-first design with CSS modules and MUI breakpoints
