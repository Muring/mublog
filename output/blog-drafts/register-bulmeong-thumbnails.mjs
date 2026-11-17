import { loadEnvFile } from 'node:process';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';

try { loadEnvFile('.env.local'); } catch {}
try { loadEnvFile('.env'); } catch {}
const reviewPath = 'output/blog-drafts/bulmeong-series-review.json';
const review = JSON.parse(readFileSync(reviewPath, 'utf8'));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const slugs = Array.from({length: 7}, (_, i) => `bulmeong-development-${i + 1}`);
if (review.posts.length !== 7) throw new Error('Expected seven approved drafts');
const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
await db.connect();
try {
  const { rows } = await db.query('SELECT slug FROM posts WHERE slug = ANY($1)', [slugs]);
  if (rows.length) throw new Error('Draft slug already exists; inspect before registration');
} finally { await db.end(); }
const prepared = [];
for (const [i, post] of review.posts.entries()) {
  const slug = slugs[i];
  if (post.order !== i + 1 || post.draft !== `output/blog-drafts/${slug}.mdx`) throw new Error('Unexpected draft path');
  const bytes = readFileSync(post.draft);
  if (hash(bytes) !== post.sha256) throw new Error(`Draft changed since review: ${slug}`);
  const jpegPath = `output/imagegen/blog-development-thumbnails/${slug}.jpg`;
  await sharp(post.thumbnail).resize({width:1200,withoutEnlargement:true}).jpeg({quality:82,mozjpeg:true}).toFile(jpegPath);
  const jpeg = readFileSync(jpegPath);
  prepared.push({post,slug,jpegPath,jpeg,path:`thumbnails/${slug}/illustration-${hash(jpeg).slice(0,12)}.jpg`});
}
const storage = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, { auth:{persistSession:false} }).storage.from('post-images');
const published = [];
for (const item of prepared) {
  const { data } = storage.getPublicUrl(item.path);
  let response = await fetch(data.publicUrl);
  if (!response.ok) {
    const { error } = await storage.upload(item.path,item.jpeg,{contentType:'image/jpeg',cacheControl:'31536000',upsert:false});
    if (error) throw new Error(`Thumbnail upload failed: ${item.slug}`);
    response = await fetch(data.publicUrl);
  }
  if (!response.ok || !response.headers.get('content-type')?.startsWith('image/jpeg')) throw new Error(`Thumbnail HTTP verification failed: ${item.slug}`);
  if (!Buffer.from(await response.arrayBuffer()).equals(item.jpeg)) throw new Error(`Thumbnail bytes differ: ${item.slug}`);
  published.push({slug:item.slug,thumbnail:data.publicUrl,jpeg:item.jpegPath,bytes:item.jpeg.length});
  console.log(`${item.slug}: JPEG ${item.jpeg.length} bytes, public bytes verified`);
}
writeFileSync('output/blog-drafts/bulmeong-thumbnails-uploaded.json',JSON.stringify(published,null,2)+'\n');
for (const [i,item] of prepared.entries()) {
  const original = readFileSync(item.post.draft,'utf8');
  if (/^thumbnail:/m.test(original.split('---')[1])) throw new Error('Unexpected existing thumbnail');
  const next = original.replace(/^series:/m,`thumbnail: ${JSON.stringify(published[i].thumbnail)}\nseries:`);
  writeFileSync(item.post.draft,next);
  item.post.sha256=hash(Buffer.from(next));
  item.post.thumbnailApproval='approved';
  item.post.thumbnailUrl=published[i].thumbnail;
}
review.status='thumbnails_uploaded_draft_registration_pending';
writeFileSync(reviewPath,JSON.stringify(review,null,2)+'\n');
