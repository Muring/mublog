import { useState, type Dispatch, type SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/providers/Toast";
import { fetchJson, jsonRequest } from "@/lib/fetcher";
import type { EditablePost } from "./PostEditor";

type Status = "DRAFT" | "PUBLISHED";
type Saved = { id?: string; slug?: string; publishedAt?: string | null };

/**
 * 초안 저장 / 발행.
 *
 * 새 글이면 POST, 이미 있으면 PATCH 로 간다. 저장 뒤 처리가 둘로 갈린다 —
 * 발행은 게시된 글로 넘어가고, 초안 저장은 이어서 쓰는 중이라 화면을 유지한다.
 */
export function usePostSave(
    post: EditablePost,
    setPost: Dispatch<SetStateAction<EditablePost>>,
    postId: string | null,
    setPostId: (id: string) => void,
    onTagError: (message: string) => void
) {
    const router = useRouter();
    const toast = useToast();
    const [pending, setPending] = useState<Status | null>(null);

    async function save(status: Status) {
        // 태그는 목록 필터의 기준이라 하나도 없으면 글이 어디에도 걸리지 않는다.
        if (post.tags.length === 0) {
            onTagError("태그를 하나 이상 선택하세요.");
            return;
        }

        setPending(status);

        const payload = {
            slug: post.slug,
            title: post.title,
            description: post.description || null,
            tags: post.tags,
            thumbnail: post.thumbnail || null,
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
            setPending(null);
            toast.error(error instanceof Error ? error.message : "저장에 실패했습니다.");
            return;
        }

        if (status === "PUBLISHED") {
            // 결과를 먼저 알리고 이동한다. 이동이 끝날 때까지 pending 을 유지해
            // 버튼이 "이동 중"으로 남아 있게 한다.
            //
            // 여기서 router.refresh() 를 부르지 않는다. 떠날 편집 화면을 다시
            // 그리느라 이동이 눈에 띄게 느려지는데, 목적지는 이미 서버에서
            // revalidatePath 로 무효화돼 있어 새로 받아온다.
            toast.success("발행했습니다. 글로 이동합니다.");
            router.push("/" + (data.slug ?? post.slug));
            return;
        }

        setPending(null);
        setPost((prev) => ({
            ...prev,
            status,
            publishedAt: data.publishedAt ?? prev.publishedAt,
        }));
        toast.success("초안을 저장했습니다.");

        // 새 글이면 이후 저장이 PATCH 로 가도록 주소와 id 를 맞춰둔다
        if (!postId && data.id) {
            setPostId(data.id);
            router.replace("/admin/posts/" + data.id);
        }
    }

    return { save, pending, isSaving: pending !== null };
}
