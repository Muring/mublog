import { useEffect, type RefObject } from "react";

/** 이 간격 안에 이어지는 휠 이벤트는 같은 손짓으로 본다. 트랙패드 관성도 여기 들어온다 */
const GESTURE_GAP_MS = 300;

/**
 * 화면 높이에 맞춘 구역(에디터의 본문·미리보기 칸) 앞에 스크롤 벽을 세운다.
 *
 * 위에서 아래로 굴리다 구역 상단이 `getTop()` 자리를 지나치려는 순간 거기서 멈춘다.
 * 한 번 휙 굴린 손짓은 벽에서 끝나고, 손을 뗐다가 다시 굴려야 푸터로 내려간다.
 * 근처에서 되맞추는 방식이 아니라 지나가지 못하게 막는 방식이다 — 멈춘 뒤에
 * "조정되는" 움직임이 없다.
 *
 * 아래 방향만 막는다. 위로 올라갈 때는 평소대로다.
 *
 * 휠(마우스·트랙패드)만 다룬다. 키보드(Space·PageDown)와 스크롤 막대 끌기는
 * 그대로 지나간다. 이 페이지는 막대를 감추고 있고, 벽이 필요한 건 휙 굴리는 손짓이다.
 *
 * 안쪽 스크롤 상자(입력란·미리보기) 위에서 굴린 것은 건드리지 않는다.
 * 그 상자가 더 내려갈 수 있거나 overscroll-behavior 로 페이지에 넘기지 않으면
 * 페이지가 움직이지 않으므로 벽도 필요 없다.
 *
 * 어느 페이지든 화면 높이짜리 구역이 있으면 같은 훅을 붙이면 된다.
 */
export function useScrollStop(target: RefObject<HTMLElement | null>, getTop: () => number) {
    useEffect(() => {
        const element = target.current;
        if (!element) return;

        // 벽에 부딪힌 손짓이 이어지는 동안은 그 휠 이벤트를 전부 삼킨다
        let holdUntil = 0;
        let wall = 0;
        // 부드러운 스크롤은 휠 이벤트보다 늦게 도착한다. 휙 굴리면 scrollY 가 아직
        // 위에 있는 채로 다음 휠이 오므로, 같은 손짓 안에서는 굴린 만큼을 더해
        // "도착할 자리" 를 따로 센다. scrollY 만 보면 벽을 그냥 지나간다.
        let expected = 0;
        let lastWheel = 0;

        const scrollsInside = (event: WheelEvent) => {
            for (const node of event.composedPath()) {
                if (!(node instanceof HTMLElement) || node === document.documentElement || node === document.body) continue;
                const style = getComputedStyle(node);
                if (!/(auto|scroll)/.test(style.overflowY)) continue;
                if (node.scrollTop + node.clientHeight < node.scrollHeight - 1) return true;
                if (style.overscrollBehaviorY !== "auto") return true;
            }
            return false;
        };

        const onWheel = (event: WheelEvent) => {
            if (event.deltaY <= 0 || event.defaultPrevented || scrollsInside(event)) return;

            const now = performance.now();
            if (now < holdUntil) {
                event.preventDefault();
                holdUntil = now + GESTURE_GAP_MS;
                return;
            }

            const wanted = Math.round(element.getBoundingClientRect().top + window.scrollY - getTop());
            const max = document.documentElement.scrollHeight - window.innerHeight;
            if (wanted <= 0 || wanted > max) return;

            const current = window.scrollY;
            expected = now - lastWheel < GESTURE_GAP_MS ? Math.max(current, expected) : current;
            lastWheel = now;
            if (current >= wanted - 1) return; // 이미 벽에 서 있거나 지났다 — 다음 손짓은 통과

            // deltaMode 는 픽셀(0)이 대부분이지만 줄(1)·페이지(2) 단위로 오는 환경도 있다
            const delta = event.deltaMode === 1 ? event.deltaY * 16
                : event.deltaMode === 2 ? event.deltaY * window.innerHeight
                : event.deltaY;
            expected += delta;
            if (expected < wanted) return; // 이번 굴림까지 더해도 벽에 닿지 않는다

            event.preventDefault();
            wall = wanted;
            holdUntil = now + GESTURE_GAP_MS;
            window.scrollTo({ top: wanted, behavior: "instant" });
        };

        // 벽을 세우기 전에 이미 출발한 부드러운 스크롤이 벽을 넘어가면 도로 세운다
        const onScroll = () => {
            if (performance.now() < holdUntil && window.scrollY > wall) {
                window.scrollTo({ top: wall, behavior: "instant" });
            }
        };

        // preventDefault 를 부르므로 passive 가 아니어야 한다
        document.addEventListener("wheel", onWheel, { passive: false });
        document.addEventListener("scroll", onScroll, { passive: true });
        return () => {
            document.removeEventListener("wheel", onWheel);
            document.removeEventListener("scroll", onScroll);
        };
        // getTop 은 매 렌더 새로 만들어지는 함수라 의존성에 넣지 않는다. 값은 호출 시점에 읽는다.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [target]);
}
