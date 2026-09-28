"use client";

import styled from "@emotion/styled";
import { useLike } from "@/hooks/useLike";
import { buttonBase } from "@/styles/button";
import LikeIcon from "./LikeIcon";

export default function LikeButton({ slug, commentId }: { slug: string; commentId?: string }) {
    const { state, toggle, pending, loading, error, retry } = useLike(slug, commentId);
    const label = commentId ? "댓글 좋아요" : "글 좋아요";
    if (error) return <Control type="button" onClick={retry} aria-label={`${label} 다시 불러오기`}>좋아요 재시도</Control>;
    if (loading || !state) return <Count aria-label={`${label} 불러오는 중`} aria-busy="true"><LikeIcon /><span>좋아요 —</span></Count>;
    if (state.isMine) return <Count title="본인이 작성한 콘텐츠입니다" aria-label={`${label} ${state.likeCount}개`}><LikeIcon />좋아요 {state.likeCount.toLocaleString("ko-KR")}</Count>;
    return <Control type="button" onClick={toggle} aria-pressed={state.likedByMe} disabled={pending}
        aria-label={`${label} ${state.likedByMe ? "취소" : "등록"}, ${state.likeCount}개`} aria-busy={pending || undefined}>
        <LikeIcon /><span>좋아요 {state.likeCount.toLocaleString("ko-KR")}</span>
    </Control>;
}
const Count = styled.span`
    display: inline-flex; align-items: center; gap: 6px; min-width: 0;
    font-size: 13px; line-height: 1.5; color: var(--desccolor); padding: 5px 9px;
`;
const Control = styled.button`
    ${buttonBase}
    display: inline-flex; align-items: center; gap: 6px; min-width: 0;
    font: inherit; font-size: 13px; line-height: 1.5; padding: 5px 9px;
    border: var(--border-width) solid var(--bordercolor); border-radius: 8px;
    color: var(--foreground); background: var(--background); cursor: pointer;
    &[aria-pressed="true"] { background: var(--activecolor); color: var(--activefontcolor); }
    &[aria-pressed="true"] svg { fill: currentColor; }
    &:hover:not(:disabled) { background: var(--hovercolor); color: var(--hoverfontcolor); }
    &:focus-visible { outline: 2px solid var(--linkhovercolor); outline-offset: 2px; }
    &:disabled { opacity: 1; cursor: wait; }
`;
