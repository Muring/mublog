import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/providers/Toast";
import { useConfirm } from "@/providers/Confirm";
import { fetchJson } from "@/lib/fetcher";

/**
 * 편집 화면에서 지금 고치던 글을 지운다.
 *
 * 목록의 행 삭제와 같은 API 를 부르되, 지운 뒤에는 돌아갈 글이 없으므로 목록으로 간다.
 * push 앞에 refresh 를 두는 이유는 usePostSave 와 같다 — 라우터 캐시에 남은 목록이
 * 지운 글을 한 번 더 보여주지 않게 한다.
 */
export function usePostDelete(postId: string | null, title: string) {
    const router = useRouter();
    const toast = useToast();
    const confirm = useConfirm();
    const [isDeleting, setIsDeleting] = useState(false);

    async function remove() {
        if (!postId || isDeleting) return;
        const name = title.trim() || "제목 없는 글";
        const ok = await confirm({
            title: `"${name}" 을(를) 삭제할까요?`,
            description: "댓글도 함께 삭제되며 되돌릴 수 없습니다.",
            confirmLabel: "삭제",
            danger: true,
        });
        if (!ok) return;

        setIsDeleting(true);
        try {
            await fetchJson(`/api/admin/posts/${postId}`, { method: "DELETE" });
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "삭제에 실패했습니다.");
            setIsDeleting(false);
            return;
        }
        // 이동이 끝날 때까지 isDeleting 을 유지해 버튼이 눌린 상태로 남는다.
        toast.success(`"${name}" 을(를) 삭제했습니다.`);
        router.refresh();
        router.push("/admin");
    }

    return { remove, isDeleting };
}
