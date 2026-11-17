import { loadEnvFile } from 'node:process';
import { readFileSync, writeFileSync } from 'node:fs';
import matter from 'gray-matter';
try { loadEnvFile('.env'); } catch {}
const { prisma } = await import('../../src/lib/prisma');
const { renderMarkdown } = await import('../../src/lib/markdown/render');
const reviewPath='output/blog-drafts/bulmeong-series-review.json';
const review=JSON.parse(readFileSync(reviewPath,'utf8'));
try {
  const slugs=review.posts.map((p: {order:number})=>`bulmeong-development-${p.order}`);
  const rows=await prisma.post.findMany({where:{slug:{in:slugs}},orderBy:{seriesOrder:'asc'}});
  if(rows.length!==7) throw new Error('Expected seven registered posts');
  const receipts=[];
  for(const row of rows){
    const index=slugs.indexOf(row.slug);
    const {data,content}=matter(readFileSync(review.posts[index].draft,'utf8'));
    if(row.status!=='DRAFT'||row.publishedAt!==null||row.seriesOrder!==index+1||row.series!==data.series||row.title!==data.title||row.description!==data.description||row.thumbnail!==data.thumbnail||JSON.stringify(row.tags)!==JSON.stringify(data.tags)||row.contentMd!==content.trim()||row.contentHtml!==await renderMarkdown(content.trim())) throw new Error(`Stored draft mismatch: ${row.slug}`);
    const receipt={order:index+1,title:row.title,slug:row.slug,status:row.status,adminUrl:`${process.env.NEXT_PUBLIC_SITE_URL}/admin/posts/${row.id}`};
    receipts.push(receipt);
    console.log(`${row.slug}: DRAFT, content/render/metadata/order/thumbnail match`);
  }
  writeFileSync('output/blog-drafts/bulmeong-registration.json',JSON.stringify(receipts,null,2)+'\n');
  review.status='registered_drafts_backup_pending';
  review.verification.databaseRegistration='7/7 DRAFT, unpublished, content/render/metadata/order/thumbnail match';
  writeFileSync(reviewPath,JSON.stringify(review,null,2)+'\n');
} finally { await prisma.$disconnect(); }
