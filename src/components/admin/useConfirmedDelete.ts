import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/providers/Toast";
import { useConfirm } from "@/providers/Confirm";
import { fetchJson } from "@/lib/fetcher";

type DeleteRequest = {
    /** 확인창. 삭제 버튼 문구와 위험색은 기본으로 붙는다 */
    title: string;
    description: string;
    url: string;
    success: string;
};

/**
 * 확인을 받고 지우는 관리 화면의 공용 흐름. 확인창 → DELETE → 토스트 → 뒤처리.
 *
 * 뒤처리 기본값은 서버 목록을 다시 받는 것이다(router.refresh 를 transition 으로 감싸
 * 새 목록이 올 때까지 busy 가 유지된다). 지운 화면에 머물 수 없으면 after 로 바꾼다.
 * 성공하면 isDeleting 을 풀지 않는다 — 행이 사라지거나 화면을 떠날 때까지 눌린 상태로 둔다.
 */
export function useConfirmedDelete(after?: () => void) {
    const router = useRouter();
    const toast = useToast();
    const confirm = useConfirm();
    const [isPending, startTransition] = useTransition();
    const [isDeleting, setIsDeleting] = useState(false);
    const busy = isDeleting || isPending;

    async function remove({ title, description, url, success }: DeleteRequest) {
        if (busy) return;
        if (!(await confirm({ title, description, confirmLabel: "삭제", danger: true }))) return;

        setIsDeleting(true);
        try {
            await fetchJson(url, { method: "DELETE" });
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "삭제에 실패했습니다.");
            setIsDeleting(false);
            return;
        }
        toast.success(success);
        if (after) after();
        else startTransition(() => router.refresh());
    }

    return { remove, isDeleting, busy };
}
