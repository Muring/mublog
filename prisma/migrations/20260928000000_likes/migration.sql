CREATE TABLE "post_likes" (
    "post_id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    CONSTRAINT "post_likes_pkey" PRIMARY KEY ("post_id", "user_id"),
    CONSTRAINT "post_likes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "post_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "post_likes_user_id_idx" ON "post_likes"("user_id");

CREATE TABLE "comment_likes" (
    "comment_id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    CONSTRAINT "comment_likes_pkey" PRIMARY KEY ("comment_id", "user_id"),
    CONSTRAINT "comment_likes_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "comment_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "comment_likes_user_id_idx" ON "comment_likes"("user_id");

-- 익명·로그인 사용자는 DB에 직접 접근하지 않는다. 서버 Prisma만 접근한다.
ALTER TABLE "post_likes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "comment_likes" ENABLE ROW LEVEL SECURITY;
