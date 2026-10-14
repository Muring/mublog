"use client";

import styled from "@emotion/styled";
import { buttonQuiet } from "@/styles/button";
import { truncate } from "@/styles/text";
import { mobile } from "@/styles/breakpoints";
import { surface } from "@/styles/surface";

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
    /* 타이틀이 남은 자리를 차지하므로, 이쪽이 눌리지 않게 고정한다 */
    flex-shrink: 0;

    .avatar {
        width: 26px;
        height: 26px;
        border-radius: 50%;
        border: var(--border-width) solid var(--bordercolor);
        flex-shrink: 0;
    }

    .name {
        font-size: 0.8rem;
        font-weight: 700;
        max-width: 7rem;
        ${truncate}
    }

    /* HeaderWrapper 의 a 규칙을 덮어쓰기 위해 클래스를 겹쳐 쓴다 */
    && .auth-action {
        ${buttonQuiet}
        display: inline-flex;
        align-items: center;
        justify-content: center;
        /* HeaderWrapper 의 a { width/height: 3rem } 을 되돌린다 */
        width: auto;
        height: auto;
        padding: 0.35rem 0.7rem;
        font-size: 0.78rem;
        line-height: 1.4;
        white-space: nowrap;
    }

    form {
        display: flex;
    }

    /*
     * 계정 메뉴. 아바타(+이름)가 버튼이고, 바로 옆 검색 버튼(SearchTrigger)과 같은 높이·모서리·호버를 쓴다.
     * 펼친 판은 공용 드롭다운 목록과 같은 면·그림자·항목 호버를 쓴다
     */
    position: relative;

    .account-trigger {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        max-width: 10rem;
        /* 검색 버튼처럼 왼쪽 메뉴 버튼(3rem 정사각형)보다 작아지지 않는다 */
        height: 3rem;
        min-width: 3rem;
        justify-content: center;
        box-sizing: border-box;
        padding: 0 0.75rem;
        border: 0;
        border-radius: 0.5rem;
        background: none;
        color: var(--foreground);
        font: inherit;
        cursor: pointer;
    }
    /* --hovercolor 는 다크에서도 밝은 회색이라 글자도 함께 --hoverfontcolor 로 돌린다(AGENTS §3) */
    .account-trigger:hover, .account-trigger[aria-expanded="true"] {
        background-color: var(--hovercolor);
        color: var(--hoverfontcolor);
        transition: 0.1s ease-in-out;
    }
    .account-trigger:focus-visible { outline: 2px solid var(--linkhovercolor); outline-offset: 2px; }
    .avatar-empty { display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box; color: var(--desccolor); }

    .account-menu {
        position: absolute;
        top: calc(100% + 6px);
        right: 0;
        z-index: 60;
        display: grid;
        min-width: 9rem;
        padding: 6px;
        ${surface("0.4rem")}
        box-shadow: 0 8px 24px var(--shadowcolor);
    }
    .account-menu hr { margin: 4px 2px; border: 0; border-top: var(--border-width) solid var(--bordercolor); }
    /* HeaderWrapper 의 a { width/height: 3rem } 을 되돌린다 */
    && .account-item {
        display: flex;
        justify-content: flex-start;
        width: 100%;
        height: auto;
        min-height: 36px;
        box-sizing: border-box;
        padding: 0.5rem 0.75rem;
        border: 0;
        border-radius: 4px;
        background: transparent;
        color: var(--foreground);
        font: inherit;
        font-size: 0.85rem;
        text-align: left;
        text-decoration: none;
        white-space: nowrap;
        cursor: pointer;
    }
    && .account-item:hover, && .account-item:focus-visible {
        background-color: color-mix(in srgb, var(--foreground) 8%, var(--cardbackground));
        color: var(--foreground);
        outline: none;
    }

    /* 좁은 화면에서는 이름을 숨겨 아바타만 남긴다 */
    ${mobile} {
        .name {
            display: none;
        }
        .account-trigger { padding: 0 0.5rem; }
        && .account-item { min-height: 44px; }
    }
`;
