"use client";
import PostStatusBadge from "./PostStatusBadge";

import Link from "next/link";
import TagChips from "@/components/ui/TagChips";
import { formatCardDate } from "@/lib/date";
import { useConfirmedDelete } from "./useConfirmedDelete";
import { postDeleteRequest } from "./usePostDelete";

import { commentListUrl } from "@/lib/admin-navigation";

type Props = {
    returnTo: string;
    /** 태그를 누르면 목록 태그 필터에 넣거나 뺀다 */
    onTagSelect?: (tag: string) => void;
    selectedTags?: string[];
    post: {
        id: string;
        slug: string;
        title: string;
        tags: string[];
        status: "DRAFT" | "PUBLISHED";
        publishedAt: string | null;
        updatedAt: string;
        viewCount: number;
        commentCount: number;
        likeCount: number;
    };
};

export default function PostTableRow({ post, returnTo, onTagSelect, selectedTags }: Props) {
    const { remove: removePost, isDeleting, busy } = useConfirmedDelete();
    const remove = () => removePost(postDeleteRequest(post.id, post.title));
    const commentsHref = commentListUrl({ post: post.slug, returnTo });

    return (
        <tr style={busy ? { opacity: 0.5 } : undefined}>
            {/* data-label 은 좁은 화면에서 행이 카드로 바뀔 때 각 값 앞에 붙는 이름표다 */}
            <td className="title-cell">
                {/*
                  초안은 공개 주소가 없다(공개 사이트에서 404). 그래서 공개글은 글로,
                  초안은 편집 화면으로 보낸다 — 어느 쪽이든 "그 글" 로 가는 것이 목적이다.
                */}
                <Link
                    href={post.status === "PUBLISHED" ? `/${post.slug}` : `/admin/posts/${post.id}`}
                    className="title-link"
                >
                    {post.title}
                </Link>
                <span className="slug">/{post.slug}</span>
                <div className="compact-tags"><TagChips tags={post.tags} onSelect={onTagSelect} selected={selectedTags} /></div>
                <Link href={commentsHref} className="compact-comments">댓글 {post.commentCount}개</Link>
                <span className="compact-likes">좋아요 {post.likeCount.toLocaleString("ko-KR")}개</span>
            </td>
            <td data-label="상태">
                <PostStatusBadge status={post.status} publishedLabel="공개" />
            </td>
            <td data-label="태그">{post.tags.length ? <TagChips tags={post.tags} visibleCount={1} alignEnd onSelect={onTagSelect} selected={selectedTags} /> : "-"}</td>
            {/* 초안은 발행된 적이 없다. 만든 날로 메우지 않고 비운 채로 둔다 */}
            <td data-label="발행일" className={post.publishedAt ? undefined : "empty-value"}>
                {post.publishedAt ? formatCardDate(post.publishedAt) : "-"}
            </td>
            <td data-label="수정일">{formatCardDate(post.updatedAt)}</td>
            <td data-label="누적 조회" className="views-total">
                {post.viewCount.toLocaleString("ko-KR")}
            </td>
            <td data-label="댓글">
                <Link href={commentsHref} className="title-link" aria-label={`댓글 ${post.commentCount}개 관리`}>{post.commentCount}</Link>
            </td>
            <td data-label="좋아요">{post.likeCount.toLocaleString("ko-KR")}</td>
            <td className="actions">
                <div className="action-buttons">
                    <Link href={`/admin/posts/${post.id}`} className="row-edit">
                        수정
                    </Link>
                    <button type="button" className="row-delete" onClick={remove} disabled={busy}>
                        {isDeleting ? "삭제 중..." : "삭제"}
                    </button>
                </div>
            </td>
        </tr>
    );
}
