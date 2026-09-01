"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "./Admin.styled";
import { useToast } from "@/providers/Toast";
import { formatCardDate } from "@/lib/date";

type Props = {
    post: {
        id: string;
        slug: string;
        title: string;
        tags: string[];
        status: "DRAFT" | "PUBLISHED";
        publishedAt: string | null;
        commentCount: number;
    };
};

export default function PostTableRow({ post }: Props) {
    const router = useRouter();
    const toast = useToast();
    const [isPending, startTransition] = useTransition();
    const [isDeleting, setIsDeleting] = useState(false);

    async function remove() {
        if (!confirm(`"${post.title}" 을(를) 삭제할까요?\n댓글도 함께 삭제되며 되돌릴 수 없습니다.`)) {
            return;
        }
        setIsDeleting(true);
        const res = await fetch(`/api/admin/posts/${post.id}`, { method: "DELETE" });
        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            toast.error(body.error ?? "삭제에 실패했습니다.");
            setIsDeleting(false);
            return;
        }
        toast.success(`"${post.title}" 을(를) 삭제했습니다.`);
        startTransition(() => router.refresh());
    }

    const busy = isDeleting || isPending;

    return (
        <tr style={busy ? { opacity: 0.5 } : undefined}>
            {/* data-label 은 좁은 화면에서 행이 카드로 바뀔 때 각 값 앞에 붙는 이름표다 */}
            <td className="title-cell">
                {post.title}
                <span className="slug">/{post.slug}</span>
            </td>
            <td data-label="상태">
                <span className={`badge ${post.status === "PUBLISHED" ? "published" : "draft"}`}>
                    {post.status === "PUBLISHED" ? "공개" : "초안"}
                </span>
            </td>
            <td data-label="태그">{post.tags.join(", ") || "-"}</td>
            <td data-label="발행일">
                {post.publishedAt ? formatCardDate(post.publishedAt) : "-"}
            </td>
            <td data-label="댓글">{post.commentCount}</td>
            <td className="actions">
                <div className="action-buttons">
                    <Link href={`/admin/posts/${post.id}`}>
                        <Button as="span">수정</Button>
                    </Link>
                    <Button className="danger" onClick={remove} disabled={busy}>
                        {busy ? "삭제 중..." : "삭제"}
                    </Button>
                </div>
            </td>
        </tr>
    );
}
