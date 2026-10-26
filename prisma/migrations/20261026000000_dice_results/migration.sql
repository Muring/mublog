-- Apply to the existing mublog Supabase project after reviewing this migration.
-- No client policies: only the server's service_role may access this table.
begin;
create table public.dice_results (
 run_id uuid primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 rules_version text not null,
 difficulty text not null check (difficulty in ('easy','normal','hard','hell')),
 outcome text not null check (outcome in ('won','lost')),
 chapter integer not null check (chapter between 1 and 2),
 depth integer not null check (depth between 0 and 9),
 turns integer not null check (turns between 0 and 60000),
 hp integer not null check (hp between 0 and 44),
 relic_count integer not null check (relic_count >= 0),
 started_at timestamptz not null,
 finished_at timestamptz not null,
 replay_hash text not null check (length(replay_hash)=64)
);
alter table public.dice_results enable row level security;
revoke all on public.dice_results from public, anon, authenticated;
grant select, insert on public.dice_results to service_role;
create index dice_results_user_finished on public.dice_results(user_id,finished_at desc);
create index dice_results_difficulty_version on public.dice_results(difficulty,rules_version,outcome);
commit;
