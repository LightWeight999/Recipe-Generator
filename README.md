# Pantry Print

A grocery-photo-to-recipe prototype. Snap or upload photos of your groceries,
Claude identifies the items and suggests a recipe using what you have on hand.

## How this is structured

- `index.html` — the app itself (frontend, no build step needed)
- `api/pantry.js` — a small serverless function that holds your Anthropic API
  key privately and forwards requests to Claude. The frontend never talks to
  Anthropic directly, so your key is never exposed to whoever uses the app.

## Deploy it (GitHub + Vercel, ~10 minutes)

### 1. Get an Anthropic API key
Go to [console.anthropic.com](https://console.anthropic.com), sign in, and
create an API key. Keep it somewhere safe — you'll paste it into Vercel in
step 4, never into the code itself.

### 2. Push this folder to a GitHub repo
```bash
cd pantry-print-deploy
git init
git add .
git commit -m "Pantry Print prototype"
```
Then create a new repo on [github.com/new](https://github.com/new) and follow
its instructions to push (something like):
```bash
git remote add origin https://github.com/YOUR-USERNAME/pantry-print.git
git branch -M main
git push -u origin main
```

### 3. Import the repo into Vercel
Go to [vercel.com](https://vercel.com), sign in with your GitHub account,
click **Add New → Project**, and select the `pantry-print` repo. Leave the
default settings — no build command is needed.

### 4. Add your API key as an environment variable
Before (or right after) deploying, go to **Project Settings → Environment
Variables** in Vercel and add:

| Name | Value |
|---|---|
| `ANTHROPIC_API_KEY` | your key from step 1 |

Redeploy if you added it after the first deploy (Vercel will prompt you).

### 5. Set a hard spend limit (do this — it's the real safety net)
In the [Anthropic Console](https://console.anthropic.com), go to your
workspace or API key settings and set a monthly spend limit (even a small
one, like $5–10, is plenty for a class demo). This is the guarantee that
actually stops spending no matter what happens with traffic — everything
below is just a nicer way to fail before you ever hit it.

### 6. Add a daily request cap (recommended, gives a friendly message)
This app checks a request counter before each call and returns a graceful
"come back tomorrow" message once the daily cap is hit, instead of just
erroring once your spend limit kicks in.

1. In your Vercel project, go to the **Storage** tab → **Create Database** →
   choose **KV**. Connect it to this project — Vercel automatically adds the
   needed environment variables (`KV_REST_API_URL`, `KV_REST_API_TOKEN`, etc).
2. Optionally add one more environment variable to control the cap:

   | Name | Value |
   |---|---|
   | `DAILY_REQUEST_CAP` | e.g. `50` (defaults to 50 if not set) |

3. Redeploy. If you skip this step entirely, the app still works fine — it
   just relies solely on the spend limit from step 5 as its only cap.

### 7. Share the link
Vercel gives you a public URL like `pantry-print.vercel.app` — that's what
you send to classmates. They don't need any setup, an API key, or a GitHub
account to use it.

## Cost note

Every scan and every "print new recipe" click makes a real API call billed
to your Anthropic account. With the spend limit (step 5) and request cap
(step 6) in place, your real exposure is capped no matter how many people
try the link.
