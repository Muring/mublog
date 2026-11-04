-- Additive, private account linking. Enable UI only after all three apps are compatible.
begin;
alter table public.profiles add column primary_email text, add column account_version integer not null default 0;
update public.profiles p set primary_email=u.email from auth.users u where u.id=p.id;
create table public.account_memberships (
 auth_user_id uuid primary key references auth.users(id) on delete restrict,
 profile_id uuid not null references public.profiles(id) on delete restrict
);
create index account_memberships_profile on public.account_memberships(profile_id);
insert into public.account_memberships select id,id from public.profiles;
create table public.account_connections (
 id uuid primary key, initiator uuid not null references auth.users(id),
 session_id text not null, origin text not null, provider text not null check(provider in ('github','google')),
 binding text not null, target uuid references auth.users(id),
 expires_at timestamptz not null default now()+interval '10 minutes',
 fingerprint text, completed_at timestamptz, result_profile uuid,
 check(length(binding)=64)
);
create index account_connections_expiry on public.account_connections(expires_at);
create index account_connections_initiator on public.account_connections(initiator,expires_at);
create table public.account_merge_audit (
 operation_id uuid primary key, profile_id uuid not null, source_profile_id uuid not null,
 completed_at timestamptz not null default now(), save_choice text
);
alter table public.account_memberships enable row level security;
alter table public.account_connections enable row level security;
alter table public.account_merge_audit enable row level security;
revoke all on public.account_memberships,public.account_connections,public.account_merge_audit from public,anon,authenticated;
grant select,insert,update,delete on public.account_memberships,public.account_connections,public.account_merge_audit to service_role;

create function public.account_created() returns trigger language plpgsql security definer set search_path=pg_catalog,public as $$
begin
 insert into public.account_memberships values(new.id,new.id);
 update public.profiles set primary_email=(select email from auth.users where id=new.id) where id=new.id;
 return new;
end $$;
create trigger account_created after insert on public.profiles for each row execute function public.account_created();

create function public.account_id(p_auth uuid) returns uuid language sql stable security definer set search_path=pg_catalog,public as $$
 select profile_id from public.account_memberships where auth_user_id=p_auth
$$;
create function public.account_context(p_auth uuid) returns jsonb language sql stable security definer set search_path=pg_catalog,public as $$
 select jsonb_build_object('id',p.id,'name',p.username,'avatar',p.avatar_url,'email',p.primary_email,'version',p.account_version,
 'members',(select jsonb_agg(auth_user_id order by auth_user_id) from public.account_memberships where profile_id=p.id),
 'providers',coalesce((select jsonb_agg(jsonb_build_object('provider',i.provider,'email',i.identity_data->>'email') order by i.provider)
 from auth.identities i join public.account_memberships m on m.auth_user_id=i.user_id where m.profile_id=p.id and i.provider in ('google','github')),'[]'::jsonb))
 from public.profiles p where p.id=public.account_id(p_auth)
$$;
create function public.account_leaderboard_profiles(p_ids uuid[]) returns table(id uuid,name text,email text,provider text)
language sql stable security definer set search_path=pg_catalog,public as $$
 select p.id,p.username,p.primary_email,
 (select case when count(distinct i.provider)=1 then min(i.provider) else null end from auth.identities i join public.account_memberships m on m.auth_user_id=i.user_id where m.profile_id=p.id)
 from public.profiles p where p.id=any(p_ids)
$$;
-- Normal writes share a fence; only merges take its exclusive counterpart.
-- A global fence avoids cross-account deadlocks while ordinary writes remain concurrent.
create function public.account_write_fence() returns trigger language plpgsql security definer set search_path=pg_catalog,public as $$
begin perform pg_advisory_xact_lock_shared(1760412,1); return null; end $$;
create function public.account_owner_redirect() returns trigger language plpgsql security definer set search_path=pg_catalog,public as $$
declare original uuid; canonical uuid;
begin
 original := (to_jsonb(new)->>TG_ARGV[0])::uuid;
 if original is not null then
  canonical := public.account_id(original);
  if canonical is null then raise exception 'account_missing'; end if;
  new := jsonb_populate_record(new,jsonb_build_object(TG_ARGV[0],canonical));
 end if;
 return new;
end $$;
do $$ declare t text; col text; begin
 foreach t in array array['posts','comments','post_likes','comment_likes','dice_results','dice_achievements','dice_achievement_profiles','bulmeong_saves','bulmeong_record_totals','bulmeong_record_batches'] loop
  if to_regclass('public.'||t) is null then continue; end if;
  execute format('create trigger account_write_fence before insert or update or delete on public.%I for each statement execute function public.account_write_fence()',t);
  col := case when t in ('posts','comments') then 'author_id' else 'user_id' end;
  execute format('create trigger account_owner_redirect before insert or update on public.%I for each row execute function public.account_owner_redirect(%L)',t,col);
 end loop;
 create trigger account_deleted_by_redirect before insert or update on public.comments for each row execute function public.account_owner_redirect('deleted_by');
end $$;

-- Support the versioned personal-record schema; unknown layouts fail closed.
create function public.account_record_snapshot(p_profile uuid) returns jsonb language plpgsql stable security definer set search_path=pg_catalog,public as $$
declare totals jsonb; batches jsonb; cols text[];
begin
 if to_regclass('public.bulmeong_record_totals') is null and to_regclass('public.bulmeong_record_batches') is null then return 'null'; end if;
 if to_regclass('public.bulmeong_record_totals') is null or to_regclass('public.bulmeong_record_batches') is null then raise exception 'record_schema_requires_upgrade'; end if;
 select array_agg(attname::text order by attname) into cols from pg_attribute where attrelid='public.bulmeong_record_totals'::regclass and attnum>0 and not attisdropped;
 if cols<>array['legacy','totals','updated_at','user_id'] then raise exception 'record_schema_requires_upgrade'; end if;
 select array_agg(attname::text order by attname) into cols from pg_attribute where attrelid='public.bulmeong_record_batches'::regclass and attnum>0 and not attisdropped;
 if cols<>array['batch_id','counts','user_id'] then raise exception 'record_schema_requires_upgrade'; end if;
 execute 'select to_jsonb(t) from public.bulmeong_record_totals t where user_id=$1' into totals using p_profile;
 execute $query$select jsonb_build_object('count',count(*),'hash',md5(coalesce(string_agg(batch_id::text||counts::text,'' order by batch_id),''))) from public.bulmeong_record_batches where user_id=$1$query$ into batches using p_profile;
 return jsonb_build_object('totals',totals,'batches',batches);
end $$;
-- Snapshot includes whole saves (returned only as summaries), permissions and visible ownership counts.
create function public.account_merge_snapshot(p_auth uuid) returns jsonb language sql stable security definer set search_path=pg_catalog,public as $$
 select jsonb_build_object('profile',to_jsonb(p),'members',public.account_context(p_auth)->'members',
 'providers',public.account_context(p_auth)->'providers','records',public.account_record_snapshot(p.id),
 'save',(select to_jsonb(s) from public.bulmeong_saves s where s.user_id=p.id),
 'posts',(select count(*) from public.posts where author_id=p.id),
 'comments',(select count(*) from public.comments where author_id=p.id),
 'likes',(select count(*) from public.post_likes where user_id=p.id)+(select count(*) from public.comment_likes where user_id=p.id),
 'runs',(select count(*) from public.dice_results where user_id=p.id),
 'achievements',(select coalesce(jsonb_agg(to_jsonb(a) order by achievement_id),'[]') from public.dice_achievements a where user_id=p.id),
 'achievementProfile',(select to_jsonb(a) from public.dice_achievement_profiles a where user_id=p.id))
 from public.profiles p where p.id=public.account_id(p_auth)
$$;
create function public.account_connection(p_action text,p_auth uuid,p_session text,p_origin text,p_id uuid,p_binding text,p_payload jsonb default '{}')
returns jsonb language plpgsql security definer set search_path=pg_catalog,public set lock_timeout='5s' as $$
declare op public.account_connections; a uuid; b uuid; sa jsonb; sb jsonb; v_fingerprint text; choice text; selected jsonb; verified_target uuid; v_provider text; tier text;
begin
 -- GET status lives in account_context; all operations here are trusted-server-only.
 if p_action='start' then
  delete from public.account_connections where expires_at<now();
  if public.account_id(p_auth) is null then raise exception 'account_missing'; end if;
  v_provider:=p_payload->>'provider';
  if v_provider not in ('google','github') or v_provider is null then raise exception 'invalid_provider'; end if;
  if exists(select 1 from auth.identities i join public.account_memberships m on m.auth_user_id=i.user_id where m.profile_id=public.account_id(p_auth) and i.provider=v_provider) then raise exception 'provider_connected'; end if;
  if (select count(*) from public.account_connections where initiator=p_auth and expires_at>now() and completed_at is null)>=5 then raise exception 'too_many_attempts'; end if;
  insert into public.account_connections(id,initiator,session_id,origin,provider,binding) values(p_id,p_auth,p_session,p_origin,v_provider,p_binding);
  return jsonb_build_object('id',p_id);
 end if;
 -- Acquire before locking the operation: retries cannot deadlock an exclusive merge.
 if p_action='confirm' then perform pg_advisory_xact_lock(1760412,1); else perform pg_advisory_xact_lock_shared(1760412,1); end if;
 select * into op from public.account_connections where id=p_id for update;
 if op.id is null or op.initiator<>p_auth or op.session_id<>p_session or op.origin<>p_origin or op.binding<>p_binding or op.expires_at<now() then raise exception 'connection_expired'; end if;
 if op.completed_at is not null then return jsonb_build_object('complete',true,'profileId',op.result_profile); end if;
 if p_action='cancel' then delete from public.account_connections where id=p_id; return '{"cancelled":true}'; end if;
 if p_action='prove' then
  if op.target is not null then raise exception 'proof_already_used'; end if;
  verified_target:=(p_payload->>'target')::uuid;
  if not exists(select 1 from auth.identities where user_id=verified_target and auth.identities.provider=op.provider) then raise exception 'invalid_provider'; end if;
  update public.account_connections set target=verified_target where id=p_id;
  return '{"verified":true}';
 end if;
 if op.target is null then raise exception 'second_login_required'; end if;
 a:=public.account_id(p_auth); b:=public.account_id(op.target);
 if a is null or b is null then raise exception 'account_missing'; end if;
 if p_action='confirm' then
  perform u.id from auth.users u join public.account_memberships m on m.auth_user_id=u.id where m.profile_id in(a,b) order by u.id for update of u;
 end if;
 if a=b then
  update public.account_connections set completed_at=now(),result_profile=a where id=p_id;
  return jsonb_build_object('complete',true,'profileId',a);
 end if;
 if exists(select i.provider from auth.identities i join public.account_memberships m on m.auth_user_id=i.user_id where m.profile_id in (a,b) group by i.provider having count(*)>1) then raise exception 'provider_conflict'; end if;
 if exists(select 1 from auth.identities i join public.account_memberships m on m.auth_user_id=i.user_id where m.profile_id in (a,b) and i.provider not in ('google','github')) then raise exception 'unsupported_provider'; end if;
 if (select role::text from public.profiles where id=b)='ADMIN' and (select role::text from public.profiles where id=a)<>'ADMIN' then raise exception 'start_as_admin'; end if;

 sa:=public.account_merge_snapshot(p_auth); sb:=public.account_merge_snapshot(op.target);
 v_fingerprint:=md5(sa::text||sb::text);
 if p_action='preview' then
  update public.account_connections set fingerprint=v_fingerprint where id=p_id;
  return jsonb_build_object('id',p_id,'fingerprint',v_fingerprint,'primary',public.account_context(p_auth),'secondary',public.account_context(op.target),
   'counts',jsonb_build_object('posts',sb->'posts','comments',sb->'comments','likes',sb->'likes','runs',sb->'runs','achievements',jsonb_array_length(sb->'achievements')),
   'saves',jsonb_build_object('primary',case when sa->'save'='null'::jsonb then null else jsonb_build_object('shelter',sa#>'{save,data,shelter}','charcoal',sa#>'{save,data,charcoal}','playSeconds',sa#>'{save,data,playSeconds}','updatedAt',sa#>'{save,updated_at}') end,
    'secondary',case when sb->'save'='null'::jsonb then null else jsonb_build_object('shelter',sb#>'{save,data,shelter}','charcoal',sb#>'{save,data,charcoal}','playSeconds',sb#>'{save,data,playSeconds}','updatedAt',sb#>'{save,updated_at}') end));
 end if;
 if p_action<>'confirm' then raise exception 'invalid_action'; end if;
 if op.fingerprint is distinct from v_fingerprint or p_payload->>'fingerprint' is distinct from v_fingerprint then raise exception 'preview_changed'; end if;
 choice:=p_payload->>'saveChoice';
 if sa->'save'<>'null'::jsonb and sb->'save'<>'null'::jsonb and (choice is null or choice not in ('primary','secondary')) then raise exception 'save_choice_required'; end if;
 if sa->'save'='null'::jsonb then choice:='secondary'; elsif sb->'save'='null'::jsonb then choice:='primary'; end if;
 selected:=case when choice='secondary' then sb->'save' else sa->'save' end;
 -- Memberships still point at the original owners throughout the data transfer.
 update public.posts set author_id=a where author_id=b;
 update public.comments set author_id=a where author_id=b;
 update public.comments set deleted_by=a where deleted_by=b;
 insert into public.post_likes select post_id,a from public.post_likes where user_id=b on conflict do nothing;
 delete from public.post_likes where user_id=b;
 insert into public.comment_likes select comment_id,a from public.comment_likes where user_id=b on conflict do nothing;
 delete from public.comment_likes where user_id=b;
 update public.dice_results set user_id=a where user_id=b;
 insert into public.dice_achievements(user_id,achievement_id,earned_at,rules_version,condition_version,run_id)
 select a,achievement_id,earned_at,rules_version,condition_version,run_id from public.dice_achievements where user_id=b
 on conflict(user_id,achievement_id) do update set earned_at=excluded.earned_at,rules_version=excluded.rules_version,condition_version=excluded.condition_version,run_id=excluded.run_id
 where excluded.earned_at<dice_achievements.earned_at;
 delete from public.dice_achievements where user_id=b;
 insert into public.dice_achievement_profiles(user_id,full_kit) select a,full_kit from public.dice_achievement_profiles where user_id=b
 on conflict(user_id) do update set full_kit=greatest(dice_achievement_profiles.full_kit,excluded.full_kit);
 delete from public.dice_achievement_profiles where user_id=b;
 -- Recompute cross-run class aggregates from the union of verified achievements.
 if (select count(*) from public.dice_achievements where user_id=a and achievement_id in ('class-traveler','class-knight','class-mage','class-rogue','class-warrior'))=5 then
  insert into public.dice_achievements select a,'all-classes',max(earned_at),'account-merge',1,p_id from public.dice_achievements where user_id=a on conflict do nothing;
 end if;
 foreach tier in array array['hard','hell'] loop
  if (select count(*) from public.dice_achievements where user_id=a and achievement_id=any(array[tier||'-class-traveler',tier||'-class-knight',tier||'-class-mage',tier||'-class-rogue',tier||'-class-warrior']))=5 then
   insert into public.dice_achievements select a,tier||'-all-classes',max(earned_at),'account-merge',1,p_id from public.dice_achievements where user_id=a on conflict do nothing;
  end if;
 end loop;
 if to_regclass('public.bulmeong_record_totals') is not null then
  if choice='secondary' then
   execute 'delete from public.bulmeong_record_totals where user_id=$1' using a;
   execute 'insert into public.bulmeong_record_totals(user_id,totals,legacy,updated_at) select $1,totals,legacy,updated_at from public.bulmeong_record_totals where user_id=$2' using a,b;
   execute 'insert into public.bulmeong_record_batches(user_id,batch_id,counts) select $1,batch_id,counts from public.bulmeong_record_batches where user_id=$2' using a,b;
  end if;
  execute 'delete from public.bulmeong_record_totals where user_id=$1' using b;
 end if;
 delete from public.bulmeong_saves where user_id in(a,b);
 if selected is not null and selected<>'null'::jsonb then insert into public.bulmeong_saves values(a,selected->'data',now()); end if;
 -- Move GitHub's unique display metadata without a temporary duplicate.
 select github_id into v_provider from public.profiles where id=b;
 update public.profiles set github_id=null where id=b;
 update public.profiles set github_id=coalesce(github_id,v_provider),account_version=(select max(account_version)+1 from public.profiles where id in(a,b)) where id=a;
 update public.account_memberships set profile_id=a where profile_id=b;
 delete from public.profiles where id=b;
 insert into public.account_merge_audit(operation_id,profile_id,source_profile_id,save_choice) values(p_id,a,b,choice);
 update public.account_connections set completed_at=now(),result_profile=a where id=p_id;
 return jsonb_build_object('complete',true,'profileId',a);
end $$;
-- Force stale-save protection into the same transaction as the save RPC.
create function public.account_save(p_auth uuid,p_version integer,p_data jsonb) returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare a uuid; result jsonb;
begin
 perform pg_advisory_xact_lock_shared(1760412,1);
 a:=public.account_id(p_auth);
 if a is null or p_version is distinct from (select account_version from public.profiles where id=a) then raise exception 'account_reload_required'; end if;
 if to_regprocedure('public.bulmeong_save_with_records(uuid,jsonb)') is null then raise exception 'record_save_unavailable'; end if;
 execute 'select public.bulmeong_save_with_records($1,$2)' into result using a,p_data;
 return result||jsonb_build_object('accountVersion',p_version);
end $$;
-- Explicitly lock every helper, including SECURITY DEFINER trigger functions.
do $$ declare r record; begin
 for r in select p.oid::regprocedure signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname in ('account_created','account_id','account_context','account_leaderboard_profiles','account_write_fence','account_owner_redirect','account_record_snapshot','account_merge_snapshot','account_connection','account_save') loop
  execute format('revoke all on function %s from public,anon,authenticated',r.signature);
  execute format('grant execute on function %s to service_role',r.signature);
 end loop;
end $$;
commit;
