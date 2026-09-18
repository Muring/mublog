import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import { referencedImagePaths } from "@/lib/image-references";

const POST_IMAGE_BUCKET = "post-images";

function createStorageClient() {
    const secretKey = process.env.SUPABASE_SECRET_KEY;
    if (!secretKey) throw new Error("SUPABASE_SECRET_KEY 가 설정되지 않았습니다.");

    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, secretKey, {
        auth: { persistSession: false },
    });
}

type StoredObject = { path: string; size: number; createdAt: Date };

/**
 * 생성 시각을 못 읽으면 "방금 올린 것"으로 취급한다.
 * 나이를 판별할 수 없는 파일을 지우는 것보다 남겨두는 쪽이 안전하다.
 */
function toDate(value: string | null): Date {
    return value ? new Date(value) : new Date();
}

/**
 * 버킷 안의 모든 객체를 훑는다.
 *
 * 깊이를 고정하지 않는다. 예전에는 업로드 경로가 YYYY-MM/파일명 한 단계뿐이라
 * 한 겹만 내려갔는데, 지금은 thumbnails/<slug>/파일 처럼 두 단계다. 고정해 두면
 * 새 구조의 파일이 통째로 안 보이고, 그러면 sweep 이 "고아 0개" 라고 답하면서
 * 아무것도 정리하지 않는다. 조용히 틀리는 쪽이라 깊이에 기대지 않는다.
 */
async function listAllObjects(): Promise<StoredObject[]> {
    const supabase = createStorageClient();
    const objects: StoredObject[] = [];

    const walk = async (prefix: string) => {
        const { data: entries, error } = await supabase.storage
            .from(POST_IMAGE_BUCKET)
            .list(prefix, { limit: 1000 });
        if (error) throw new Error(`버킷 목록 조회 실패(${prefix || "/"}): ${error.message}`);

        for (const entry of entries ?? []) {
            const path = prefix ? `${prefix}/${entry.name}` : entry.name;
            // id 가 null 이면 폴더다
            if (entry.id === null) {
                await walk(path);
                continue;
            }
            objects.push({
                path,
                size: entry.metadata?.size ?? 0,
                createdAt: toDate(entry.created_at),
            });
        }
    };

    await walk("");
    return objects;
}

/**
 * 모든 포스트(초안 포함)에서 이 버킷을 가리키는 경로를 모은다.
 *
 * 본문과 썸네일을 둘 다 본다. 썸네일 주소는 본문에 나타나지 않으므로 빠뜨리면
 * 쓰고 있는 대표 이미지가 고아로 잡혀 --apply 에서 지워진다.
 * 이미지를 담는 컬럼이 늘어나면 여기에도 함께 더해야 한다.
 */
async function collectReferencedPaths(): Promise<Set<string>> {
    const posts = await prisma.post.findMany({ select: { contentMd: true, thumbnail: true } });
    const referenced = new Set<string>();
    for (const post of posts) {
        for (const text of [post.contentMd, post.thumbnail ?? ""]) {
            for (const path of referencedImagePaths(text, POST_IMAGE_BUCKET)) referenced.add(path);
        }
    }
    return referenced;
}

type SweepResult = {
    total: number;
    referenced: number;
    orphans: { path: string; size: number; createdAt: Date }[];
    skippedRecent: number;
    deleted: string[];
    freedBytes: number;
};

/**
 * 어떤 포스트도 참조하지 않는 이미지를 정리한다.
 *
 * 누수 경로가 셋이라 개별 대응 대신 전수 대조 한 번으로 덮는다.
 *   1) 올렸다가 본문에서 지운 경우
 *   2) 올려놓고 저장 없이 창을 닫은 경우
 *   3) 포스트를 삭제해 딸린 이미지가 고아가 된 경우
 *
 * graceHours: 방금 올린 파일은 건드리지 않는다.
 *   에디터에서 이미지를 올린 뒤 아직 저장하지 않은 초안이 있을 수 있고,
 *   그것까지 지우면 작성 중인 글이 깨진다.
 */
export async function sweepOrphanImages(
    options: { dryRun?: boolean; graceHours?: number } = {}
): Promise<SweepResult> {
    const { dryRun = true, graceHours = 24 } = options;

    // 참조 목록을 먼저 확보한다. 이 조회가 실패하면 무엇이 고아인지 알 수 없으므로
    // 삭제 단계로 넘어가지 않고 그대로 예외를 던진다.
    const referenced = await collectReferencedPaths();
    const objects = await listAllObjects();

    const cutoff = Date.now() - graceHours * 60 * 60 * 1000;
    const orphans: StoredObject[] = [];
    let skippedRecent = 0;

    for (const object of objects) {
        if (referenced.has(object.path)) continue;
        if (object.createdAt.getTime() > cutoff) {
            skippedRecent++;
            continue;
        }
        orphans.push(object);
    }

    let deleted: string[] = [];
    if (!dryRun && orphans.length > 0) {
        const supabase = createStorageClient();
        const paths = orphans.map((o) => o.path);
        const { error } = await supabase.storage.from(POST_IMAGE_BUCKET).remove(paths);
        if (error) throw new Error(`삭제 실패: ${error.message}`);
        deleted = paths;
    }

    return {
        total: objects.length,
        referenced: referenced.size,
        orphans,
        skippedRecent,
        deleted,
        freedBytes: orphans.reduce((sum, o) => sum + o.size, 0),
    };
}

/** 이미지 고르기 화면에 뿌릴 한 장 */
export type LibraryImage = {
    /** 그대로 썸네일 칸에 넣을 수 있는 주소 */
    url: string;
    /** 화면에 보일 이름 */
    name: string;
    size: number;
    createdAt: string;
    /** 이 이미지를 대표 이미지로 쓰는 글 */
    usedAsThumbnail: string[];
    /** 이 이미지를 본문에 끼워 넣은 글 */
    usedInBody: string[];
};

/**
 * 에디터에서 고를 수 있는 이미지 전부.
 *
 * 출처는 Storage 하나다. 저장소에 커밋된 public/thumbnails·public/images 를
 * 같이 훑던 시절이 있었는데, 서버 코드가 public/ 을 fs 로 읽으면 Next 가 그 폴더를
 * 통째로 함수 번들에 싣는다 — 그게 배포마다 쌓여 Vercel Function Storage 를 먹었다.
 * 글 이미지를 다시 public/ 에 두지 않는다 (next.config 의 outputFileTracingExcludes 가 안전망).
 *
 * 쓰임은 본문과 썸네일을 문자열 포함으로 찾는다. 정규식으로 주소를 파싱하지 않는 이유는
 * 마크다운·HTML·프론트매터 어디에 있든 걸려야 하기 때문이다.
 */
export async function listImageLibrary(): Promise<LibraryImage[]> {
    const posts = await prisma.post.findMany({
        select: { slug: true, contentMd: true, thumbnail: true },
    });
    /*
     * 쓰임을 본문과 썸네일로 나눠 본다. 합쳐서 세면 "이 이미지가 무엇으로 쓰이는지"
     * 를 알 수 없는데, 고르는 사람에게는 그게 파일 위치보다 중요한 정보다.
     * 한 이미지가 둘 다일 수도 있다 - 그때는 둘 다 표시된다.
     */
    const usersOf = (needle: string) => ({
        usedAsThumbnail: posts
            .filter((post) => (post.thumbnail ?? "").includes(needle))
            .map((post) => post.slug),
        usedInBody: posts.filter((post) => post.contentMd.includes(needle)).map((post) => post.slug),
    });

    const images: LibraryImage[] = [];

    for (const object of await listAllObjects()) {
        images.push({
            url: publicUrlOf(object.path),
            // 마지막 조각만 보여준다. 지금은 uuid 라 읽히지 않지만
            // 아래 "사용 중" 표시가 어느 글의 것인지 알려준다.
            name: object.path.split("/").pop() ?? object.path,
            size: object.size,
            createdAt: object.createdAt.toISOString(),
            // 주소 전체가 아니라 버킷 안 경로로 찾는다. 프로젝트 주소가 바뀌어도 걸린다.
            ...usersOf(object.path),
        });
    }

    // 최근에 올린 것을 먼저 본다
    return images.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** 버킷 안 경로를 공개 주소로 */
function publicUrlOf(path: string): string {
    const supabase = createStorageClient();
    return supabase.storage.from(POST_IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}
