# How to put this website on the internet (for free)

This guide walks you through getting the American Space Oujda site live on a real public URL using **Cloudflare Pages** (hosting) + **Turso** (database). Both are free.

**Total time:** ~30 minutes
**Total cost:** $0
**You will need:** an email address, a GitHub account, and a web browser

---

## Why two services?

Your website has two parts:
1. **The code** (Next.js app) → goes on Cloudflare Pages
2. **The data** (members, applications, courses, logins) → goes on Turso

Both are free. Both are made for projects exactly like yours. You'll create one account on each.

---

## STEP 1 — Create a GitHub account (5 min)

GitHub is where your code lives. Cloudflare will pull from here every time you change something.

1. Go to https://github.com/signup
2. Create a free account with your email
3. Verify your email

(If you already have a GitHub account, skip this step.)

---

## STEP 2 — Create a Turso account and database (5 min)

Turso hosts your database (members, applications, login info, etc.).

1. Go to https://turso.tech → click "Sign up" → "Sign up with GitHub" (uses your GitHub account from Step 1)
2. After signing in, click **"New database"**
3. Name it: `american-space-oujda`
4. Click **"Create"**
5. You'll see a screen with your database details. You need **two values** from here:
   - **URL** — looks like `libsql://american-space-oujda-yourname.turso.io`
   - **Auth token** — click "Create auth token" if not shown, then copy it

⚠️ **Save both of these somewhere safe.** You'll need them in Steps 5 and 6. Don't share them publicly — the token is like a password for your database.

---

## STEP 3 — Install the Turso CLI and create the database tables (5 min)

Your database is empty right now. We need to create the tables (users, events, applications, etc.).

Open **Terminal** (Mac) or **Command Prompt** (Windows) on your computer and run:

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Log in (will open a browser)
turso auth login

# Push your database schema to Turso
# (run this from inside your project folder after cloning it from GitHub)
turso db shell american-space-oujda
```

Inside the Turso shell, paste the entire contents of `prisma/schema.sql` (you'll generate this in step 5 below — for now just type `.exit` to leave).

> **Easier alternative:** if you have this project running locally with `bun install`, you can just run:
> ```bash
> DATABASE_URL="libsql://american-space-oujda-YOURNAME.turso.io" \
> DATABASE_AUTH_TOKEN="YOUR_TOKEN" \
> bunx prisma db push
> ```
> This pushes all your tables automatically.

---

## STEP 4 — Push your code to GitHub (5 min)

You need to upload your project's code to GitHub so Cloudflare can find it.

### If you have the project files on your computer:

1. Go to https://github.com/new
2. Repository name: `american-space-oujda`
3. Set to **Private** (recommended — keeps your code private)
4. Don't initialize with README
5. Click **"Create repository"**
6. GitHub will show you commands. Open Terminal/Command Prompt in your project folder and run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/american-space-oujda.git
   git push -u origin main
   ```

Replace `YOUR_USERNAME` with your actual GitHub username.

---

## STEP 5 — Set up Cloudflare Pages (5 min)

1. Go to https://dash.cloudflare.com/sign-up → create a free account
2. From the Cloudflare dashboard, click **"Workers & Pages"** in the left sidebar
3. Click **"Create application"** → **"Pages"** tab → **"Connect to Git"**
4. Connect your GitHub account (Cloudflare will ask permission — allow it)
5. Select your `american-space-oujda` repository
6. **Build settings** (important — fill these in exactly):
   - **Project name:** `american-space-oujda`
   - **Production branch:** `main`
   - **Framework preset:** Next.js
   - **Build command:** `npx @cloudflare/next-on-pages`
   - **Build output directory:** `.vercel/output/static`
   - **Root directory:** (leave blank)
7. Expand **"Environment variables (advanced)"** and add these 4:

| Variable name | Value |
|---|---|
| `DATABASE_URL` | `libsql://american-space-oujda-YOURNAME.turso.io` (from Step 2) |
| `DATABASE_AUTH_TOKEN` | your Turso auth token (from Step 2) |
| `NEXTAUTH_URL` | `https://american-space-oujda.pages.dev` (your future URL — replace with project name Cloudflare assigns) |
| `NEXTAUTH_SECRET` | generate one at https://generate-secret.now.sh/32, paste the result |

8. Click **"Save and Deploy"**

Cloudflare will now build your site. This takes 3–5 minutes. Watch the build log — when it says "Deployment complete", you're live!

---

## STEP 6 — Seed your production database (3 min)

Your database tables exist but are empty. Let's fill them with the demo admin/teacher accounts and sample content.

In your project folder on your computer:

```bash
DATABASE_URL="libsql://american-space-oujda-YOURNAME.turso.io" \
DATABASE_AUTH_TOKEN="YOUR_TOKEN" \
bun run scripts/seed-turso.ts
```

This creates:
- 3 demo users (admin, teacher, editor — see credentials below)
- 3 sample courses with 5 students each
- 8 site settings (contact info, hours, hero text)
- 5 sample events
- 6 sample gallery images

---

## STEP 7 — Verify your live site (2 min)

1. Visit your Cloudflare URL: `https://american-space-oujda.pages.dev`
2. The home page should load — explore it
3. Go to `https://american-space-oujda.pages.dev/#/login`
4. Sign in with: `admin@asoujda.ma` / `admin123`
5. You should see the admin dashboard
6. ⚠️ **CHANGE THE ADMIN PASSWORD IMMEDIATELY**:
   - Go to "Users" tab
   - Click on the admin user
   - Set a new password and click Save

---

## STEP 8 — Connect your custom domain (optional, ~10 min)

If you want a custom URL like `americanspace-oujda.ma` instead of `american-space-oujda.pages.dev`:

1. Buy a domain from any registrar (Namecheap, GoDaddy, etc.) — ~$10/year for `.ma` domains
2. In Cloudflare Pages: Settings → Custom domains → "Set up a custom domain"
3. Enter your domain → Cloudflare will give you DNS records to add
4. Add those DNS records at your domain registrar
5. Wait 10–30 minutes for DNS to propagate
6. Update your `NEXTAUTH_URL` env var in Cloudflare Pages to your new domain
7. Trigger a redeploy

---

## STEP 9 — Migrate from Google Sites

1. Update your old Google Site to redirect visitors: add a big banner at the top that says "We've moved! Visit us at [your new URL]"
2. Update your social media bios, business cards, and the embassy website to point to the new URL
3. Wait 2–3 months for traffic to migrate
4. Then delete the old Google Site

---

## Troubleshooting

### "Build failed" on Cloudflare
- Check that all 4 environment variables are set correctly
- Check the build log for specific errors
- Make sure `DATABASE_URL` starts with `libsql://` (not `file:`)

### Site loads but login doesn't work
- Verify `NEXTAUTH_URL` matches your Cloudflare URL exactly (including `https://`)
- Verify `NEXTAUTH_SECRET` is set
- Clear your browser cookies and try again

### "Cannot read properties of undefined" errors
- Your Turso database tables are missing. Run Step 3 again to push the schema.

### Login works but no data shows
- You forgot Step 6 (seed). Run the seed script against your Turso DB.

### Want to make changes to the live site?
- Edit code on your computer
- `git add . && git commit -m "your change" && git push`
- Cloudflare auto-rebuilds within a minute

---

## Quick reference — accounts you'll have

| Service | URL | Free tier | What it does |
|---|---|---|---|
| GitHub | github.com | Unlimited free repos | Stores your code |
| Turso | turso.tech | 500 databases, 9GB each | Hosts your database |
| Cloudflare Pages | pages.cloudflare.com | Unlimited sites, 500 builds/month | Hosts your website |

**Demo login credentials** (CHANGE THESE IMMEDIATELY after going live):
- Admin: `admin@asoujda.ma` / `admin123`
- Teacher: `sarah.benali@asoujda.ma` / `teacher123`
- Editor: `editor@asoujda.ma` / `editor123`

---

## Need help?

- Cloudflare Pages docs: https://developers.cloudflare.com/pages/
- Turso docs: https://docs.turso.tech/
- Next.js on Cloudflare: https://github.com/cloudflare/next-on-pages

If you get stuck, copy the error message and ask for help — most issues are 1-line fixes.
