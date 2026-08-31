-- 페이지뷰는 화면에 쓰지 않는다. 개인 블로그에서는 방문자 수만 노출하는 것이 보편적이다.
-- 컬럼을 걷어내면 재방문자의 요청마다 발생하던 쓰기도 함께 사라진다.
ALTER TABLE "daily_stats" DROP COLUMN "page_views";
