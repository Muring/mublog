"use client";

import styled from "@emotion/styled";

/**
 * 헤더 우측 로그인 영역.
 *
 * HeaderWrapper 에 `a { width: 3rem; height: 3rem }` 규칙이 있어서
 * 그냥 두면 링크가 정사각형으로 부풀어 오른다.
 * 클래스를 하나 더 얹어 우선순위를 올려서 덮어쓴다.
 */
export const AuthWrapper = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;

    .avatar {
        width: 26px;
        height: 26px;
        border-radius: 50%;
        border: 1px solid var(--bordercolor);
        flex-shrink: 0;
    }

    .name {
        font-size: 0.8rem;
        font-weight: 700;
        max-width: 7rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    /* HeaderWrapper 의 a 규칙을 덮어쓰기 위해 클래스를 겹쳐 쓴다 */
    && .auth-action {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: auto;
        height: auto;
        padding: 0.35rem 0.7rem;
        border: 1px solid var(--bordercolor);
        border-radius: 0.5rem;
        background: none;
        color: var(--foreground);
        font-family: inherit;
        font-size: 0.78rem;
        font-weight: 700;
        line-height: 1.4;
        white-space: nowrap;
        cursor: pointer;

        &:hover {
            background-color: var(--hovercolor);
            color: var(--hoverfontcolor);
            transition: 0.1s ease-in-out;
        }
    }

    form {
        display: flex;
    }

    /* 좁은 화면에서는 이름을 숨겨 아바타와 버튼만 남긴다 */
    @media (max-width: 640px) {
        .name {
            display: none;
        }
    }
`;
