import { css } from "@emotion/react";

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
