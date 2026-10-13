import { useRouter } from "next/navigation";
import { useConfirmedDelete } from "./useConfirmedDelete";

/** 확인창·토스트 문구는 목록의 행 삭제(PostTableRow)와 같다 */
export function postDeleteRequest(id: string, title: string) {
    const name = title.trim() || "제목 없는 글";
    return {
        title: `"${name}" 을(를) 삭제할까요?`,
        description: "댓글도 함께 삭제되며 되돌릴 수 없습니다.",
        url: `/api/admin/posts/${id}`,
        success: `"${name}" 을(를) 삭제했습니다.`,
    };
}

/**
 * 편집 화면에서 지금 고치던 글을 지운다.
 *
 * 목록의 행 삭제와 같은 API 를 부르되, 지운 뒤에는 돌아갈 글이 없으므로 목록으로 간다.
 * push 앞에 refresh 를 두는 이유는 usePostSave 와 같다 — 라우터 캐시에 남은 목록이
 * 지운 글을 한 번 더 보여주지 않게 한다.
 */
export function usePostDelete(postId: string | null, title: string) {
    const router = useRouter();
    const { remove, isDeleting } = useConfirmedDelete(() => {
        router.refresh();
        router.push("/admin");
    });
    return {
        remove: () => { if (postId) void remove(postDeleteRequest(postId, title)); },
        isDeleting,
    };
}
