begin;
-- Additive. Dice Dungeon boards show the hero name the player chose instead of the account name;
-- rows without it (older records) keep falling back to the account name.
alter table public.dice_results add column if not exists hero_name text
  check (hero_name is null or length(hero_name) between 1 and 40);
commit;
