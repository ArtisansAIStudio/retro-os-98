# Turning on the worldwide leaderboard

Without this the site still works: scores are saved on the visitor's own computer only.

> **Anti-cheat:** scores are verified by the server. Games request a signed run token when they start,
> and a score is only accepted with that token (one use). Snake and Minesweeper also send a replay of
> the player's inputs, which the server re-plays to recompute the score. The browser has no permission
> to write to the table. This needs the two Edge Functions below.

1. Create a free project at https://supabase.com (any region close to most of your visitors).
2. Open **SQL Editor > New query**, paste the contents of `supabase/schema.sql`, click **Run**.
3. Open **Project Settings > API**. Copy the **Project URL** and the **anon public** key.
4. Deploy the verification functions (needs the Supabase CLI: `brew install supabase/tap/supabase`):
   ```sh
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   supabase secrets set RUN_SECRET=$(openssl rand -hex 32)
   supabase functions deploy start-run submit-score
   ```
   After editing `js/sim.js` always run `cp js/sim.js supabase/functions/_shared/sim.js`, and `node test/sim.test.js` to re-check.
5. Paste the URL and anon key into `js/config.js`:
   ```js
   const CFG={supabaseUrl:'https://xxxx.supabase.co',anonKey:'eyJ...'};
   ```
6. Deploy the folder (Netlify, Vercel, GitHub Pages, Cloudflare Pages all work: it is plain static files).

The anon key is public by design. Visitors can only read scores. Every write goes through `submit-score`,
which checks the signed run token, replays or sanity-checks the run, rate-limits per IP (8 a minute,
150 a day) and rejects reused tokens.

What this stops: typing a fake score in the browser console, calling the database directly,
replaying one run many times, and impossible times or scores.
What it cannot stop: a person who writes a bot that plays the game properly. Replay checks make that
expensive; for Snake and Minesweeper the bot has to produce a legal, correctly timed game.
Turbo Rush, Maze Hunter, Block Drop and Book Cricket are checked by time and score limits only.
You can delete any row by hand in the Supabase dashboard.
