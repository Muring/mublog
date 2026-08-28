import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

export const POST_IMAGE_BUCKET = "post-images";

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

/** 버킷 안의 모든 객체를 훑는다. 업로드 경로가 `YYYY-MM/파일명` 이라 한 단계만 내려간다. */
async function listAllObjects(): Promise<StoredObject[]> {
    const supabase = createStorageClient();
    const objects: StoredObject[] = [];

    const { data: entries, error } = await supabase.storage
        .from(POST_IMAGE_BUCKET)
        .list("", { limit: 1000 });
    if (error) throw new Error(`버킷 목록 조회 실패: ${error.message}`);

    for (const entry of entries ?? []) {
        // id 가 null 이면 폴더다
        if (entry.id === null) {
            const { data: inner, error: innerError } = await supabase.storage
                .from(POST_IMAGE_BUCKET)
                .list(entry.name, { limit: 1000 });
            if (innerError) throw new Error(`폴더 조회 실패: ${innerError.message}`);

            for (const file of inner ?? []) {
                objects.push({
                    path: `${entry.name}/${file.name}`,
                    size: file.metadata?.size ?? 0,
                    createdAt: toDate(file.created_at),
                });
            }
        } else {
            objects.push({
                path: entry.name,
                size: entry.metadata?.size ?? 0,
                createdAt: toDate(entry.created_at),
            });
        }
    }

    return objects;
}

/** 모든 포스트(초안 포함)의 본문에서 이 버킷을 가리키는 경로를 모은다. */
async function collectReferencedPaths(): Promise<Set<string>> {
    const posts = await prisma.post.findMany({ select: { contentMd: true } });
    const pattern = new RegExp(
        `/storage/v1/object/public/${POST_IMAGE_BUCKET}/([^)\\s"'<>]+)`,
        "g"
    );

    const referenced = new Set<string>();
    for (const post of posts) {
        for (const match of post.contentMd.matchAll(pattern)) {
            referenced.add(decodeURIComponent(match[1]));
        }
    }
    return referenced;
}

export type SweepResult = {
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
