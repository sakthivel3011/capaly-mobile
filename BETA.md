# CAPALY Beta — Android Tester Guide

**App:** CAPALY Beta · `in.capaly.beta` · v1.0.2 (versionCode 3)
**Build profile:** `preview` (direct-install `.apk`, not an `.aab`)

---

## 1. Install on an Android phone

1. Open the build link from EAS (Expo dashboard → your project → **Builds**, or the URL the CLI printed). Each successful build page has a **Download** button and a **QR code**.
2. On the phone, open that page and tap **Download** (or scan the QR with the camera).
3. When prompted, allow **"Install unknown apps"** for your browser, then open the downloaded `.apk` and tap **Install**.
4. Launch **CAPALY Beta** from the home screen.

> No Play Store, no account, and no developer setup is needed to install a `preview` APK.

---

## 2. Try it with zero backend — Demo mode

The beta ships with a built-in **offline demo dataset**, so you can explore every screen without a login or a live server.

- On the welcome screen tap **"Explore the demo — no login needed"** → opens the **Employee** portal with sample data.
- Tap **"or preview the Department portal"** → opens the **Department** portal.

Demo mode persists across app restarts. **Sign out** (Profile tab → Sign out) to leave demo mode and return to the real login.

### What to test in demo mode
| Area | Where | What you'll see |
|------|-------|-----------------|
| Splash | App launch | Animated CAPALY logo reveal |
| Dashboard | Home tab | KPI tiles, incident trend chart, recent incidents, activity feed |
| Incidents | Incidents tab | List with search + status filters; tap a card for full detail |
| Incident detail | Tap any incident | Overview, workflow timeline, investigation, CAPA, action plan, activity |
| Report Incident | Employee · center **+** | Full report form (title, type, severity, date, attachments) |
| CAPA / Investigation / Inspection | Employee · **+** sheet | Module report forms |
| Action Plan | Department · Action Plan tab | Task list, filters, detail, create |
| Reports | Department · Reports tab | Report type previews (PDF/Excel export needs the live API) |
| Notifications | Alerts tab | Sample alerts by severity; tap to open related incident |
| Profile | Profile tab | Profile + Settings + Change password |

> In demo mode, form submissions show a success toast but aren't persisted (the dataset is static). Report **PDF/Excel downloads** require the live backend.

---

## 3. Test against the live backend

The `preview` build points at `https://api.capaly.in/api`. To sign in with a real account instead of demo mode:

1. From the welcome screen choose **Department** or **Employee**.
2. Search and select your company, then sign in with your credentials.

If the API is unreachable, read-only screens automatically fall back to the demo dataset so the app never shows a blank screen.

---

## 4. Rebuild the APK

```bash
npm install -g eas-cli      # one-time
cd capaly-mobile
eas login                   # your Expo account
eas build -p android --profile preview
```

- The build runs in the Expo cloud (~10–20 min); the CLI prints a download URL when done.
- `versionCode` is taken from `app.json` (`appVersionSource: "local"` in `eas.json`). Bump `android.versionCode` for each new build you distribute.
- For a Play Store **App Bundle** instead of an APK: `eas build -p android --profile production`.

---

## 5. Known limitations (beta)

- Demo-mode writes (new reports, status changes) are not saved.
- Report file exports and push notifications require the live backend.
- iOS builds are configured (`in.capaly.app`) but not part of this Android beta.
