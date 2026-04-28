# ThoughtTap

A small Next.js web app for long-distance couples. Two people pair with an invite link and each person gets 5 meaningful taps per rolling 24 hours.

## Features

- Email/password auth with Supabase
- Private couple invite links
- One main ThoughtTap button
- 5 taps per user per rolling 24 hours
- Realtime in-app updates
- Optional browser notifications while the app is open
- Recent tap history

## Tech stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth, Database, Realtime
- Vercel hosting

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create a Supabase project.

3. In Supabase, open **SQL Editor** and run:

```sql
-- paste the contents of supabase/schema.sql
```

4. Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

5. Add your Supabase values:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

6. Run the app:

```bash
npm run dev
```

Open http://localhost:3000.

## Deploy to Vercel

1. Push this folder to GitHub.
2. Import the GitHub repo in Vercel.
3. Add the same environment variables in Vercel Project Settings.
4. Deploy.

## Supabase auth settings

In Supabase, set your site URL:

- Local: `http://localhost:3000`
- Production: your Vercel URL

For easier testing, you can temporarily disable email confirmations in Supabase Auth settings.

## Note about notifications

This MVP supports realtime updates and browser notifications while the app is open. True background push notifications require adding a service worker and storing push subscriptions. That can be added as the next version.
