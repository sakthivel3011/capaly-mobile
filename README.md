# CAPALY Mobile

**Safety • Compliance • CAPA • Inspections** — the React Native (Expo) companion app for the CAPALY EHS platform.

Phase 3 of CAPALY. Reuses the existing `capaly-backend` APIs **without any backend, schema or business-logic changes.**

---

## Tech stack

| Concern | Library |
| --- | --- |
| Runtime | React Native + **Expo SDK 52** |
| Navigation | React Navigation v7 (native-stack + bottom-tabs) |
| State | Zustand |
| Networking | Axios (token + cookie-replay refresh) |
| Forms / validation | React Hook Form + Zod |
| Secure storage | expo-secure-store (tokens) + AsyncStorage (cache) |
| Lists | FlashList |
| Charts | react-native-chart-kit + react-native-svg |
| Icons | lucide-react-native |
| Animations | react-native-reanimated |
| Images | expo-image |
| Push | expo-notifications |
| Theme | Light + Dark (system aware) |

## CAPALY design system

Primary `#233DFF` · Accent `#6A3CFF` · Navy `#0B1B45` · Success `#16A34A` · Warning `#F59E0B` · Danger `#DC2626` · 20px card radius, soft shadows. See `src/theme/`.

---

## Getting started

```bash
cd capaly-mobile
npm install            # or: npx expo install   (to align native versions)
cp .env.example .env   # set EXPO_PUBLIC_API_URL to your backend
npm start              # then press a (Android) / i (iOS) / scan QR in Expo Go
```

Make sure `capaly-backend` is running (`npm run dev` in `../capaly-backend`).

### Pointing at the backend

The API base URL resolves in this order:
1. `EXPO_PUBLIC_API_URL` env var
2. `expo.extra.apiUrl` in `app.json`
3. fallback `https://api.capaly.in/api` (production)

For local development, set `EXPO_PUBLIC_API_URL` in `.env` (see `.env.example`):

- **Android emulator:** `http://10.0.2.2:5000/api`
- **iOS simulator:** `http://localhost:5000/api`
- **Physical device (Expo Go):** `http://<your-LAN-IP>:5000/api`

### Auth & refresh tokens

The backend issues the refresh token as an **httpOnly cookie**. React Native has no
automatic cookie jar, so `src/api/client.js` captures the `capaly_refresh_token`
cookie from login responses into SecureStore and **replays it manually** on the
`/auth/refresh` call. Access tokens are sent as `Authorization: Bearer`.

---

## Architecture

```
App.js                     Providers: Theme -> Toast -> Confirm -> Navigation
src/
  theme/                   palette (light/dark), tokens, ThemeProvider
  api/                     axios client, secure storage, endpoint modules
  store/                   Zustand auth store (bootstrap / login / logout)
  navigation/              Root + Auth + 3 role-based tab navigators
  hooks/                   useAsync (cache + offline), usePortal (role routing)
  components/
    ui/                    Button, Card, Input, Select, Badge, Skeleton, ...
    feedback/              Toast + Confirm (replace alert/confirm)
    domain/                IncidentCard, WorkflowTimeline, charts, pickers
  screens/
    auth/                  Welcome, CompanySelect, Admin/Portal login, Forgot/Reset
    shared/                Dashboard, Incidents, Detail, Reports, Notifications,
                           Profile, Settings, ChangePassword, Tracking
    department/            Action Plan list / detail / create
    employee/              Report hub + Report Incident / Investigation / CAPA / Inspection
  services/                push notifications
  utils/                   formatting, image URL resolver, file download/share
```

### Role-based apps
`RootNavigator` reads `portalType` from the auth store and mounts the matching
tab navigator:

- **Admin** (Super/Company Admin): Dashboard · Incidents · Tracking · Reports · Profile
- **Department**: Dashboard · Incidents · Action Plan · Reports · Profile
- **Employee**: Dashboard · Report · Incidents · Alerts · Profile

Shared screens (Dashboard, Incidents, Detail) are portal-aware via `usePortal()`,
which selects the correct backend slice for the signed-in role.

---

## Features

- Company selection + Admin / Department / Employee logins, forgot/reset password, cookie notice, auto-login.
- Premium dashboards (hero, KPIs, trend chart, recent incidents, activity, quick report action).
- Incident list (search + severity-first sort + status filter) and full workflow detail (Overview / Workflow timeline / Investigation / CAPA / Action Plan / Activity).
- Employee report forms with section cards, validation, and camera / gallery / files attachments (images + documents, **no video**) with preview.
- Department action plans: searchable incident & assignee pickers, create + status updates.
- Notifications with priority colors + unread badge, mark read / mark all read, deep-link to incidents.
- Report center: preview + PDF / Excel export via the share sheet.
- Profile / Settings (light-dark-system theme) / Change password.
- Offline cache for dashboard, incidents and profile, with an offline banner.
- Skeleton loaders, toasts, confirm modals, smooth Reanimated transitions, tablet-safe layouts.

> Uploads, notifications, workflow routing, codes and emails are all handled by the
> existing backend — the app never duplicates business logic.
