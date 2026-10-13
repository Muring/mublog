import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/providers/Toast";
import { fetchJson, jsonRequest } from "@/lib/fetcher";
import type { EditablePost } from "@/lib/posts";

type Status = "DRAFT" | "PUBLISHED";
type Saved = { id?: string; slug?: string; publishedAt?: string | null };

/**
 * 초안 저장 / 발행.
 *
 * 새 글이면 POST, 이미 있으면 PATCH 로 간다. 저장 뒤에는 관리 목록으로 돌아가고,
 * 발행한 글은 완료 토스트의 바로가기로 연다.
 */
export function usePostSave(
    post: EditablePost,
    postId: string | null,
    onTagError: (message: string) => void,
    uploadsPending: () => boolean
) {
    const router = useRouter();
    const toast = useToast();
    const [pending, setPending] = useState<Status | null>(null);

    const saving = useRef(false);

    async function save(status: Status) {
        if (saving.current) return;
        if (uploadsPending()) {
            toast.error("이미지 업로드가 끝난 뒤 저장해 주세요.");
            return;
        }
        // 태그는 목록 필터의 기준이라 하나도 없으면 글이 어디에도 걸리지 않는다.
        if (post.tags.length === 0) {
            onTagError("태그를 하나 이상 선택하세요.");
            return;
        }

        saving.current = true;
        setPending(status);

        const payload = {
            slug: post.slug,
            title: post.title,
            description: post.description || null,
            tags: post.tags,
            thumbnail: post.thumbnail || null,
            series: post.series.trim() || null,
            seriesOrder: post.series.trim() && post.seriesOrder ? Number(post.seriesOrder) : null,
            contentMd: post.contentMd,
            status,
            // 발행일은 서버가 발행 시점에 자동으로 넣는다.
            // 이미 발행된 글은 기존 값을 그대로 유지한다.
            publishedAt: post.publishedAt,
        };

        let data: Saved;
        try {
            data = await fetchJson<Saved>(
                postId ? "/api/admin/posts/" + postId : "/api/admin/posts",
                jsonRequest(postId ? "PATCH" : "POST", payload)
            );
        } catch (error) {
            saving.current = false;
            setPending(null);
            toast.error(error instanceof Error ? error.message : "저장에 실패했습니다.");
            return;
        }

        if (status === "PUBLISHED") {
            // Route Handler 저장 뒤 목록과 바로가기에서 갱신된 글을 읽도록 라우터를 새로고친다.
            // 이동이 끝날 때까지 pending 을 유지해 중복 발행을 막는다.
            toast.success("발행했습니다.", {
                label: "포스트 보기",
                href: "/" + (data.slug ?? post.slug),
            });
            router.refresh();
            router.push("/admin");
            return;
        }

        // 초안도 저장하고 나면 목록으로 돌아간다.
        // 발행과 마찬가지로 pending 을 유지해 이동이 끝날 때까지 버튼이 눌린 상태로 남는다.
        toast.success("초안을 저장했습니다.");
        router.push("/admin");
    }

    return { save, pending, isSaving: pending !== null };
}
