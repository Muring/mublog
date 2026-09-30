import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { PublicYear, UsageYear } from "./ai-usage";

export const getPublicAi = unstable_cache(async () => {
    const [snapshots, entries] = await Promise.all([
        prisma.aiUsageSnapshot.findMany({ orderBy: { year: "desc" }, select: { publicData: true, receivedAt: true } }),
        prisma.aiPublication.findMany({ where: { published: true }, orderBy: { date: "desc" }, select: { id: true, kind: true, title: true, body: true, date: true, postId: true } }),
    ]);
    const posts = await prisma.post.findMany({ where: { status: "PUBLISHED", id: { in: entries.flatMap(e => e.postId ? [e.postId] : []) } }, select: { id: true, slug: true, title: true } });
    return { years: snapshots.map(s => s.publicData as PublicYear), receivedAt: snapshots[0]?.receivedAt.toISOString() ?? null,
        entries: entries.filter(e => !e.postId || posts.some(p => p.id === e.postId)).map(e => ({ id: e.id, kind: e.kind, title: e.title, body: e.body, date: e.date, post: posts.find(p => p.id === e.postId) ? { slug: posts.find(p => p.id === e.postId)!.slug, title: posts.find(p => p.id === e.postId)!.title } : null })) };
}, ["ai-public"], { tags: ["ai-public", "posts:list"], revalidate: 300 });

export async function getAdminAi() {
    const [snapshots, entries, posts] = await Promise.all([
        prisma.aiUsageSnapshot.findMany({ orderBy: { year: "desc" } }),
        prisma.aiPublication.findMany({ orderBy: { date: "desc" } }),
        prisma.post.findMany({ where: { status: "PUBLISHED" }, select: { id: true, title: true }, orderBy: { publishedAt: "desc" } }),
    ]);
    return { checkedAt: new Date().toISOString(), snapshots: snapshots.map(s => ({ year: s.year, sequence: s.sequence.toString(), sourceRevision: s.sourceRevision, generatedAt: s.generatedAt.toISOString(), receivedAt: s.receivedAt.toISOString(), data: s.privateData as UsageYear & { improvements: { date: string; kind: string; summary: string }[] } })), entries: entries.map(e => ({ ...e, updatedAt: e.updatedAt.toISOString() })), posts };
}
export type AdminAiData = Awaited<ReturnType<typeof getAdminAi>>;
export type PublicAiData = Awaited<ReturnType<typeof getPublicAi>>;
