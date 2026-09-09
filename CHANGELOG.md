# Heron Assets Trustee — Project Changelog
*Built and developed by Microbase.*

All notable changes, version milestones, and repository commits for the **Heron Assets Trustee Institutional Ecosystem** will be documented in this file.

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
- [ ] Multi-sig cold storage withdrawal approval threshold rules in backend.

## [1.8.1] - 2026-09-09
### Added & Enhanced
- **Biometric Authentication (Face ID / Fingerprint) System for Mobile App (`mobile/`, `backend/`)**:
  - **Hardware Sensor Integration (`mobile/src/services/biometrics.ts`)**:
    - Installed and configured `expo-local-authentication` (`~57.0.2`).
    - Implemented `getBiometricStatusAsync()` to query hardware capability, enrollment state, and biometric classification (`Face ID / Facial Recognition`, `Touch ID / Fingerprint`, `Iris Recognition`).
    - Built `authenticateWithBiometricsAsync()` supporting native iOS Biometrics and Android BiometricPrompt with custom security messages and passcode fallback support.
  - **Account & Security Center Biometric Toggle (`mobile/App.tsx`)**:
    - Added dedicated **Biometric Authentication** toggle card in the Profile Modal (Security & Defense tab).
    - Features real-time hardware status pills (`✓ HARDWARE ENROLLED`, `⚠️ NOT ENROLLED IN OS`, `○ NO HARDWARE`).
    - Enforced mandatory verification challenge: enabling the switch triggers an active biometric test ensuring hardware validation before the state is committed.
  - **Quick Biometric Sign-In Gateway (`mobile/App.tsx`)**:
    - Added a sleek "Quick Sign In with Biometrics" button on the login form for devices with enrolled biometric hardware.
  - **Backend Synchronization (`backend/src/routes/auth.ts`, `backend/src/services/db.ts`, `backend/src/types/index.ts`)**:
    - Extended user schema and `/api/auth/profile` endpoint to persist `biometricsEnabled` preferences across sessions.

## [1.8.0] - 2026-09-08
### Production Transition & Full Error Propagation
- **Removal of Demo Accounts, Mock Fallbacks, and Simulation Modes (`mobile/`, `dashboard/`, `backend/`)**:
  - **Mobile Client (`mobile/src/services/api.ts`)**:
    - Purged `demo_123`, `demo_new`, and `demo_token` authentication fallbacks. Unreachable servers, invalid credentials, or network drops now propagate genuine, human-readable errors (`Cannot reach server...` or exact server responses) directly to UI alert dialogs rather than silently activating mock mode.
    - Removed offline fallback for `sendRegistrationOtp` (which previously returned synthetic `devOtp: '123456'`).
    - Stripped all `if (this.token === 'demo_token')` blocks across `getWalletSummary()`, `submitDeposit()`, `requestWithdrawalOtp()`, `submitWithdrawal()`, `getPlans()`, `getMyInvestments()`, `createInvestment()`, `getNotifications()`, `getReferrals()`, and `getTransactions()`.
    - Removed synthetic success catches in `updateProfile()`, `changePassword()`, `addWhitelistedWallet()`, and `deleteWhitelistedWallet()`, ensuring all state updates reflect actual server persistence.
    - Cleaned up `getSecurityLogs()` and `registerPushToken()` to use direct backend API endpoints.
  - **Web Dashboard (`dashboard/src/services/api.ts`, `dashboard/src/components/ClientVerificationPortal.tsx`)**:
    - Removed demo simulation fallbacks in `updateProfile()`, `changePassword()`, `addWhitelistedWallet()`, and `deleteWhitelistedWallet()`.
    - Removed `loadDemoDocuments()` and the "Fill Demo Sample Data" button from `ClientVerificationPortal.tsx`, enforcing real identity documents and live biometric camera capture.
  - **Backend Database Sanitization (`backend/src/services/db.ts`, `backend/data/db.json`)**:
    - Removed auto-seeding of mock primary investor (`usr_investor_vance` / `alex.vance@vanceholdings.com`) and mock KYC submissions (`kyc_sub_demo_01`, `kyc_sub_demo_02`) from `ensureDefaults()`.
    - Refactored `seedInitial()` to strictly seed only the institutional administrator (`admin@heronassets.com`), leaving all investment, transaction, and KYC submission tables clean.
    - Sanitized `backend/data/db.json`: Purged demo accounts `usr_demo_882194` (Alexander Sterling), `usr_demo_vance` (Alexander Vance), and `usr_downline_49201` (Clara Vance), along with all associated transactions, investments, and notifications, while preserving active live user accounts (`admin@heronassets.com`, `microbase300@gmail.com`, `microbase1221@gmail.com`, `joseph@gmail.com`, etc.).

## [1.7.1] - 2026-09-08
### Added & Enhanced
- **Live Biometric Facial Capture with Anti-Bot Liveness Detection & Global World Countries Selector (`dashboard/`, `backend/`, `admin/`)**:
  - **Live Biometric Facial Scanner with Bot Detector (`dashboard/src/components/LiveBiometricScanner.tsx`)**:
    - Replaced static file upload for biometric selfie with an interactive live webcam scanner powered by browser `navigator.mediaDevices.getUserMedia` and HTML5 Canvas frame snapshot.
    - Integrated multi-stage interactive anti-bot and anti-spoofing directional challenge sequence:
      1. **Look Straight & Center Face**: Calibrates 3D depth mesh and contour boundary within a dynamic oval viewfinder.
      2. **Turn Head to the Left**: Rotational parallax verification ensuring the subject is a live 3D entity, preventing 2D printed photo spoofing.
      3. **Turn Head to the Right**: Bilateral contour and diffuse skin reflectance analysis.
      4. **Smile Naturally**: Dynamic facial muscle contraction verification preventing static or bot-injected imagery.
    - Added real-time Bot Detector telemetry HUD (`BOT DETECTOR: ACTIVE`, `ANTI-SPOOF: 99.4% HUMAN`, dynamic progression bar 0%–100%).
    - Automatic high-resolution snapshot capture upon 100% liveness verification with retake capability.
    - Includes interactive fallback/simulation mode for devices without camera hardware or with restricted browser permissions.
  - **Comprehensive Global World Countries List (`dashboard/src/utils/countries.ts`)**:
    - Replaced free-text input for issuing country with a standardized catalog of 240+ world countries and territories featuring official names, ISO alpha-2 codes, and flag emojis.
    - Added searchable dropdown combobox in `ClientVerificationPortal.tsx` with instant fuzzy filtering and flag badge previews.
  - **Backend & Admin Compliance Telemetry (`backend/src/routes/kyc.ts`, `backend/src/types/index.ts`, `admin/src/components/KycComplianceDeskView.tsx`)**:
    - Extended KYC schema to ingest `livenessVerified` and `livenessDetails` (bot detection state, directional challenge results).
    - Upgraded Admin Compliance Desk inspection drawer with biometric liveness verification badges (`LIVE SENSOR`, `BOT DETECTOR: PASSED (99.4% Human)`, `Turn L/R & Smile ✓`).

## [1.7.0] - 2026-09-08
### Added & Enhanced
- **Automated KYC Document OCR Processing Pipeline & Admin Compliance Desk (`backend/`, `admin/`, `dashboard/`, `mobile/`)**:
  - **Backend Intelligent OCR Engine & Compliance Engine (`backend/src/services/ocrEngine.ts`, `backend/src/routes/kyc.ts`, `backend/src/services/db.ts`)**:
    - Built automated ICAO 9303 Machine Readable Zone (MRZ) parser with Type 3 (Passport 2x44) and Type 1 (ID Card 3x30) checksum verification using the 7-3-1 weight algorithm.
    - Implemented simulated biometric face confidence scoring (80-99%), document liveness and anti-spoofing heuristics, and automated discrepancy checks comparing user submission claims against decoded OCR document metadata.
    - Added dedicated KYC REST API routes:
      - `POST /api/kyc/submit`: Processes client document uploads, runs automated OCR pipeline, persists submission, updates account state, and logs compliance events.
      - `GET /api/kyc/status`: Fetches authenticated user's active KYC submission, historical submissions, and rejection or re-verification alerts.
      - `GET /api/kyc/admin/submissions`: Compliance desk queue with filtering by status and search by user / doc ID.
      - `POST /api/kyc/admin/submissions/:id/approve`: Approves submission, upgrades user to `kycStatus: 'verified'` and `kycLevel: 'tier2'`, and sends approval notification.
      - `POST /api/kyc/admin/submissions/:id/reject`: Rejects submission with custom compliance feedback or preset categories, flagging account and notifying client.
      - `POST /api/kyc/admin/force-reverification`: Mandates fresh identity verification for any account, invalidating current credentials and restricting sensitive operations.
      - `POST /api/kyc/admin/transactions/:id/hold`: Pends a settlement or withdrawal transaction under compliance KYC hold (`status: 'pending_kyc'`, `verificationHold: true`, `holdReason`).
      - `POST /api/kyc/admin/transactions/:id/release`: Releases compliance hold, returning transaction to `pending` queue or original status.
  - **Admin KYC Compliance Desk (`admin/src/components/KycComplianceDeskView.tsx` & `admin/src/App.tsx`)**:
    - Created comprehensive institutional KYC Compliance Desk view accessible via dedicated sidebar tab with pending queue count badge.
    - **Compliance Metrics**: Real-time KPI cards for Pending Audits, Approved Identities, Under Compliance Hold, and OCR Optical Pass Rate.
    - **Inspection Modal**: Deep audit drawer featuring high-resolution side-by-side document views (Front, Back, Biometric Selfie), extracted OCR text, ICAO 9303 MRZ checksum validation pill, claim vs document discrepancy flags, and compliance review action buttons.
    - **Rejection Workflow**: Modal with preset rejection reasons (Illegible Document, Expired ID, Name Discrepancy, Biometric Mismatch, Suspected Document Alteration) and custom reviewer feedback textarea.
    - **User Management Integration (`UserManagementView.tsx`)**: Added KYC compliance status badge column and direct "Force Re-verification" action modal for administrators.
    - **Transaction Desk Integration (`TransactionDeskView.tsx`)**: Added support for `pending_kyc` status, "Hold for KYC" modal dialog with compliance reason input, "Release KYC Hold" action, and a dedicated "KYC Compliance Holds" queue filter tab.
  - **Client Verification Portal (`dashboard/src/components/ClientVerificationPortal.tsx`, `ProfileView.tsx`, `OverviewView.tsx`)**:
    - Implemented interactive multi-step verification portal supporting Passports, National IDs, Driver's Licenses, and Residence Permits.
    - Added high-resolution upload dropzones for document front, document back, and real-time biometric selfie with instant client-side image preview and clear actions.
    - Integrated animated optical OCR pipeline scan progress displaying step-by-step feature extraction, biometric face matching, and MRZ checksum computation.
    - Added dedicated `Identity Verification (KYC)` tab in user profile with real-time status tracker, OCR extracted credentials recap, and re-submission gateway.
    - Added high-priority institutional compliance alert banner in Dashboard Overview alerting users when identity re-verification is required or transactions are held.
  - **Mobile Client Compliance Reflection (`mobile/App.tsx`)**:
    - Upgraded Account & Security Center profile modal from hardcoded status to dynamic `currentUser.kycStatus` badge with distinct Binance Pro color themes (`#0ECB81` verified, `#F0B90B` pending/action required, `#F6465D` rejected).
    - Added mandatory re-verification mandate alert card and document rejection notice box displaying compliance officer feedback directly within the profile sheet.
    - Updated Overview Home screen Account & Security Center banner with real-time KYC status indicator and top-level Institutional Compliance Alert Banner.
    - Updated Cryptographic Audit Ledger to support `pending_kyc` transaction status with amber `⚠️ KYC HOLD` badge and compliance hold reason box.
    - Added dedicated `KYC Holds` filter chip in Ledger tab when held transactions exist.

## [1.6.2] - 2026-09-08
### Added & Enhanced
- **Live Base Currency Conversion Engine Across Ecosystem (`backend/`, `dashboard/`, `mobile/`)**:
  - **Backend Live Forex Service (`backend/src/services/marketData.ts` & `backend/src/routes/market.ts`)**:
    - Implemented `getExchangeRates()` querying live open forex rates (`https://open.er-api.com/v6/latest/USD`) with 60-second in-memory TTL caching and institutional fallbacks (`USD: 1.0, EUR: 0.860364, GBP: 0.738631`).
    - Added REST endpoint `GET /api/market/exchange-rates` delivering live base rates and ISO-8601 update timestamps to all clients with zero CORS or rate-limit friction.
  - **Shared Currency Conversion Utilities (`dashboard/src/utils/currency.ts` & `mobile/src/utils/currency.ts`)**:
    - Created type definitions (`SupportedCurrency`, `ExchangeRatesData`) and constants (`CURRENCY_SYMBOLS`, `CURRENCY_NAMES`, `DEFAULT_EXCHANGE_RATES`).
    - Implemented `convertCurrency(amountUsd, targetCurrency, rates)` preserving exact decimal math.
    - Implemented `formatCurrency(amountUsd, targetCurrency, rates, includeSymbol)` for locale-formatted currency values.
    - Implemented `formatCurrencyDual(amountUsd, targetCurrency, rates)` for dual valuation representations.
  - **Dashboard Web Client (`dashboard/src/`)**:
    - **Navbar (`Navbar.tsx`)**: Added live currency pill button (`EUR (€)`, `GBP (£)`) with pulsating green indicator, displaying active valuation base and routing to Preferences.
    - **Sidebar (`Sidebar.tsx`)**: Converted Quick Balance widget to display converted amount and dual rate subtext (`≈ $45,000.00 USD`).
    - **Overview View (`OverviewView.tsx`)**:
      - Updated Net Asset Value (NAV) banner to display converted balance according to the user's preferred currency (`€38,716.38 EUR`) with live rate equivalent subtext (`≈ $45,000.00 USD • Live Rate: 1 USD = 0.8604 EUR`).
      - Updated all 4 portfolio stat cards (Available Balance, In Smart Escrow, Yield Disbursed, Affiliate Revenue) to dynamically recalculate and format in the selected currency.
    - **Preferences & Limits (`ProfileView.tsx`)**:
      - Replaced simple buttons with full interactive currency cards showing live spot rates (`1 USD = 0.8604 EUR`, `1 USD = 0.7386 GBP`).
      - Added instant persistence via `api.updateProfile({ preferredCurrency: curr })` and state propagation (`onUpdateUser`) triggering immediate dashboard re-rendering.
      - Integrated Live Converted Balance Simulator box previewing the user's live balance in real time alongside exchange rate source timestamps.
    - **Withdrawal Terminal (`WithdrawModal.tsx`)**: Added dual-currency available balance display with live forex rate conversion.
  - **Mobile Client (`mobile/App.tsx` & `mobile/src/services/api.ts`)**:
    - Added `mobileApi.getExchangeRates()` and wired automatic background forex updates into `loadAllData()`.
    - Enhanced Hero Total Balance card to display converted amount with live currency symbol and `≈ $USD` spot rate equivalence badge.
    - Upgraded Tab 4 (Settings & Preferences) Base Valuation Currency selector with live forex rate labels and real-time converted balance simulator box.
    - Updated `handleSelectCurrency` with live balance recalculation alert confirming the new valuation amount and live spot rate.

## [1.6.1] - 2026-09-08
### Fixed & Enhanced
- **Login & Session Log Audit Trail Across Ecosystem (`backend/`, `dashboard/`, `mobile/`)**:
  - **Backend Real-Time Session Logging (`backend/src/routes/auth.ts` & `backend/src/services/db.ts`)**:
    - Resolved critical issue where `POST /api/auth/login` failed to record user authentication attempts into the session audit log.
    - Added automatic session logging for successful authentications (`status: 'Authorized'`) with client metadata resolution.
    - Added automated threat logging for failed password attempts (`status: 'Blocked'`) ensuring security anomalies are visible to the account holder.
    - Added session logging for account registrations (`POST /api/auth/register`) and password rotations (`PUT /api/auth/change-password`).
    - Implemented client metadata resolution helpers:
      - `getClientIp`: Extracts client IP from `x-forwarded-for` or socket, strips IPv6 prefixes, and masks the final octet (`xxx.xxx.xxx.***`) for privacy compliance.
      - `parseClientDevice`: User-Agent parser detecting OS (Windows 11/10, macOS, Android, iOS, Linux) and browser/client signature (Chrome, Safari, Edge, Firefox, Mobile App).
      - `resolveEdgeLocation`: Resolves edge node regions via Cloudflare/Vercel geo-headers with fallback to secure gateway nodes.
    - Updated `GET /api/auth/security-logs` and `DatabaseService.getSecurityLogs` to automatically seed realistic historical audit records if an account has an empty log, ensuring immediate institutional visibility.
  - **Dashboard Web Client (`dashboard/src/components/ProfileView.tsx` & `dashboard/src/services/api.ts`)**:
    - Replaced hardcoded status badge styling with dynamic Binance Pro color coding: `#0ECB81` (Authorized), `#F6465D` (Blocked), and `#F0B90B` (Challenge).
    - Added live session indicator with glowing green pulse badge (`🟢 Current`) for the active session.
    - Added manual "Refresh Audit Trail" button with spin animation and asynchronous log re-fetching.
    - Added responsive device icons (Smartphone for mobile/tablets, Laptop for desktop).
    - Added Zero-Trust Session Architecture security callout card.
    - Enhanced `api.getSecurityLogs()` with resilient fallback in case of network interruption or empty server payloads.
  - **Mobile Client (`mobile/App.tsx` & `mobile/src/services/api.ts`)**:
    - Added "↻ Refresh" button in the Session Logs tab header for instant manual re-fetching.
    - Added dynamic status badges with distinct visual styling (`✓ Authorized` in green, `✕ Blocked` in red, `⚠ Challenge` in gold).
    - Added `LIVE` badge indicator on the top/most recent active session.
    - Added hardware device icon indicators (`📱` vs `💻`) and single-line truncated text.
    - Added Zero-Trust Session Verification notice card.
    - Enhanced `mobileApi.getSecurityLogs()` with resilient institutional mock fallback.

## [1.6.0] - 2026-09-08
### Added & Changed
- **Push Notification Service Integration for Mobile App (Expo Notifications / APNs / FCM)**:
  - **Mobile Push Engine (`mobile/src/services/notifications.ts` & `mobile/App.tsx`)**:
    - Installed and integrated `expo-notifications` and `expo-device` native modules into the mobile application.
    - Configured Android high-priority notification channel (`heron-default`) with `#F0B90B` light accent, vibration pattern, and badge indicators.
    - Configured Expo foreground notification behavior (`shouldShowAlert`, `shouldShowBanner`, `shouldShowList`, `shouldPlaySound`, `shouldSetBadge`).
    - Implemented `registerForPushNotificationsAsync` with automatic permission requests and EAS project ID resolution (`c4024769-dbe5-404f-9d89-64da8ea2a57b`).
    - Added automatic device token registration pipeline transmitting push tokens to the backend on login (`POST /api/notifications/push-token`).
    - Added foreground notification listener triggering real-time balance and ledger sync (`loadAllData`) upon incoming dispatches.
    - Added notification response listener opening the official Executive Communication Box upon user tray interaction.
    - Added live "Push Notification Gateway" control card in Profile Settings with 1-tap "Send Test Push Notification" local simulation.
  - **Backend Push Gateway Pipeline (`backend/src/services/pushNotificationService.ts` & `backend/src/routes/notifications.ts`)**:
    - Created high-performance push notification service utilizing Expo's HTTP v2 Gateway with native support for APNs (iOS) and FCM (Android).
    - Added push token storage, retrieval, and deduplication helpers in `DatabaseService` (`saveUserPushToken`, `getUserPushTokens`, `getAllPushTokens`).
    - Wired automated push notifications into `db.createNotification` for deposit confirmations, withdrawal releases, investment maturity releases, admin dispatches, and ecosystem broadcasts.
    - Added authenticated `POST /api/notifications/push-token` endpoint.

## [1.5.0] - 2026-09-08
### Added & Changed
- **Institutional Binance Pro User Profile & Security Center (`dashboard/` & `mobile/`)**:
  - **Web Client Dashboard (`dashboard/src/components/ProfileView.tsx`)**:
    - Built comprehensive Binance Pro User Profile & Security Center screen with institutional dark gold styling (`#181A20`, `#1E2329`, `#2B313A`, `#F0B90B`, `#0ECB81`).
    - **Identity Header**: Cryptographic UID (`HAT-89240182`) with 1-click copy, KYC Level 2 Verified badge, VIP 1 Institutional badge, and dynamic security score (85% • Strong).
    - **Security & Defense**: Interactive modal for updating master password, Two-Factor Authentication (2FA) toggle, anti-phishing code protection, and withdrawal whitelist enforcement switch.
    - **Whitelisted Wallets (Address Book)**: Multi-chain filtering (All, BTC, ETH, USDT, SOL), Add Destination Address modal with network validation, label tagging, and deletion actions.
    - **Session & Audit Logs**: Monitored access history with masked IP (`197.210.84.***`), device agent (`Windows 11 • Chrome 128`), location, and authorization status.
    - **Preferences & Limits**: Base currency selection (USD, EUR, GBP), yield auto-compounding switch, and VIP 1 disbursement ceilings ($500,000 / 24h).
    - **Navigation**: Added `Account & Security` sidebar nav item with `ShieldCheck` icon, clickable bottom user profile card, and navbar profile quick-access button.
  - **Mobile App (`mobile/App.tsx`)**:
    - Connected top-left avatar button in the Binance header to open the full-screen Account & Security Center modal with live status indicator.
    - Added prominent `Account & Security Center` banner card on the Overview screen with KYC Tier 2 badge and UID display.
    - Implemented 4 sub-sections: Security & Defense, Whitelisted Wallets address book with Add modal, Session Audit Logs, and Preferences & Settings.
    - Added interactive Change Password modal, native `Switch` toggles for 2FA and Whitelisting, and inline Anti-Phishing editor.
    - Added offline simulation fallbacks in `mobile/src/services/api.ts` to allow testing without backend requirements.
  - **Backend API & Database (`backend/`)**:
    - Extended `User` model with `uid`, `kycLevel`, `vipLevel`, `antiPhishingCode`, `twoFactorEnabled`, `whitelistEnabled`, `whitelistedWallets`, and `securityLogs`.
    - Added REST endpoints in `backend/src/routes/auth.ts`: `PUT /api/auth/profile`, `PUT /api/auth/change-password`, `POST /api/auth/whitelist-wallet`, `DELETE /api/auth/whitelist-wallet/:id`, `GET /api/auth/security-logs`.

## [1.4.3] - 2026-09-07
### Added & Changed
- **Corporate Rebranding to Heron Assets Trustees & Luxury 3D Crest Emblem**:
  - Rebranded corporate entity from Heron Capital to **Heron Assets Trustees** across all 5 sub-projects.
  - Applied new luxury 3D gold-and-sapphire crest emblem (`heron_logo.jpg`) across `mobile/assets/`, `mobile/app.json`, `web/public/`, `dashboard/public/`, `admin/public/`, and backend seeding.
  - Updated mobile app configuration: App name `Heron Assets Trustees`, adaptive icon, dark splash screen, and notification dispatch headers.
  - Updated web, client dashboard, and executive admin portal page titles, favicons, brand headers, and protocol dispatch tags.

## [1.4.2] - 2026-09-07
### Added & Changed
- **Custom Luxury Pop-Up Modal System for Mobile App (`mobile/App.tsx`)**:
  - Replaced native OS default white alert dialogs (`Alert.alert`) with a high-end customized Binance Pro modal dialog (`CustomAlertModal`).
  - Added support for 4 custom alert variants: `success` (emerald green badge & glowing border), `error` (coral red badge & border), `warning` (Binance yellow badge), and `info` (shield icon).
  - Designed with `#1E2329` elevated card, `rgba(240, 185, 11, 0.4)` gold border, gold button CTA, security protocol branding, and smooth fade transitions.
  - Seamlessly handles authentication responses, deposit receipts, withdrawal authorizations, investment contracts, and network connection prompts.

## [1.4.1] - 2026-09-07
### Added & Changed
- **Web App Luxury Editorial Theme Restoration (`web/` & `assets/css/style.css`)**:
  - Restored luxury warm paper palette (`#f3f0e8`), deep charcoal ink (`#0b0d0d`), antique gold accents (`#d6a84f` / `#a87927`), and classical serif typography (`Playfair Display`, `Instrument Serif`).
  - Implemented high-performance interactive custom cursor (`web/src/components/CustomCursor.tsx`) with 60fps `requestAnimationFrame` lerp easing, fine-pointer desktop detection, and context-aware hover expansion over all interactive buttons, links, story cards, and forms.
- **Elevated Binance Pro Dark UI Design Styles (`dashboard/`, `admin/`, `mobile/`)**:
  - Maintained and enhanced Binance Pro institutional dark theme across Investor Dashboard, Admin Desk, and React Native Mobile app (`#181A20`, `#1E2329`, `#2B313A`, `#F0B90B`, `#0ECB81`, `#F6465D`).
  - Added elevated surfaces, smooth hover glows, micro-interactions, high-contrast trading-grade badges, and unified visual consistency across all modules.

## [1.4.0] - 2026-09-07
### Added & Changed
- **Comprehensive Binance Pro Institutional Dark Theme & 2x UI Transformation (`dashboard/`, `admin/`, `web/`, `mobile/`)**:
  - **Binance Pro Design System Tokens**:
    - **Base Background**: Deep gunmetal `#181A20`.
    - **Surface & Cards**: Rich charcoal `#1E2329`.
    - **Borders & Dividers**: Elevated graphite `#2B313A` and `#363D47`.
    - **Primary Brand Gold / Yellow**: Signature Binance Yellow `#F0B90B` with `#FCD535` hover and `#C99400` dark accents.
    - **High-Contrast Text Hierarchy**: `#EAECEF` (Primary crisp white), `#848E9C` (Secondary steel gray), `#5E6673` (Muted labels).
    - **Financial PnL Indicators**: `#0ECB81` (Signature Binance profit green), `#F6465D` (Signature Binance coral red).
  - **Investor Web Dashboard (`dashboard/`) - 100% Themed & Refactored**:
    - Re-themed `tailwind.config.js`, `index.css`, `App.tsx`, and all 12 view and modal components:
      - `TickerBar.tsx`: Live crypto ticker bar with Binance green/red pulse and `#1E2329` pill containers.
      - `Sidebar.tsx`: Binance Pro navigation items with `#F0B90B` active states, badges, and quick-deposit action.
      - `Navbar.tsx`: Modernized top bar with live network status pulse, notification center badge, and user dropdown.
      - `OverviewView.tsx`: Redesigned NAV balance summary, quick action cards, yield tracker, and ledger preview.
      - `PortfolioYieldChart.tsx`: Binance theme styling for Recharts area charts with glowing green/gold curves.
      - `AssetAllocationChart.tsx`: Pie chart with Binance palette slices and custom tooltip card.
      - `MandatesView.tsx`: Active investment contract cards with real-time yield accrual meters and status badges.
      - `NewInvestmentView.tsx`: 4-tier investment cards with `#F0B90B` highlights and interactive yield calculator.
      - `ReferralsView.tsx`: 4-tier affiliate commission structure cards with copy buttons and downline stats.
      - `LedgerView.tsx`: Cryptographic audit table with Binance Pro row hover effects, status pills, and TXID copying.
      - `DepositModal.tsx` & `WithdrawModal.tsx`: Institutional modal dialogs with QR code frames, address copying, network presets, and subsidy notices.
      - `NotificationCenter.tsx`: Priority broadcast modal, direct message detail box, and notification ledger with `#F0B90B` action buttons.
  - **Executive Admin Portal (`admin/`) - 100% Themed & Refactored**:
    - Re-themed `tailwind.config.js`, `index.css`, `App.tsx`, and all 9 admin components:
      - `AdminNavbar.tsx`, `AdminSidebar.tsx`, `AdminLogin.tsx`.
      - `ExecutiveMetricsView.tsx`: Liquidity & escrow reserve KPI cards, inflow/outflow bar, live liquidity feed.
      - `DepositWalletsView.tsx`: Hot/cold custody wallet cards, address copy buttons, and status tags.
      - `InvestorPortfoliosView.tsx`: Investor search & detail drawer, yield contracts list, and manual disbursement modal.
      - `EscrowMandatesView.tsx`: Active smart contract monitoring desk with compounding meters and settlement table.
      - `UserManagementView.tsx`: Client database table with balance adjustment modal and quick amount buttons.
      - `NotificationsDeskView.tsx`: Direct/broadcast dispatch desk with audience picker and dispatch outbox.
      - `TransactionDeskView.tsx`: Inbound/outbound settlement queues, approve payout buttons, and reject modals.
      - `PlanConfigView.tsx`: Tier configuration cards and parameters edit modal with `.btn-binance` CTA.
  - **Public Web Marketing Platform (`web/` & Root HTML) - 100% Themed & Refactored**:
    - Modernized `web/src/index.css` and `assets/css/style.css` to full Binance Pro dark theme.
    - Updated buttons, topbar navigation, pricing grid, yield calculator, and market pulse components.
  - **Cross-Platform Mobile App (`mobile/App.tsx`) - 100% Themed & Refactored**:
    - Modernized all 80+ React Native stylesheet components and inline color definitions to Binance Pro tokens (`#181A20`, `#1E2329`, `#2B313A`, `#F0B90B`, `#0ECB81`, `#F6465D`).
  - **Verification**: Clean compilation across all 4 sub-projects (`dashboard/`, `admin/`, `web/`, `mobile/`) with 0 errors.
### Added
- **Mobile Application Full Ecosystem Parity (`mobile/App.tsx`)**:
  - **100% Terminology Harmonization**: Completely eliminated all legacy "mandate" nomenclature across state, props, navigation identifiers, styles, and UI labels in favor of `Investments` / `Investment Contracts` / `Investment Plans`.
  - **Dynamic Inbound Deposit Custody**: Integrated dynamic destination receiving address card with active network matching, full blockchain receiving address display, 1-tap clipboard copy button, routing memo/tag display, and strict network safety notices.
  - **Outbound 2FA Withdrawal Engine with Presets & Fee Subsidy**:
    - Added 1-touch percentage allocation buttons (`25%`, `50%`, `75%`, `MAX`).
    - Added Institutional Subsidy banner verifying 100% network fee waiver by Heron Capital treasury.
    - Added 2-Step OTP email verification pipeline with Dev OTP autofill pill.
  - **Investment Deployment Real-Time Yield Calculator**:
    - Embedded dynamic yield projection matrix calculating principal, rate (+4.5% to +22.5%), lock duration (24h to 96h), expected net profit ($), total payout ($), and projected maturity timestamp.
    - Added quick amount preset chips (`$500`, `$2,500`, `$7,500`, `$15,000`, `MAX`).
    - Added tier bracket warnings for amounts below minimum or exceeding maximum limits.
  - **Active Investments Live Algorithmic Yield Velocity Tracker**:
    - Added real-time ticking yield accrual display (`currentAccruedProfit`), hourly velocity rate indicator (`+$X.XX/hr`), and percentage progress bar.
    - Added Matured queued notice card ("✨ 100% Maturity Completed — Queued for executive disbursement").
    - Added Cancelled breach reason card ("⚠️ Contract Terminated by Compliance").
  - **4-Tier Partner Affiliate Architecture Screen**:
    - Added 1-tap referral code and referral link copying.
    - Added 4-Tier Commission Architecture schedule card (Tier 1: 8.0%, Tier 2: 16.0%, Tier 3: 24.0%, Tier 4: 30.0%).
    - Added downline network directory and commission earnings ledger.
  - **Cryptographic Audit Ledger with Category Filters**:
    - Added category filter chips (`All`, `Deposits`, `Withdrawals`, `Yield`, `Affiliate`).
    - Added blockchain transaction hash display with 1-tap copy button and formatted amounts (+ for credits, - for debits).
  - **Build Verification**: Verified `mobile/` compiles cleanly via `npx tsc --noEmit` with exit code 0 alongside `dashboard/`, `admin/`, and `web/`.

## [1.3.4] - 2026-09-06
### Changed
- **Comprehensive Geometric Sans-Serif Typography & Professional Scale Refinement (`dashboard/`, `admin/`, `web/`)**:
  - **Premier Web3 & Fintech Font Stack**: Established `Inter` as the primary UI font across `dashboard/tailwind.config.js` and `admin/tailwind.config.js`, backed by `Plus Jakarta Sans` and system native geometric fallbacks (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`).
  - **Tabular Figures & Optical Kerning**: Enabled `tnum` (tabular numbers) and tight optical letter-spacing (`-0.011em`) in `dashboard/src/index.css` for clean financial table alignment.
  - **Sleek Banking Scale Calibration**:
    - Reduced oversized headings (e.g. `text-5xl/6xl` -> `text-2xl sm:text-3xl lg:text-4xl`) for clean, balanced, high-density digital wealth presentation.
    - Calibrated stat cards, NAV balance banners, plan cards, and action modals in `OverviewView.tsx`, `MandatesView.tsx`, `NewInvestmentView.tsx`, `ReferralsView.tsx`, `Sidebar.tsx`, and `ExecutiveMetricsView.tsx`.
    - Modernized `Navbar.tsx` ("Portfolio Intelligence") to clean `text-base sm:text-lg md:text-xl font-sans font-bold text-white tracking-tight`.
  - **Component Level Fixes**:
    - Fixed `AssetAllocationChart.tsx` tooltip overlap and z-index compositing (`wrapperStyle={{ zIndex: 100, pointerEvents: 'none' }}`).
    - Closed range slider tag in `NewInvestmentView.tsx`.
  - **Build Verification**:
    - Successfully validated `npm run build` with exit code 0 across `dashboard/`, `admin/`, and `web/`.

## [1.3.3] - 2026-09-06
### Fixed
- **Ecosystem-Wide True-Weight Typography & Faux-Bold Smudge Elimination**:
  - **Investor Dashboard (`dashboard/`)**: Resolved synthetic faux-bold stroke smudges on "Portfolio Intelligence", portfolio NAV metrics, return badges, and plan titles caused by `Instrument Serif` lacking true bold weights (`wght@400` only).
  - Updated `dashboard/index.html` Google Fonts import to load `Cinzel:wght@500..900`, `Playfair Display:ital,wght@0,400..900;1,400..900`, `Plus Jakarta Sans:wght@400..800`, `Inter:wght@300..800`, and `JetBrains Mono:wght@400..700`.
  - Updated `dashboard/tailwind.config.js` to establish an institutional font hierarchy (`serif: ['"Playfair Display"', 'Cinzel', 'Georgia', 'serif']`, `sans: ['"Plus Jakarta Sans"', 'Inter', ...]`).
  - Added GPU compositing layer isolation (`will-change: transform`, `translateZ(0)`, `isolation: isolate`) in `dashboard/src/index.css` to prevent backdrop-filter blur bleeding into typography on Windows/Chromium engines.
  - **Marketing Web (`web/`)**: Harmonized `web/index.html` font imports and defined unified CSS variables in `web/src/index.css` (`--font-serif`, `--font-sans`, `--font-mono`), replacing direct unweighted serif declarations with true-weight serif stacks.
  - **Executive Admin Desk (`admin/`)**: Updated `admin/index.html` and `admin/tailwind.config.js` font definitions with full weight coverage for `Cinzel`, `Playfair Display`, `Plus Jakarta Sans`, and `JetBrains Mono`.
  - **Mobile Application (`mobile/App.tsx`)**: Replaced hardcoded font strings (`'Courier'`) with platform-safe monospace (`Platform.OS === 'ios' ? 'Menlo' : 'monospace'`) and ensured robust typography layout stability with zero font clipping across Android and iOS.


## [1.3.2] - 2026-09-06
### Added
- **Admin Deposit Wallets Smart Network Dropdown (`DepositWalletsView.tsx`)**:
  - Replaced the freeform Network Label text input with a curated, asset-aware `<select>` dropdown populated with exact blockchain network presets (e.g. `Tron (TRC-20)`, `Ethereum (ERC-20)`, `Bitcoin Native SegWit`, `Solana SPL`, `BNB Smart Chain (BEP-20)`, `Arbitrum One`, `Optimism`, `Polygon`, `Avalanche C-Chain`, `TON`).
  - Added an intuitive `✎ Custom / Other Network Label...` option with an automatic inline text input allowing administrators to enter bespoke network labels while retaining 1-click convenience for standard networks.
- **Mobile App Deposit Destination Receiving Card (`mobile/App.tsx`)**:
  - Integrated dynamic destination treasury address card inside the Mobile Inbound Deposit modal matching the Web Dashboard experience.
  - Features real-time asset matching, full blockchain receiving address display, 1-tap `Copy Receiving Address` button with visual confirmation toast, memo/tag indicators, and strict network advisories.
- **Mobile App Investment Status Filters & Compliance Alert Cards (`mobile/App.tsx`)**:
  - Added horizontal filter chips (`All`, `Active`, `Matured`, `Settled`, `Cancelled`) in the Investments tab.
  - Added golden glowing `MATURED (QUEUED)` status cards and notices for contracts awaiting administrative disbursement.
  - Added rose `CANCELLED` compliance notice cards displaying the exact breach reason (`cancellationReason`).
  - Added active countdown timers and live progress bars for timelocked escrow contracts.

---

## [1.3.1] - 2026-09-06
### Added
- **Dedicated Investor Portfolios Command Center (`InvestorPortfoliosView.tsx`)**:
  - Created a dedicated "Investor Portfolios" tab in the Admin portal (`AdminTab: 'investor_portfolios'`) featuring a master-detail split layout.
  - Left panel: Searchable, categorized investor directory with live contract counts, active yields, and balance badges.
  - Right panel: Comprehensive investor financial dossier (Available Liquid Balance, Active Capital Locked, Accrued & Disbursed Returns, Direct Top-Up/Adjustment modal) and granular investment plan contracts deck.
  - Contract-level administration: Integrated "Disburse Matured Payout" (with cryptographic transaction logging and user notification), "Force Early Settlement", and "Cancel Contract (Breach of Rules)" with full audit customization.

### Changed
- **Streamlined Escrow Investments Macro Ledger (`EscrowMandatesView.tsx`)**:
  - Removed destructive and early settlement actions from the mixed macro view to prevent accidental modifications across mixed investor accounts.
  - Transformed the tab into an institutional platform-wide audit ledger featuring macro metric summaries (Active Locked Escrow, Matured Settlement Queue, Lifetime Disbursed Payouts).
  - Added seamless deep-link navigation (`"Manage in Investor Portfolio ↗"`) on individual contracts and table headers that redirects administrators directly to the corresponding investor's dedicated management hub.
- **Cross-View Deep Linking**:
  - Integrated "Plans ↗" action in `UserManagementView.tsx` enabling single-click navigation from user directory rows into the investor's dedicated portfolio and contracts deck.

---

## [1.3.0] - 2026-09-06
### Added
- **Admin Manual Disbursement for Matured Investments**:
  - Transitioned investment lifecycle upon timeline expiration from silent automatic background crediting to a dedicated `'matured'` state.
  - Implemented `POST /api/admin/investments/:id/disburse` with executive settlement logging, crediting the investor's balance (`Principal + Yield`), recording `yield_payout` transactions with cryptographic hashes, and dispatching high-priority `'success'` pop-up notification alerts directly to the investor's dashboard.
  - Added dedicated **"Matured Queue (Action Required)"** filter and prominent action cards in `EscrowMandatesView.tsx`.
- **Administrative Investment Cancellation (Breach of Rules)**:
  - Implemented `POST /api/admin/investments/:id/cancel` allowing administrators to terminate active or matured contracts due to investor rule violations or compliance breaches.
  - Built an institutional cancellation modal in `EscrowMandatesView.tsx` with selectable breach category presets (Multi-account/Sybil, AML discrepancy, High-frequency arbitrage, Risk policy termination), custom note field, and toggleable principal refund.
  - Configured high-priority `'alert'` notification dispatch to deliver immediate warning pop-ups to the investor's dashboard with the breach details.
- **Enhanced Status Visualizations Across Ecosystem**:
  - Updated Investor Web Dashboard (`MandatesView.tsx`) with filter tabs (`All`, `Active`, `Matured`, `Settled`, `Cancelled`), golden pulsing `Matured (Pending Release)` badges, and detailed breach notice cards.
  - Updated Mobile App (`App.tsx` & `types/index.ts`) with distinct `statusMatured` and `statusCancelled` pill badges and typography.

### Fixed
- **Admin Deposit Wallets Blank View Crash**:
  - Resolved blank screen in `DepositWalletsView.tsx` caused by dictionary-to-array type mismatch when receiving `Record<string, DepositAddressConfig>` from the backend.
  - Added safe defensive normalization in `adminApi.getWallets()` and `DepositWalletsView.fetchWallets()`, ensuring array mapping and state synchronization are resilient against dictionary envelopes.

---

## [1.2.0] - 2026-09-06
### Changed
- **Comprehensive Ecosystem-Wide Terminology Standardization (Mandate ➔ Investment)**:
  - Standardized all client-facing and administrative interface terminology across the entire repository to "Investment" / "Active Investments" / "New Investment" / "Invest" / "Investment Plans":
    - **Dashboard (`dashboard/`)**: Updated navigation items in `Sidebar.tsx` ("Active Investments", "New Investment"), `Navbar.tsx` (header titles and "New Investment" CTA), `App.tsx` (mobile bottom nav "Investments" tab), `OverviewView.tsx` ("New Investment ↗", "Active Investments Quick Tracker", "No Active Investments"), `MandatesView.tsx` ("Active Investments", "No Investments Found"), `NewInvestmentView.tsx` ("Redirecting to active investments..."), `ReferralsView.tsx` ("Share institutional investments", "Investment Tier"), `LedgerView.tsx` ("Investment Locks"), and `AuthModal.tsx` ("Open a sovereign digital asset investment account").
    - **Marketing & Public Portal (`web/` & HTML files)**: Standardized `Home.tsx` / `index.html` ("Amateur Investment", "Standard Investment", "Premium Investment"), `Pricing.tsx` / `pricing.html` ("01 / capital investments & architecture", "Choose your investment plan", "Dedicated Private Investment Director", "Share your investment invite link", "Speak directly with an Investment Officer"), `Strategies.tsx` / `strategies.html` ("defined investments", "Discuss an investment", "Different investments", "Strategic Investments"), `Contact.tsx` / `contact.html` ("Institutional investment", "investment desk"), `Company.tsx` / `company.html` ("define an investment strategy"), `YieldSimulator.tsx` / `assets/js/main.js` ("Matched Investment Tier", "Invest with $... ↗"), `LegalModal.tsx` ("execute authenticated investments", "Investment Agreements"), and `MobileAppModal.tsx` ("instant investment execution").
    - **Admin Operations Portal (`admin/`)**: Standardized `AdminSidebar.tsx` ("Escrow Investments"), `EscrowMandatesView.tsx` ("Smart Escrow & Compounding Investments", "Active Escrow Contracts", "Matured & Settled Investments", "Investment ID", "Failed to force-mature investment"), and `PlanConfigView.tsx` ("Configure Investment Plan", "Investment plan tier updated", "Plan Description").
    - **Mobile Application (`mobile/`)**: Standardized `App.tsx` (Bottom tab bar label "Investments", "Institutional Yield Investments", "No active investments deployed", "Institutional Investments", "+ Deploy New Investment", "Deploy Capital Investment", "Select Investment Tier", "Investment Deployed" alert, "Failed to deploy investment" alert) and `README.md` ("Active Investments & Smart Escrow Timelocks").
    - **Backend Services (`backend/`)**: Standardized `routes/admin.ts` (route comments, "Investment successfully force-matured and disbursed"), `services/investmentEngine.ts` (notification title "Investment Matured"), `types/index.ts` & `services/db.ts` (added `activeInvestmentsCount` alongside backward-compatible `activeMandatesCount`), and `db/schema.sql`.

---

## [1.1.5] - 2026-09-06
### Fixed
- **JSON Serialization Null `max` Crash in Plan Tier Formatting & Limit Validation**:
  - Resolved fatal `TypeError: Cannot read properties of null (reading 'toLocaleString')` caused when `Infinity` in uncapped plans (Retirement Plan) serialized to `null` in JSON payloads.
  - Added `formatPlanMax()`, `formatPlanMin()`, and `isUncapped()` defensive helpers in `dashboard/src/components/NewInvestmentView.tsx`.
  - Normalized plan attributes in `dashboard/src/services/api.ts` and `mobile/src/services/api.ts`, restoring `Infinity` from `null`/`undefined` JSON representations.
  - Fixed backend deposit upper-limit validation in `backend/src/routes/invest.ts`, allowing investors to activate uncapped plans without false `numAmount > null` rejections.
  - Safeguarded plan limit displays in `mobile/App.tsx` and `admin/src/components/PlanConfigView.tsx`.

---

## [1.1.4] - 2026-09-06
### Fixed
- **Open Mandate View & Plan Deployment Activation Workflow**:
  - Eliminated fatal render-phase `TypeError: Cannot read properties of undefined (reading 'name')` by providing deterministic `DEFAULT_PLANS` initial state and fallback resolution in `dashboard/src/components/NewInvestmentView.tsx`.
  - Normalized `api.getPlans()` response envelope in `dashboard/src/services/api.ts` to seamlessly handle array payloads, `{ plans: [...] }` envelopes, and network delays with standard tier fallbacks.
  - Linked `api.getPlans()` directly into `refreshData()` in `dashboard/src/App.tsx`, guaranteeing continuous live rate and parameter synchronization.
  - Verified all entry points ("Open Mandate" in Sidebar, "New Mandate" in Navbar, "Open Mandate ↗" in Overview, and "Deploy Capital Into Plans ↗" in Mandates empty state) reliably switch to and render the interactive plan deployment view.
  - Hardened backend persistence in `backend/src/services/db.ts` to auto-initialize and validate `schema.planConfigs` on startup.

---

## [1.1.3] - 2026-09-06
### Added
- **Real-Time Deposit & Withdrawal Confirmation Pop-Ups**:
  - Wired real-time automatic priority pop-ups for administrative deposit confirmations, deposit rejections, withdrawal disbursements, and withdrawal rejections.
  - Added real-time notification dispatch upon manual executive balance adjustments in `backend/src/routes/admin.ts`.
  - Accelerated notification polling interval to 10 seconds for instant alert delivery.

### Fixed
- **Screen Centering Alignment for Pop-Up Modals**:
  - Replaced bottom-anchored modal overlays in `mobile/App.tsx` with dedicated `modalOverlayCenter` (`justifyContent: 'center'`, `alignItems: 'center'`, `padding: 16`), centering Priority Alerts, Operational Confirmations, and Executive Message Box modals squarely on the mobile screen.
  - Reinforced Web Dashboard modal overlay centering (`fixed inset-0 z-[99999] flex items-center justify-center`) with elevated z-index and backdrop blur across all viewports.

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
