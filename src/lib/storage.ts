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

export type StoredObject = { path: string; size: number; createdAt: Date };

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

    // 폴더 수만큼 왕복을 직렬로 기다리지 않는다. 요청은 최대 6개로 제한한다.
    const folders = [""];
    const batchSize = 1000;
    const walk = async (prefix: string) => {
        for (let offset = 0; ; offset += batchSize) {
            const { data: entries, error } = await supabase.storage
                .from(POST_IMAGE_BUCKET)
                .list(prefix, { limit: batchSize, offset, sortBy: { column: "name", order: "asc" } });
            if (error) throw new Error(`버킷 목록 조회 실패(${prefix || "/"}): ${error.message}`);

            for (const entry of entries ?? []) {
                const path = prefix ? `${prefix}/${entry.name}` : entry.name;
                if (entry.id === null) folders.push(path);
                else objects.push({
                    path,
                    size: entry.metadata?.size ?? 0,
                    createdAt: toDate(entry.created_at),
                });
            }
            if (!entries || entries.length < batchSize) break;
        }
    };

    while (folders.length) {
        await Promise.all(folders.splice(0, 6).map(walk));
    }
    return objects;
}

/**
 * 목록 표시용 메타데이터는 폴더별 HTTP 왕복 없이 한 번에 읽는다.
 * storage 스키마는 읽기 전용으로만 사용한다. 삭제 전 재확인과 실제 삭제는
 * 기존 Storage API 경로를 유지한다.
 * https://supabase.com/docs/guides/storage/schema/design
 */
async function listObjectMetadata(): Promise<StoredObject[]> {
    const rows = await prisma.$queryRaw<{ path: string; size: string | null; createdAt: Date | null }[]>`
        SELECT name AS path, metadata->>'size' AS size, created_at AS "createdAt"
        FROM storage.objects
        WHERE bucket_id = ${POST_IMAGE_BUCKET}
    `;
    return rows.map((row) => ({
        path: row.path,
        size: Number(row.size ?? 0),
        createdAt: row.createdAt ?? new Date(),
    }));
}

/** 이미지를 쓰는 글. 관리 화면이 제목·상태를 보여주고 편집 화면으로 이어준다. */
export type ImageUser = { id: string; slug: string; title: string; status: PostStatus };
export type ImageUsage = { thumbnail: ImageUser[]; body: ImageUser[] };

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
export async function collectImageUsage(): Promise<Map<string, ImageUsage>> {
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
/** vercel.json crons 의 "0 3 * * *" 와 맞춘다. UTC 03시 = KST 12시 */
const SWEEP_HOUR_UTC = 3;

/** after 이후 처음 도는 정리 시각 */
export function nextSweepAt(after: Date): Date {
    const next = new Date(after);
    next.setUTCHours(SWEEP_HOUR_UTC, 0, 0, 0);
    if (next <= after) next.setUTCDate(next.getUTCDate() + 1);
    return next;
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

/**
 * used: 어떤 글이 쓰는 중
 * grace: 아무도 안 쓰지만 올린 지 GRACE_HOURS 가 안 됐다. 저장 전 초안일 수 있다
 * scheduled: 다음 정리에서 지워진다
 */
export type ImageState = "used" | "grace" | "scheduled";

/** 이미지 관리 화면의 한 장 */
export type ManagedImage = {
    /** 버킷 안 경로. 삭제 요청은 이걸로 한다 */
    path: string;
    url: string;
    name: string;
    size: number;
    createdAt: string;
    usedAsThumbnail: ImageUser[];
    usedInBody: ImageUser[];
    state: ImageState;
    /** 자동 정리로 지워질 시각. 쓰는 중이면 null */
    deletesAt: string | null;
};

/**
 * 버킷의 모든 이미지를 쓰임·상태와 함께.
 *
 * sweep 과 같은 참조 판정·같은 유예 시간을 쓴다. 여기서 "삭제 예정" 인 것이
 * 실제로 다음 정리에서 지워지는 것과 어긋나면 이 화면은 거짓말을 한다.
 */
export async function classifyImages(now = new Date()): Promise<{ images: ManagedImage[]; nextSweepAt: string }> {
    const [usage, objects] = await Promise.all([collectImageUsage(), listObjectMetadata()]);
    const images = describeImages(objects, usage, now);
    images.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return { images, nextSweepAt: nextSweepAt(now).toISOString() };
}

/** DB 페이지 조회와 전체 라이브러리가 같은 쓰임·유예 판정을 사용한다. */
export function describeImages(objects: StoredObject[], usage: Map<string, ImageUsage>, now: Date): ManagedImage[] {
    const supabase = createStorageClient();
    const graceMs = GRACE_HOURS * 60 * 60 * 1000;
    return objects.map((object): ManagedImage => {
        const used = usage.get(object.path);
        const expires = new Date(object.createdAt.getTime() + graceMs);
        // sweep 은 "cutoff 보다 늦게 올린 것" 만 남긴다 — 경계는 sweep 과 같게 둔다
        const state: ImageState = used ? "used" : expires.getTime() > now.getTime() ? "grace" : "scheduled";
        return {
            path: object.path,
            url: supabase.storage.from(POST_IMAGE_BUCKET).getPublicUrl(object.path).data.publicUrl,
            name: object.path.split("/").pop() ?? object.path,
            size: object.size,
            createdAt: object.createdAt.toISOString(),
            usedAsThumbnail: used?.thumbnail ?? [],
            usedInBody: used?.body ?? [],
            state,
            deletesAt: used ? null : nextSweepAt(expires > now ? expires : now).toISOString(),
        };
    });

}

/** 이미지 고르기 화면의 "이 이미지를 쓰는 글". 글 필터가 제목으로 고르게 한다 */
export type LibraryUser = { slug: string; title: string };

/** 이미지 고르기 화면에 뿌릴 한 장 */
export type LibraryImage = {
    /** 그대로 썸네일 칸에 넣을 수 있는 주소 */
    url: string;
    /** 버킷 안 경로. 글 폴더(posts/<slug>/…)로 "이 글" 을 가린다 */
    path: string;
    /** 화면에 보일 이름 */
    name: string;
    size: number;
    createdAt: string;
    /** 이 이미지를 대표 이미지로 쓰는 글 */
    usedAsThumbnail: LibraryUser[];
    /** 이 이미지를 본문에 끼워 넣은 글 */
    usedInBody: LibraryUser[];
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
    const { images } = await classifyImages();
    const user = ({ slug, title }: ImageUser): LibraryUser => ({ slug, title });
    return images.map(({ url, path, name, size, createdAt, usedAsThumbnail, usedInBody }) => ({
        url,
        path,
        name,
        size,
        createdAt,
        usedAsThumbnail: usedAsThumbnail.map(user),
        usedInBody: usedInBody.map(user),
    }));
}

/** 삭제를 거절한 이유. 라우트가 상태 코드로 바꾼다 */
export class ImageDeleteRefused extends Error {
    constructor(readonly status: 404 | 409, message: string) {
        super(message);
    }
}

/**
 * 아무 글도 쓰지 않는 이미지를 지금 지운다 (관리 화면의 삭제 버튼).
 *
 * 화면이 "미사용" 이라고 보낸 것을 믿지 않고 참조를 다시 모은다. 화면을 연 뒤
 * 다른 탭에서 그 이미지를 글에 넣었을 수 있다. 하나라도 쓰는 중이면 전부 거절한다 —
 * 일부만 지우고 성공이라 하면 무엇이 남았는지 알 수 없다.
 * 버킷에 실제로 있는 경로만 받는다. 목록에 없는 경로를 remove 에 넘기지 않는다.
 */
export async function deleteUnusedImages(paths: string[]): Promise<{ deleted: string[]; freedBytes: number }> {
    const usage = await collectImageUsage();
    const objects = new Map((await listAllObjects()).map((object) => [object.path, object]));

    const missing = paths.filter((path) => !objects.has(path));
    if (missing.length > 0) throw new ImageDeleteRefused(404, `이미 없는 이미지가 있습니다: ${missing.join(", ")}`);

    const inUse = paths.filter((path) => usage.has(path));
    if (inUse.length > 0) throw new ImageDeleteRefused(409, `글에서 쓰고 있어 지울 수 없습니다: ${inUse.join(", ")}`);

    const { error } = await createStorageClient().storage.from(POST_IMAGE_BUCKET).remove(paths);
    if (error) throw new Error(`삭제 실패: ${error.message}`);

    return { deleted: paths, freedBytes: paths.reduce((sum, path) => sum + (objects.get(path)?.size ?? 0), 0) };
}
