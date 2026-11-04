begin;
-- Additive migration for muring-bulmeong account saves. Run with the database owner
-- before setting the game's Supabase env vars in production.
-- One row per account. The game's server API (service_role) is the only reader/writer;
-- account ownership is always supplied by the authenticated server, never the browser.
create table if not exists public.bulmeong_saves (
 user_id uuid primary key references auth.users(id) on delete cascade,
 data jsonb not null check (jsonb_typeof(data) = 'object' and pg_column_size(data) < 65536),
 updated_at timestamptz not null default now()
);
alter table public.bulmeong_saves enable row level security;
revoke all on public.bulmeong_saves from public, anon, authenticated;
-- Supabase default privileges may already grant ALL to service_role on new tables.
revoke all on public.bulmeong_saves from service_role;
-- Upsert (insert ... on conflict do update) needs SELECT, INSERT and UPDATE.
grant select, insert, update on public.bulmeong_saves to service_role;
commit;
notify pgrst, 'reload schema';
