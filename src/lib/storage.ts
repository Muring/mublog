import { createClient } from "@supabase/supabase-js";
import type { PostStatus } from "@/generated/prisma";
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

/** 이미지를 쓰는 글. 관리 화면이 제목·상태를 보여주고 편집 화면으로 이어준다. */
export type ImageUser = { id: string; slug: string; title: string; status: PostStatus };
type ImageUsage = { thumbnail: ImageUser[]; body: ImageUser[] };

/**
 * 모든 포스트(초안 포함)가 이 버킷의 어느 경로를 어떻게 쓰는지.
 *
 * 쓰는지 판정은 여기 한 곳이다. sweep·이미지 고르기·이미지 관리가 모두 이걸 본다.
 * 예전에는 고르기 화면이 문자열 포함으로 따로 판정해서, 인코딩된 파일명은 "미사용" 으로,
 * 공개 주소가 아닌 변환 주소는 "사용 중" 으로 sweep 과 반대로 보였다.
 *
 * 본문과 썸네일을 둘 다 본다. 썸네일 주소는 본문에 나타나지 않으므로 빠뜨리면
 * 쓰고 있는 대표 이미지가 고아로 잡혀 지워진다.
 * 이미지를 담는 컬럼이 늘어나면 여기에도 함께 더해야 한다.
 */
async function collectImageUsage(): Promise<Map<string, ImageUsage>> {
    const posts = await prisma.post.findMany({
        select: { id: true, slug: true, title: true, status: true, contentMd: true, thumbnail: true },
    });
    const usage = new Map<string, ImageUsage>();
    const add = (path: string, kind: keyof ImageUsage, user: ImageUser) => {
        const entry = usage.get(path) ?? { thumbnail: [], body: [] };
        // 한 글이 같은 이미지를 본문에 두 번 넣어도 한 번만 센다
        if (!entry[kind].some((u) => u.id === user.id)) entry[kind].push(user);
        usage.set(path, entry);
    };
    for (const { contentMd, thumbnail, ...user } of posts) {
        for (const path of referencedImagePaths(thumbnail ?? "", POST_IMAGE_BUCKET)) add(path, "thumbnail", user);
        for (const path of referencedImagePaths(contentMd, POST_IMAGE_BUCKET)) add(path, "body", user);
    }
    return usage;
}

/**
 * 참조를 잃은 뒤 이만큼은 남겨둔다.
 * 에디터에서 이미지를 올린 뒤 아직 저장하지 않은 초안이 있을 수 있고,
 * 그것까지 지우면 작성 중인 글이 깨진다.
 */
export const GRACE_HOURS = 24;
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
 * graceHours: 방금 올린 파일은 건드리지 않는다 (GRACE_HOURS 참고).
 */
export async function sweepOrphanImages(
    options: { dryRun?: boolean; graceHours?: number } = {}
): Promise<SweepResult> {
    const { dryRun = true, graceHours = GRACE_HOURS } = options;

    // 참조 목록을 먼저 확보한다. 이 조회가 실패하면 무엇이 고아인지 알 수 없으므로
    // 삭제 단계로 넘어가지 않고 그대로 예외를 던진다.
    const referenced = await collectImageUsage();
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
 * 쓰임은 본문과 썸네일로 나눠 본다. 고르는 사람에게는 그게 파일 위치보다 중요하다.
 */
export async function listImageLibrary(): Promise<LibraryImage[]> {
    const usage = await collectImageUsage();
    const supabase = createStorageClient();
    const images = (await listAllObjects()).map((object): LibraryImage => ({
        url: supabase.storage.from(POST_IMAGE_BUCKET).getPublicUrl(object.path).data.publicUrl,
        // 마지막 조각만 보여준다. 아래 "사용 중" 표시가 어느 글의 것인지 알려준다.
        name: object.path.split("/").pop() ?? object.path,
        size: object.size,
        createdAt: object.createdAt.toISOString(),
        usedAsThumbnail: usage.get(object.path)?.thumbnail.map((post) => post.slug) ?? [],
        usedInBody: usage.get(object.path)?.body.map((post) => post.slug) ?? [],
    }));

    // 최근에 올린 것을 먼저 본다
    return images.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
