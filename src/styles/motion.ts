import { css, keyframes } from "@emotion/react";

type FadeSlideOptions = {
    visible: boolean;
    baseTransform?: string; // 예: "translate(-50%, -50%)"
    hiddenY?: number; // 숨김 상태에서 Y 이동(px)
    durationMs?: number; // 전환 시간
};

export const fadeSlide = ({ visible, baseTransform = "", hiddenY = -6, durationMs = 200 }: FadeSlideOptions) => css`
    opacity: ${visible ? 1 : 0};
    visibility: ${visible ? "visible" : "hidden"};
    pointer-events: ${visible ? "auto" : "none"};

    transform: ${baseTransform} translateY(${visible ? "0px" : `${hiddenY}px`});

    transition: opacity ${durationMs}ms ease, transform ${durationMs}ms ease,
        visibility 0ms linear ${visible ? "0ms" : `${durationMs}ms`};
`;

/*
 * 떴다 사라지는 창(모달·하단 시트·서랍·전체 화면 뷰어)의 공용 움직임.
 *
 * 창마다 따로 정하던 시절에는 어떤 것은 올라오고 어떤 것은 뚝 나타나고, 닫힐 때는 거의 다
 * 뚝 사라졌다. 같은 속도·같은 곡선을 한 곳에서 정한다. 닫힘 쪽 시간은 hooks/useOverlay 의
 * 안전망과 짝이라 OVERLAY_EXIT_MS 를 함께 본다.
 *
 * 닫히는 중에는 창의 뿌리(막 또는 dialog)에 data-closing 이 붙는다. 여는 쪽은 마운트만으로 돈다.
 * 움직임 줄이기 설정이면 전부 끈다 — 닫힘은 useOverlay 가 애니메이션 없이 곧바로 처리한다.
 */
export const OVERLAY_ENTER_MS = 220;
export const OVERLAY_EXIT_MS = 180;
const enterEase = "cubic-bezier(0.2, 0.8, 0.2, 1)";
const exitEase = "cubic-bezier(0.4, 0, 1, 1)";

const fadeIn = keyframes`from { opacity: 0; }`;
const fadeOut = keyframes`to { opacity: 0; }`;
const riseIn = keyframes`from { transform: translateY(100%); }`;
const sinkOut = keyframes`to { transform: translateY(100%); }`;
const popIn = keyframes`from { opacity: 0; transform: translateY(8px) scale(0.98); }`;
const popOut = keyframes`to { opacity: 0; transform: translateY(8px) scale(0.98); }`;
const slideInLeft = keyframes`from { transform: translateX(-100%); }`;
const slideOutLeft = keyframes`to { transform: translateX(-100%); }`;

const noMotion = css`
    @media (prefers-reduced-motion: reduce) {
        &,
        &[data-closing],
        [data-closing] & {
            animation: none;
        }
    }
`;

/** 뒤를 가리는 막. 흐려졌다 짙어지고, 닫힐 때 다시 흐려진다. 닫히는 중에는 누름을 받지 않는다 */
export const overlayBackdrop = css`
    animation: ${fadeIn} ${OVERLAY_ENTER_MS}ms ease-out;
    &[data-closing] {
        pointer-events: none;
        animation: ${fadeOut} ${OVERLAY_EXIT_MS}ms ease-in forwards;
    }
    ${noMotion}
`;

/**
 * 막 위의 창. 막(뿌리)의 data-closing 을 보고 함께 나간다.
 *   sheet  — 아래에 붙은 시트: 아래에서 올라오고 아래로 내려간다
 *   pop    — 가운데 창: 살짝 떠오르며 나타나고 가라앉으며 사라진다
 *   drawer — 왼쪽 서랍: 왼쪽에서 밀려 들어오고 왼쪽으로 나간다
 */
export const overlayPanel = (kind: "sheet" | "pop" | "drawer") => {
    const [enter, exit] = kind === "sheet" ? [riseIn, sinkOut] : kind === "drawer" ? [slideInLeft, slideOutLeft] : [popIn, popOut];
    return css`
        animation: ${enter} ${OVERLAY_ENTER_MS}ms ${enterEase};
        [data-closing] &,
        &[data-closing] {
            animation: ${exit} ${OVERLAY_EXIT_MS}ms ${exitEase} forwards;
        }
        ${noMotion}
    `;
};

/** 네이티브 dialog(showModal) 용. 창 자체와 ::backdrop 을 함께 움직인다 */
export const overlayDialog = (kind: "sheet" | "pop" | "drawer" | "fade") => css`
    ${kind === "fade" ? overlayBackdrop : overlayPanel(kind)}
    &::backdrop {
        animation: ${fadeIn} ${OVERLAY_ENTER_MS}ms ease-out;
    }
    &[data-closing]::backdrop {
        animation: ${fadeOut} ${OVERLAY_EXIT_MS}ms ease-in forwards;
    }
    @media (prefers-reduced-motion: reduce) {
        &::backdrop,
        &[data-closing]::backdrop {
            animation: none;
        }
    }
`;
