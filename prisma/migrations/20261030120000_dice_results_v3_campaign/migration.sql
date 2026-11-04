begin;
-- Already applied to production on 2026-10-30; written to be safely re-runnable.
-- Dice Dungeon v2/v3 runs finish on chapter 3-5 at depth 10 (11 nodes per chapter) and can end
-- above 44 HP, so the original chapter 1-2, depth 0-9 and hp 0-44 checks rejected every clear.
-- starting_relic stores the optional starter relic id shown next to a leaderboard name.
alter table public.dice_results add column if not exists starting_relic text;
alter table public.dice_results drop constraint if exists dice_results_chapter_check;
alter table public.dice_results add constraint dice_results_chapter_check
  check (chapter between 1 and 5);
alter table public.dice_results drop constraint if exists dice_results_depth_check;
alter table public.dice_results add constraint dice_results_depth_check
  check (depth between 0 and 10);
alter table public.dice_results drop constraint if exists dice_results_hp_check;
alter table public.dice_results add constraint dice_results_hp_check
  check (hp between 0 and 999);
commit;
