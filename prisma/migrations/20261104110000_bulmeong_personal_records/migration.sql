-- Apply after public.bulmeong_saves exists, before deploying the records API.
begin;
create table if not exists public.bulmeong_record_totals (
 user_id uuid primary key references auth.users(id) on delete cascade,
 totals jsonb not null default '{}', legacy jsonb not null default '{}',
 updated_at timestamptz not null default now()
);
create table if not exists public.bulmeong_record_batches (
 user_id uuid not null references public.bulmeong_record_totals(user_id) on delete cascade,
 batch_id uuid not null, counts jsonb not null,
 primary key(user_id,batch_id)
);
alter table public.bulmeong_record_totals enable row level security;
alter table public.bulmeong_record_batches enable row level security;
revoke all on public.bulmeong_record_totals, public.bulmeong_record_batches from public, anon, authenticated;
grant select, insert, update on public.bulmeong_record_totals, public.bulmeong_record_batches to service_role;

create or replace function public.bulmeong_save_with_records(p_user_id uuid, p_data jsonb)
returns jsonb language plpgsql security invoker set search_path = pg_catalog, pg_temp as $$
<<record_save>>
declare
 keys text[] := array['playSeconds','logsBurned','logsSplit','roundsChopped','treesFelled','kindlingCollected','kindlingUsed','matchesUsed','matchesCrafted','charcoalProduced','logsAdded'];
 totals jsonb; legacy jsonb; prior jsonb; previous_save jsonb;
 batch record; k text; incoming bigint; old_count bigint; baseline bigint;
 merged jsonb; result_data jsonb; stamp timestamptz := clock_timestamp();
begin
 insert into public.bulmeong_record_totals(user_id) values(p_user_id) on conflict do nothing;
 select t.totals,t.legacy into totals,legacy from public.bulmeong_record_totals t where user_id=p_user_id for update;
 select s.data into previous_save from public.bulmeong_saves s where user_id=p_user_id;
 -- Existing saves establish the baseline. Only the first guest import uses the incoming legacy.
 foreach k in array keys loop
   baseline := 0;
   if k = any(array['playSeconds','logsBurned','charcoalProduced']) then
     if previous_save is not null and previous_save->'records' is null then
       baseline := coalesce((previous_save->>case when k='charcoalProduced' then 'logsBurned' else k end)::numeric,0)::bigint;
     elsif previous_save is null then
       baseline := least(coalesce((p_data#>>array['records','legacy',k])::bigint,0),case when k='playSeconds' then 86400 else 10000 end);
     end if;
   end if;
   old_count := coalesce((legacy->>k)::bigint,0);
   totals := jsonb_set(totals,array[k],to_jsonb(coalesce((totals->>k)::bigint,0)+greatest(0,baseline-old_count)));
   legacy := jsonb_set(legacy,array[k],to_jsonb(greatest(baseline,old_count)));
 end loop;
 if (select count(*) from jsonb_object_keys(p_data#>'{records,pending}')) > 32 then raise exception 'too many record batches'; end if;
 for batch in select * from jsonb_each(p_data#>'{records,pending}') loop
   select b.counts into prior from public.bulmeong_record_batches b where user_id=p_user_id and batch_id=batch.key::uuid;
   merged := '{}';
   foreach k in array keys loop
     incoming := coalesce((batch.value#>>array['counts',k])::bigint,0);
     if incoming < 0 or incoming > 1000000000000 then raise exception 'invalid record count'; end if;
     old_count := coalesce((prior->>k)::bigint,0);
     merged := jsonb_set(merged,array[k],to_jsonb(greatest(incoming,old_count)));
     totals := jsonb_set(totals,array[k],to_jsonb((totals->>k)::bigint+greatest(0,incoming-old_count)));
   end loop;
   insert into public.bulmeong_record_batches values(p_user_id,batch.key::uuid,merged)
    on conflict(user_id,batch_id) do update set counts=excluded.counts;
 end loop;
 update public.bulmeong_record_totals set totals=record_save.totals,legacy=record_save.legacy,updated_at=stamp where user_id=p_user_id;
 result_data := p_data || jsonb_build_object('records',jsonb_build_object('version',1,'confirmed',totals,'legacy',legacy,'pending','{}'::jsonb),'playSeconds',totals->'playSeconds','logsBurned',totals->'logsBurned');
 insert into public.bulmeong_saves(user_id,data,updated_at) values(p_user_id,result_data,stamp)
 on conflict(user_id) do update set data=excluded.data,updated_at=excluded.updated_at;
 return jsonb_build_object('data',result_data,'updatedAt',stamp);
end $$;
revoke all on function public.bulmeong_save_with_records(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.bulmeong_save_with_records(uuid,jsonb) to service_role;
-- Private aggregate foundation. No user identifiers or public access.
create or replace view public.bulmeong_global_records as
 select item.key as metric, sum(item.value::numeric) as total
 from public.bulmeong_record_totals t cross join lateral jsonb_each_text(t.totals) item
 group by item.key;
revoke all on public.bulmeong_global_records from public,anon,authenticated;
grant select on public.bulmeong_global_records to service_role;
commit;
