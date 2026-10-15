# Velora: install on your phone as an app (no computer build)

These 5 files are a Progressive Web App. Once hosted on any https address,
Chrome on Android installs it like a normal app: home-screen icon, full screen,
opens offline, appears in the Share menu, and keeps your data on the phone.

## Host it free, from your phone
1. Extract this zip with the Files app.
2. Make a free account at github.com and create a new public repository
   named `velora`.
3. In the repository tap Add file > Upload files, upload ALL files in this
   folder (index.html, manifest.webmanifest, sw.js, icon-192.png,
   icon-512.png), then Commit.
4. Settings > Pages > Source: "Deploy from a branch", branch `main`, folder
   `/ (root)`, Save. After about a minute your address is
   `https://YOURNAME.github.io/velora/`
5. Open it in Chrome > menu > Install app (or Add to Home screen).

Your tasks never leave the phone. Only the app files are public, not your data.
Any other static host works too (Netlify, Cloudflare Pages).

## What you get
- Opens instantly and works offline after the first visit
- Voice and typed commands, plan my day, summaries, find
- Tasks you can edit (title, date, time, repeat, priority star)
- Week view, focus timer with time tracking, photo notes
- Automations with Suggest / Ask / Auto permissions and a pause-all switch
- Share any text from another app to Velora ("Share" > Velora)
- Backup and restore from Automations > Data & look

## Honest limits of the installed web app
- Reminders are shown while Velora is open or recently in the background.
  Android can suspend a web app, so an alert for a closed app is not
  guaranteed. If you need guaranteed alerts, use the Android project, which
  uses Android's alarm system.
- Data is stored in the browser on this phone. Export a backup now and then.
- Speech recognition in Chrome may need internet.
