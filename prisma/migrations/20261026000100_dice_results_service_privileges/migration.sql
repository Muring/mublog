-- Supabase default privileges may already grant ALL to service_role on new tables.
-- Revoke those defaults before granting the two operations used by the game API.
begin;
revoke all on public.dice_results from service_role;
grant select, insert on public.dice_results to service_role;
commit;
