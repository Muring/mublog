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
            // push 전에 refresh 를 부른다. 서버의 revalidatePath 만으로는 부족하다 —
            // 그것은 서버 캐시를 지울 뿐이고, 브라우저가 따로 들고 있는 라우터
            // 캐시는 그대로다. 목록에서 글 제목을 눌러 미리 받아둔 적이 있으면
            // 그 낡은 payload 가 최대 5분(staleTimes.static) 동안 그대로 쓰인다.
            // 그러면 방금 고친 태그가 반영되지 않은 글로 넘어간다.
            //
            // 라우터 캐시를 비우는 것은 Server Action 만 자동으로 해준다. 여기는
            // Route Handler 를 fetch 로 부르는 자리라 직접 해야 한다.
            //
            // push 뒤가 아니라 앞이다. 뒤에 두면 낡은 화면이 한 번 그려진 다음
            // 바뀌어 눈에 띈다. 앞에 두면 캐시가 빈 상태로 이동한다.
            // 떠날 편집 화면이 한 번 더 그려지지만 곧바로 벗어나므로 보이지 않는다.
            toast.success("발행했습니다. 글로 이동합니다.");
            router.refresh();
            router.push("/" + (data.slug ?? post.slug));
            return;
        }

        // 초안도 저장하고 나면 목록으로 돌아간다.
        // 발행과 마찬가지로 pending 을 유지해 이동이 끝날 때까지 버튼이 눌린 상태로 남는다.
        toast.success("초안을 저장했습니다.");
        router.push("/admin");
    }

    return { save, pending, isSaving: pending !== null };
}
