-- 계정 통합(20261104120000_account_unification)을 걷어내고 로그인 사용자별 소유로 되돌린다.
-- 병합 이력이 없을 때만 적용한다. 세 앱이 계정 RPC를 더 이상 부르지 않는 버전으로 배포된 뒤 적용한다.
begin;

do $$ begin
 if exists (select 1 from public.account_memberships where auth_user_id <> profile_id)
    or exists (select 1 from public.account_merge_audit) then
  raise exception 'account merges exist; removing unification would split merged users';
 end if;
end $$;

do $$ declare t text; begin
 foreach t in array array['posts','comments','post_likes','comment_likes','dice_results','dice_achievements','dice_achievement_profiles','bulmeong_saves','bulmeong_record_totals','bulmeong_record_batches'] loop
  execute format('drop trigger if exists account_owner_redirect on public.%I', t);
  execute format('drop trigger if exists account_write_fence on public.%I', t);
 end loop;
end $$;
drop trigger if exists account_deleted_by_redirect on public.comments;
drop trigger if exists account_created on public.profiles;

drop function if exists public.account_connection(text, uuid, text, text, uuid, text, jsonb);
drop function if exists public.account_context(uuid);
drop function if exists public.account_leaderboard_profiles(uuid[]);
drop function if exists public.account_merge_snapshot(uuid);
drop function if exists public.account_record_snapshot(uuid);
drop function if exists public.account_save(uuid, integer, jsonb);
drop function if exists public.account_id(uuid);
drop function if exists public.account_created();
drop function if exists public.account_owner_redirect();
drop function if exists public.account_write_fence();

drop table if exists public.account_merge_audit;
drop table if exists public.account_connections;
drop table if exists public.account_memberships;

alter table public.profiles drop column if exists primary_email, drop column if exists account_version;

commit;
