-- SECURITY DEFINER 함수는 PostgREST 가 /rest/v1/rpc/<name> 으로 노출하고,
-- 기본 ACL 이 PUBLIC 에 EXECUTE 라 anon 도 부를 수 있다. RLS 를 우회하므로 막는다.

-- 1) is_admin 은 앱 어디서도 쓰지 않는다(관리자 판별은 Prisma 가 profiles.role 을 읽는다).
DROP FUNCTION IF EXISTS public.is_admin(uuid);

-- 2) handle_new_user 는 auth.users 트리거로만 쓴다. 트리거 실행은 EXECUTE ACL 을 검사하지 않으므로
--    회수해도 로그인은 깨지지 않는다. 트리거를 발화시키는 롤에만 명시적으로 남긴다.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;
