import { NextResponse, type NextRequest } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { requireAdminApi } from "@/lib/auth";
import { handleApiError } from "@/lib/api";
import { slugSchema } from "@/lib/validation";

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

/** 아직 글 주소가 없을 때 받아두는 곳. sweep 이 쓰이지 않는 것을 걷어간다. */
const DRAFT_DIR = "_drafts";
/** 같은 이름이 걸렸을 때 다시 만들어 보는 횟수 */
const NAME_ATTEMPTS = 3;

/**
 * 이름 끝에 붙이는 조각.
 *
 * 유일성의 근거가 아니다 — 그건 폴더와 라벨(thumbnail / image-N)이 맡는다.
 * 이건 **주소를 절대 재사용하지 않기 위한** 것이다. 업로드에 1년 캐시가 걸려
 * 있어서, 같은 주소에 다른 그림이 올라가면 이미 본 사람에게는 옛 그림이
 * 최대 1년 동안 계속 보인다. 8자리(42억)면 이름칸이 수만 개여도 안전하고,
 * 그래도 걸리면 아래에서 다시 만든다.
 */
function shortId(): string {
    return crypto.randomUUID().replace(/-/g, "").slice(0, 8);
}

/**
 * posts/<slug>/ 안에서 다음 image 번호.
 *
 * 개수가 아니라 가장 큰 번호에 1 을 더한다. 본문에서 지운 뒤에도 파일은 남아
 * 있으므로 개수로 세면 이미 쓰인 번호가 다시 나온다.
 */
async function nextImageNumber(supabase: SupabaseClient, folder: string): Promise<number> {
    const { data } = await supabase.storage.from(BUCKET).list(folder, { limit: 1000 });

    let largest = 0;
    for (const entry of data ?? []) {
        const match = /^image-(\d+)-/.exec(entry.name);
        if (match) largest = Math.max(largest, Number(match[1]));
    }
    return largest + 1;
}

/**
 * 포스트 이미지 업로드 (관리자 전용).
 *
 * 브라우저에서 Storage 로 직접 올리지 않고 이 라우트를 거치게 한다.
 * 그래야 인가 경로가 requireAdminApi 하나로 유지된다.
 * 직접 업로드로 가면 라우트 가드와 Storage 정책 두 곳을 따로 맞춰야 한다.
 *
 * 경로는 글과 쓰임으로 나눈다.
 *
 *   thumbnails/<slug>/thumbnail-9f3a1c2e.png
 *   posts/<slug>/image-1-7c2db418.png
 *   _drafts/thumbnail-2e91af03.png        <- 아직 글 주소가 없을 때
 *
 * slug 를 바꿔도 이미 올라간 파일은 옛 폴더에 남는다. 주소가 절대경로라 글이
 * 깨지지는 않고, 폴더 이름만 실제와 달라진다. 파일을 따라 옮기는 것은 주소가
 * 바뀌는 일이라 본문 치환과 캐시 무효화가 함께 필요해서 여기서 하지 않는다.
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

        const extension = EXTENSIONS[file.type];
        const isThumbnail = formData.get("kind") === "thumbnail";
        // 새 글에서 주소를 정하기 전에 이미지부터 붙여넣는 것이 자연스러운 흐름이다.
        // 막지 않고 임시 폴더로 받는다.
        const slug = slugSchema.safeParse(formData.get("slug"));

        let folder: string;
        let label: string;
        if (!slug.success) {
            folder = DRAFT_DIR;
            label = isThumbnail ? "thumbnail" : "image";
        } else if (isThumbnail) {
            folder = `thumbnails/${slug.data}`;
            label = "thumbnail";
        } else {
            folder = `posts/${slug.data}`;
            label = `image-${await nextImageNumber(supabase, folder)}`;
        }

        // 같은 이름이 이미 있으면 upsert 를 주지 않았으므로 덮어쓰지 않고 오류가 난다.
        // 확률이 낮다고 넘기지 않고 이름을 다시 만들어 본다.
        let lastError = "";
        for (let attempt = 0; attempt < NAME_ATTEMPTS; attempt++) {
            const path = `${folder}/${label}-${shortId()}.${extension}`;
            const { error } = await supabase.storage
                .from(BUCKET)
                .upload(path, file, { contentType: file.type, cacheControl: "31536000" });

            if (!error) {
                const {
                    data: { publicUrl },
                } = supabase.storage.from(BUCKET).getPublicUrl(path);
                return NextResponse.json({ url: publicUrl });
            }
            lastError = error.message;
        }

        console.error("[api/admin/upload]", lastError);
        return NextResponse.json({ error: "업로드에 실패했습니다." }, { status: 500 });
    } catch (error) {
        return handleApiError(error, "api/admin/upload");
    }
}
