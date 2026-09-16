-- 글을 시리즈로 묶는다.
--
-- "블로그 개발기 1~7" 처럼 이어지는 글이 서로를 가리키지 않았다.
-- slug 접두사로 추론하지 않고 컬럼으로 둔다 — docker-gcp-01-* 처럼
-- 규칙이 하나만 달라도 추론은 조용히 틀린다.
--
-- series 는 표시용 문자열이라 그대로 화면에 나간다. 같은 문자열이면 같은 시리즈다.
ALTER TABLE "posts" ADD COLUMN "series" VARCHAR(60);
ALTER TABLE "posts" ADD COLUMN "series_order" INTEGER;

CREATE INDEX "posts_series_series_order_idx" ON "posts"("series", "series_order");

-- 기존 글 백필. slug 를 명시한다. 순서는 발행일순이다.
UPDATE "posts" SET "series" = '블로그 개발기', "series_order" = v.o
FROM (VALUES
    ('blog-development-1', 1),
    ('blog-development-2', 2),
    ('blog-development-3', 3),
    ('blog-development-4', 4),
    ('blog-development-5', 5),
    ('blog-development-6', 6),
    ('blog-development-7', 7)
) AS v(slug, o) WHERE "posts"."slug" = v.slug;

UPDATE "posts" SET "series" = 'Docker 기본', "series_order" = v.o
FROM (VALUES
    ('docker-basics-metaphor-cd', 1),
    ('docker-basics-concepts', 2),
    ('docker-basics-docker-compose', 3),
    ('docker-basics-create-db', 4)
) AS v(slug, o) WHERE "posts"."slug" = v.slug;

UPDATE "posts" SET "series" = 'Docker + GCP 배포', "series_order" = v.o
FROM (VALUES
    ('docker-gcp-01-vm-creation', 1),
    ('docker-gcp-02-docker-installation', 2),
    ('docker-gcp-03-docker-build', 3),
    ('docker-gcp-04-deployment', 4)
) AS v(slug, o) WHERE "posts"."slug" = v.slug;

UPDATE "posts" SET "series" = 'Salesforce CI/CD', "series_order" = v.o
FROM (VALUES
    ('salesforce-ci-cd-basic', 1),
    ('salesforce-ci-cd-practice', 2),
    ('salesforce-ci-cd-advanced', 3)
) AS v(slug, o) WHERE "posts"."slug" = v.slug;
