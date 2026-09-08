# Heron Assets Trustee — Institutional Testing & Access Credentials
*Built and developed by Microbase.*

This document provides authorized test accounts and step-by-step verification flows for testing the **Heron Assets Trustee** multi-platform ecosystem across Web, Admin, and Mobile.

---

## 1. Executive Operations & Risk Desk (Admin Portal)

Use these credentials to log in to the administrative command center to inspect transactions, approve deposits, process withdrawals, verify KYC documents, and adjust system parameters.

| Portal | URL / Port | Email | Master Security Keyphrase | Role |
| :--- | :--- | :--- | :--- | :--- |
| **Executive Admin Desk** | `http://localhost:5174` | `admin@heronassets.com` | `Heron2026!` | `admin` (Level 4 Clearance) |

### Administrative Verification Capabilities:
- **Pending Deposits**: Review submitted transaction hashes (TXIDs) and click **Approve** to instantly credit investor balances.
- **Withdrawal Settlement**: Authorize high-value outbound cryptocurrency releases.
- **KYC Review Desk**: View submitted identification documents and approve/reject verification tiers.
- **Investor Ledger**: Search all active accounts, adjust balances, or freeze/unfreeze accounts.
- **System Parameters**: Update minimum deposit thresholds, network fee schedules, and referral commission tiers.
- **Direct Messaging**: Broadcast institutional announcements or send encrypted direct messages to individual investors.

---

## 2. Pre-Provisioned Investor Accounts (Web & Mobile)

These accounts can be used to test the Investor Web Dashboard (`http://localhost:5173`) and the Cross-Platform Mobile App (`Expo SDK 57 / Port 8081`).

### Account A: Primary Sovereign Tier Investor
- **Email**: `alex.vance@vanceholdings.com`
- **Password**: `Heron2026!`
- **Role**: `investor`
- **Available Liquidity**: `$45,000.00`
- **Referral Code**: `HERON-VANCE`
- **Test Use Case**: High-net-worth portfolio management, deploying Quantum and Sovereign mandates.

### Account B: Institutional Senior Investor
- **Email**: `investor@heronassets.com`
- **Password**: `Heron2026!`
- **Role**: `investor`
- **Available Liquidity**: `$14,500.00`
- **Active Mandate**: Premium Plan ($8,000 active, 72-hour compounding cycle, $1,240 projected yield)
- **Referral Code**: `HERON-8821`
- **Test Use Case**: Testing live compounding progress bars, yield releases, and multi-currency deposits.

### Account C: Downline Partner Investor
- **Email**: `clara.vance@genevacapital.ch`
- **Password**: `Heron2026!`
- **Role**: `investor`
- **Available Liquidity**: `$3,200.00`
- **Upline Referrer**: `HERON-8821` (Alexander Sterling)
- **Test Use Case**: Testing multi-tier referral commissions and downline tracking.

---

## 3. Fresh Account Creation Flow (Zero-Balance Standard)

To test production user onboarding from scratch:

1. Open the **Web Dashboard** (`http://localhost:5173`) or **Mobile App** (`Port 8081`).
2. Select **Register / Open Mandate Account**.
3. Enter your legal name, email, and password (optional referral code: `HERON-VANCE`).
4. Click **Request Verification OTP**.
5. The 6-digit cryptographic security passcode will appear on the verification screen (`🛡️ Passcode: XXXXXX`). Enter it to complete registration.
6. **Zero-Balance Confirmation**: Fresh accounts strictly initialize with `$0.00` balance.
7. **Deposit Flow**: Go to the Deposit tab, choose an asset (BTC, ETH, USDT), copy the treasury wallet address, enter any sample TXID, and submit.
8. **Settlement**: Switch to the **Admin Portal** (`http://localhost:5174`), approve the pending deposit, and observe the balance update in real-time.

---

## 4. Port & Service Matrix Reference

| Module | Directory | Port | Command |
| :--- | :--- | :--- | :--- |
| **Backend API** | `backend/` | `5000` | `npm run dev` |
| **Web Marketing** | `web/` | `3000` | `npm run dev` |
| **Investor Dashboard** | `dashboard/` | `5173` | `npm run dev` |
| **Admin Command Desk** | `admin/` | `5174` | `npm run dev` |
| **Mobile App (Metro)** | `mobile/` | `8081` | `npx expo start -c` |
