-- Google 로그인 추가에 맞춰 profiles 자동 생성 트리거를 provider 공용으로 바꾼다.
-- 1) github_id 는 GitHub 로그인일 때만 채운다. 그대로 두면 Google 계정 식별자(sub)가 들어간다.
-- 2) Google 은 user_name 이 없고 이름은 full_name/name, 프로필 이미지는 avatar_url/picture 로 준다.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
    ON CONFLICT (id) DO UPDATE
        SET username   = EXCLUDED.username,
            avatar_url = EXCLUDED.avatar_url;
    RETURN NEW;
END;
$$;

-- CREATE OR REPLACE 는 기존 ACL 을 유지하지만, 잠금을 명시해 둔다(20260914000000 과 동일).
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;
