-- Run this once in Supabase: SQL Editor > New query > paste > Run. Safe to re-run.
create table if not exists public.scores (
  id         bigint generated always as identity primary key,
  game       text    not null check (game in ('snake','drop','turbo','maze3d','mines-b','mines-i','mines-e','cricket')),
  name       text    not null check (char_length(name) between 1 and 12 and name ~ '^[A-Z0-9 _.-]+$'),
  country    char(2) not null check (country ~ '^[A-Z]{2}$'),
  score      integer not null check (score >= 0),
  daily      date,
  created_at timestamptz not null default now()
);
-- anti-cheat columns (added by the verified-score system)
alter table public.scores add column if not exists run_id  uuid unique;   -- one submission per signed run
alter table public.scores add column if not exists ip_hash text;          -- hashed IP, for rate limiting only
alter table public.scores drop constraint if exists sane_score;
alter table public.scores add constraint sane_score check (
     (game = 'snake'   and score between 1 and 222)
  or (game = 'drop'    and score between 1 and 999999)
  or (game = 'turbo'   and score between 49000 and 600000)   -- milliseconds, 3 laps
  or (game = 'maze3d'  and score between 15 and 3600)        -- seconds
  or (game like 'mines-%' and score between 1 and 999)       -- seconds
  or (game = 'cricket' and score between 1 and 72)           -- runs in 12 balls
);
create index if not exists scores_game_score_idx on public.scores (game, score);
create index if not exists scores_daily_idx      on public.scores (daily, game, score);
create index if not exists scores_recent_idx     on public.scores (created_at desc);
create index if not exists scores_ip_idx         on public.scores (ip_hash, created_at);

alter table public.scores enable row level security;
drop policy if exists "read scores"   on public.scores;
drop policy if exists "insert scores" on public.scores;
create policy "read scores" on public.scores for select using (true);
-- NO insert/update/delete policy for the public key: scores can only be written by the
-- submit-score Edge Function (service role), after it has verified the run.
-- Hide the verification columns from the public key:
revoke select on public.scores from anon, authenticated;
grant  select (id, game, name, country, score, daily, created_at) on public.scores to anon, authenticated;

-- explicit privileges (safe whether or not "grant API access to new tables automatically" is on)
revoke insert, update, delete, truncate on public.scores from anon, authenticated;
grant all on public.scores to service_role;
grant usage, select on all sequences in schema public to service_role;

-- login required to post (Google sign-in via Supabase Auth). Old anonymous scores keep verified = false.
alter table public.scores add column if not exists user_id  uuid references auth.users(id) on delete set null;
alter table public.scores add column if not exists verified boolean not null default false;
create index if not exists scores_user_idx on public.scores (user_id, created_at);
-- the public key may see "verified" but never the user id
revoke select on public.scores from anon, authenticated;
grant  select (id, game, name, country, score, daily, created_at, verified) on public.scores to anon, authenticated;
