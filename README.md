# Heron Digital Capital — Enterprise Platform Suite

Institutional-grade digital asset management ecosystem consisting of 4 independent modular applications:

| Application | Technology | Default Port | Launcher Script | Description |
|---|---|---|---|---|
| **Marketing Web App** | React 18 + Vite + Tailwind | `3000` | `START-WEB.bat` | Public institutional showcase, interactive yield simulator, Binance live feed, and anti-phishing safe client routing. |
| **Investor Dashboard** | React 18 + Vite + Tailwind + Recharts | `5173` | `START-DASHBOARD.bat` | Client investor portal, algorithmic compounding curves, asset allocation matrices, wallet deposits/withdrawals, KYC & security vault. |
| **Executive Admin Desk** | React 18 + Vite + Tailwind | `5174` | `START-ADMIN.bat` | Protected executive operations desk, user directory & balance adjustments, transaction settlement queue, escrow overrides, plan configuration. |
| **Institutional API Backend** | Node.js + Express + TypeScript + PostgreSQL | `5000` | `START-BACKEND.bat` | REST API, PostgreSQL connection pooling & dual-mode fallback, 15m JWT + 7d rotated refresh tokens, 10s background maturity engine. |

---

## 🚀 How to Run All 4 Applications

Each application runs as a separate, independent process per architecture requirements.

### Method 1: Double-click the Windows Launchers
- Double-click `START-BACKEND.bat` (Starts API on `http://localhost:5000`)
- Double-click `START-WEB.bat` (Starts Main Website on `http://localhost:3000`)
- Double-click `START-DASHBOARD.bat` (Starts Investor Dashboard on `http://localhost:5173`)
- Double-click `START-ADMIN.bat` (Starts Admin Operations Desk on `http://localhost:5174`)

### Method 2: Command Line (Separate Terminals)

**Terminal 1 (Backend API):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Marketing Web SPA):**
```bash
cd web
npm run dev
```

**Terminal 3 (Investor Dashboard):**
```bash
cd dashboard
npm run dev
```

**Terminal 4 (Executive Admin Desk):**
```bash
cd admin
npm run dev
```

---

## 🔐 Default Credentials & Clearances

### Executive Admin Portal (`http://localhost:5174`):
- **Email**: `admin@heronassets.com`
- **Password**: `Heron2026!`
- **Role**: `admin` (Level 4 Operations Clearance)

### Investor Client Portal (`http://localhost:5173`):
- **Primary Sovereign Investor**: `alex.vance@vanceholdings.com` / `Heron2026!` (Funded with $45,000 NAV & active escrow mandate)
- **Senior Institutional Investor**: `investor@heronassets.com` / `Heron2026!`
- **Testing & Credentials Guide**: Full test matrix documented in [`TESTING_CREDENTIALS.md`](./TESTING_CREDENTIALS.md).
- **New Account**: Click *"Register Account"* to create an investor profile and receive a unique referral link.

---

## 📊 Core Features & Technical Stack
- **PostgreSQL Database**: Auto-runs DDL schema and seed migrations on connected instances, with transparent fallback adapter.
- **Authentication**: Stateless 15-minute JWT access tokens + rotated cryptographically secure 7-day refresh tokens.
- **Market Data**: Live Binance REST ticker feed with 10s TTL caching and historical OHLCV candlestick generation.
- **Visualizations**: Interactive Recharts compounding trajectory curves and asset distribution donuts.
- **Security**: Anti-phishing Safe Browsing compliance, RBAC middleware, and cold-custody audit simulation.
