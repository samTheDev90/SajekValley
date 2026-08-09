# Sajek Valley — Trip Planner

A shared budget, itinerary, and spots planner for the group. Anyone who opens
the deployed link sees the same data, and any edit — a new contribution, a
moved itinerary stop, a checked-off spot — shows up for everyone else within
about half a second. That live sync is powered by a free Firebase Realtime
Database; hosting is a free static site on GitHub Pages.

You need to do two things once: set up a free Firebase project (10 minutes),
and connect this repo to GitHub Pages (5 minutes). After that, sharing the
link is the only step — the data layer takes care of itself.

## 1. Create a free Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
   and sign in with any Google account.
2. **Add project** → give it any name (e.g. `sajek-valley-trip`) → you can
   skip Google Analytics → **Create project**.
3. On the project overview page, click the **`</>`** (web) icon to register a
   web app. Give it a nickname (e.g. `sajek-planner`) — you don't need
   Firebase Hosting, this project uses GitHub Pages instead.
4. Firebase will show a `firebaseConfig` object. Keep this tab open, you'll
   copy it in step 4 below.

## 2. Turn on the Realtime Database

1. In the left sidebar: **Build → Realtime Database → Create Database**.
2. Pick any location close to your group.
3. Start in **locked mode** (we'll set the real rules next).
4. Once created, go to the **Rules** tab and replace the contents with:

   ```json
   {
     "rules": {
       "sajekTrip": {
         ".read": "auth != null",
         ".write": "auth != null"
       }
     }
   }
   ```

   This means: anyone can read/write the trip data once they're signed in —
   and step 3 makes that sign-in happen automatically and invisibly for
   everyone who opens your link, no password needed. It's the same trust
   model as a shared Google Sheet link: fine for a friend-group trip, not
   meant to hold anything sensitive.
5. Click **Publish**.

## 3. Turn on Anonymous sign-in

1. **Build → Authentication → Get started**.
2. **Sign-in method** tab → **Anonymous** → enable it → **Save**.

This is what lets every visitor pass the `auth != null` rule above without
creating an account or seeing a login screen — it happens automatically the
moment the page loads.

## 4. Paste your config into the app

Open `src/firebaseConfig.js` and replace the placeholder values with the real
`firebaseConfig` object from step 1.4. It should look like:

```js
export const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "sajek-valley-trip.firebaseapp.com",
  databaseURL: "https://sajek-valley-trip-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "sajek-valley-trip",
  storageBucket: "sajek-valley-trip.appspot.com",
  messagingSenderId: "...",
  appId: "...",
};
```

Make sure `databaseURL` is included — the Firebase console's copy-paste
snippet sometimes omits it. You can always find it at the top of the Realtime
Database page (`https://your-project-default-rtdb....firebasedatabase.app`).

These values aren't secret — they're meant to ship inside the app. Real
protection comes from the rules you set in step 2, not from hiding this file.

## 5. Push this project to GitHub

```bash
git init
git add .
git commit -m "Sajek Valley trip planner"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

## 6. Match the Vite base path to your repo name

Open `vite.config.js` and set `base` to `/YOUR_REPO_NAME/` (with slashes on
both sides):

```js
export default defineConfig({
  base: '/YOUR_REPO_NAME/',
  plugins: [react(), tailwindcss()],
})
```

Skip this — set `base: '/'` instead — only if you're deploying to a *user*
Pages site (a repo literally named `YOUR_USERNAME.github.io`).

## 7. Turn on GitHub Pages

In your GitHub repo: **Settings → Pages → Build and deployment → Source →
GitHub Actions**. That's it — the included workflow
(`.github/workflows/deploy.yml`) builds and deploys automatically on every
push to `main`.

Commit and push the `vite.config.js` change from step 6, then watch the
**Actions** tab for the deploy to finish. Your link will be:

```
https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
```

Share that link with the group — everyone editing it stays in sync.

## Local development

```bash
npm install
npm run dev
```

## Notes

- **Resetting** the trip (the ↺ icon, top right) now resets it **for
  everyone** on the link, since the data is shared — a confirmation dialog
  spells this out before it happens.
- **Free tier limits:** Firebase's free Spark plan comfortably covers a trip
  like this (the limits are roughly 100 simultaneous connections, 1GB
  stored, 1GB/day transferred) — you won't come close.
- **`xlsx` (SheetJS)** has a couple of known, unpatched advisories
  (prototype pollution / ReDoS) reported by `npm audit`. They matter if the
  app parses a maliciously crafted spreadsheet from someone you don't trust;
  for a friend group importing your own files, the practical risk is low.
  It's the same library Claude's own artifact environment uses.
- Want to reuse this app for a future trip instead of resetting? Change the
  `TRIP_PATH` constant near the top of `src/App.jsx` (search for
  `"sajekTrip"`) to a new name, and update the Realtime Database rule in
  step 2 to match.
- Colors, fonts, and copy live in the `BRAND` object and `GLOBAL_CSS` string
  near the top of `src/App.jsx` if you want to restyle anything.
