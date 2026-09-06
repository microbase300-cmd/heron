# Heron Capital — Project Changelog

All notable changes, version milestones, and repository commits for the **Heron Capital Institutional Ecosystem** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Protocol & Maintenance Rule]
> ⚠️ **MANDATORY AI AGENT / DEVELOPER INSTRUCTION**:
> 1. Every time any change is made to this codebase, it **MUST** be recorded in this file under `[Unreleased]` or a new version header.
> 2. Always review `BUGS_AND_ERRORS.md` and `IMPLEMENTATION_HISTORY.md` **BEFORE** making modifications to prevent regressions and avoid undoing previously solved bugs.
> 3. Keep all five decoupled sub-projects (`backend/`, `mobile/`, `web/`, `dashboard/`, `admin/`) in synchronized version harmony.

---

## [Unreleased]
### Planned / In Progress
- [ ] Push Notification service integration for mobile app (Expo Notifications / APNs / FCM).
- [ ] Automated KYC document OCR processing pipeline in Admin portal.
- [ ] Biometric Authentication (FaceID / Fingerprint) toggle for mobile app.
- [ ] Multi-sig cold storage withdrawal approval threshold rules in backend.

---

## [1.1.2] - 2026-09-06
### Added
- **Automatic Priority Dispatch Pop-Up Modal**:
  - Implemented automatic high-priority pop-up modal for unread `alert`, `success`, and `warning` communications across Web Investor Dashboard (`dashboard/src/components/NotificationCenter.tsx`) and Mobile App (`mobile/App.tsx`).
  - Added session-level deduplication (`seenPopupsRef` and `seenMobilePopupsRef`) ensuring users are not interrupted repeatedly during regular background polling cycles.
  - Added "Acknowledge & Confirm" action that automatically marks the dispatch as read in backend persistence.
- **Dedicated Executive Message Box Modal**:
  - Built an institutional message detail inspector modal for all communications.
  - Clicking any notification item in the Notification Center drawer opens the complete formatted dispatch including sender authority, timestamp, category badge, and verified audit status.
  - Automatic read-receipt synchronization decrements unread counters in real time.

---

## [1.1.1] - 2026-09-06
### Fixed
- **Admin Direct Messaging Investor Dropdown**: Upgraded `NotificationsDeskView.tsx` with:
  - Multi-mode investor selector (Interactive Quick-Select Cards, Native Styled Dropdown, and Manual Input).
  - Real-time investor search filter covering names, emails, user IDs, and referral codes.
  - Array response normalization in `adminApi.getUsers()` and `adminApi.getNotifications()`.
  - Selected recipient confirmation card with instant clear/change controls.
  - High-contrast option styling for dark-theme browser dropdown compatibility.

---

## [1.1.0] - 2026-09-06
### Added
- Created dedicated [`TESTING_CREDENTIALS.md`](./TESTING_CREDENTIALS.md) detailing credentials, roles, and verification procedures for Admin and Investor testing.
- Created `CHANGELOG.md`, `BUGS_AND_ERRORS.md`, and `IMPLEMENTATION_HISTORY.md` for continuous error-free maintenance and regression prevention.

### Changed
- Standardized package naming across sub-projects: `heron-backend`, `heron-dashboard`, `heron-web`, `heron-admin`.
- Purged all public-facing demo hints, one-click demo login buttons, and test badges from `admin/`, `dashboard/`, and `mobile/` to reach true institutional production polish.
- Replaced pre-filled executive credentials in `admin/src/components/AdminLogin.tsx` with standard secure login inputs.
- Normalized OTP security code UI badges to institutional design (`🛡️ Passcode:` / `Security Code:`).

### Fixed
- Fixed TypeScript compile script configuration across `backend/` and `dashboard/` to ensure deterministic builds.
- Cleaned variable and user identifier naming in `backend/src/services/db.ts` to standard production schemas.

---

## [1.0.0] - 2026-09-05
**Git Commit**: `4bede3a`  
**Repository**: [https://github.com/microbase300-cmd/heron.git](https://github.com/microbase300-cmd/heron.git)  
**Branches**: `main`, `react-web-migration`

### Added
- **Cross-Platform Mobile App (`mobile/`)**:
  - Upgraded mobile project to **Expo SDK 57** (`~57.0.20`), **React Native 0.86.3**, and **React 19.2.3**.
  - Built custom **Heron Capital Luxury Brand Opening Animation** (`OpeningSplashScreen`) with golden falcon crest, particle illumination, institutional subtitle, animated progress tracker, and quick skip option.
  - Implemented dynamic LAN Host Auto-Discovery in `mobile/src/services/api.ts` using `Constants.expoConfig?.hostUri` to seamlessly connect physical mobile devices to the host machine backend API (`http://192.168.43.149:5000/api`).
  - Added full authenticated mobile screens:
    - `AuthScreen`: Login, Registration, and 2-Step OTP verification.
    - `PortfolioScreen`: Real-time portfolio valuation, 24h P&L metrics, and asset allocation breakdown.
    - `DepositScreen`: Multi-currency institutional deposit generator (BTC, ETH, USDT-TRC20, USDT-ERC20) with live wallet address display, network warnings, and copy-to-clipboard.
    - `InvestScreen`: Fixed-yield tier plans (Starter, Core, Sovereign, Quantum) with integrated compounding calculators.
    - `WithdrawScreen`: 2FA/OTP-guarded withdrawal request flow with real-time balance validation.
    - `ProfileScreen`: KYC tier badge, security credentials, referral link sharing, and session sign-out.
  - Configured persistent session caching using `@react-native-async-storage/async-storage`.

- **Institutional Backend API (`backend/`)**:
  - Bound Express HTTP listener to `0.0.0.0` (all network interfaces) on port `5000` to allow physical mobile devices on Wi-Fi/LAN to access API routes.
  - Dual Database Engine (`src/database/`): Robust PostgreSQL engine with atomic JSON fallback engine (`heron-data.json`) ensuring 100% uptime with or without live Postgres servers.
  - Dual-phase OTP Verification: Generates and validates simulated 6-digit one-time codes for user onboarding and high-value withdrawal requests.
  - CoinGecko live market ticker aggregation with local cache to prevent rate-limiting.
  - Zero-balance account onboarding rule ensuring fresh accounts start at `$0.00` until verified deposits occur.

- **Investor Web Dashboard (`dashboard/`)**:
  - React 19 + Vite 6 client on port `5173`.
  - Comprehensive portfolio management, dynamic balance visualizer, live transactions feed, referral statistics, and real-time investment manager.

- **Executive Admin Portal (`admin/`)**:
  - React 19 + Vite 6 administrative dashboard on port `5174`.
  - User Ledger Management, KYC Document Approvals, Deposit Approvals / Rejections, Withdrawal Processing, Direct Message Broadcaster, and System Financial Parameter controls.

- **Institutional Marketing Platform (`web/`)**:
  - React 19 + Vite 6 public website on port `3000` featuring dark cyber-institutional design, interactive pricing tables, strategy performance charts, and contact inquiries.

- **Root Infrastructure**:
  - Root `.gitignore` excluding `node_modules/`, `dist/`, `.expo/`, `.vite/`, and `.env` across all workspaces.
  - Direct execution batch scripts: `START-BACKEND.bat`, `START-WEB.bat`, `START-DASHBOARD.bat`, `START-ADMIN.bat`.

### Fixed
- Fixed critical mobile crash `TypeError: depositAddresses.map is not a function` by normalizing backend dictionary map (`Record<string, DepositAddressConfig>`) into array format in `mobile/src/services/api.ts`.
- Fixed mobile physical device `Failed to fetch` connection timeout by replacing hardcoded `localhost` with dynamic Metro host resolution and binding Express server to `0.0.0.0`.
- Fixed TurboModule `PlatformConstants` crash by aligning Expo SDK to 57 and React Native to 0.86.3 matching the Expo Go client binary.
- Fixed empty investor selection dropdown in Admin Direct Messaging modal.
- Fixed parameters tab state synchronization in the Executive Admin desk.

---

## [0.1.0] - 2026-09-04
**Git Commit**: `73f6d87`  
**Description**: Initial project repository setup with legacy HTML/JS prototypes.

### Added
- Static prototype HTML landing pages (`index.html`, `pricing.html`, `company.html`, `strategies.html`, `contact.html`, `admin.html`).
- Initial asset bundles and styling assets.
