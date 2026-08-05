<div align="center">

<img src="https://img.shields.io/badge/Status-Live-brightgreen?style=flat-square" />
<img src="https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white" />
<img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/BullMQ-Queue-FF6B6B?style=flat-square" />
<img src="https://img.shields.io/badge/Redis-Upstash-DC382D?style=flat-square&logo=redis&logoColor=white" />
<img src="https://img.shields.io/badge/MySQL-Railway-4479A1?style=flat-square&logo=mysql&logoColor=white" />
<img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black" />

# Notivo

**A developer-facing email notification delivery service with async job processing, exponential backoff retry logic, and full per-attempt delivery tracking.**

[🌐 Live Demo](https://notivo.anuragdev.com) · [💻 GitHub](https://github.com/anurag-prajapati34/notivo) · [👤 Portfolio](https://anuragdev.com/)

> Built to demonstrate async backend architecture — BullMQ job queues, retry patterns, multi-tenant credential isolation, and delivery observability.

</div>

---

## 📸 Preview

> Dashboard showing delivery analytics, email status breakdown, and retry timeline

![Notivo Dashboard](./assets/dashboard.png)

> Log Detail — full retry timeline showing per-attempt timestamps and error messages

![Notivo Log Detail](./assets/email-log.png)

---

## 📖 About

Notivo is a notification delivery service built for developers. Instead of managing email infrastructure inside their own backend, developers integrate a single REST API. Notivo handles everything — template rendering, job queuing, SMTP delivery, retry on failure, and delivery logging.

**The problem it solves:** Synchronous email sending blocks API responses and fails silently. A slow SMTP server makes your API slow. A network blip loses the email forever. There's no visibility into what happened or why.

**How Notivo solves it:** Every send request is queued immediately in Redis via BullMQ. The API returns in under 5ms. A separate worker process handles SMTP delivery in the background, retries on failure with exponential backoff, and logs every attempt with its error message and timestamp.

**Why I built this:** As a backend developer with 1 year of experience, I built Notivo to demonstrate async system design — specifically job queue architecture, retry patterns, encrypted credential storage, and delivery observability at a platform level.

---

## 🏗️ Architecture

```mermaid
flowchart TD
    A[Developer App] -->|POST /api/v1/send\nAuthorization: Bearer notivo_xxx| B[Express API Server]
    
    B -->|1. Validate API key| C{API Key Valid?}
    C -->|No| D[401 Unauthorized]
    C -->|Yes| E[Find Template by slug + userId]
    
    E -->|2. Validate variables| F{All required vars present?}
    F -->|No| G[400 Missing variables]
    F -->|Yes| H[Render HTML — replace variables]
    
    H -->|3. Save email log\nstatus: PENDING| I[(MySQL - Railway)]
    H -->|4. addJob to queue| J[BullMQ Queue\nUpstash Redis]
    
    J -->|Returns immediately| K[200 OK\njobId returned]
    
    J -->|Worker picks up job| L[Worker Process]
    
    L -->|Attempt 1| M{SMTP Success?}
    M -->|Yes| N[Update status: DELIVERED\nLog attempt: success]
    M -->|No| O[Log attempt: failed\nwith error message]
    
    O -->|Wait 30s backoff| P[Attempt 2]
    P -->|Fail| Q[Wait 60s backoff]
    Q -->|Attempt 3| R{Final attempt}
    R -->|Success| N
    R -->|Fail| S[Update status: FAILED\nAll 3 attempts exhausted]
    
    N --> I
    S --> I

    style A fill:#6366f1,color:#fff
    style J fill:#DC382D,color:#fff
    style L fill:#f59e0b,color:#fff
    style I fill:#10b981,color:#fff
```

### Key Architectural Decisions

| Decision | Choice | Reasoning |
|---|---|---|
| Sync vs Async email | Async (BullMQ) | API response must not block on SMTP latency |
| Queue store | Redis (Upstash) | In-memory, persistent, native BullMQ support |
| Retry strategy | Exponential backoff | Prevents hammering a struggling SMTP server |
| Worker process | Separate Node process | Isolates failures — API stays up if worker crashes |
| Email delivery | SendGrid HTTP API | HTTPS (port 443) — no hosting platform port restrictions |
| Credential storage | AES-256 encrypted | DB breach doesn't expose usable credentials |
| Multi-tenancy | userId filter on every query | Complete data isolation per account |

---

## ✨ Features

| Feature | What's built |
|---|---|
| **Async job processing** | BullMQ queue backed by Upstash Redis. API returns in <5ms regardless of SMTP speed. |
| **Exponential backoff retry** | Failed jobs retry 3 times — 30s → 60s → 120s delays. Each attempt saved with error message and timestamp. |
| **Per-attempt delivery timeline** | Log Detail page shows full retry history — which attempt failed, the exact error, when each attempt fired. |
| **Template system** | HTML templates with `{{variable}}` placeholders. Variables auto-extracted, validated before queuing, replaced at render time. |
| **Custom template builder** | Live HTML editor with real-time preview, automatic variable detection, and starter templates. |
| **Scheduled delivery** | BullMQ delayed jobs fire at exact timestamp. No cron jobs, no DB polling. |
| **Multi-recipient sending** | Single API call sends to multiple recipients — each queued as independent job with its own retry lifecycle. |
| **Encrypted credential storage** | SendGrid API keys stored AES-256 encrypted. Encryption key stored separately in environment variables. |
| **Multi-tenant isolation** | Every query filters by `userId`. Templates, emails, and credentials are never shared across accounts. |
| **Dashboard analytics** | Delivery rate, 7-day volume chart, template usage distribution, delivery time metrics. |
| **API key authentication** | Prefixed API keys (`notivo_xxx`) with single-click regeneration. |
| **Demo account** | One-click demo login with pre-seeded realistic data — no signup required. |

---

## 🛠️ Tech Stack

### Backend

| Technology | Purpose | Why chosen |
|---|---|---|
| Node.js | Runtime | Non-blocking I/O suits async email processing |
| TypeScript | Language | Type safety across job payloads, DB queries, API contracts |
| Express.js | HTTP framework | Minimal, flexible — familiar from production work |
| BullMQ | Job queue | Redis-backed, supports delayed jobs, retries, priority, events |
| Upstash Redis | Redis host | Serverless Redis with free tier and TLS — no self-hosted infra |
| MySQL | Database | Relational — email logs and attempts have clear relational structure |
| Drizzle ORM | DB queries | Type-safe, lightweight, familiar from current job |
| SendGrid | Email delivery | HTTP API (port 443) — works on all hosting platforms |
| Zod | Validation | Runtime validation + TypeScript inference in one |
| AES-256 (crypto-js) | Encryption | Industry standard for symmetric encryption at rest |
| JWT | Authentication | Stateless auth via httpOnly cookies |
| bcryptjs | Password hashing | One-way hash — plain text passwords never stored |

### Frontend

| Technology | Purpose | Why chosen |
|---|---|---|
| React 18 | UI framework | Component model, ecosystem, familiarity |
| TypeScript | Language | Type-safe API responses and component props |
| Vite | Build tool | Faster dev server than CRA, native ESM |
| Tailwind CSS v4 | Styling | Utility-first, consistent design without CSS files |
| React Query | Server state | Caching, loading states, refetching without manual useEffect |
| Axios | HTTP client | Interceptors for auth headers, better error handling than fetch |
| React Router v6 | Navigation | Nested routes, layout pattern |
| Recharts | Charts | Composable chart components, good TypeScript support |
| Lucide React | Icons | Consistent stroke weight, tree-shakeable |

### Infrastructure

| Service | What runs there |
|---|---|
| Vercel | React frontend |
| Render | Express API server + BullMQ worker |
| Railway | MySQL database |
| Upstash | Redis (BullMQ queue store) |
| SendGrid | Email delivery |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MySQL database (local or Railway)
- Redis instance (local or Upstash)
- SendGrid account (free tier — 100 emails/day)

### Clone the repository

```bash
git clone https://github.com/anurag-prajapati34/notivo.git
cd notivo
```

### Backend setup

```bash
cd backend
npm install
```

Copy the environment file and fill in your values:

```bash
cp .env.example .env
```

Push database schema:

```bash
npm run db:push
```

Seed default templates for a user (optional):

```bash
tsx scripts/seedDefaultTemplates.ts
```

Start the API server:

```bash
npm run dev
```

Start the worker in a separate terminal:

```bash
npm run dev:worker
```

### Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs at `http://localhost:5173`
Backend runs at `http://localhost:3000`

---

## 🔑 Environment Variables

### Backend `.env`

```env
# ── Database ──────────────────────────────────────
DATABASE_URL=mysql://user:password@host:3306/notivo

# ── Redis ─────────────────────────────────────────
UPSTASH_REDIS_URL=rediss://default:password@endpoint.upstash.io:6379

# ── Auth ──────────────────────────────────────────
JWT_SECRET=your-minimum-32-character-secret-here

# ── Encryption ────────────────────────────────────
AES_SECRET_KEY=your-exactly-32-character-aes-key

# ── Server ────────────────────────────────────────
PORT=3000
NODE_ENV=development
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:3000
```

---

## 📡 API Reference

### Authentication

All API endpoints require an API key in the Authorization header:

```
Authorization: Bearer notivo_your_api_key_here
```

Get your API key from the Settings page after creating an account.

---

### Send Email

```http
POST /api/v1/send
```

**Headers**

```
Authorization: Bearer notivo_xxx
Content-Type: application/json
```

**Request body**

```json
{
  "templateId": "welcome-email",
  "recipients": ["user@example.com", "other@example.com"],
  "variables": [
    { "variableName": "name", "variableValue": "Rahul" },
    { "variableName": "appName", "variableValue": "MyApp" }
  ]
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `templateId` | string | ✅ | The slug of your template (e.g. `welcome-email`) |
| `recipients` | string[] | ✅ | Array of recipient email addresses |
| `variables` | object[] | Depends | Required variables for the selected template |

**Responses**

```json
// 200 — Success
{
  "success": true,
  "message": "Emails queued for delivery",
  "jobIds": ["1841", "1842"]
}

// 400 — Missing variables
{
  "success": false,
  "error": "Missing required variables: name, appName"
}

// 401 — Invalid API key
{
  "success": false,
  "error": "Invalid API key"
}

// 404 — Template not found
{
  "success": false,
  "error": "Template 'welcome-email' not found"
}
```

---

### Schedule Email

```http
POST /api/v1/schedule
```

Same body as Send Email, with one additional field:

```json
{
  "templateId": "welcome-email",
  "recipients": ["user@example.com"],
  "variables": [...],
  "scheduleAt": "2026-08-01T09:00:00.000Z"
}
```

BullMQ calculates the delay in milliseconds and holds the job until the exact timestamp. No cron jobs involved.

---

## 📁 Project Structure

```
notivo/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts               # Drizzle + MySQL connection
│   │   │   └── redis.ts            # Upstash Redis connection
│   │   ├── database/
│   │   │   └── schema/
│   │   │       ├── users.ts
│   │   │       ├── emails.ts
│   │   │       ├── email-attempts.ts
│   │   │       ├── email-templates.ts
│   │   │       └── email-template-variables.ts
│   │   ├── queues/
│   │   │   └── email-queue.ts      # BullMQ queue + worker + processor
│   │   ├── routes/
│   │   │   └── v1/
│   │   │       ├── auth/           # Signup, login, demo login
│   │   │       ├── email/          # Send, schedule, logs
│   │   │       └── templates/      # Template CRUD
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts  # JWT verification
│   │   │   └── apikey.middleware.ts # API key verification
│   │   └── utils/
│   │       ├── encrypt.ts          # AES-256 encrypt/decrypt
│   │       ├── apiKey.ts           # API key generation
│   │       ├── extractVariables.ts # {{variable}} regex extraction
│   │       └── logger.ts
│   ├── scripts/
│   │   ├── createDemoAccount.ts
│   │   └── seedDemoData.ts
│   ├── worker.ts                   # Worker process entry point
│   ├── app.ts                      # Express app entry point
│   └── package.json
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── Landing.tsx
        │   ├── Login.tsx
        │   ├── Signup.tsx
        │   ├── Dashboard.tsx
        │   ├── Emails.tsx
        │   ├── LogDetail.tsx
        │   ├── Templates.tsx
        │   ├── CreateTemplate.tsx
        │   ├── SendEmail.tsx
        │   └── Settings.tsx
        ├── components/
        │   └── layout/
        │       ├── TopBar.tsx
        │       └── Sidebar.tsx
        ├── apis/                   # Axios API functions per feature
        ├── hooks/                  # useAuthContext, custom hooks
        ├── utils/                  # templateHelpers, analytics helpers
        └── types/                  # TypeScript interfaces
```

---

## 🔄 Background Job Flow

This is the core of the system. Understanding this flow is understanding Notivo:

```
1. POST /api/v1/send received
         │
2. API key validated → userId extracted
         │
3. Template found by slug + userId
         │
4. Required variables validated
         │
5. HTML rendered — {{variables}} replaced with actual values
         │
6. Email record inserted → status: PENDING
         │
7. Job added to BullMQ with emailId in payload
         │
8. 200 OK returned immediately ← API is done
         │
         ↓ (background, separate process)
         
9. Worker picks up job
         │
10. Fetch SendGrid credentials for userId
         │
11. SendGrid HTTP request attempted
         │
    ┌────┴────┐
   FAIL      SUCCESS
    │            │
12a. Save    12b. Save attempt (success)
    attempt       Update status: DELIVERED
    (failed)      Update sentAt timestamp
    │
13. BullMQ retries after backoff delay
    (30s → 60s → 120s)
         │
    After 3 failures:
    Update status: FAILED
    lastErrorMessage saved
```

---

## 📊 Database Schema

### Core tables

```
users                     — accounts, API keys
emails                    — every email sent, final status, rendered content
email_attempts            — one row per delivery attempt, powers retry timeline
email_templates           — reusable HTML templates per user
email_template_variables  — variables declared per template
email_creds               — SendGrid API key per user (AES-256 encrypted)
```

### Key design decisions

**`emails` stores rendered HTML** — not a template reference. If a template is later edited, historical email previews remain accurate.

**`email_attempts` is separate from `emails`** — one email can have many attempts. Normalizing this enables the retry timeline UI without JSON blobs.

**`templateId` is the slug string** — not a numeric FK. Developers use it directly in API calls. Joining on a human-readable string is intentional.

---

## 🧪 Testing the Flow Locally

After setup, test the complete flow using curl or Postman:

**1. Sign up and get your API key**

```bash
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com", "password": "password123"}'
```

**2. Configure SendGrid credentials** via the Settings page in the dashboard.

**3. Send a test email**

```bash
curl -X POST http://localhost:3000/api/v1/send \
  -H "Authorization: Bearer notivo_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "welcome-email",
    "recipients": ["your@email.com"],
    "variables": [
      { "variableName": "name", "variableValue": "Anurag" },
      { "variableName": "platformName", "variableValue": "Notivo" }
    ]
  }'
```

**4. Check delivery** in the Emails page → click the email → see the retry timeline.

---

## 🔗 Try the Demo

The live demo is pre-loaded with realistic data — emails across 7 days, failed emails with retry timelines, multiple templates.

**No signup required:**

👉 [notivo.vercel.app](https://notivo.vercel.app) → click **"Try Demo"**

To test real email sending, create your own account and add a SendGrid API key in Settings.

---

## 👤 Author

**Anurag Prajapati**
Backend Developer · Bangalore, India
1 year experience · BCA from AKS University

[![GitHub](https://img.shields.io/badge/GitHub-anurag--prajapati34-181717?style=flat-square&logo=github)](https://github.com/anurag-prajapati34)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-anurag--prajapati34-0A66C2?style=flat-square&logo=linkedin)](https://linkedin.com/in/anurag-prajapati34)
[![Portfolio](https://img.shields.io/badge/Portfolio-anurag--prajapati.vercel.app-6366f1?style=flat-square)](https://anuragdev.com/)

---

<div align="center">

Built with Node.js · BullMQ · Redis · MySQL · React · TypeScript

*A portfolio project demonstrating async backend architecture and system design.*

</div>
