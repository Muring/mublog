-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "github_id" TEXT,
    "username" TEXT NOT NULL,
    "avatar_url" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "thumbnail" TEXT,
    "content_md" TEXT NOT NULL,
    "content_html" TEXT NOT NULL,
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMP(3),
    "reading_time" INTEGER NOT NULL DEFAULT 1,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "comment_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "author_id" UUID,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "body" VARCHAR(2000) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "edited_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "post_id" TEXT NOT NULL,
    "author_id" UUID NOT NULL,
    "parent_id" TEXT,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_stats" (
    "date" DATE NOT NULL,
    "visitors" INTEGER NOT NULL DEFAULT 0,
    "page_views" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "daily_stats_pkey" PRIMARY KEY ("date")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_github_id_key" ON "profiles"("github_id");

-- CreateIndex
CREATE UNIQUE INDEX "posts_slug_key" ON "posts"("slug");

-- CreateIndex
CREATE INDEX "posts_status_published_at_idx" ON "posts"("status", "published_at" DESC);

-- CreateIndex
CREATE INDEX "posts_tags_idx" ON "posts" USING GIN ("tags");

-- CreateIndex
CREATE INDEX "comments_post_id_created_at_idx" ON "comments"("post_id", "created_at");

-- CreateIndex
CREATE INDEX "comments_author_id_created_at_idx" ON "comments"("author_id", "created_at");

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- ─────────────────────────────────────────────────────────────────────────
-- Supabase 전용 보강 SQL.
-- prisma migrate diff 가 만든 마이그레이션 뒤에 이어붙인다.
-- Prisma 는 public 스키마만 관리하므로 auth 스키마 연동은 여기서 처리한다.
-- ─────────────────────────────────────────────────────────────────────────

-- 1) profiles.id 를 auth.users 에 묶는다. 계정 삭제 시 함께 정리된다.
ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id)
    REFERENCES auth.users (id) ON DELETE CASCADE;

-- 2) GitHub 로그인 시 profiles 행을 자동 생성/갱신한다.
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
        NEW.raw_user_meta_data ->> 'provider_id',
        COALESCE(
            NEW.raw_user_meta_data ->> 'user_name',
            NEW.raw_user_meta_data ->> 'name',
            'user'
        ),
        NEW.raw_user_meta_data ->> 'avatar_url',
        'USER',
        now()
    )
    ON CONFLICT (id) DO UPDATE
        SET username   = EXCLUDED.username,
            avatar_url = EXCLUDED.avatar_url;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3) 관리자 판별 함수. 필요 시 Storage 정책에서도 재사용할 수 있다.
CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = uid AND role = 'ADMIN'
    );
$$;

-- 4) ★ 이 블록이 가장 중요하다.
--
-- 저장소가 public 이고 NEXT_PUBLIC_SUPABASE_ANON_KEY 는 클라이언트 번들에 그대로 노출된다.
-- Supabase 는 public 스키마 테이블을 PostgREST 로 자동 노출하므로, 아무나
-- https://<ref>.supabase.co/rest/v1/posts 를 호출해 초안까지 읽을 수 있다.
--
-- 허용 정책을 "하나도 만들지 않은 채" RLS 만 켜면 anon/authenticated 롤은 전부 차단된다.
-- 앱은 Prisma 가 postgres 롤로 접속하고 postgres 는 RLS 를 우회하므로 영향이 없다.
ALTER TABLE public.profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_stats ENABLE ROW LEVEL SECURITY;
