import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { PublicYear, UsageYear } from "./ai-usage";

export const getPublicAi = unstable_cache(async () => {
    const snapshots = await prisma.aiUsageSnapshot.findMany({ orderBy: { year: "desc" }, select: { publicData: true, receivedAt: true } });
    return { years: snapshots.map(s => s.publicData as PublicYear), receivedAt: snapshots[0]?.receivedAt.toISOString() ?? null };
}, ["ai-public"], { tags: ["ai-public", "posts:list"], revalidate: 300 });

export async function getAdminAi() {
    const snapshots = await prisma.aiUsageSnapshot.findMany({ orderBy: { year: "desc" } });
    return { checkedAt: new Date().toISOString(), snapshots: snapshots.map(s => ({ year: s.year, sequence: s.sequence.toString(), sourceRevision: s.sourceRevision, generatedAt: s.generatedAt.toISOString(), receivedAt: s.receivedAt.toISOString(), data: s.privateData as UsageYear & { improvements: { date: string; kind: string; summary: string }[] } })) };
}
export type AdminAiData = Awaited<ReturnType<typeof getAdminAi>>;
export type PublicAiData = Awaited<ReturnType<typeof getPublicAi>>;
