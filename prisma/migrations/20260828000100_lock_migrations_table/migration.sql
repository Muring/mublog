-- Prisma 가 관리하는 마이그레이션 이력 테이블도 public 스키마에 있어서
-- PostgREST 가 anon 롤에게 그대로 노출한다 (마이그레이션 이름/체크섬/시각).
-- 앱은 postgres 롤로 접속해 RLS 를 우회하므로 영향이 없다.
ALTER TABLE public._prisma_migrations ENABLE ROW LEVEL SECURITY;
