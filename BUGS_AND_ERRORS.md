# Heron Capital — Bug & Error Knowledge Base

This document is the **single source of truth** for all errors reported, bugs identified, root-cause analyses, exact resolutions, and regression prevention rules across the Heron Capital ecosystem.

---

## [Mandatory Protocol For All Developers & AI Agents]
> 🚨 **CRITICAL INSTRUCTION**:
> 1. **ALWAYS READ THIS FILE** before beginning any debugging, refactoring, or feature development in this project.
> 2. **NEVER REINTRODUCE PREVIOUSLY FIXED PATTERNS**. Pay strict attention to the *Regression Prevention Rule* for every logged issue.
> 3. Whenever a new bug is reported or discovered, you **MUST** append a new entry to this file with:
>    - Problem Summary & Error Message
>    - Affected Module / Component
>    - Root Cause Analysis (RCA)
>    - Exact Resolution & Code Location
>    - Regression Prevention Rule

---

## Index of Logged Issues

1. [BUG-001: Mobile Post-Signup Crash (`TypeError: depositAddresses.map is not a function`)](#bug-001-mobile-post-signup-crash-typeerror-depositaddressesmap-is-not-a-function)
2. [BUG-002: Mobile Physical Device Connection Failure (`Failed to fetch` / Timeout)](#bug-002-mobile-physical-device-connection-failure-failed-to-fetch--timeout)
3. [BUG-003: Mobile TurboModule Crash (`Cannot read property 'PlatformConstants' of undefined`)](#bug-003-mobile-turbomodule-crash-cannot-read-property-platformconstants-of-undefined)
4. [BUG-004: Expo CLI Module Resolution Error (`Cannot find module '../src/start/index.js'`)](#bug-004-expo-cli-module-resolution-error-cannot-find-module-srcstartindexjs)
5. [BUG-005: Android Emulator Missing SDK / ADB Path (`'adb' is not recognized`)](#bug-005-android-emulator-missing-sdk--adb-path-adb-is-not-recognized)
6. [BUG-006: Admin Portal Direct Messaging Modal Empty Investor List](#bug-006-admin-portal-direct-messaging-modal-empty-investor-list)
7. [BUG-007: Admin Portal Parameters Tab State Desynchronization](#bug-007-admin-portal-parameters-tab-state-desynchronization)
8. [BUG-008: Git Index Pollution from Build Artifacts & Node Modules](#bug-008-git-index-pollution-from-build-artifacts--node-modules)
9. [BUG-009: Missing Brand Identity Onboarding Animation](#bug-009-missing-brand-identity-onboarding-animation)
10. [BUG-010: Zero-Balance Account Initialization Inconsistency](#bug-010-zero-balance-account-initialization-inconsistency)

---

### BUG-001: Mobile Post-Signup Crash (`TypeError: depositAddresses.map is not a function`)
- **Status**: ✅ Resolved (Permanent Fix)
- **Module**: `mobile/src/services/api.ts` & `mobile/src/screens/DepositScreen.tsx`
- **Symptom**: User completes registration, gets automatically logged in, but the screen immediately crashes with a red fatal error: `TypeError: depositAddresses.map is not a function`.
- **Root Cause**:
  - The backend `db.getDepositAddresses()` returns a key-value dictionary `Record<string, DepositAddressConfig>` (e.g., `{ BTC: { network: "BTC", address: "..." }, ETH: { ... } }`).
  - The mobile `DepositScreen` expected an Array and called `.map()` directly on `depositAddresses`.
- **Exact Resolution**:
  - In `mobile/src/services/api.ts`, normalized the `getDepositAddresses` method:
    ```typescript
    getDepositAddresses: async () => {
      const res = await request<any>('/wallet/addresses');
      if (res.data) {
        // Normalize Record to Array if needed
        const addressesArray = Array.isArray(res.data) ? res.data : Object.values(res.data);
        return { data: addressesArray, error: null };
      }
      return res;
    }
    ```
  - Added safe fallback empty array checks `(data || [])` on all array methods in `mobileApi` (`getInvestments`, `getTransactions`, `getNotifications`, `getTickers`).
- **Regression Prevention Rule**:
  - *Never assume backend dictionary responses are arrays. Always perform `Array.isArray(x) ? x : Object.values(x || {})` normalization in API client adapters.*

---

### BUG-002: Mobile Physical Device Connection Failure (`Failed to fetch` / Timeout)
- **Status**: ✅ Resolved (Permanent Fix)
- **Module**: `backend/src/server.ts` & `mobile/src/services/api.ts`
- **Symptom**: Physical mobile phone on Wi-Fi scans the Expo QR code, but registration or login hangs on "Loading..." indefinitely before failing with `Network request failed` / `Failed to fetch`.
- **Root Cause**:
  1. `mobile/src/services/api.ts` was hardcoded to `http://localhost:5000/api`. On a mobile phone, `localhost` refers to the mobile device itself, not the development computer.
  2. `backend/src/server.ts` was invoking `app.listen(PORT, ...)` without specifying `0.0.0.0`, causing Windows to bind strictly to loopback `127.0.0.1`.
- **Exact Resolution**:
  - In `backend/src/server.ts`, bound Express explicitly to `0.0.0.0`:
    ```typescript
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Heron Core Server running on http://0.0.0.0:${PORT}`);
    });
    ```
  - In `mobile/src/services/api.ts`, implemented dynamic host IP discovery:
    ```typescript
    import Constants from 'expo-constants';
    const getHostIp = () => {
      const uri = Constants.expoConfig?.hostUri;
      if (uri) {
        const ip = uri.split(':')[0];
        return `http://${ip}:5000/api`;
      }
      return 'http://192.168.43.149:5000/api'; // Host PC Wi-Fi fallback
    };
    ```
- **Regression Prevention Rule**:
  - *Do NOT hardcode `localhost` in any mobile API service. Always use dynamic host detection via `Constants.expoConfig?.hostUri` and maintain backend binding on `0.0.0.0`.*

---

### BUG-003: Mobile TurboModule Crash (`Cannot read property 'PlatformConstants' of undefined`)
- **Status**: ✅ Resolved (Permanent Fix)
- **Module**: `mobile/package.json`
- **Symptom**: Mobile app fails to start with TurboModule initialization error when launched through Expo Go.
- **Root Cause**:
  - The installed Expo Go client on mobile is built for **Expo SDK 57** (which bundles React Native `0.86.3` and React `19.2.3`).
  - The project's `mobile/package.json` originally had mismatched SDK 54 dependencies, causing native bridge symbol incompatibility.
- **Exact Resolution**:
  - Upgraded `mobile/package.json` to exact SDK 57 compatible versions:
    - `"expo": "~57.0.20"`
    - `"react": "19.2.3"`
    - `"react-native": "0.86.3"`
    - `"typescript": "^5.6.3"`
- **Regression Prevention Rule**:
  - *Never downgrade `expo` or `react-native` in `mobile/package.json` without verifying the target Expo Go binary version. Always verify with `npx expo config`.*

---

### BUG-004: Expo CLI Module Resolution Error (`Cannot find module '../src/start/index.js'`)
- **Status**: ✅ Resolved (Permanent Fix)
- **Module**: `mobile/node_modules/@expo/cli`
- **Symptom**: `npx expo start` crashed on startup with `Error: Cannot find module '../src/start/index.js'`.
- **Root Cause**: Corrupted or incomplete `@expo/cli` build package inside local `mobile/node_modules`.
- **Exact Resolution**:
  - Removed corrupted local dependencies and cleanly reinstalled using `npx expo install`.
- **Regression Prevention Rule**:
  - *Always use `npx expo start -c` (clear cache) after changing dependencies, and never install disparate global/local Expo CLI versions.*

---

### BUG-005: Android Emulator Missing SDK / ADB Path (`'adb' is not recognized`)
- **Status**: ✅ Resolved (Permanent Workaround / Guidance Documented)
- **Module**: Android Environment & Tooling
- **Symptom**: `Opening on Android... Failed to resolve the Android SDK path. Error: 'adb' is not recognized as an internal or external command.`
- **Root Cause**: LDPlayer 9 / 3rd-party emulators do not install the Google Android SDK CLI tools to `%LOCALAPPDATA%\Android\Sdk` or add `adb.exe` to Windows System `PATH`.
- **Exact Resolution**:
  - Use physical phone with Expo Go on the same Wi-Fi network (fastest, zero-config).
  - For LDPlayer: Add `C:\Program Files\LDPlayer\LDPlayer9` to Windows System `PATH` and connect via `adb connect 127.0.0.1:5555`.
- **Regression Prevention Rule**:
  - *Physical device via Expo Go QR code is the primary test environment. Avoid coupling development workflows to local Android Studio SDK paths.*

---

### BUG-006: Admin Portal Direct Messaging Modal Empty Investor List
- **Status**: ✅ Resolved (Permanent Fix)
- **Module**: `admin/src/pages/Users.tsx` / `admin/src/pages/Messages.tsx`
- **Symptom**: When attempting to compose a direct message to an investor in the Admin portal, the investor dropdown was empty.
- **Root Cause**: The messaging component filtered users by a hardcoded role check that failed when users were created with case-mismatched or undefined role keys.
- **Exact Resolution**:
  - Updated user querying logic to normalize role checks: `(u.role || '').toLowerCase() === 'investor' || (u.role || '').toLowerCase() === 'user'`.
  - Added fallback list rendering all active accounts with full names and emails.
- **Regression Prevention Rule**:
  - *Role comparisons in both frontend and backend must always be case-insensitive (`.toLowerCase()`) or use strict enum validation.*

---

### BUG-007: Admin Portal Parameters Tab State Desynchronization
- **Status**: ✅ Resolved (Permanent Fix)
- **Module**: `admin/src/pages/Settings.tsx` & `backend/src/routes/admin.ts`
- **Symptom**: Changes made to system parameters (minimum deposit, withdrawal fee, referral commission) in the admin UI reverted on refresh.
- **Root Cause**: The parameters endpoint was reading from volatile memory instead of persisting updates to `heron-data.json` / PostgreSQL.
- **Exact Resolution**:
  - Connected system parameters to `db.updateSettings()` in `backend/src/database/` to ensure immediate atomic disk and SQL persistence.
- **Regression Prevention Rule**:
  - *All administrative settings mutations must invoke persistent database adapter methods (`db.updateSettings`) rather than mutating in-memory copies.*

---

### BUG-008: Git Index Pollution from Build Artifacts & Node Modules
- **Status**: ✅ Resolved (Permanent Fix)
- **Module**: `.gitignore` & Root Repository
- **Symptom**: Large cached `.vite`, `.expo`, `dist/`, and duplicate `package-lock.json` files were being tracked in git, bloating commits and risking merge conflicts.
- **Root Cause**: The repository lacked a top-level `.gitignore` that recursively ignored nested build directories across all 5 sub-projects.
- **Exact Resolution**:
  - Created root `.gitignore`:
    ```gitignore
    node_modules/
    dist/
    .expo/
    .vite/
    .env
    .env.local
    .env.*.local
    *.log
    npm-debug.log*
    yarn-debug.log*
    yarn-error.log*
    .DS_Store
    Thumbs.db
    backend/dist/
    backend/data/heron-data.json
    ```
  - Executed `git rm -r --cached` to purge untracked artifacts from the index.
- **Regression Prevention Rule**:
  - *Never commit without verifying `git status` against root `.gitignore`. Never add `node_modules` or build output directories.*

---

### BUG-009: Missing Brand Identity Onboarding Animation
- **Status**: ✅ Resolved (Permanent Fix)
- **Module**: `mobile/App.tsx` & `mobile/src/screens/OpeningSplashScreen.tsx`
- **Symptom**: Mobile app booted immediately into a raw login screen with no institutional branding, luxury prestige animation, or welcoming intro.
- **Root Cause**: No dedicated animated splash / opening sequence was defined in the mobile root navigator.
- **Exact Resolution**:
  - Designed and built `OpeningSplashScreen` featuring:
    - Glowing Falcon Shield crest with animated opacity and scaling.
    - Metallic typography: `HERON CAPITAL` in institutional gold (`#d4af37`).
    - Subtitle: `INSTITUTIONAL ASSET MANAGEMENT & CRYPTO WEALTH`.
    - Golden gradient loading line with percentage counter.
    - Interactive "Enter Platform" instant-skip button.
- **Regression Prevention Rule**:
  - *Preserve `OpeningSplashScreen` in `App.tsx` state machine (`showSplash: boolean`) on mobile app launches.*

---

### BUG-010: Zero-Balance Account Initialization Inconsistency
- **Status**: ✅ Resolved (Permanent Fix)
- **Module**: `backend/src/database/index.ts` & `backend/src/routes/auth.ts`
- **Symptom**: Newly registered accounts in testing sometimes inherited mock balances or unverified demo balances.
- **Root Cause**: The default wallet generator assigned placeholder balances in certain development database seeds.
- **Exact Resolution**:
  - Enforced strict zero-balance initialization for all new accounts across all supported assets:
    ```typescript
    wallets: {
      USD: { balance: 0.00, locked: 0.00 },
      BTC: { balance: 0.00000000, locked: 0.00000000 },
      ETH: { balance: 0.00000000, locked: 0.00000000 },
      USDT: { balance: 0.00, locked: 0.00 }
    }
    ```
- **Regression Prevention Rule**:
  - *Never assign initial positive balances to newly created user wallets. All capital inflows must originate from verified deposit approvals.*
