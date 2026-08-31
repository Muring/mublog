"use client";

import styled from "@emotion/styled";

/*
 * 스레드 기하 구조.
 *
 * 최상위 댓글의 아바타 중심에서 줄기가 내려오다가, 각 답글의 아바타 왼쪽으로
 * 곡선을 그리며 꺾여 들어간다. 답글 목록 전체에 직선 하나를 긋는 방식과 달리
 * 어느 댓글에 달린 답글인지가 선 자체로 드러난다.
 *
 *   ●  최상위 댓글
 *   │
 *   ╰─● 답글
 *   │
 *   ╰─● 답글
 */
const ROOT_AVATAR = 36;
const REPLY_AVATAR = 28;
const REPLY_ROW_PADDING = 14;
const LINE = 2;
const REPLY_INDENT = 36;

/*
 * 선과 아바타 사이 간격.
 *
 * 이 값 하나가 양쪽 끝을 동시에 제어한다.
 *   0  -> 줄기가 부모 아바타 하단에, 팔꿈치가 답글 아바타 왼쪽에 맞닿는다
 *   n  -> 양쪽 모두 n px 씩 떨어진다
 * 한쪽만 붙고 한쪽만 떨어지는 어중간한 상태가 나올 수 없다.
 */
const AVATAR_GAP = 0;

// 선의 x 좌표는 이 값 하나에서만 나온다.
// 줄기와 팔꿈치가 각자 계산하면 1px 만 어긋나도 꺾인 선처럼 보인다.
const TRUNK_LEFT = ROOT_AVATAR / 2 - LINE / 2; // 최상위 아바타 중심에 선을 맞춘다
// 답글 행은 REPLY_INDENT 만큼 들여써 있으므로 그만큼 되돌아가야 줄기와 만난다
const ELBOW_WIDTH = REPLY_INDENT - TRUNK_LEFT;
// 답글 행 상단에서 아바타 중심까지. 선 두께의 절반을 더해야 선의 중심이 아바타 중심과 맞는다
const ELBOW_DROP = REPLY_ROW_PADDING + REPLY_AVATAR / 2 + LINE / 2;

export const CommentsWrapper = styled.section`
    max-width: 900px;
    margin: 0 auto;
    /* 바로 위 RelatedContent 의 hr 과 좌우를 맞추고, 상단은 넉넉히 띄운다 */
    padding: 2.5rem 2rem 3rem;

    @media (max-width: 640px) {
        padding: 2rem 1rem 2.5rem;
    }

    .comments-title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1.25rem;

        /* 개수는 제목과 같은 줄에 두되 무게를 낮춰 보조 정보로 읽히게 한다 */
        .count {
            padding: 0.1rem 0.5rem;
            border-radius: 999px;
            background-color: var(--codefontbgcolor);
            color: var(--desccolor);
            font-size: 0.75rem;
            font-weight: 700;
            line-height: 1.6;
        }
    }

    /* 댓글이 도착하기 전후로 높이가 튀지 않도록 자리를 잡아둔다 */
    .status-text {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 6rem;
        font-size: 0.85rem;
        color: var(--desccolor);
        text-align: center;
    }
`;

export const CommentList = styled.ul`
    display: flex;
    flex-direction: column;
    margin-top: 1.25rem;

    /*
     * 구분선은 스레드 사이에만 긋는다.
     * 댓글과 그 답글은 한 덩어리이므로 안쪽에는 선을 두지 않고,
     * 연결선이 묶는 역할을 대신한다.
     */
    > li {
        margin: 0;
        list-style-type: none;
        padding: 0.35rem 0;
        border-bottom: 1px solid var(--bordercolor);
    }

    > li:last-of-type {
        border-bottom: none;
    }

    .replies {
        display: flex;
        flex-direction: column;
        padding-left: ${REPLY_INDENT}px;
    }
`;

export const CommentRow = styled.div`
    position: relative;
    display: flex;
    gap: 0.75rem;
    padding: 1rem 0;

    &.pending {
        opacity: 0.55;
    }

    .avatar-col {
        position: relative;
        flex-shrink: 0;
        width: ${ROOT_AVATAR}px;
        /* 연결선을 그리려면 아바타 아래 남은 높이까지 차지해야 한다 */
        align-self: stretch;
    }

    .avatar {
        width: ${ROOT_AVATAR}px;
        height: ${ROOT_AVATAR}px;
        border-radius: 50%;
        border: 1px solid var(--bordercolor);
        object-fit: cover;
    }

    .avatar-fallback {
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--codefontbgcolor);
        color: var(--desccolor);
        font-size: 0.9rem;
        font-weight: 800;
    }

    /*
     * 답글이 달린 댓글: 아바타 아래로 줄기를 내린다.
     *
     * 시작점은 AVATAR_GAP 이 정한다. 선이 아바타의 중심축에 있으므로
     * y = ROOT_AVATAR 지점이 원의 최하단이고, 거기서 간격만큼 띄운다.
     */
    &.has-replies .avatar-col::after {
        content: "";
        position: absolute;
        left: ${TRUNK_LEFT}px;
        top: ${ROOT_AVATAR + AVATAR_GAP}px;
        bottom: -1rem;
        width: ${LINE}px;
        background-color: var(--bordercolor);
    }

    /* 답글은 한 단계 작은 아바타로 깊이를 드러낸다 */
    &.reply {
        padding: ${REPLY_ROW_PADDING}px 0;

        .avatar-col {
            width: ${REPLY_AVATAR}px;
        }
        .avatar {
            width: ${REPLY_AVATAR}px;
            height: ${REPLY_AVATAR}px;
        }
        .avatar-fallback {
            font-size: 0.75rem;
        }
    }

    /* 줄기에서 이 답글의 아바타로 꺾여 들어오는 곡선 */
    &.reply::before {
        content: "";
        position: absolute;
        left: -${ELBOW_WIDTH}px;
        top: 0;
        /* 세로선 위치는 그대로 두고 가로 도달 지점만 간격만큼 앞당긴다 */
        width: ${ELBOW_WIDTH - AVATAR_GAP}px;
        height: ${ELBOW_DROP}px;
        border-left: ${LINE}px solid var(--bordercolor);
        border-bottom: ${LINE}px solid var(--bordercolor);
        border-bottom-left-radius: 12px;
    }

    /*
     * 뒤에 답글이 더 있으면 줄기를 이어 그린다.
     *
     * 행 전체 높이를 덮어야 한다. 팔꿈치의 세로선은 곡선 반경 때문에
     * 아바타 중심에 닿기 전에 이미 오른쪽으로 휘어 나가므로,
     * 곡선이 끝나는 지점부터 그리면 그 사이가 비어 끊긴 선처럼 보인다.
     * 겹치는 구간은 같은 색이라 이음매가 드러나지 않는다.
     */
    &.reply.has-next::after {
        content: "";
        position: absolute;
        left: -${ELBOW_WIDTH}px;
        top: 0;
        bottom: 0;
        width: ${LINE}px;
        background-color: var(--bordercolor);
    }

    .content {
        flex: 1;
        min-width: 0;
    }

    .meta {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 0.4rem;
        margin-bottom: 0.25rem;

        .username {
            font-size: 0.85rem;
            font-weight: 800;
        }
        .badge {
            padding: 0.05rem 0.4rem;
            border-radius: 999px;
            background-color: var(--codefontbgcolor);
            font-size: 0.65rem;
            font-weight: 700;
            color: var(--desccolor);
        }
        .time {
            font-size: 0.72rem;
            color: var(--desccolor);
        }
    }

    .body {
        font-size: 0.9rem;
        line-height: 1.75;
        white-space: pre-wrap;
        word-break: break-word;

        a {
            color: #0070f3;
            text-decoration: none;
            &:hover {
                text-decoration: underline;
            }
        }
    }

    .body.deleted {
        color: var(--desccolor);
        font-size: 0.85rem;
    }

    .row-actions {
        display: flex;
        gap: 0.75rem;
        margin-top: 0.35rem;
        /* 평소에는 물러나 있다가 해당 댓글에 다가가면 또렷해진다 */
        opacity: 0.55;
        transition: opacity 0.15s ease-in-out;
    }

    &:hover .row-actions,
    &:focus-within .row-actions {
        opacity: 1;
    }

    .row-action {
        padding: 0;
        border: none;
        background: none;
        color: var(--desccolor);
        font-family: inherit;
        font-size: 0.72rem;
        font-weight: 700;
        cursor: pointer;

        &:hover {
            color: var(--foreground);
        }
        &.danger:hover {
            color: var(--dangercolor);
        }
        &:disabled {
            opacity: 0.5;
            cursor: default;
        }
    }
`;

export const CommentFormWrapper = styled.form`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.85rem 0;

    textarea {
        width: 100%;
        min-height: 5.5rem;
        resize: vertical;
        padding: 0.8rem;
        border: 1px solid var(--bordercolor);
        border-radius: 0.75rem;
        background-color: var(--cardbackground);
        color: var(--foreground);
        font-family: inherit;
        font-size: 0.9rem;
        line-height: 1.75;
        transition: border-color 0.15s ease-in-out;

        &::placeholder {
            color: var(--desccolor);
        }
        &:focus {
            outline: none;
            border-color: var(--foreground);
        }
    }

    .form-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
    }

    .counter {
        font-size: 0.72rem;
        color: var(--desccolor);
    }
    .counter.over {
        color: var(--dangercolor);
        font-weight: 700;
    }

    .buttons {
        display: flex;
        gap: 0.4rem;
    }

    button {
        padding: 0.45rem 1rem;
        border: 1px solid var(--bordercolor);
        border-radius: 0.5rem;
        background-color: var(--cardbackground);
        color: var(--foreground);
        font-family: inherit;
        font-size: 0.8rem;
        font-weight: 700;
        cursor: pointer;
        transition: border-color 0.15s ease-in-out;

        &:hover:not(:disabled) {
            border-color: var(--foreground);
        }
        &:disabled {
            opacity: 0.45;
            cursor: default;
        }
        &.primary {
            background-color: var(--foreground);
            color: var(--background);
            border-color: var(--foreground);
        }
    }

    /* 문구가 생겼다 사라져도 아래가 밀리지 않도록 자리를 고정한다 */
    .form-error {
        min-height: 1rem;
        font-size: 0.72rem;
        font-weight: 500;
        color: transparent;
    }
    .form-error.visible {
        color: var(--dangercolor);
    }
`;

export const SignInPrompt = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.75rem;
    padding: 1.1rem 1.25rem;
    border: 1px solid var(--bordercolor);
    border-radius: 0.75rem;
    background-color: var(--cardbackground);

    p {
        font-size: 0.85rem;
        color: var(--desccolor);
    }

    a {
        padding: 0.45rem 1rem;
        border: 1px solid var(--foreground);
        border-radius: 0.5rem;
        background-color: var(--foreground);
        color: var(--background);
        font-size: 0.8rem;
        font-weight: 700;

        &:hover {
            opacity: 0.85;
        }
    }
`;
