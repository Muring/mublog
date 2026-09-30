import { NextResponse, type NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { requireAdminApi, HttpError } from "@/lib/auth";
import { handleApiError, parseBody } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { publicationSchema } from "@/lib/ai-usage";
export async function POST(request: NextRequest) {
    try {
        await requireAdminApi();
        if (request.headers.get("origin") && request.headers.get("origin") !== new URL(request.url).origin) throw new HttpError(403, "요청 출처 오류");
        const data = { ...await parseBody(request, publicationSchema), postId: null };
        const entry = await prisma.aiPublication.upsert({ where: { id: "intro" }, create: { id: "intro", ...data }, update: data });
        revalidateTag("ai-public", { expire: 0 });
        return NextResponse.json({ id: entry.id });
    } catch (error) { return handleApiError(error, "admin-ai-content"); }
}
