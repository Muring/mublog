begin;
-- Additive migration. Run with the database owner before deploying achievement APIs.
-- Account ownership is always supplied by the authenticated server, never the browser.
create table if not exists public.dice_achievements (
 user_id uuid not null references auth.users(id) on delete cascade,
 achievement_id text not null,
 earned_at timestamptz not null default now(),
 rules_version text not null,
 condition_version integer not null,
 run_id uuid not null,
 primary key(user_id, achievement_id)
);
create table if not exists public.dice_achievement_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 selected_title text,
 full_kit integer not null default 0 check(full_kit between 0 and 7)
);
alter table public.dice_achievements enable row level security;
alter table public.dice_achievement_profiles enable row level security;
revoke all on public.dice_achievements, public.dice_achievement_profiles from public, anon, authenticated;
grant all on public.dice_achievements, public.dice_achievement_profiles to service_role;
-- Immutable title snapshot for rankings; existing results remain untitled.
alter table public.dice_results add column if not exists achievement_title text;
create or replace function public.dice_award_achievements(p_user uuid,p_ids text[],p_full_kit integer,p_rules text,p_version integer,p_run uuid,p_earned_at timestamptz)
returns void language plpgsql security definer set search_path=public as $$
begin
 insert into dice_achievement_profiles(user_id,full_kit) values(p_user,least(7,greatest(0,p_full_kit)))
 on conflict(user_id) do update set full_kit=greatest(dice_achievement_profiles.full_kit,excluded.full_kit);
 -- Serialize each account's awards, including the five-class aggregate.
 perform 1 from dice_achievement_profiles where user_id=p_user for update;
 insert into dice_achievements(user_id,achievement_id,earned_at,rules_version,condition_version,run_id)
 select p_user,id,p_earned_at,p_rules,p_version,p_run from unnest(p_ids) id
 on conflict(user_id,achievement_id) do nothing;
 if (select count(*) from dice_achievements where user_id=p_user and achievement_id in ('class-traveler','class-knight','class-mage','class-rogue','class-warrior'))=5 then
  insert into dice_achievements values(p_user,'all-classes',p_earned_at,p_rules,p_version,p_run)
  on conflict(user_id,achievement_id) do nothing;
 end if;
end $$;
revoke all on function public.dice_award_achievements(uuid,text[],integer,text,integer,uuid,timestamptz) from public,anon,authenticated;
grant execute on function public.dice_award_achievements(uuid,text[],integer,text,integer,uuid,timestamptz) to service_role;

commit;
