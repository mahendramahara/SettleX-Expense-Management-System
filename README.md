# SettleX — Intelligent Group Expense Management & Debt Settlement System

> **BCA 8th Semester Final Year Project**
> A full-stack web application that tracks shared group expenses and automatically calculates the minimum number of payments required to settle all debts fairly — using the Greedy Minimum Cash Flow algorithm and Graph-Based Cycle Cancellation.

---

## What Is This Project?

When a group of friends, roommates, or colleagues go on a trip or share expenses together, the payments rarely happen equally. One person books the hotel, another pays for food, someone else covers the taxi — and at the end, nobody is sure who owes whom and how much.

**SettleX solves this problem.**

Instead of manually tracking every IOUs and doing complex math, SettleX:
1. Lets each member record every expense and who paid for it
2. Automatically calculates each person's net balance (how much they're owed vs. how much they owe)
3. Computes the **minimum number of direct transfers** needed to settle the entire group — using a mathematically optimal algorithm

### Real-World Example

> Aarav, Suman, and Rohan go on a Pokhara trip together.

| Person | What They Paid | Amount |
|--------|---------------|--------|
| Aarav  | Hotel + Transport | Rs. 15,000 |
| Suman  | Restaurant meals | Rs. 1,000 |
| Rohan  | Nothing yet | Rs. 0 |

**Total Group Spend: Rs. 16,000**
**Fair Share per Person: Rs. 16,000 ÷ 3 = Rs. 5,333**

| Person | Paid | Fair Share | Net Balance | Status |
|--------|------|------------|-------------|--------|
| Aarav  | 15,000 | 5,333 | **+9,667** | Gets back Rs. 9,667 |
| Suman  | 1,000 | 5,333 | **-4,333** | Owes Rs. 4,333 |
| Rohan  | 0 | 5,333 | **-5,333** | Owes Rs. 5,333 |

**The algorithm then produces:**
1. Rohan → Aarav: **Rs. 5,333**
2. Suman → Aarav: **Rs. 4,333**

That's it. Only **2 transfers** and everyone is settled. Without the algorithm, they might create 5–6 confusing back-and-forth payments.

---

## Core Algorithms

### 1. Greedy Minimum Cash Flow

The primary settlement algorithm. It works in two steps:

**Step 1 — Compute Net Balances**
For each member: `Net Balance = Total Amount Paid − Fair Share Owed`
- Positive net = creditor (should receive money)
- Negative net = debtor (owes money)

**Step 2 — Greedy Matching**
Sort creditors and debtors by amount (descending). Repeatedly match the largest debtor with the largest creditor until all balances reach zero.

```
Time Complexity:  O(E + N log N)
Space Complexity: O(N)

where E = number of expenses, N = number of members
```

In a group of N members, this algorithm guarantees settlement in **at most N−1 transactions** (instead of the O(N²) naive pairwise approach).

### 2. Graph-Based Cycle Cancellation

Before greedy matching, the system detects and eliminates circular debts in the raw debt graph.

**Example of a circular debt:**
```
Aarav owes Suman Rs. 500
Suman owes Rohan Rs. 500
Rohan owes Aarav Rs. 500
```

All three debts cancel out to zero — nobody actually needs to pay anyone. The cycle cancellation algorithm detects this using Depth-First Search and eliminates the redundant transactions.

### 3. Anomaly Detection

The system uses **Z-score statistical analysis** to detect spending anomalies:
- Cross-group high spenders (a member who consistently spends far above group average)
- Outlier single expenses (one expense much larger than group norms)
- Sudden spending spikes compared to historical patterns

Anomalies are flagged, and admins can dispatch spending advisory emails to flagged users.

---

## Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database and ODM |
| JSON Web Tokens | Authentication |
| Bcryptjs | Password hashing |
| Nodemailer | OTP and advisory emails |
| Cloudinary | Avatar and image uploads |
| Google OAuth 2.0 | Social login |
| Vitest + Supertest | Unit and API testing |

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 19 | UI framework |
| React Router v7 | Client-side routing |
| TailwindCSS v4 | Styling |
| Lucide React | Icon library |
| Vite 8 | Build tool and dev server |

---

## Project Structure

```
SettleX-Expense-Management-System/
├── client/                        # React frontend (Vite)
│   ├── src/
│   │   ├── components/            # Reusable UI components
│   │   │   ├── analytics/         # Charts, KPIs, leaderboards
│   │   │   ├── auth/              # Login, register, OTP forms
│   │   │   ├── expenses/          # Expense list, add expense modal
│   │   │   ├── groups/            # Group cards, create group modal
│   │   │   ├── settlements/       # Balance list, transaction cards, graph
│   │   │   └── ui/                # Shared primitives (Button, Input, Card...)
│   │   ├── context/               # React context (Auth, Toast)
│   │   ├── demo/                  # Guest demo data (no account needed)
│   │   ├── layouts/               # MainLayout, AdminLayout, AuthLayout
│   │   ├── pages/
│   │   │   ├── admin/             # Admin console pages (14 pages)
│   │   │   ├── auth/              # Landing page, Google callback
│   │   │   └── user/              # Member portal pages (8 pages)
│   │   ├── routes/                # AppRoutes.jsx (unified routing)
│   │   ├── services/              # API service layer (axios-like fetch wrappers)
│   │   └── utils/                 # Formatters, helpers
│   └── package.json
│
├── server/                        # Express backend
│   ├── src/
│   │   ├── app.js                 # Express app setup (routes, middleware, DI)
│   │   ├── server.js              # Entry point (DB connect + listen)
│   │   ├── common/                # Shared utilities
│   │   │   ├── database.js        # MongoDB connection
│   │   │   ├── middleware.js      # Auth, Admin auth, Error middleware
│   │   │   ├── mail.service.js    # Nodemailer email service
│   │   │   └── cloudinary.service.js
│   │   └── modules/               # Feature modules (MVC per domain)
│   │       ├── algorithm/
│   │       │   ├── debt-settlement.algorithm.js   # Core settlement logic
│   │       │   └── anomaly-detection.algorithm.js # Z-score anomaly logic
│   │       ├── auth/              # Register, login, OTP, Google OAuth
│   │       ├── user/              # User profile, dashboard data
│   │       ├── group/             # Create/manage expense groups
│   │       ├── expense/           # Add, list, split expenses
│   │       ├── settlement/        # Balance calculation, optimize, simulate
│   │       ├── analytics/         # Platform-wide analytics, anomaly model
│   │       ├── admin/             # Admin user/staff management
│   │       ├── notification/      # In-app notifications
│   │       ├── audit/             # Admin action audit logs
│   │       ├── activity/          # Activity feed tracker
│   │       ├── settings/          # Platform settings
│   │       ├── upload/            # Cloudinary avatar upload
│   │       └── seed/              # Database seeder (test data)
│   ├── tests/                     # Vitest unit tests
│   ├── .env.example               # Environment variable template
│   └── package.json
│
├── .gitignore
├── LICENSE
└── README.md
```

---

## Key Features

### Member Portal
- **Dashboard** — personal spending summary, recent activity, group overview
- **Groups** — create expense circles, invite members, view group details
- **Expenses** — add expenses with equal, exact, or percentage-based splits
- **Settlements** — view optimized payment plan, record payments, What-If simulator
- **Analytics** — personal spend trends, group distribution, split strategy breakdown
- **Profile & Settings** — avatar upload, password change, notification preferences

### Admin Console
- **Dashboard** — platform-wide KPIs (users, groups, total volume, debt reduction %)
- **User Management** — suspend, verify, view all registered users
- **Staff Management** — create and manage admin accounts
- **Group Management** — view and moderate all groups
- **Expense Management** — platform-wide expense oversight
- **Settlement Analytics** — settlement benchmarks per group
- **Debt Optimization** — interactive group-based settlement calculation with visual graph
- **Anomaly Detection** — Z-score based flagging, advisory email dispatch
- **System Logs** — full audit trail of all admin actions
- **Notifications** — broadcast announcements to users

### Security Features
- JWT-based authentication with 7-day token expiry
- Email OTP verification on registration (6-digit, single-use, TTL-evicted)
- Password hashing with bcryptjs (salt rounds: 10)
- Google OAuth 2.0 social login
- Role-based access control (User / Admin / SuperAdmin)
- Admin audit log for every privileged action

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Gmail account with App Password enabled (for OTP emails)
- Cloudinary account (for avatar uploads)
- Google Cloud Console project with OAuth 2.0 credentials

### 1. Clone the Repository

```bash
git clone https://github.com/mahendramahara/SettleX-Expense-Management-System.git
cd SettleX-Expense-Management-System
```

### 2. Configure the Server

```bash
cd server
cp .env.example .env
```

Open `server/.env` and fill in your values:

```env
PORT=5000
NODE_ENV=development

JWT_SECRET=your_strong_random_secret_here
JWT_EXPIRES_IN=7d

MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/settlex

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/callback

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

SUPERADMIN_NAME=Suman Sharma
SUPERADMIN_EMAIL=suman.admin@settlex.com
SUPERADMIN_PASSWORD=SuperAdmin123!
```

### 3. Configure the Client

```bash
cd ../client
cp .env.example .env
```

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### 4. Install Dependencies and Run

```bash
# Terminal 1 — Server
cd server
npm install
npm run dev

# Terminal 2 — Client
cd client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Seed Sample Data (Optional)

To populate the database with sample Nepali group data for testing:

```
POST http://localhost:5000/api/seed/all
```

Or use the Admin Console → seed from the dashboard.

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login with email/password | Public |
| POST | `/api/auth/verify-otp` | Verify email OTP | Public |
| POST | `/api/auth/google` | Google OAuth login | Public |
| GET | `/api/groups` | Get user's groups | JWT |
| POST | `/api/groups` | Create a new group | JWT |
| GET | `/api/expenses` | Get user's expenses | JWT |
| POST | `/api/expenses` | Add a new expense | JWT |
| GET | `/api/settlements/:groupId/optimize` | Get optimized settlements | JWT |
| GET | `/api/settlements/:groupId/cancel-cycles` | Run cycle cancellation | JWT |
| POST | `/api/settlements/:groupId/record` | Record a payment | JWT |
| GET | `/api/analytics/platform` | Platform analytics (admin) | Admin JWT |
| GET | `/api/analytics/sandbox` | Settlement sandbox | Admin JWT |
| GET | `/api/analytics/anomalies` | Detect anomalies | Admin JWT |
| GET | `/api/health` | Server health check | Public |

---

## Running Tests

```bash
# Server unit tests (Vitest)
cd server
npm test

# Client component tests
cd client
npm test
```

Tests cover: settlement algorithm correctness, net balance calculations, cycle cancellation, and greedy optimization.

---

## How the Settlement Algorithm Works (Step by Step)

```
Given group expenses → Build raw debt graph

Step 1: Build Debt Graph
  For each expense:
    For each split participant (not the payer):
      participant OWES payer their split amount

Step 2: Cycle Cancellation (Graph DFS)
  Find circular debt chains (A→B→C→A)
  Subtract the bottleneck amount from all edges in the cycle
  Repeat until no cycles remain

Step 3: Calculate Net Balances
  For each person:
    net = totalPaid − totalOwed
  Positive net = creditor, Negative net = debtor

Step 4: Greedy Optimal Settlement
  Sort creditors (desc), sort debtors (desc)
  While debtors and creditors remain:
    transfer = min(largestDebtor, largestCreditor)
    record transaction
    reduce both balances by transfer amount
    remove if zero balance

Result: Minimum set of direct payments to settle all debts
```

---

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 5000) | Yes |
| `MONGO_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret key for JWT signing | Yes |
| `JWT_EXPIRES_IN` | Token validity duration | Yes |
| `SMTP_HOST` | Email SMTP host | Yes |
| `SMTP_USER` | Email sender address | Yes |
| `SMTP_PASS` | Email app password | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Optional |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Optional |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Optional |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Optional |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Optional |
| `SUPERADMIN_EMAIL` | Root admin email | Yes |
| `SUPERADMIN_PASSWORD` | Root admin password | Yes |

---

## License

This project is licensed under the ISC License. See [LICENSE](./LICENSE) for details.

---

## Authors

**Developed as BCA 8th Semester Final Year Project**

> Built with a focus on algorithmic correctness, clean architecture, and real-world applicability for Nepali group travel and shared expense scenarios.
