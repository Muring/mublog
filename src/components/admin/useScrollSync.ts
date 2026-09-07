import { useEffect, useRef, type RefObject } from "react";

/**
 * 본문과 미리보기가 같은 곳을 보게 한다.
 *
 * 두 칸의 "굴릴 수 있는 거리" 를 비율로 맞춘다. 줄 번호를 서로 잇지 않는 이유는
 * textarea 가 줄의 위치를 알려주지 않기 때문이다 - 알아내려면 같은 글꼴·같은 폭의
 * 거울 요소를 따로 그려 재야 하고(줄바꿈 때문에 줄 번호 x 줄 높이로는 안 된다),
 * 이 화면에 그만한 값을 하지 않는다.
 *
 * 그래서 이미지(원문 한 줄 ↔ 렌더 수백 px)나 코드블록처럼 원문과 렌더 결과의
 * 밀도가 크게 다른 구간에서는 한 문단쯤 어긋난다. 문단 위주의 글에서는 맞는다.
 */
export function useScrollSync(
    write: RefObject<HTMLTextAreaElement | null>,
    preview: RefObject<HTMLElement | null>
) {
    // 맞춰준 쪽에서 scroll 이 되올라와 둘이 서로를 밀어내는 것을 막는다
    const syncing = useRef(false);

    useEffect(() => {
        const source = write.current;
        const target = preview.current;
        if (!source || !target) return;

        const follow = (from: HTMLElement, to: HTMLElement) => () => {
            if (syncing.current) return;

            const fromMax = from.scrollHeight - from.clientHeight;
            const toMax = to.scrollHeight - to.clientHeight;
            // 좁은 화면에서는 한 쪽만 보인다. 감춰진 칸은 0 이라 여기서 걸러진다.
            if (fromMax <= 0 || toMax <= 0) return;

            syncing.current = true;
            to.scrollTop = (from.scrollTop / fromMax) * toMax;
            // 위 대입이 부른 scroll 이벤트가 지나간 뒤에 푼다
            requestAnimationFrame(() => {
                syncing.current = false;
            });
        };

        const onWrite = follow(source, target);
        const onPreview = follow(target, source);

        source.addEventListener("scroll", onWrite, { passive: true });
        target.addEventListener("scroll", onPreview, { passive: true });
        return () => {
            source.removeEventListener("scroll", onWrite);
            target.removeEventListener("scroll", onPreview);
        };
    }, [write, preview]);
}
