# SplitPay Mobile App

SplitPay is a fintech mobile product that helps users split bills, manage group contributions, generate vendor payment links, and track wallet activity in one app.

This repository contains the current deliverable built with Expo React Native and TypeScript, ready for demo and prepared for Firebase-backed production rollout.

## Project Delivery Summary

### What We Built

- End-to-end onboarding flow (phone, OTP UI, and profile setup with avatar)
- Wallet-first home experience with account balance and action shortcuts
- Group savings flow (list groups, create group, view details, contribute)
- Bill split flow (create split, manage participants, track payment states)
- Vendor pay link flow for collecting payments from customers
- Activity timeline with statuses and grouped transaction history
- Deep-link-ready navigation structure for core app routes
- Security controls (PIN lock + biometric unlock support)
- Offline-safe behavior for queued transaction actions
- Production-style UX polish (loading states, retries, empty states, pull-to-refresh)

### Business Value Delivered

- Validates a single app experience for personal + social money management
- Reduces friction in peer bill collection and informal group savings
- Creates a foundation for revenue channels via payment links and transaction rails
- Supports scale-out with backend integrations (Firebase + payment gateway)

### Current Product State

- **Status:** Feature-complete demo/MVP
- **Platform:** Expo React Native (Android/iOS/Web support)
- **Backend mode:** Firebase-ready with local fallback data when env vars are absent
- **Payments:** Paystack integration scaffolded; server-side payment execution pending

## Technical Architecture

### Core Stack

- Expo SDK 54 + React Native + TypeScript
- React Navigation
- Zustand for state management
- Firebase (Auth + Firestore)
- Expo Notifications + Deep Linking
- Expo Secure Store + Local Authentication

### Firestore Data Model

- `users`
- `groups`
- `splits`
- `transactions`
- `vendorLinks`

### Baseline Security Rules (Recommended)

- Users read/write only their own profile
- Group access restricted to group members
- Split access restricted to participants
- Transactions restricted to owner (`userId == auth.uid`)

### Baseline Indexes (Recommended)

- `transactions`: `where(userId == ...) + orderBy(createdAt desc)`
- `groups`: `where(memberIds array-contains ...) + orderBy(createdAt desc)`
- `splits`: `where(participantIds array-contains ...) + orderBy(createdAt desc)`
- `vendorLinks`: `where(creatorId == ...) + orderBy(createdAt desc)`

## Paystack Integration Plan

The app is prepared for Paystack but intentionally avoids client-side secret handling.

Recommended production flow:

1. Mobile app creates payment intent request with backend
2. Backend calls Paystack using secret keys
3. Backend verifies webhooks
4. Backend writes trusted transaction updates to Firestore
5. App listens and reflects final payment status

> Never expose Paystack secret keys in the client app.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
cp .env.example .env
```

3. Fill Firebase values in `.env`

4. Start app:

```bash
npm run start
```

Then use:
- `a` for Android
- `i` for iOS (macOS)
- `w` for web

## Environment Variables

- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`
- `EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY` (optional)

If Firebase env vars are missing, major flows run on local demo data.

## Notifications and Deep Links

- Notifications permission requested on startup
- Reminder hooks wired for split and contribution journeys
- App scheme: `splitpay`
- Web prefix: `https://splitpay.app`

## Build and Release (Expo EAS)

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build -p android
eas build -p ios
eas submit -p android
eas submit -p ios
```

## Recommended Next Milestones

- Connect wallet actions to real backend payment APIs
- Add Cloud Functions for scheduled reminders and payouts
- Add automated tests for critical money movement flows
- Add monitoring/crash reporting (Sentry or Crashlytics)
- Finalize compliance checklist (audit logs, fraud controls, policy docs)

## Scripts

- `npm run start` - start Expo dev server
- `npm run android` - run Android
- `npm run ios` - run iOS
- `npm run web` - run web
