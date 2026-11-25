// Leaderboard backend. Leave both empty to run in local-only mode (scores stay on this computer).
// To go global: create a free Supabase project, run supabase/schema.sql, then paste the
// Project URL and the "anon public" key here. See SETUP-LEADERBOARD.md.
// The anon key is meant to be public; the table's Row Level Security limits what it can do.
const CFG={supabaseUrl:'',anonKey:''};
