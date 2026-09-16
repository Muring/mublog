-- 글별 일일 조회.
--
-- posts.view_count 는 누적값 하나뿐이라 "지난주에 뭐가 읽혔나" 를 알 수 없었다.
-- 요청당 행을 남기지 않는다 — 글마다 KST 하루 1행이다. 30편 x 365일이면 연 1만 행,
-- 수백 KB 라 500MB 무료 한도에 닿지 않는다. view_count 는 그대로 두고 같은 문장에서 함께 올린다.
CREATE TABLE "post_daily_views" (
    "post_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "post_daily_views_pkey" PRIMARY KEY ("post_id", "date"),
    CONSTRAINT "post_daily_views_post_id_fkey" FOREIGN KEY ("post_id")
        REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "post_daily_views_date_idx" ON "post_daily_views"("date");

-- public 테이블은 PostgREST 로 노출된다. 정책 없이 RLS 만 켜서 anon 을 막는다 (init 과 같은 이유).
ALTER TABLE public.post_daily_views ENABLE ROW LEVEL SECURITY;
