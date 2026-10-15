# Velora: install on your phone as an app (no computer build)

These files are a Progressive Web App. Once hosted on any https address,
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
   Velora also shows its own Install banner when the browser allows it.

Your tasks never leave the phone. Only the app files are public, not your data.
Any other static host works too (Netlify, Cloudflare Pages).

## What you get
- Opens instantly and works offline after the first visit
- One-tap Install banner plus update notice when a new version is cached
- Voice in English, Tamil, Malayalam: pick en-US / en-IN / en-GB / ta-IN / ml-IN,
  or just type in Tamil / Malayalam and Velora remembers it for next voice run.
  Understands plan-my-day, summary, remind, add, find, today / tomorrow
  (இன்று / நாளை, ഇന്ന് / നാളെ) in all three.
- Voice and typed commands, plan my day, summaries, find
- Tasks you can edit (title, date, time, repeat, priority star)
- Week view, focus timer with time tracking, photo notes
- Photo auto-cleanup: when storage fills, Velora compresses older photo notes
  first, then clears photos from completed notes, then tells you what it freed.
- Widget + shortcut Quick-add: home-screen "+ Add task" button opens Velora
  straight into the add box (native APK intent + `./?a=quickadd` web shortcut).
- Smart Vault: share any text (bill, warranty card, subscription notice, ID,
  prescription, flight / train / hotel ticket, study note, link) and Velora
  detects what it is and files it under Bill, Warranty, Subscription, ID,
  Medical, Travel, Study, Link or Doc — with amount, due / expiry date, PNR,
  photo and link kept together. Filter chips count each category.
- Ask your Vault: "what is my EB bill date", "show my subscriptions",
  "my PNR", "show my medical reports" — answered from what you saved,
  no internet needed.
- Undo everywhere: a 6-second Undo bar covers deletes, clear-completed and
  bulk changes.
- Bulk select: long-press a row to enter multi-select, then mark Done,
  move to Tomorrow, or Share a list in one tap.
- One-tap templates (Morning routine, Trip pack, Study sprint) shown on the
  Upcoming screen when you have nothing open, or by voice.
- Morning briefing now also reads out renewals coming up in 3 days.
- Automations with Suggest / Ask / Auto permissions and a pause-all switch
- Share any text from another app to Velora ("Share" > Velora)
- Backup and restore from Automations > Data & look
- Clearer "storage full" guidance before local data stops saving

## Native Android app (guaranteed alarms + widget + offline voice)
1. Push to GitHub `main`.
2. Actions tab > Build Velora APK > Run workflow.
3. Download the `velora-apk` artifact and install it on your phone.
4. Open once, tap "Enable alerts", and allow Alarms & reminders +
   Notifications + Microphone.

Native extras over the web install: exact alarms that fire even when the
app is closed, Done / Snooze buttons on notifications, home-screen widget,
and on-device speech recognition where supported.

## Honest limits of the installed web app
- Reminders are shown while Velora is open or recently in the background.
  Android can suspend a web app, so an alert for a closed app is not
  guaranteed. If you need guaranteed alerts, use the Android project, which
  uses Android's alarm system.
- Data is stored in the browser on this phone. Export a backup now and then.
- Speech recognition in Chrome may need internet.
