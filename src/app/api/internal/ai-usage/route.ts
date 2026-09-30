import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ingestSchema, publicYear, sumTotals } from "@/lib/ai-usage";
import { HttpError } from "@/lib/auth";
import { handleApiError } from "@/lib/api";

export const dynamic = "force-dynamic";
export async function POST(request: Request) {
    try {
        const key = process.env.AI_USAGE_INGEST_KEY;
        if (!key || key.length < 32) throw new HttpError(503, "수집 연결이 준비되지 않았습니다.");
        const provided = Buffer.from(request.headers.get("authorization") ?? "");
        const expected = Buffer.from(`Bearer ${key}`);
        if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) throw new HttpError(401, "Unauthorized");
        const reader = request.body?.getReader();
        if (!reader) throw new HttpError(400, "본문이 없습니다.");
        const chunks: Uint8Array[] = []; let length = 0;
        while (true) {
            const part = await reader.read(); if (part.done) break;
            length += part.value.byteLength;
            if (length > 8 * 1024 * 1024) { await reader.cancel(); throw new HttpError(413, "집계 크기 제한을 초과했습니다."); }
            chunks.push(part.value);
        }
        let body: unknown;
        try { body = JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { throw new HttpError(400, "JSON 형식 오류"); }
        const parsed = ingestSchema.safeParse(body);
        if (!parsed.success) throw new HttpError(400, "집계 형식 또는 버전 오류");
        const data = parsed.data;
        if (Date.parse(data.generatedAt) > Date.now() + 300_000) throw new HttpError(400, "미래 시각의 집계");
        for (const year of data.years) for (const week of year.weeks) {
            const total = sumTotals(week.groups.map(g => g.totals));
            if (Object.keys(total).some(k => total[k as keyof typeof total] !== week.totals[k as keyof typeof total])) throw new HttpError(400, "그룹 합계 불일치");
        }
        const changed = await prisma.$transaction(async tx => {
            await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(93103001)`;
            const latest = await tx.aiUsageSnapshot.aggregate({ _max: { sequence: true } });
            if (latest._max.sequence !== null && latest._max.sequence >= BigInt(data.sequence)) return false;
            for (const year of data.years) {
                const values = { sequence: BigInt(data.sequence), sourceRevision: data.sourceRevision, generatedAt: new Date(data.generatedAt), receivedAt: new Date(), publicData: JSON.parse(JSON.stringify(publicYear(year))), privateData: JSON.parse(JSON.stringify({ ...year, improvements: data.improvements })) };
                await tx.aiUsageSnapshot.upsert({ where: { year: year.year }, create: { year: year.year, ...values }, update: values });
            }
            return true;
        }, { timeout: 30_000 });
        if (changed) revalidateTag("ai-public", { expire: 0 });
        return NextResponse.json({ accepted: changed });
    } catch (error) { return handleApiError(error, "ai-usage-ingest", "집계를 저장하지 못했습니다."); }
}
