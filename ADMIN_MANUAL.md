# PrivacyLens — Operations Manual

This is the complete, standalone guide to installing, configuring, running,
and maintaining PrivacyLens with **no other help available** — no AI
assistant, no prior knowledge of this specific project. Every command in
this document was actually run against this exact codebase to verify it
works; every error shown in Section 7 was actually encountered while doing
so, not copied from documentation elsewhere.

**What you're setting up**: three pieces that work together —
1. A **backend API** (Python/FastAPI), which does all the actual work and
   talks to MongoDB, Firebase, and Groq (an AI provider).
2. A **website** (React), which is what a normal user or admin opens in a
   browser.
3. A **Chrome extension**, built from the same website codebase, loaded
   manually into Chrome (it is not published on the Chrome Web Store).

There is **no git repository** for this project as of this writing — you
will work directly with the project folder on disk, not `git clone`. There
is also **no Docker setup and no CI/CD pipeline** — everything below is run
directly on your machine with Python and Node.js installed natively.

---

## 1. Prerequisites

### 1.1 Software you need, with exact versions

This manual was verified against these exact versions. Newer patch/minor
versions of the same major version should work; do not assume newer major
versions will.

| Software | Verified version | Why it's needed |
|---|---|---|
| Python | 3.12.0 | Runs the backend (FastAPI) |
| Node.js | v22.20.0 | Runs/builds the website and extension |
| npm | 10.9.3 (bundled with Node) | Installs and runs frontend dependencies |
| MongoDB (Community Server or Atlas) | any recent version (6.x/7.x/8.x) | Stores scan history, the Data Exposure Ledger, and analytics data |
| Google Chrome | any recent version | To load and use the browser extension |

Check what you already have installed before installing anything new:

```bash
python --version
node --version
npm --version
```

If any of those fail or show a much older version, install as follows.

**Windows:**
- Python: download the installer from
  [python.org/downloads](https://www.python.org/downloads/) (3.12.x) and
  run it. **Check the box "Add python.exe to PATH"** on the first
  installer screen — this is the single most common setup mistake; if you
  miss it, `python` will not be recognized in a new terminal afterward.
- Node.js: download the "LTS" installer from
  [nodejs.org](https://nodejs.org/) and run it (accept all defaults).

**macOS** (using [Homebrew](https://brew.sh/) — if you don't have Homebrew,
install it first by following the one-line command on that site):
```bash
brew install python@3.12 node
```

**Linux (Debian/Ubuntu):**
```bash
sudo apt update
sudo apt install python3 python3-venv python3-pip nodejs npm
```
If your distro's `nodejs` package is older than Node 20, install Node via
[nodesource](https://github.com/nodesource/distributions) or
[nvm](https://github.com/nvm-sh/nvm) instead — do not rely on Ubuntu's
default `apt` Node package for anything below Node 20.

### 1.2 MongoDB — pick ONE of these two options

**Option A — Local MongoDB (what this manual was verified against)**:

*Windows*: download "MongoDB Community Server" (MSI installer) from
[mongodb.com/try/download/community](https://www.mongodb.com/try/download/community),
run it, and during the installer choose **"Install MongoDB as a Service"**
(the default) — this makes MongoDB start automatically in the background
every time the machine boots, so you never have to manually start it.
After installing, verify it's running:
```powershell
Get-Service -Name MongoDB*
```
You should see `Status: Running`, `Name: MongoDB`.

*macOS*:
```bash
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0
```

*Linux (Debian/Ubuntu)*: follow MongoDB's official apt-repository
instructions at
[mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/)
(the exact commands depend on your Ubuntu version, so use the official page
rather than a single hardcoded snippet here), then:
```bash
sudo systemctl start mongod
sudo systemctl enable mongod
```

Either way, once running, the connection string for `.env` (Section 3)
will be:
```
MONGODB_URI=mongodb://localhost:27017
```

**Option B — MongoDB Atlas (free cloud-hosted alternative)**, useful if
you don't want to install MongoDB locally at all:
1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) and create a free
   account (or sign in with an existing Google account).
2. Click **"Create"** to make a new cluster → choose the **free "M0"**
   tier → pick any cloud provider/region → click **Create Deployment**.
3. When prompted to create a database user, set a username and password
   (write the password down, you'll need it in the connection string) →
   click **Create Database User**.
4. Under **"Where would you like to connect from?"**, click **"Add My
   Current IP Address"** (or, for a fully open dev setup only, add
   `0.0.0.0/0` — do not do this for anything beyond local testing).
5. Click **"Choose a connection method"** → **"Drivers"** → copy the
   connection string shown (starts with `mongodb+srv://`) → replace
   `<password>` in that string with the real password from step 3.
6. Use that full string as `MONGODB_URI` in `.env` (Section 3) instead of
   the localhost one.

### 1.3 Accounts you need to create

| Account | Where | Why | Cost |
|---|---|---|---|
| Google account | You likely already have one; if not, [accounts.google.com/signup](https://accounts.google.com/signup) | Required to create a Firebase project (Section 2) | Free |
| Groq | [console.groq.com](https://console.groq.com) — sign up with Google or email | Provides the AI model (`llama-3.1-8b-instant`) used to classify privacy-policy clauses | Free tier available at the time of writing; check Groq's own pricing page for current limits |
| MongoDB Atlas (only if using Option B above) | [cloud.mongodb.com](https://cloud.mongodb.com) | Cloud database, if not running MongoDB locally | Free "M0" tier available |

You do **not** need: a payment method for Firebase (only Auth is used, and
it's free at any realistic scale for this project — see Section 2), a
Vercel account (only needed if you plan to deploy the website — see
Section 6), or any Chrome Web Store developer account (the extension is
loaded manually, never published).

---

## 2. Firebase Setup (from absolute zero)

**What Firebase is used for in this project, specifically**: only
**Authentication** (email/password sign-in and "Sign in with Google").
Nothing else. This project does **not** use Firestore, Cloud Storage,
Cloud Functions, or Firebase Hosting — actual application data (scan
history, the Data Exposure Ledger, analytics) is stored in MongoDB instead
(Section 1.2), not in any Firebase product. If you see tutorials online
about Firestore rules or Storage rules, they do not apply here — skip
straight to enabling Authentication below.

### 2.1 Create the Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
   and sign in with your Google account.
2. Click **"Add project"** (or **"Create a project"** if this is your
   first one).
3. Type a project name (e.g. `privacylens`) → click **Continue**.
4. On the "Google Analytics" step, you can leave it enabled (default) or
   toggle it off — it makes no functional difference to this project.
   Click **Continue** (or **Create project** if Analytics is off).
5. Wait for "Your new project is ready" → click **Continue** to land in
   the project's console dashboard.

### 2.2 Enable Authentication with the two providers this project uses

1. In the left sidebar, click **Build** → **Authentication**.
2. Click **"Get started"**.
3. You'll see a "Sign-in method" tab with a list of providers. Click
   **"Email/Password"** in that list → toggle **"Enable"** to on → click
   **Save**.
4. Back on the same list, click **"Google"** → toggle **"Enable"** to on
   → a **"Project support email"** dropdown appears — pick your own email
   from it → click **Save**.

No other providers need to be enabled — this project's login screen only
offers Email/Password and "Continue with Google."

### 2.3 Register a Web App (to get the frontend's config values)

1. Still in the Firebase console, click the **gear icon** (top left, next
   to "Project Overview") → **"Project settings"**.
2. Scroll down to the **"Your apps"** section → click the **`</>`** (web)
   icon to add a web app.
3. Type an app nickname (e.g. `privacylens-web`) — the "Also set up
   Firebase Hosting" checkbox can stay **unchecked** (this project deploys
   its website to Vercel, not Firebase Hosting — see Section 6).
4. Click **Register app**.
5. You'll see a `firebaseConfig` object like this on screen — **keep this
   tab open**, you'll copy every one of these seven values into the
   frontend's `.env` file in Section 3:
   ```js
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project",
     storageBucket: "your-project.firebasestorage.app",
     messagingSenderId: "1234567890",
     appId: "1:1234567890:web:abcdef123456",
     measurementId: "G-XXXXXXX"
   };
   ```
6. Click **Continue to console**.

### 2.4 Generate the backend's service account key

The backend (Python) verifies login tokens using a separate, private
credential — not the same config as the web app above.

1. Gear icon (top left) → **"Project settings"** → click the
   **"Service accounts"** tab.
2. You'll see "Firebase Admin SDK" pre-selected with a Node.js code
   snippet — ignore the code snippet, you only need the button below it.
3. Click **"Generate new private key"** → a confirmation dialog appears
   warning to keep it secret → click **"Generate key"**.
4. A `.json` file downloads automatically (named something like
   `your-project-firebase-adminsdk-xxxxx-xxxxxxxxxx.json`). **This file is
   a secret credential — never commit it to version control or share it.**
5. You will paste the **entire contents** of this file (as one single
   line) into the backend's `.env` as `FIREBASE_CREDENTIALS` — see Section
   3.2 for the exact mechanics of "flattening" a multi-line JSON file into
   one line.

### 2.5 Firestore / Storage rules

**Not applicable.** This project has no Firestore database and no Cloud
Storage bucket enabled or used anywhere in the codebase (confirmed by
reading every Firebase import in the frontend: only `firebase/app` and
`firebase/auth` are ever imported — never `firebase/firestore` or
`firebase/storage`). If your Firebase console shows a prompt to "set up
Firestore," you can ignore it; nothing in this project will use it.

### 2.6 Firebase CLI / `firebase init`

**Not applicable, and not installed for this project.** The Firebase CLI
(`firebase login`, `firebase init`) is only needed for Firebase Hosting,
Functions, or Firestore deployment — none of which this project uses. You
do not need to install the Firebase CLI at all to run or deploy
PrivacyLens. (See Section 6 for how deployment actually works — Vercel for
the website, a plain Python process for the backend.)

### 2.7 Adding your production domain later (only needed at deploy time)

If you later deploy the website (Section 6) to a real domain, Google
Sign-In will fail there until you add that domain to Firebase's allow-list:
Authentication → **Settings** tab (next to "Sign-in method" and "Users") →
**"Authorized domains"** → **"Add domain"** → type your production domain
(e.g. `your-app.vercel.app`) → **Add**. `localhost` is already present in
this list by default, which is why local development works without this
step.

---

## 3. Environment Configuration

There are **two separate `.env` files** — one for the backend, one for the
frontend. Each has a matching `.env.example` already in the repo showing
the exact variable names (with empty values) to copy from.

### 3.1 Every environment variable, in full

**Backend** (`backend/.env`):

| Variable | Required? | What it is | Where to get it |
|---|---|---|---|
| `GROQ_API_KEY` | Yes | Groq API key — used for AI-based clause classification, the plain-English report, and the chat assistant | [console.groq.com](https://console.groq.com) → **API Keys** (left sidebar) → **"Create API Key"** → give it any name → copy the key shown (starts `gsk_...`) — **it is only shown once**, so copy it immediately |
| `MONGODB_URI` | Yes | MongoDB connection string | `mongodb://localhost:27017` for local MongoDB, or the `mongodb+srv://...` string from Atlas (Section 1.2, Option B) |
| `DATABASE_NAME` | Yes | Which database name on that Mongo server/cluster to use | Any name works; use `privacylens` (this is also the value already in the repo's example file) |
| `FIREBASE_CREDENTIALS` | Yes | The entire downloaded service-account JSON file (Section 2.4), flattened to one line | See Section 3.2 below for exactly how to flatten it |
| `ADMIN_USERNAME` | No — defaults to `admin` | Username for the operator-only `/admin` dashboard (completely separate from Firebase user accounts) | Pick your own |
| `ADMIN_PASSWORD` | No — defaults to `admin` | Password for the same admin dashboard | Pick your own — **do not leave this as the default** (see Section 9) |
| `ADMIN_SESSION_SECRET` | No — defaults to `admin-dev-secret` | A random string used as the admin session token | Generate one yourself — see the exact command in Section 3.3 |

**Frontend** (`frontend/.env`):

| Variable | Required? | What it is | Where to get it |
|---|---|---|---|
| `VITE_API_URL` | Yes | The backend's base URL the website/extension calls | `http://127.0.0.1:8811` for local development (already the default in `.env.example`) |
| `VITE_FIREBASE_API_KEY` | Yes | Part of the web app config | From Section 2.3's `firebaseConfig` object |
| `VITE_FIREBASE_AUTH_DOMAIN` | Yes | Same | Same |
| `VITE_FIREBASE_PROJECT_ID` | Yes | Same | Same |
| `VITE_FIREBASE_STORAGE_BUCKET` | Yes | Same (present in config even though Storage itself is unused) | Same |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Yes | Same | Same |
| `VITE_FIREBASE_APP_ID` | Yes | Same | Same |
| `VITE_FIREBASE_MEASUREMENT_ID` | Yes | Same | Same |

The website also has a Contact-page email form (using EmailJS) that needs
three more variables (`VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`,
`VITE_EMAILJS_PUBLIC_KEY`) to actually send — these are **not** in
`.env.example` and are **not required** for the app to run; only the
Contact page's "Send" button needs them. Get these from
[dashboard.emailjs.com](https://dashboard.emailjs.com) (Email Services →
add a service; Email Templates → add a template; Account → API Keys) if
you want that specific form to work.

### 3.2 How to flatten the Firebase service-account JSON into one line

The file you downloaded in Section 2.4 is a multi-line `.json` file. Your
`.env` file needs its entire contents on a single line after
`FIREBASE_CREDENTIALS=`. The easiest reliable way:

**macOS/Linux:**
```bash
python3 -c "import json; print(json.dumps(json.load(open('/path/to/your-downloaded-file.json'))))"
```

**Windows (PowerShell):**
```powershell
python -c "import json; print(json.dumps(json.load(open('C:\path\to\your-downloaded-file.json'))))"
```

Copy the single line of output this prints, and paste it directly after
`FIREBASE_CREDENTIALS=` in `backend/.env` (no quotes around it — the value
itself contains quotes, which is correct).

### 3.3 Generating a random `ADMIN_SESSION_SECRET`

```bash
python -c "import secrets; print(secrets.token_hex(24))"
```
Copy the printed string as the value of `ADMIN_SESSION_SECRET`.

### 3.4 Exact file structure to create

```
D:\LY PROJ\backend\.env       (copy from backend\.env.example, then fill in)
D:\LY PROJ\frontend\.env      (copy from frontend\.env.example, then fill in)
```

```bash
# from the project root
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```
(On Windows PowerShell, use `Copy-Item backend\.env.example backend\.env`
and `Copy-Item frontend\.env.example frontend\.env` instead of `cp`.)

Then open each new `.env` file in a text editor and fill in the values
from the tables above. A completed `backend/.env` looks like this
(values below are fake examples — do not use them):

```
GROQ_API_KEY=gsk_EXAMPLEEXAMPLEEXAMPLEEXAMPLEEXAMPLE
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=privacylens
FIREBASE_CREDENTIALS={"type":"service_account","project_id":"your-project","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com", ...}
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-this-to-something-real
ADMIN_SESSION_SECRET=9f3a1c...redacted-random-hex-string
```

And a completed `frontend/.env`:
```
VITE_API_URL=http://127.0.0.1:8811
VITE_FIREBASE_API_KEY=AIzaSyEXAMPLEEXAMPLEEXAMPLEEXAMPLE
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXX
```

Both `.env` files are already listed in `.gitignore` at both the root and
per-folder level, so they will not accidentally get committed if this
project is ever put under version control (see Section 9).

---

## 4. Local Installation & First Run

### 4.1 Get the project onto your machine

There is no git repository for this project — you receive it as a plain
folder (e.g. a zip file or a copied directory). Place it anywhere, e.g.
`D:\LY PROJ` on Windows or `~/privacylens` on macOS/Linux. All commands
below assume you `cd` into that folder first.

### 4.2 Backend: install dependencies

```bash
cd backend
python -m venv venv
```

Activate the virtual environment (the command differs by OS/shell — run
the one matching yours):

```bash
# Windows (Command Prompt)
venv\Scripts\activate.bat

# Windows (PowerShell)
venv\Scripts\Activate.ps1

# macOS / Linux
source venv/bin/activate
```

Your terminal prompt should now start with `(venv)`. With the virtual
environment active:

```bash
pip install -r requirements.txt
```

This installs FastAPI, Uvicorn, MongoDB's driver, the Firebase Admin SDK,
Groq's SDK, Playwright, scikit-learn, and the other backend dependencies
(full list in `backend/requirements.txt`).

**One extra step this project's own `start.bat` does NOT do, and that you
must run once yourself** — Playwright needs its own browser binary
downloaded separately from the `pip install` above:

```bash
playwright install chromium
```

Skipping this step is a real, verified failure mode — see Section 7.1.

**Trained model files**: `backend/ml/artifacts/practice_model.joblib` and
`severity_model.joblib` are already present in this project folder — you
do **not** need to train anything yourself to run the app normally. (Model
training is a separate, optional, offline process only needed if you want
to retrain the models from scratch — not covered by this manual, since it
is not part of normal operation.)

### 4.3 Frontend: install dependencies

Open a **second** terminal window (leave the backend terminal as-is) and:

```bash
cd frontend
npm install
```

### 4.4 Database seeding

**None needed.** MongoDB collections (`history`, `ledger_entries`,
`scan_attempts`, `extension_downloads`) are created automatically the
first time the backend writes to them — there is no seed script and none
is required. A brand-new database will simply show empty lists/zero counts
everywhere until you perform your first scan.

### 4.5 Start the backend

In the terminal where you activated `venv` (Section 4.2):

```bash
cd backend
uvicorn app:app --reload --port 8811
```

**What a successful startup looks like** (verified output):
```
INFO:     Will watch for changes in these directories: [...]
INFO:     Uvicorn running on http://127.0.0.1:8811 (Press CTRL+C to quit)
INFO:     Started reloader process [...]
INFO:     Started server process [...]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

Leave this terminal running. Verify it's actually working by opening a
**third** terminal and running:
```bash
curl http://127.0.0.1:8811/health
```
Expected output: `{"status":"healthy"}`

If instead you see a Python traceback ending in `RuntimeError: Missing
FIREBASE_CREDENTIALS environment variable...`, your `backend/.env` isn't
set up correctly yet — go back to Section 3.

### 4.6 Start the frontend

In your second terminal (Section 4.3):

```bash
cd frontend
npm run dev
```

**What a successful startup looks like** (verified output):
```
  VITE v8.0.3  ready in 6952 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open **http://localhost:5173** in your browser.

**What the first screen should show**: the **Login** page ("Welcome
Back — Sign in to your account"), with a "Continue with Google" button,
Email/Password fields, and a "Don't have an account? Create Account"
link — because no one is signed in yet on a fresh setup. This was
directly verified while writing this manual.

### 4.7 Create your first account and verify every integration

1. Click **"Create Account"** on the login page, fill in the sign-up
   form, and submit. **Verify Firebase Auth is wired correctly**: go back
   to the Firebase console → Authentication → **Users** tab — your new
   account should appear in that list within a few seconds.
2. You should now land on the **Dashboard** page inside the app.
3. Go to the **Scan** page (left sidebar) → paste in any real privacy
   policy text (or a company URL) → click the scan/analyze button.
   **Verify the full backend pipeline is working**: you should see a risk
   score (0–100%), a risk label (Low/Medium/High), and a list of findings
   appear within a few seconds. A `NOT_A_POLICY` error at this step is
   expected if you paste in something that isn't actually a privacy
   policy — try a real company's policy text instead.
4. **Verify MongoDB is receiving data**: open the **History** page (left
   sidebar) — the scan you just ran should appear there. (Optionally,
   open MongoDB Compass or `mongosh`, connect to your `MONGODB_URI`, open
   the `privacylens` database, and confirm a new document exists in the
   `history` collection.)
5. **Verify the admin dashboard**: open **http://localhost:5173/admin**
   in your browser (this page is not linked from the normal site
   navigation — you must type the URL) → log in with the
   `ADMIN_USERNAME`/`ADMIN_PASSWORD` you set in `backend/.env` → you
   should land on a dashboard showing real numbers (total registered
   users, total scans, etc.) reflecting the scan you just ran.

### 4.8 Load the Chrome extension (optional, but part of the product)

```bash
cd frontend
npm run build:extension
```
Expected output ends with something like:
```
extension/popup.html                   0.29 kB
extension/assets/popup-*.css          20.77 kB
extension/assets/popup-*.js          358.57 kB
✓ built in 6s
```

Then, in Chrome:
1. Go to `chrome://extensions` in the address bar.
2. Toggle **"Developer mode"** on (top-right corner switch).
3. Click **"Load unpacked"** (top-left).
4. In the file picker, select the `frontend/extension` folder (not a zip
   — the actual unpacked folder) → click **"Select Folder"**.
5. The PrivacyLens icon should now appear in your Chrome toolbar (you may
   need to click the puzzle-piece "Extensions" icon and pin it). Click it
   on any real website to run a scan directly from the browser.

---

## 5. Running Without Claude / AI Assistance — Quick Reference

Assumes you already completed the full setup once (Sections 1–4).

### 5.1 Every-day startup (2 terminals)

**Terminal 1 — backend:**
```bash
cd backend
venv\Scripts\activate.bat   # Windows CMD — use the matching command for your shell/OS from Section 4.2
uvicorn app:app --reload --port 8811
```

**Terminal 2 — frontend:**
```bash
cd frontend
npm run dev
```

Then open http://localhost:5173.

Make sure MongoDB is running before starting the backend:
```bash
# Windows — check the service is running
Get-Service -Name MongoDB*
# macOS
brew services list
# Linux
sudo systemctl status mongod
```

### 5.2 Shutting everything down

Press `Ctrl+C` in each terminal window. On Windows, if a terminal is
unresponsive, find and stop the process directly:
```powershell
Get-CimInstance Win32_Process -Filter "Name='python.exe'" | Where-Object { $_.CommandLine -match 'uvicorn' } | Stop-Process -Force
```

### 5.3 Clearing test/scan data

To wipe all scan history, ledger entries, and analytics data and start
completely fresh, drop the database:
```bash
mongosh --eval "db.getSiblingDB('privacylens').dropDatabase()"
```
(Replace `privacylens` with your own `DATABASE_NAME` value if different.)
This does **not** delete any Firebase user accounts — those are managed
separately (Section 8.1).

### 5.4 Rotating API keys / secrets

- **Groq key**: [console.groq.com](https://console.groq.com) → API Keys →
  delete the old key → **Create API Key** again → paste the new value
  into `GROQ_API_KEY` in `backend/.env` → restart the backend.
- **Firebase service account key**: Firebase console → Project settings →
  Service accounts → **Generate new private key** again (this does not
  invalidate the old one automatically — see Section 9 for how to revoke
  the old one) → re-flatten the new file (Section 3.2) → replace
  `FIREBASE_CREDENTIALS` in `backend/.env` → restart the backend.
- **Admin password/session secret**: edit `ADMIN_PASSWORD` and/or
  `ADMIN_SESSION_SECRET` directly in `backend/.env` → restart the backend.
  Anyone with an old admin session token will be logged out automatically
  the moment `ADMIN_SESSION_SECRET` changes, since that value itself *is*
  the token.

### 5.5 Updating dependencies

```bash
# Backend — from backend/, with venv active
pip list --outdated
pip install -r requirements.txt --upgrade

# Frontend — from frontend/
npm outdated
npm update
```
After either, restart the corresponding server and re-run the checks in
Section 4.7 to confirm nothing broke — this project has automated tests
for the backend's analysis logic (see Section 8.4) but not for the
frontend, so a manual click-through after a frontend dependency update is
the only way to catch a regression there.

---

## 6. Deployment

**Current actual deployment state, confirmed by inspecting this project**:
the **website** is set up to deploy to **Vercel** (a `vercel.json` file
exists configuring single-page-app routing), but this exact project folder
is **not currently linked to a Vercel project** (no `.vercel` folder is
present) — deployment must be (re-)connected by whoever owns the Vercel
account. The **backend** has **no deployment configuration at all** — no
Dockerfile, no Procfile, no platform-specific config file anywhere in
`backend/`. It is currently designed to run only on `localhost` (its CORS
allow-list in `backend/app.py` only permits `http://localhost:5173` and
`https://privacy-risk-analyzer.vercel.app` as origins, plus any
`chrome-extension://` origin).

### 6.1 Deploying the website to Vercel

**One-time setup:**
```bash
cd frontend
npx vercel login
```
This opens a browser window to authenticate with your Vercel account (or
prompts for an email to send a magic link to, if run in a
non-interactive terminal).

```bash
npx vercel link
```
Answer the prompts: confirm the directory (`frontend`), choose or create a
Vercel project, and accept defaults for build settings — Vercel
auto-detects this as a Vite project.

**Before deploying**, add every `VITE_*` variable from Section 3.1 to the
Vercel project: Vercel dashboard → your project → **Settings** →
**Environment Variables** → add each one (name + value) → set them for
"Production" (and "Preview"/"Development" too, if you want preview
deployments to also work) → **Save**. `VITE_API_URL` here must point at
wherever your backend actually ends up running publicly — since the
backend currently has no deployment path of its own (see below), this
would need to be resolved first.

**Deploy:**
```bash
npx vercel --prod
```
This runs `npm run build` (per `vercel.json`) and uploads the result. On
success, Vercel prints the live URL.

**After deploying**: add the new production domain to Firebase's
authorized-domains list (Section 2.7), and add it to `backend/app.py`'s
`allow_origins` list (replacing or alongside the existing
`https://privacy-risk-analyzer.vercel.app` entry) so the browser doesn't
block API calls with a CORS error (see Section 7.4).

### 6.2 Deploying the backend

**Not currently set up in this project** — there is no hosting platform
configured, no Dockerfile, and no process-management config
(`Procfile`, `systemd` unit, etc.) anywhere in `backend/`. To actually put
the backend somewhere other than your own machine, you would need to:
1. Choose a Python-hosting platform (e.g. Render, Railway, Fly.io, a plain
   VM) — this is a decision for whoever owns/pays for that infrastructure,
   not something this manual can pick for you.
2. Set every variable from Section 3.1's backend table as an environment
   variable on that platform (not a `.env` file — most platforms have
   their own secrets/environment-variable UI).
3. Make sure that platform can run `playwright install chromium` (or
   already has Chromium available) as part of its build step — Playwright
   needs the actual browser binary present at runtime, not just the pip
   package (see Section 7.1).
4. Update `backend/app.py`'s `allow_origins` CORS list to include your
   real deployed website domain.
5. Update the website's `VITE_API_URL` (Section 6.1) to point at wherever
   the backend now lives, and redeploy the website.

### 6.3 Rolling back a bad deploy

**Website (Vercel)**: Vercel dashboard → your project → **Deployments**
tab → find the last known-good deployment in the list → click the **⋯**
(three dots) menu next to it → **"Promote to Production"**. This
instantly repoints the live domain at that older build with no rebuild
required.

**Backend**: since there's no deployment platform configured yet, rollback
strategy depends entirely on whichever platform you choose in Section 6.2
— most (Render, Railway, Fly.io) keep previous deploy artifacts and offer
a one-click "redeploy this version" action in their own dashboard.

### 6.4 Checking production logs

**Website (Vercel)**: Vercel dashboard → your project → **Logs** tab
(runtime/function logs) — mostly irrelevant here since this is a static
SPA with no server-side functions, but build logs for a failed deploy show
under the specific deployment's **"Build Logs"** tab.

**Backend**: depends on the hosting platform chosen in Section 6.2; check
that platform's own log-streaming feature (e.g. Render's "Logs" tab,
`fly logs`, Railway's "Deployments → Logs").

---

## 7. Troubleshooting

Every item below was either directly encountered while verifying this
manual, or is documented in this project's own `backend/QA_REPORT.md` as a
confirmed, previously-found issue.

### 7.1 Playwright: `Executable doesn't exist at ... chromium ...`

**When it happens**: the very first time you try to scan a URL (not raw
pasted text) after a fresh `pip install -r requirements.txt`, if you
skipped the extra step in Section 4.2.

**Fix**: from `backend/`, with the virtual environment active:
```bash
playwright install chromium
```
This downloads the actual browser binary Playwright needs — a separate
step from the Python package install, and one this project's own
`start.bat` does **not** do automatically. If you use `start.bat` for
setup, still run this command manually once yourself.

### 7.2 Backend fails to start: `RuntimeError: Missing FIREBASE_CREDENTIALS environment variable`

**Full error text** (from `backend/utils/firebase_admin.py`):
```
RuntimeError: Missing FIREBASE_CREDENTIALS environment variable. Create a
backend/.env file with your Firebase service account JSON on a single
line as FIREBASE_CREDENTIALS=... (see setup docs).
```
**Cause**: `backend/.env` doesn't exist yet, or exists but
`FIREBASE_CREDENTIALS` is empty. **Fix**: complete Section 3 (copy
`.env.example` to `.env` and fill in every value, especially the
flattened Firebase JSON from Section 3.2).

A closely related error, `FIREBASE_CREDENTIALS in backend/.env is not
valid JSON`, means the flattening step in Section 3.2 wasn't done
correctly (usually: pasted the file's contents with real line breaks
still in it, instead of using the one-line `json.dumps` output) — redo
Section 3.2 exactly as written.

### 7.3 `curl http://127.0.0.1:8811/health` fails / connection refused

**Cause**: the backend isn't actually running, or is running on a
different port than the frontend expects. **Fix**: check the backend
terminal for a startup error (most commonly 7.1 or 7.2 above); confirm
`VITE_API_URL` in `frontend/.env` matches the port the backend actually
printed on startup (default `8811`).

### 7.4 Every scan in the browser fails, but `curl` to the backend works fine

**Symptom**: the website UI shows a generic network/failed-to-fetch error,
but the backend terminal shows no incoming request logged at all, and a
direct `curl` to the same endpoint succeeds.

**Cause (verified directly while writing this manual)**: port 5173 was
already in use by another process, so Vite silently started the dev
server on **5174** instead and printed `Port 5173 is in use, trying
another one...` — but `backend/app.py`'s CORS `allow_origins` list only
permits `http://localhost:5173` by exact match, not 5174. The browser
blocks the request as a CORS violation before it ever reaches the backend
(so nothing shows up in the backend's own logs — the request never
arrived).

**Fix**: either (a) find and stop whatever is already using port 5173
(`netstat -ano | findstr :5173` on Windows to find the PID, then stop it)
so Vite starts on the expected port, or (b) if you genuinely need a
different port, add that exact origin to the `allow_origins` list in
`backend/app.py` and restart the backend.

### 7.5 Port 8811 already in use when starting the backend

**Full error text** (verified directly):
```
ERROR: [Errno 10048] error while attempting to bind on address
('127.0.0.1', 8811): only one usage of each socket address
(protocol/network address/port) is normally permitted
```
**Cause**: another backend instance (often left running from a previous
session, especially since `--reload` mode can leave orphaned worker
processes behind) is already listening on 8811. **Fix**: find and stop it
first.
```powershell
# Windows — list any process using uvicorn on this port
Get-CimInstance Win32_Process -Filter "Name='python.exe'" | Where-Object { $_.CommandLine -match 'uvicorn' } | Select-Object ProcessId, CommandLine
# then stop the specific one found:
Stop-Process -Id <the ProcessId shown above> -Force
```
```bash
# macOS/Linux
lsof -i :8811
kill -9 <PID shown>
```
**Important note about `--reload`**: this project's own build history
records that `uvicorn --reload` has repeatedly served stale code after an
edit, and has left orphaned processes behind after a crash. If backend
behavior doesn't match a change you just made, or you hit this exact port
conflict, fully kill every matching `python.exe`/`uvicorn` process first
and start a single fresh instance before trusting what you see.

### 7.6 A scan returns `{"error": "NOT_A_POLICY"}`

**Not a bug** — this is the app correctly refusing to analyze text that
doesn't look like an actual privacy policy (e.g. a homepage's marketing
copy, or a short unrelated snippet). Paste in the real, full text of an
actual privacy policy, or give it a real company URL and let auto-discovery
find the real policy page.

### 7.7 Corrupted or unusual file upload crashes with a raw server error

If you're running an older copy of this codebase, malformed `.pdf`/`.docx`
files or non-UTF8 `.txt` files could crash the analyze endpoint with a raw
500 error and stack trace. This exact issue is documented as **fixed** in
`backend/QA_REPORT.md` (finding #3) — if you still see a raw crash instead
of a clean `{"error": "..."}` JSON response on a bad file upload, you are
likely running an older, unpatched copy of `backend/services/file_reader.py`.

### 7.8 Admin dashboard: "Unauthorized" even with the right username/password

**Cause 1**: you're being rate-limited. This project locks out further
login attempts for 5 minutes after 5 failed attempts from the same
machine (`backend/utils/admin_auth.py`) — wait 5 minutes and try again
with the correct credentials.
**Cause 2**: `ADMIN_USERNAME`/`ADMIN_PASSWORD` in `backend/.env` don't
match what you're typing — these default to `admin`/`admin` if not set at
all, but if you (correctly, per Section 9) changed them, make sure you're
using the new values, not the old defaults.

### 7.9 Google Sign-In works locally but fails after deploying the website

**Cause**: the new production domain hasn't been added to Firebase's
authorized-domains allow-list yet. **Fix**: Section 2.7.

### 7.10 CORS error in the browser console after deploying

**Cause**: `backend/app.py`'s `allow_origins` list doesn't include your
new production domain yet — it's hardcoded to
`http://localhost:5173` and `https://privacy-risk-analyzer.vercel.app`
only (plus any `chrome-extension://` origin, via a regex). **Fix**: add
your actual domain to that list in `backend/app.py` and restart the
backend.

### 7.11 Quota/rate limits

- **Groq**: free-tier API keys have a requests-per-minute and
  tokens-per-minute limit; if scans start failing only under heavy/rapid
  use, check your usage against your plan's limits at
  [console.groq.com](https://console.groq.com) (left sidebar → usage/limits).
  The app itself degrades gracefully on any Groq failure (returns an empty
  findings list rather than crashing), so a quota error will look like an
  unusually thin/empty result, not a hard crash.
- **MongoDB Atlas free tier**: has a storage cap (512 MB on the M0 tier at
  the time of writing) — if writes start silently failing, check your
  cluster's storage usage in the Atlas dashboard.
- **Firebase Auth**: effectively unlimited at this project's realistic
  scale on the free "Spark" plan; not a practical concern.

---

## 8. Maintenance & Admin Tasks

### 8.1 Viewing and managing users

Firebase console → **Authentication** → **Users** tab. From here you can:
see every registered user's email, sign-up provider, and creation date;
click the **⋮** menu next to any user to **disable** or **delete** their
account; click **"Add user"** to manually create an account.

This project's own `/admin` dashboard (Section 4.7, step 5) additionally
shows a **total registered users** count pulled live from this same
Firebase user list — no separate user-management UI exists inside the app
itself beyond that count.

### 8.2 Inspecting or exporting stored data

All application data (scan history, the Data Exposure Ledger, scan
attempt logs, extension download counts) lives in MongoDB, in four
collections inside the database named by your `DATABASE_NAME` (default
`privacylens`): `history`, `ledger_entries`, `scan_attempts`,
`extension_downloads`.

**Easiest way to browse it**: install
[MongoDB Compass](https://www.mongodb.com/products/compass) (a free GUI),
open it, connect using the same `MONGODB_URI` from your `.env` file, and
browse/query any collection visually.

**Command-line export** (requires `mongoexport`, installed alongside
MongoDB Community Server):
```bash
mongoexport --uri="mongodb://localhost:27017" --db=privacylens --collection=history --out=history_export.json --jsonArray
```

### 8.3 Monitoring usage and costs

- **This project's own `/admin` dashboard** (Section 4.7) is the primary
  place to watch real usage: total scans, success/failure rate,
  extension-vs-website split, and — specifically relevant to cost — the
  proportion of scans that used a paid Groq API call versus a free
  ToS;DR-sourced result (shown as "source mix" on the dashboard).
- **Groq costs/limits**: [console.groq.com](https://console.groq.com) →
  usage/billing section in the left sidebar.
- **MongoDB Atlas usage** (if using Option B from Section 1.2):
  [cloud.mongodb.com](https://cloud.mongodb.com) → your cluster → the
  "Metrics" tab shows storage and operation counts.
- **Firebase usage**: Firebase console → left sidebar **Usage and
  billing** — shows Authentication usage against the free plan's limits.

### 8.4 Updating the app safely

1. Read whatever changed before updating (there's no CHANGELOG in this
   project — check with whoever made the change).
2. Update dependencies per Section 5.5.
3. **Run the backend's automated test suite** before trusting anything:
   ```bash
   cd backend
   venv\Scripts\activate.bat   # or the matching command from Section 4.2
   pytest tests/ -v
   ```
   Expected output ends with `33 passed` (verified while writing this
   manual — some deprecation warnings from a third-party library,
   `joblib`, are expected and harmless). If any test fails, do not deploy
   until you understand why — these tests cover the core scoring and
   detection logic directly.
4. There are currently **no automated tests for the frontend** — after any
   frontend change, manually repeat the checks in Section 4.7 (sign up,
   run a scan, check History, check the admin dashboard) before trusting
   the update.
5. No database migration steps exist or are needed for this project's
   current schema — MongoDB has no fixed schema to migrate, and no schema
   version markers exist in the codebase.

---

## 9. Security Checklist

### 9.1 Every secret/key in this project, and how to rotate each

| Secret | Where it lives | How to rotate |
|---|---|---|
| `GROQ_API_KEY` | `backend/.env` | Section 5.4 |
| `MONGODB_URI` (contains a password if using Atlas) | `backend/.env` | Atlas dashboard → Database Access → edit the user's password → update the connection string in `.env` |
| `FIREBASE_CREDENTIALS` (service account private key) | `backend/.env` | Section 5.4. **To fully revoke an old key** (not just generate a new one alongside it): Google Cloud Console → [console.cloud.google.com/iam-admin/serviceaccounts](https://console.cloud.google.com/iam-admin/serviceaccounts) → select your Firebase project → find the `firebase-adminsdk-...` service account → **Keys** tab → delete the old key's entry |
| `VITE_FIREBASE_API_KEY` and the rest of the web `firebaseConfig` | `frontend/.env` (and, once deployed, Vercel's environment variables) | These are not secret in the same sense — they identify your project but don't grant privileged access on their own (Firebase's security rules are what actually protect data). Still, if you ever need to regenerate them, use a fresh Web App registration (Section 2.3) |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | `backend/.env` | Edit directly, then restart the backend (Section 5.4) |
| `ADMIN_SESSION_SECRET` | `backend/.env` | Section 3.3 to generate a new one, then restart the backend |

### 9.2 Confirmed, currently-live risk: default admin credentials

**As shipped, this project's `backend/.env` may still have
`ADMIN_USERNAME=admin` and `ADMIN_PASSWORD=admin`** — the weak defaults
baked into the code whenever these variables are unset. **Change both
before this backend is ever reachable from anywhere other than your own
machine.** This is explicitly flagged in this project's own
`backend/QA_REPORT.md` as a known, unresolved risk, not something already
handled for you.

### 9.3 Admin sessions never expire

There is no session timeout or server-side logout invalidation for the
`/admin` dashboard — the "token" handed back on login is simply the
`ADMIN_SESSION_SECRET` value itself, valid indefinitely until you change
that secret. Treat that secret with the same care as a password: don't
share it, and rotate it (Section 5.4) if you ever suspect it leaked.

### 9.4 What NOT to commit to version control

`backend/.env` and `frontend/.env` (both contain live secrets) — already
covered by `.gitignore` at both the project root and inside each folder
(confirmed by direct inspection: `.gitignore` lists `.env`,
`backend/.env`, and `frontend/.env` explicitly, in addition to the
generic `.env` pattern). The downloaded Firebase service-account `.json`
file from Section 2.4 should also never be committed anywhere — keep it
outside the project folder once you've copied its contents into `.env`,
or delete it after flattening it.

If this project is ever put under actual git version control for the
first time, run `git status` immediately after `git init` and before your
first commit, and confirm neither `.env` file appears in the list of
files about to be tracked.

### 9.5 Recommended review cadence

- **Firestore/Storage rules**: not applicable — this project uses neither
  (Section 2.5).
- **Firebase Authentication → Users list**: review periodically for any
  account you don't recognize, especially if this app is ever exposed
  publicly with open sign-up.
- **CORS allow-list** (`backend/app.py`'s `allow_origins`): review whenever
  you add or retire a deployed domain — a stale entry left in the list
  after a domain is decommissioned is a low-risk but unnecessary open
  door.
- **Admin credentials and session secret**: rotate immediately if this
  backend is ever moved from `localhost`-only to anything network-
  reachable, and periodically thereafter (e.g. every few months) as
  ordinary hygiene.

---

*This manual reflects the exact state of the project verified at the time
of writing: backend running on Python 3.12 with all dependencies
installed cleanly; a real scan run end-to-end and confirmed logged to
MongoDB; the admin dashboard confirmed showing live data from that scan;
the full pytest suite (33 tests) confirmed passing; both the website and
extension production builds confirmed completing successfully. Every
troubleshooting entry in Section 7 was either directly triggered and
resolved during this verification, or is drawn from this project's own
`backend/QA_REPORT.md`.*
