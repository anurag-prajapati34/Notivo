<div align="center">

<img src="https://img.shields.io/badge/Status-Live-brightgreen?style=flat-square" />
<img src="https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white" />
<img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/BullMQ-Queue-FF6B6B?style=flat-square" />
<img src="https://img.shields.io/badge/Redis-Upstash-DC382D?style=flat-square&logo=redis&logoColor=white" />
<img src="https://img.shields.io/badge/MySQL-Railway-4479A1?style=flat-square&logo=mysql&logoColor=white" />
<img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black" />

# Notivo

**Notivo is a developer-first email notification platform that enables applications to send transactional and scheduled emails through a simple REST API while handling asynchronous processing, retries, template management, and delivery tracking behind the scenes.**

[🌐 Live Demo](https://notivo.anuragdev.com) · [💻 GitHub](https://github.com/anurag-prajapati34/notivo) · [👤 Portfolio](https://anuragdev.com/)

</div>

---

## 📸 Preview

### 📊 Dashboard

Monitor email activity, delivery statistics, and recent email logs.

![Dashboard](./assets/dashboard.png)

### 📧 Email Logs
View all emails with delivery status, recipient details, and timestamps.

![Email Logs](./assets/email-log.png)

### 📝 Templates

Create and manage reusable HTML email templates with dynamic variables.

![Templates](./assets/templates.png)


### ✏️ Template Builder

Build email templates with live preview and automatic variable detection.

![Template Builder](./assets/template-builder.png)


### 🚀 Send Email

Send transactional or scheduled emails using your templates.

![Send Email](./assets/send-email.png)


### ⚙️ Settings

Configure API keys and SendGrid credentials.

![Settings](./assets/email-creds.png)
---

## 🏗️ Architecture

```mermaid
flowchart TD

A[Developer]
--> |POST /send| B[REST API]

B -->|Queue Job| C[BullMQ + Redis]

B -->|Immediate Response| A

C --> D[Worker]

D --> E[SendGrid]

D --> F[(MySQL Logs)]
```

### Key Architectural Decisions

| Decision | Choice | Reasoning |
|---|---|---|
| Sync vs Async email | Async (BullMQ) | API response must not block on SMTP latency |
| Queue store | Redis (Upstash) | In-memory, persistent, native BullMQ support |
| Retry strategy | Exponential backoff | Prevents hammering a struggling SMTP server |
| Worker process | Separate Node process | Isolates failures — API stays up if worker crashes |
| Email delivery | SendGrid HTTP API | HTTPS (port 443) — no hosting platform port restrictions |

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
| **Multi-recipient sending** | Single API call sends to multiple recipients — each queued as an independent job with its own retry lifecycle. |
| **Multi-tenant isolation** | Every query filters by `userId`. Templates, emails, and credentials are never shared across accounts. |
| **Dashboard analytics** | Delivery rate, 7-day volume chart, template usage distribution, delivery time metrics. |
| **API key authentication** | Prefixed API keys (`notivo_xxx`) with single-click regeneration. |
| **Demo account** | One-click demo login with pre-seeded realistic data, and free emails sent up to certain limits — no signup required. |

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

## 📡 API Reference

### Authentication

Send email api require an API key in the Authorization header:

```
Authorization: Bearer notivo_your_api_key_here
```

Get your API key from the Settings page after creating an account and configuring SendGrid Credentials.

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
   "scheduleAt": "2026-08-01T09:00:00.000Z"
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


BullMQ calculates the delay in milliseconds and holds the job until the exact timestamp. No cron jobs involved.

---

## 🔄 Background Job Flow

This is the core of the system. Understanding this flow is understanding Notivo:

```
1. POST /api/v1/send received
         │
2. API key validated → userId extracted
         │
3. Template found by templateId
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

## 🔗 Try the Demo
Explore Notivo as a guest user with 3 free emails to send
**No signup required:**

👉 [notivo.anuragdev.com](https://notivo.anuragdev.com/) → click **"Try Demo"**

For more email sending, create your own account and add a SendGrid API key in Settings.

---

## 👤 Author

**Anurag Prajapati**
FullStack Developer

[![GitHub](https://img.shields.io/badge/GitHub-anurag--prajapati34-181717?style=flat-square&logo=github)](https://github.com/anurag-prajapati34)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-anurag--prajapati34-0A66C2?style=flat-square&logo=linkedin)](https://linkedin.com/in/anurag-prajapati34)
[![Portfolio](https://img.shields.io/badge/Portfolio-anuragdev.com-6366f1?style=flat-square)](https://anuragdev.com/)

---

