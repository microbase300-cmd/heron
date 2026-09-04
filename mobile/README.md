# Heron Assets Trustees — Cross-Platform Mobile App (Android & iOS)

This mobile app provides the mobile client experience for Heron Assets Trustees, mirroring the **Cyber-Institutional Web3 Liquid** design language.

## Key Features
- **Net Asset Value (NAV) Tracker**: Live portfolio valuation in USD, BTC, and ETH.
- **Active Mandates & Smart Escrow Timelocks**: Real-time `HH:MM:SS` countdown timer with live seconds ticks.
- **4 Investment Plans**: Amateur (24h • 4.5%), Standard (48h • 9.5%), Premium (72h • 15.5%), Retirement (96h • 22.5%).
- **Multi-Crypto Wallet**: Quick deposit and withdrawal sheets.
- **Affiliate Network**: Real-time tracking of 8%, 16%, 24%, and 30% referral tiers.

## Architecture
- Built with **React Native & Expo**.
- Shares 100% of TypeScript models, API client, and business logic with the React Web Dashboard.
- Connects directly to the backend REST API (`http://<LAN_IP>:5000/api`).

## How to Run on Android / iOS

1. In the `mobile/` directory, install dependencies:
   ```bash
   npm install
   ```

2. Start the Expo development server:
   ```bash
   npx expo start
   ```

3. Open on your phone:
   - **iOS**: Scan the terminal QR code with your iPhone Camera (opens in **Expo Go**).
   - **Android**: Scan the QR code using the **Expo Go** app from the Google Play Store.
