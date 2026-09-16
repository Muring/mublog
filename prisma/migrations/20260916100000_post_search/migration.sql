-- 글 검색.
--
-- 제목·요약·본문(마크다운 원문)에서 부분 문자열을 찾는다. 한국어는 형태소 분석이
-- 없어서 tsvector 로는 "조회수" 로 "조회수가" 를 못 찾는다. pg_trgm 의 ILIKE 가
-- 그걸 하고, GIN 인덱스가 그 ILIKE 를 받는다.
--
-- 지금은 글이 서른 편이라 인덱스 없이도 즉시 끝나지만, 인덱스는 값이 싸고
-- 나중에 글이 늘었을 때 조용히 느려지는 것을 막는다.
--
-- 확장은 Supabase 관례대로 extensions 스키마에 둔다. search_path 에 들어 있다.
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;

CREATE INDEX "posts_search_trgm_idx" ON "posts"
    USING gin ((title || ' ' || coalesce(description, '') || ' ' || content_md) extensions.gin_trgm_ops);
