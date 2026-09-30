CREATE TABLE "ai_usage_snapshots" (
 "year" INTEGER PRIMARY KEY, "sequence" BIGINT NOT NULL,
 "source_revision" TEXT NOT NULL, "generated_at" TIMESTAMP(3) NOT NULL,
 "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "public_data" JSONB NOT NULL, "private_data" JSONB NOT NULL
);
CREATE TABLE "ai_publications" (
 "id" TEXT PRIMARY KEY, "kind" TEXT NOT NULL DEFAULT 'improvement',
 "title" TEXT NOT NULL, "body" TEXT NOT NULL, "date" TEXT NOT NULL,
 "post_id" TEXT, "published" BOOLEAN NOT NULL DEFAULT false,
 "updated_at" TIMESTAMP(3) NOT NULL
);
ALTER TABLE "ai_usage_snapshots" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ai_publications" ENABLE ROW LEVEL SECURITY;
