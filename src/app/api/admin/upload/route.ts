import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdminApi } from "@/lib/auth";
import { handleApiError } from "@/lib/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BUCKET = "post-images";
// Vercel 라우트 핸들러의 요청 본문 상한이 4.5MB 라 그 아래로 잡는다
const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"]);
const EXTENSIONS: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/svg+xml": "svg",
};

/**
 * 포스트 이미지 업로드 (관리자 전용).
 *
 * 브라우저에서 Storage 로 직접 올리지 않고 이 라우트를 거치게 한다.
 * 그래야 인가 경로가 requireAdminApi 하나로 유지된다.
 * 직접 업로드로 가면 라우트 가드와 Storage 정책 두 곳을 따로 맞춰야 한다.
 */
export async function POST(request: NextRequest) {
    try {
        await requireAdminApi();

        const formData = await request.formData();
        const file = formData.get("file");

        if (!(file instanceof File)) {
            return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
        }
        if (!ALLOWED.has(file.type)) {
            return NextResponse.json(
                { error: "png, jpg, webp, gif, svg 만 업로드할 수 있습니다." },
                { status: 400 }
            );
        }
        if (file.size > MAX_BYTES) {
            return NextResponse.json({ error: "파일이 4MB 를 넘습니다." }, { status: 400 });
        }

        const secretKey = process.env.SUPABASE_SECRET_KEY;
        if (!secretKey) throw new Error("SUPABASE_SECRET_KEY 가 설정되지 않았습니다.");

        // service role 로 접속한다. 버킷에는 insert 정책을 두지 않는다.
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, secretKey, {
            auth: { persistSession: false },
        });

        const yearMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        const path = `${yearMonth}/${crypto.randomUUID()}.${EXTENSIONS[file.type]}`;

        const { error } = await supabase.storage
            .from(BUCKET)
            .upload(path, file, { contentType: file.type, cacheControl: "31536000" });

        if (error) {
            console.error("[api/admin/upload]", error.message);
            return NextResponse.json({ error: "업로드에 실패했습니다." }, { status: 500 });
        }

        const {
            data: { publicUrl },
        } = supabase.storage.from(BUCKET).getPublicUrl(path);

        return NextResponse.json({ url: publicUrl });
    } catch (error) {
        return handleApiError(error, "api/admin/upload");
    }
}
