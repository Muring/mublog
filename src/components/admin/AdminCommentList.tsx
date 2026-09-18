"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import styled from "@emotion/styled";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CommentList, CommentRow } from "@/components/comments/Comments.styled";
import CommentBody from "@/components/comments/CommentBody";
import { useConfirm } from "@/providers/Confirm";
import { useToast } from "@/providers/Toast";
import { fetchJson } from "@/lib/fetcher";
import { formatRelative } from "@/lib/date";
import type { AdminComment } from "@/lib/comments";

/**
 * 관리 화면의 댓글 목록.
 *
 * 공개 화면의 CommentRow · CommentBody 를 그대로 쓴다 — 아바타·이름·시각·본문 규칙이
 * 두 화면에서 갈리면 안 된다. 여기서 더 붙는 건 "어느 글에 달렸나" 링크와 삭제뿐이다.
 * 답글 트리는 그리지 않는다. 최신순 한 줄 목록이라 부모 댓글을 인용 한 줄로 같이 보여준다.
 */
export default function AdminCommentList({ comments }: { comments: AdminComment[] }) {
    if (comments.length === 0) return null;
    return (
        <CompactList>
            {comments.map((comment) => (
                <li key={comment.id}>
                    <AdminCommentRow comment={comment} />
                </li>
            ))}
        </CompactList>
    );
}

/** 본문이 이 줄 수를 넘으면 접는다. 한 댓글(최대 2000자)이 화면을 다 먹지 않게 */
const CLAMP_LINES = 5;

function AdminCommentRow({ comment }: { comment: AdminComment }) {
    const router = useRouter();
    const toast = useToast();
    const confirm = useConfirm();
    const [isPending, startTransition] = useTransition();
    const [isDeleting, setIsDeleting] = useState(false);
    const [expanded, setExpanded] = useState(false);
    // 접혀서 실제로 잘린 본문만 "더 보기" 를 단다. 글자 수로 어림하면 넓은 화면에서 안 잘린 것에도 붙는다.
    const [overflows, setOverflows] = useState(false);
    const bodyRef = useRef<HTMLParagraphElement>(null);
    useEffect(() => {
        const el = bodyRef.current;
        if (el) setOverflows(el.scrollHeight > el.clientHeight + 1);
    }, [comment.body]);

    async function remove() {
        const ok = await confirm({
            title: "이 댓글을 삭제할까요?",
            description: "본문이 가려지고 되돌릴 수 없습니다. 답글은 남습니다.",
            confirmLabel: "삭제",
            danger: true,
        });
        if (!ok) return;
        setIsDeleting(true);
        try {
            await fetchJson(`/api/comments/${comment.id}`, { method: "DELETE" });
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "삭제에 실패했습니다.");
            setIsDeleting(false);
            return;
        }
        toast.success("댓글을 삭제했습니다.");
        startTransition(() => router.refresh());
    }

    const busy = isDeleting || isPending;
    const published = comment.post.status === "PUBLISHED";
    const postHref = published ? `/${comment.post.slug}#comment-${comment.id}` : `/admin/posts/${comment.post.id}`;

    // 지운 댓글도 본문과 작성자를 그대로 보여준다(공개 화면과 다른 점).
    // 대신 행 왼쪽에 빨간 띠를 두르고 본문에 취소선을 그어 목록을 훑을 때 바로 걸리게 한다.
    const rowClass = ["root", comment.deleted ? "deleted" : "", busy ? "pending" : ""].filter(Boolean).join(" ");

    return (
        <CommentRow className={rowClass}>
            <div className="avatar-col">
                {comment.author?.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="avatar" src={comment.author.avatarUrl} alt="" />
                ) : (
                    <div className="avatar avatar-fallback">
                        {comment.author?.username.slice(0, 1).toUpperCase() ?? "?"}
                    </div>
                )}
            </div>
            <div className="content">
                {/* 한 줄에 다 둔다: 누가 · 언제 · 어느 글 · 삭제. 본문 아래로 눈을 내리지 않아도 행을 판단할 수 있다 */}
                <div className="meta">
                    <span className="username">{comment.author?.username}</span>
                    {comment.parent && <span className="badge">답글</span>}
                    {comment.deleted && (
                        <span className="badge deleted-badge">
                            {comment.deletedByAdmin ? "관리자가 삭제" : "작성자가 삭제"}
                            {comment.deletedAt && ` · ${formatRelative(comment.deletedAt)}`}
                        </span>
                    )}
                    <time className="time" dateTime={comment.createdAt} title={absolute(comment.createdAt)}>
                        {formatRelative(comment.createdAt)}
                        {comment.editedAt && " (수정됨)"}
                    </time>
                    {/* "이름 · 시각 · 제목" 으로 이으면 그 사람이 쓴 글처럼 읽힌다. 겹낫표로 감싸 글 제목임을 드러낸다 */}
                    <span className="sep" aria-hidden="true">·</span>
                    <Link href={postHref} className="post-link" title={published ? "글에서 이 댓글 보기" : "초안 편집 화면으로"}>『{comment.post.title}』</Link>
                    {!published && <span className="badge draft">초안</span>}
                    {!comment.deleted && (
                        <button type="button" className="row-action danger" onClick={remove} disabled={busy}>
                            {busy ? "삭제 중..." : "삭제"}
                        </button>
                    )}
                </div>
                {/* 답글은 무엇에 대한 답인지가 궁금하다. 부모 댓글을 인용 한 줄로 두고, 눌러 부모 댓글로 넘어가지 않고 여기서 읽고 끝낸다 */}
                {comment.parent && (
                    <p className="parent">
                        <span className="parent-author">{comment.parent.author}</span>
                        {comment.parent.deleted ? <span className="parent-deleted">삭제된 댓글</span> : <span className="parent-body">{comment.parent.body}</span>}
                    </p>
                )}
                <p ref={bodyRef} className={expanded ? "body" : "body clamped"}>
                    <CommentBody text={comment.body ?? ""} />
                </p>
                {overflows && (
                    <button type="button" className="expand" onClick={() => setExpanded((v) => !v)} aria-expanded={expanded}>
                        {expanded ? "접기" : "더 보기"}
                    </button>
                )}
            </div>
        </CommentRow>
    );
}

/**
 * 상대 시각 위에 마우스를 올리면 정확한 시각을 보여준다. 일주일 넘은 댓글은 날짜만 남아 시각이 사라지기 때문이다.
 *
 * title 속성이라 서버와 클라이언트가 글자 하나까지 같아야 한다(다르면 하이드레이션 경고).
 * toLocaleString 은 Node 와 브라우저의 ICU 가 공백·오전/오후 표기를 다르게 내고,
 * 타임존도 Vercel 은 UTC 라 어긋난다. 숫자 조각만 KST 로 받아 직접 조립한다.
 */
const KST = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });
function absolute(iso: string) {
    const part = Object.fromEntries(KST.formatToParts(new Date(iso)).map((p) => [p.type, p.value]));
    return `${part.year}년 ${Number(part.month)}월 ${Number(part.day)}일 ${part.hour}:${part.minute}`;
}

export const CompactList = styled(CommentList)`
    && {
    /* 삭제 표시와 키보드 포커스 테두리가 스크롤 경계에서 잘리지 않게 여백을 둔다. */
    margin: 8px 10px 0;
    > li { padding: 0; }
    .root { padding: 10px 0; gap: 10px; }
    .avatar-col { width: 28px; }
    .avatar { width: 28px; height: 28px; }
    .meta { gap: 4px 8px; margin-bottom: 2px; }
    .meta .username { font-size: 13px; }
    .meta a:focus-visible { outline: 2px solid var(--linkhovercolor); outline-offset: 2px; }
    .meta .time { font-size: 12px; }
    .meta .sep { color: var(--desccolor); font-size: 12px; }
    .body { font-size: 13px; line-height: 1.6; margin: 0; }

    /* 부모 댓글 인용. 한 줄로 자르고 왼쪽 선으로 "인용" 임을 드러낸다 */
    .parent { display: flex; gap: 6px; min-width: 0; margin: 2px 0 4px; padding-left: 8px; border-left: 2px solid var(--bordercolor); font-size: 12px; line-height: 1.5; color: var(--desccolor); }
    .parent-author { flex-shrink: 0; font-weight: 700; }
    .parent-author::after { content: ":"; }
    .parent-body { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .parent-deleted { font-style: italic; }
    .body.clamped { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: ${CLAMP_LINES}; overflow: hidden; }
    .expand { margin-top: 2px; padding: 0; border: 0; background: none; color: var(--desccolor); font: inherit; font-size: 12px; font-weight: 700; cursor: pointer; }
    .expand:hover { color: var(--foreground); text-decoration: underline; }
    .expand:focus-visible { outline: 2px solid var(--linkhovercolor); outline-offset: 2px; }

    /* 어느 글의 댓글인지. 시각과 같은 무게로 두고, 제목이 길면 줄을 바꾸되 한 단어가 폭을 밀지 않게 한다 */
    .post-link { min-width: 0; color: var(--desccolor); font-size: 12px; font-weight: 700; text-decoration: none; overflow-wrap: anywhere; }
    .post-link:hover { color: var(--linkhovercolor); text-decoration: underline; }

    /* 삭제는 줄 맨 오른쪽으로 밀어 제목과 섞이지 않게 한다 */
    .row-action { margin-left: auto; padding: 3px 8px; border-radius: 4px; flex-shrink: 0; font-size: 12px; }
    .row-action:hover:not(:disabled) { background: var(--dangercolor); color: var(--dangerfontcolor); }
    .row-action:focus-visible { outline: 2px solid var(--linkhovercolor); outline-offset: 2px; }

    .badge.draft { background-color: var(--warnbg); color: var(--warncolor); border: 1px solid var(--warnborder); }

    /*
     * 삭제된 행.
     * 배지 하나로는 흐린 회색이라 목록에서 스쳐 지나간다. 행 왼쪽 띠 + 빨간 배지 + 취소선을 함께 둬서
     * 스크롤 중에도 걸리게 한다. 띠는 absolute 로 그려 본문 정렬을 밀지 않는다. 배지 글자는 --dangercolor 를 바탕 위에 그대로 써 양 테마 AA 를 유지한다
     * (연한 빨강 바탕을 깔면 라이트에서 4.2:1 로 미달이라 바탕은 칠하지 않는다).
     */
    .root.deleted::before { content: ""; position: absolute; left: -10px; top: 8px; bottom: 8px; width: 3px; border-radius: 2px; background: var(--dangercolor); }
    .root.deleted .body { color: var(--desccolor); text-decoration: line-through; text-decoration-color: color-mix(in srgb, var(--desccolor) 60%, transparent); }
    .root.deleted .username { color: var(--desccolor); }
    .badge.deleted-badge { color: var(--dangercolor); background: transparent; border: 1px solid var(--dangercolor); font-weight: 800; }
    }
`;
