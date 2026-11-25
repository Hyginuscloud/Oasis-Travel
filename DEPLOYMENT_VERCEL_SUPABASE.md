# Hosting on Vercel + Supabase PostgreSQL

Your Oasis Travel and Tourism Consultancy Dubai project is ready for deployment on **Vercel** using **Supabase** as the PostgreSQL backend.

## 1. Set Up Supabase PostgreSQL
1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** in your Supabase dashboard, paste the contents of `supabase/schema.sql`, and run it. *(You have already completed this step if SQL Editor succeeded!)*
3. Note: **Inside Google AI Studio**, the preview runs automatically on AI Studio's built-in Cloud SQL database—there is no Supabase key box in AI Studio's UI. Use the steps below when deploying your exported project to **Vercel** (or Railway / Render / local `.env`).

## 2. Connect Supabase to Vercel (2 Ways)
### Option A — 1-Click Vercel Supabase Integration (Easiest)
1. Push/deploy this project to **Vercel**.
2. In your Vercel project dashboard, go to **Integrations → Browse Marketplace → Supabase** and connect your Supabase project.
3. Vercel automatically injects `POSTGRES_URL` and `POSTGRES_HOST`—no manual copy-pasting needed.

### Option B — Manual Environment Variable
1. In Supabase, click the **Connect** button in the top header bar → select **Transaction Pooler** → copy the PostgreSQL URI (`postgresql://postgres.[REF]:[PASSWORD]@...pooler.supabase.com:6543/postgres`).
2. In **Vercel → Project Settings → Environment Variables** (or your local `.env`), add:
   - `SUPABASE_DB_URL` = *(your copied Transaction Pooler URI)*
   - `APP_URL` = `https://your-domain.vercel.app`
   - `ADMIN_PASSCODE` = *(your chosen primary admin password)*
   - `ADMIN_EMAILS` = `hyginustina46@gmail.com`

Optional SMTP settings for automatic enquiry email delivery to `Oasistravel46@gmail.com`:
- `SMTP_HOST`
- `SMTP_PORT` (`587`)
- `SMTP_SECURE` (`false`)
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `ENQUIRY_RECIPIENT_EMAIL` (`Oasistravel46@gmail.com`)

## 3. Authorize Your Vercel Domain for Admin Google Sign-In
Because `/admin` uses Firebase Google Sign-In:
1. Open the Firebase Console for project `utility-passage-7bvhw` -> **Authentication -> Settings -> Authorized domains**.
2. Add your `*.vercel.app` domain and custom domain (e.g. `oasistraveldubai.com`).

## 4. Media Uploads on Vercel
Vercel serverless functions have an ephemeral filesystem. In `/admin` -> **Media Gallery**, upload photos to a public **Supabase Storage** bucket and paste the public HTTPS image URL into the Media Gallery URL field so images persist across deployments.

## 5. Deploy
Connect your repository to Vercel or run `vercel --prod`. `vercel.json` automatically builds the Vite frontend into `dist/` and routes `/api/*`, `/sitemap.xml`, and `/robots.txt` through `api/index.ts`.
