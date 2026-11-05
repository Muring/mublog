-- 계정 트리거의 실행 범위를 좁히고, 쓰지 않는 Data API 권한을 회수한다.
begin;

-- 1) 소유자 리다이렉트: 행 전체를 jsonb 로 바꾸지 않고 해당 컬럼만 읽고 쓴다.
--    plpgsql 은 트리거가 걸린 테이블마다 따로 컴파일하고 실행된 분기만 준비하므로,
--    그 테이블에 없는 컬럼을 가리키는 분기는 평가되지 않는다.
create or replace function public.account_owner_redirect() returns trigger language plpgsql security definer set search_path=pg_catalog,public as $$
declare original uuid; canonical uuid;
begin
 case TG_ARGV[0]
  when 'user_id' then original := new.user_id;
  when 'author_id' then original := new.author_id;
  when 'deleted_by' then original := new.deleted_by;
  else raise exception 'account_owner_redirect: unsupported column %', TG_ARGV[0];
 end case;
 if original is null then return new; end if;
 canonical := public.account_id(original);
 if canonical is null then raise exception 'account_missing'; end if;
 if canonical <> original then
  case TG_ARGV[0]
   when 'user_id' then new.user_id := canonical;
   when 'author_id' then new.author_id := canonical;
   else new.deleted_by := canonical;
  end case;
 end if;
 return new;
end $$;
revoke all on function public.account_owner_redirect() from public, anon, authenticated;

--    UPDATE 는 소유자 컬럼이 SET 에 있을 때만 실행한다(조회수·저장 데이터 갱신은 건너뛴다).
do $$ declare t text; col text; begin
 foreach t in array array['posts','comments','post_likes','comment_likes','dice_results','dice_achievements','dice_achievement_profiles','bulmeong_saves','bulmeong_record_totals','bulmeong_record_batches'] loop
  col := case when t in ('posts','comments') then 'author_id' else 'user_id' end;
  execute format('drop trigger account_owner_redirect on public.%I', t);
  execute format('create trigger account_owner_redirect before insert or update of %I on public.%I for each row execute function public.account_owner_redirect(%L)', col, t, col);
 end loop;
end $$;
drop trigger account_deleted_by_redirect on public.comments;
create trigger account_deleted_by_redirect before insert or update of deleted_by on public.comments for each row execute function public.account_owner_redirect('deleted_by');

-- 2) 프로필은 가입할 때 한 번 채운다. 로그인마다 실행되면 병합으로 지운 보조 계정의
--    프로필을 다시 만들려다 실패하고, 사용자가 고칠 수 있는 user_metadata 를 다시 반영한다.
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
BEGIN
    INSERT INTO public.profiles (id, github_id, username, avatar_url, role, created_at)
    VALUES (
        NEW.id,
        CASE WHEN NEW.raw_app_meta_data ->> 'provider' = 'github'
             THEN NEW.raw_user_meta_data ->> 'provider_id' END,
        COALESCE(
            NEW.raw_user_meta_data ->> 'user_name',
            NEW.raw_user_meta_data ->> 'full_name',
            NEW.raw_user_meta_data ->> 'name',
            'user'
        ),
        COALESCE(
            NEW.raw_user_meta_data ->> 'avatar_url',
            NEW.raw_user_meta_data ->> 'picture'
        ),
        'USER',
        now()
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;
drop trigger on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
revoke execute on function public.handle_new_user() from public, anon, authenticated;
grant execute on function public.handle_new_user() to supabase_auth_admin;

--    이름·아바타는 제공자가 보낸 identity_data 가 실제로 바뀐 경우에만 반영한다.
--    identity_data 는 사용자가 API 로 고칠 수 없다. 자기 프로필이 있는 계정(병합의 대표)만 갱신한다.
create function public.sync_profile_from_identity() returns trigger language plpgsql security definer set search_path=pg_catalog,public as $$
declare v_name text; v_avatar text;
begin
 if new.provider not in ('github','google') then return null; end if;
 v_name := coalesce(new.identity_data->>'user_name', new.identity_data->>'full_name', new.identity_data->>'name');
 v_avatar := coalesce(new.identity_data->>'avatar_url', new.identity_data->>'picture');
 update public.profiles p set username=coalesce(v_name,p.username), avatar_url=coalesce(v_avatar,p.avatar_url)
  where p.id=new.user_id
    and (p.username, p.avatar_url) is distinct from (coalesce(v_name,p.username), coalesce(v_avatar,p.avatar_url));
 return null;
end $$;
revoke execute on function public.sync_profile_from_identity() from public, anon, authenticated;
grant execute on function public.sync_profile_from_identity() to supabase_auth_admin;
create trigger on_auth_identity_updated after update of identity_data on auth.identities
 for each row when (old.identity_data is distinct from new.identity_data)
 execute function public.sync_profile_from_identity();

-- 3) mublog 테이블은 Prisma 직접 연결로만 쓴다. RLS 정책이 없어 행 접근은 이미 막혀 있지만
--    TRUNCATE 는 RLS 를 받지 않으므로 Data API 역할의 권한을 회수한다. service_role 은 그대로 둔다.
revoke all on table public._prisma_migrations, public.ai_publications, public.ai_usage_snapshots,
 public.comment_likes, public.comments, public.daily_stats, public.post_daily_views,
 public.post_likes, public.posts, public.profiles from anon, authenticated;

commit;
