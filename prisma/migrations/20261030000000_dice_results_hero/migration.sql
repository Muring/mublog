begin;
-- Additive migration. Run with the database owner before deploying ranking portraits.
-- The game server stores the replay-verified class and only valid drawing ids; existing results stay blank.
alter table public.dice_results add column if not exists hero_class text
 check (hero_class is null or length(hero_class) between 1 and 32);
alter table public.dice_results add column if not exists hero_look jsonb
 check (hero_look is null or jsonb_typeof(hero_look) = 'object');
commit;
