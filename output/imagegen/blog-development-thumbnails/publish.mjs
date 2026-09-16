import { loadEnvFile } from "node:process";
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { createClient } from "@supabase/supabase-js";

try { loadEnvFile(".env.local"); } catch {}
try { loadEnvFile(".env"); } catch {}
const root = new URL("./", import.meta.url);
const apply = process.argv.includes("--apply");
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
    const slugs = Array.from({ length: 7 }, (_, i) => `blog-development-${i + 1}`);
    const { rows } = await client.query(
        "SELECT id, slug, thumbnail, updated_at FROM posts WHERE slug = ANY($1) ORDER BY slug",
        [slugs],
    );
    if (rows.length !== 7) throw new Error("Expected exactly seven series posts");
    const images = rows.map((row) => {
        const bytes = readFileSync(new URL(`${row.slug}.png`, root));
        const hash = createHash("sha256").update(bytes).digest("hex").slice(0, 12);
        return { ...row, bytes, path: `thumbnails/${row.slug}/illustration-${hash}.png` };
    });
    if (!apply) {
        console.log(JSON.stringify(images.map(({ slug, path, bytes }) => ({ slug, path, bytes: bytes.length })), null, 2));
    } else {
        const backup = new URL(`before-${Date.now()}.json`, root);
        writeFileSync(backup, JSON.stringify(rows, null, 2));
        const storage = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
            auth: { persistSession: false },
        }).storage.from("post-images");
        const published = [];
        for (const image of images) {
            const { error } = await storage.upload(image.path, image.bytes, {
                contentType: "image/png", cacheControl: "31536000", upsert: false,
            });
            if (error) throw new Error(`Upload failed for ${image.slug}: ${error.message}`);
            const { data } = storage.getPublicUrl(image.path);
            const response = await fetch(data.publicUrl);
            if (!response.ok || !response.headers.get("content-type")?.startsWith("image/")) {
                throw new Error(`Public image verification failed: ${image.slug}`);
            }
            const downloaded = Buffer.from(await response.arrayBuffer());
            if (!downloaded.equals(image.bytes)) throw new Error(`Image bytes differ: ${image.slug}`);
            published.push({ slug: image.slug, thumbnail: data.publicUrl });
        }
        await client.query("BEGIN");
        try {
            for (const post of published) {
                const previous = rows.find((row) => row.slug === post.slug);
                const result = await client.query(
                    "UPDATE posts SET thumbnail=$1, updated_at=NOW() WHERE slug=$2 AND thumbnail IS NOT DISTINCT FROM $3",
                    [post.thumbnail, post.slug, previous.thumbnail],
                );
                if (result.rowCount !== 1) throw new Error(`Thumbnail changed concurrently: ${post.slug}`);
            }
            await client.query("COMMIT");
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        }
        writeFileSync(new URL("published.json", root), JSON.stringify(published, null, 2));
        console.log(`Updated ${published.length} thumbnails. Backup: ${fileURLToPath(backup)}`);
    }
} finally {
    await client.end();
}
