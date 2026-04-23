# Lydie Vue MVP

Lydie is a small, private, local-only recovery tracker for post-surgery patients.

This version is a small Vue app so it can be used on:
- iPhone
- Android
- iPad
- tablets
- laptops
- desktops

It does not use:
- a backend
- cloud sync
- accounts
- analytics
- ads
- telemetry
- third-party tracking

All data stays on the device in local browser storage.

## MVP Plan

1. Build a responsive browser app with three main destinations:
   - Medications
   - Left Drain
   - Right Drain
2. Store all data locally with `localStorage`.
3. Keep the UI calm and low-friction:
   - large buttons
   - minimal typing
   - tap-based color selection
   - simple confirmations
4. Support medication reminders in the simplest local-only way available in the browser:
   - in-app due states
   - optional browser notifications when supported and permitted
5. Keep the code small and maintainable with Vue components, Vue Router, and a small local store.

## Architecture

- `index.html`
  - Vite entry HTML
- `src/App.vue`
  - shared app shell and routed layout
- `src/router`
  - Vue Router setup
- `src/views`
  - routed screens
- `src/components`
  - small reusable UI pieces
- `src/stores/appStore.js`
  - local state, persistence, and reminder behavior
- `src/styles.css`
  - responsive visual system and large-tap UI
- `package.json`
  - local dev/build tooling
- `manifest.webmanifest`
  - installable app metadata
- `sw.js`
  - offline cache for the app shell

## Data Model

- `medications`
  - `id`
  - `name`
  - `doseLabel`
  - `intervalHours`
  - `nextDueAt`
  - `lastActionAt`
  - `lastActionType`
  - `isActive`
  - `history`
- `drainEntries`
  - `id`
  - `side`
  - `drainNumber`
  - `amountML`
  - `color`
  - `loggedAt`

## Navigation

- `/`
  - Home
- `/medications`
  - Medications
- `/drains`
  - Drains menu
- `/drains/left`
  - Left drain tracking
- `/drains/right`
  - Right drain tracking

## Reminder Note

Browser notifications are less reliable than native mobile notifications, especially across different devices and browsers.

This MVP uses only local browser capabilities:
- due indicators inside the app
- optional browser notifications if the device/browser allows them

## Run Locally

Install dependencies first:

```powershell
npm.cmd install
```

Run the local dev server:

```powershell
npm.cmd run dev
```

Build for production:

```powershell
npm.cmd run build
```
