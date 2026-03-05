# Markd — Smart Bookmark Manager

A private bookmark manager with real-time sync, built with Next.js 14, Supabase, and Tailwind CSS.

**Live Demo**: *(Add your Vercel URL here after deployment)*  
**Tech Stack**: Next.js 14 (App Router) · Supabase (Auth + DB + Realtime) · Tailwind CSS

---

## Features

- Google OAuth login (no passwords)
- Add and delete bookmarks (URL + title)
- Bookmarks are private — users only see their own
- Real-time sync across tabs without page refresh
- Deployed on Vercel

---

## Local Development Setup

### Prerequisites
- Node.js 18+
- A Supabase account (free): https://supabase.com
- A Google Cloud Console project (for OAuth)

---

### Step 1 — Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/smart-bookmark-app
cd smart-bookmark-app
npm install
```

---

### Step 2 — Create a Supabase project

1. Go to https://app.supabase.com and create a new project
2. Wait for it to provision (~1 minute)
3. Go to **Project Settings → API**
4. Copy:
   - **Project URL** → this is your `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

### Step 3 — Set up the database

1. In Supabase, go to **SQL Editor → New Query**
2. Paste the contents of `SUPABASE_SETUP.sql`
3. Click **Run**

This creates the `bookmarks` table, Row Level Security policies, and enables Realtime.

---

### Step 4 — Set up Google OAuth

1. Go to https://console.cloud.google.com
2. Create a new project (or use an existing one)
3. Go to **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
4. Application type: **Web application**
5. Under **Authorised redirect URIs**, add:
   ```
   https://YOUR-PROJECT-ID.supabase.co/auth/v1/callback
   ```
   *(Replace YOUR-PROJECT-ID with your actual Supabase project ID)*
6. Copy the **Client ID** and **Client Secret**

Now in Supabase:
1. Go to **Authentication → Providers → Google**
2. Toggle **Enable**
3. Paste your Google **Client ID** and **Client Secret**
4. Save

---

### Step 5 — Create your .env.local file

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill in your values:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

---

### Step 6 — Run the app

```bash
npm run dev
```

Visit http://localhost:3000

---

## Deploying to Vercel

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/smart-bookmark-app.git
git push -u origin main
```

### Step 2 — Deploy on Vercel

1. Go to https://vercel.com and sign in
2. Click **Add New Project**
3. Import your GitHub repository
4. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click **Deploy**

### Step 3 — Update OAuth redirect URI

After Vercel gives you a URL (e.g. `https://smart-bookmark-app.vercel.app`):

1. Go back to Google Cloud Console → your OAuth client
2. Add to **Authorised redirect URIs**:
   ```
   https://YOUR-PROJECT-ID.supabase.co/auth/v1/callback
   ```
   *(This was already added — no change needed if using the Supabase callback URL)*

3. In Supabase → **Authentication → URL Configuration**, add your Vercel URL:
   - **Site URL**: `https://your-app.vercel.app`
   - **Redirect URLs**: `https://your-app.vercel.app/**`

---

## Problems Encountered & How I Solved Them

### 1. Session not persisting after OAuth redirect
**Problem**: After Google login, the user was redirected back but appeared logged out.  
**Solution**: The `@supabase/ssr` package requires a callback route (`/auth/callback/route.ts`) that exchanges the OAuth code for a session. Without this, the session cookie is never set.

### 2. Real-time not receiving events
**Problem**: The Supabase Realtime subscription wasn't firing.  
**Solution**: Two things were needed: (1) The `bookmarks` table needed to be added to the `supabase_realtime` publication via SQL, and (2) the filter `user_id=eq.${user.id}` had to exactly match the column name in the table.

### 3. Duplicate bookmarks appearing on add
**Problem**: When a bookmark was added, it appeared twice — once from the API response and once from the real-time event.  
**Solution**: Removed the manual `setBookmarks` call after `POST /api/bookmarks`. The real-time subscription now handles all state updates, so we only need to call the API and let the subscription react.

### 4. Cookies not working in Server Components
**Problem**: `cookies()` in Next.js 14 became async and required `await`.  
**Solution**: Updated `lib/supabase/server.ts` to use `await cookies()` and made the `createClient` function async.

### 5. Row Level Security blocking reads
**Problem**: After enabling RLS, the bookmarks table returned 0 rows even for authenticated users.  
**Solution**: RLS disables ALL access by default. Explicit SELECT, INSERT, and DELETE policies had to be created using `auth.uid() = user_id` to allow each user to access only their own rows.

---

## Project Structure

```
smart-bookmark-app/
├── app/
│   ├── layout.tsx              # Root HTML shell, font loading
│   ├── page.tsx                # Home page (Server Component — checks auth)
│   ├── globals.css             # Global styles and CSS variables
│   ├── auth/callback/
│   │   └── route.ts            # OAuth callback — exchanges code for session
│   └── api/bookmarks/
│       └── route.ts            # REST API: POST (create) and DELETE bookmark
├── components/
│   ├── LoginPage.tsx           # Login screen with Google button
│   ├── Dashboard.tsx           # Main app shell, real-time subscription
│   ├── AddBookmarkForm.tsx     # Form to add a new bookmark
│   └── BookmarkList.tsx        # List of bookmarks with delete
├── lib/
│   └── supabase/
│       ├── client.ts           # Browser-side Supabase client
│       └── server.ts           # Server-side Supabase client (reads cookies)
├── middleware.ts               # Refreshes auth session on every request
├── SUPABASE_SETUP.sql          # Run this in Supabase SQL Editor
├── .env.local.example          # Template for environment variables
└── README.md                   # This file
```
