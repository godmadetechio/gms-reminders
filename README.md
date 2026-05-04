# GMS Slack Reminder Bot

Sends Slack reminders for all GMS group coaching calls.
Triggered by Railway cron — runs for ~1 second, sends the message, exits.

---

## Repo structure

```
gms-reminders/
├── index.js          ← main script
├── package.json
├── package-lock.json
├── railway.toml      ← Railway build config
├── .env.example      ← env var reference
└── .gitignore
```

---

## Call schedule

| Day | Call | Lead | Time (UK) |
|-----|------|------|-----------|
| Mon | Discovery Mastery + Onboarding Call | Isaac / Rotating | 6:00pm |
| Tue | Pitch Perfect + AMA | Piotr | 6:00pm |
| Wed | Objection Handling Gauntlet / Closing | Isaac | 6:00pm |
| Thu | Sales Training | Jaka | 6:00pm |
| Fri | Hiring Call | Jackson | 6:00pm |

---

## Local test

```bash
npm install
cp .env.example .env        # fill in your real token
node index.js 3hr           # test the 3hr message
node index.js 1hr           # test the 1hr message
node index.js 5min          # test the 5min message
```

---

## Deploy to Railway

### Step 1 — Push repo to GitHub

```bash
git init
git add .
git commit -m "init"
# Create a new repo on github.com first, then:
git remote add origin https://github.com/YOUR_USERNAME/gms-reminders.git
git push -u origin main
```

### Step 2 — Create 3 cron services on Railway

Go to railway.app → New Project → Deploy from GitHub repo → select `gms-reminders`.

You need **3 separate cron services** (one per reminder type).
For each one: click **New Service** → **GitHub repo** → same repo → set as **Cron Job**.

| Service name   | Start command        | Cron schedule  | Timezone       |
|----------------|----------------------|----------------|----------------|
| reminder-3hr   | `node index.js 3hr`  | `0 15 * * 1-5` | Europe/London  |
| reminder-1hr   | `node index.js 1hr`  | `0 17 * * 1-5` | Europe/London  |
| reminder-5min  | `node index.js 5min` | `55 17 * * 1-5`| Europe/London  |

### Step 3 — Add env vars (on all 3 services)

In each service → Variables tab:

```
SLACK_BOT_TOKEN   =   xoxb-your-token-here
SLACK_CHANNEL_ID  =   C0AGL7MKSTZ
TZ                =   Europe/London
```

### Step 4 — Done ✅

Railway fires each service at the right time.
Each run takes ~1 second and costs essentially nothing.
Every push to GitHub auto-redeploys all 3 services.

---

## Changing a call time or name

Edit `index.js` → find the `CALLS` object or `CALL_LINK` → update → push to GitHub.
Railway auto-redeploys in ~30 seconds.
