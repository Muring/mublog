import { useEffect, type RefObject } from "react";

/** 원문 픽셀 위치와 그에 대응하는 미리보기 픽셀 위치 한 쌍 */
type Anchor = { src: number; pv: number };

/**
 * 원문에서 제목 줄의 번호.
 *
 * 코드펜스 안의 # 은 주석이지 제목이 아니다. 이 저장소의 글에도 bash·yaml
 * 코드블록 안에 # 로 시작하는 줄이 여럿 있어서, 세지 않으면 짝이 어긋난다.
 */
function headingLineIndexes(markdown: string): number[] {
    const result: number[] = [];
    let inFence = false;

    markdown.split("\n").forEach((line, index) => {
        if (/^\s*(`{3}|~{3})/.test(line)) {
            inFence = !inFence;
            return;
        }
        if (!inFence && /^#{1,6}\s/.test(line)) result.push(index);
    });

    return result;
}

/**
 * 원문에서 각 제목 줄이 몇 px 에 있는지.
 *
 * textarea 는 줄의 위치를 알려주지 않는다. "줄 번호 x 줄 높이" 로 대신할 수도 없다 —
 * 줄바꿈이 있고, 한글은 Consolas 에 없어 대체 글꼴로 그려지므로 글자 수로 폭을 셀 수
 * 없다. 그래서 같은 글꼴·같은 폭의 거울을 화면 밖에 그려 직접 잰다.
 */
function measureSourceTops(area: HTMLTextAreaElement, lineIndexes: number[]): number[] {
    if (lineIndexes.length === 0) return [];

    const style = getComputedStyle(area);
    const mirror = document.createElement("div");

    Object.assign(mirror.style, {
        position: "absolute",
        top: "0",
        left: "-9999px",
        visibility: "hidden",
        boxSizing: "border-box",
        whiteSpace: "pre-wrap",
        // clientWidth 는 스크롤 막대가 차지한 만큼을 이미 뺀 값이라
        // 원본과 같은 자리에서 줄이 접힌다.
        width: `${area.clientWidth}px`,
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        fontStyle: style.fontStyle,
        lineHeight: style.lineHeight,
        letterSpacing: style.letterSpacing,
        padding: style.padding,
        tabSize: style.tabSize,
        wordBreak: style.wordBreak,
        overflowWrap: style.overflowWrap,
    });

    const wanted = new Set(lineIndexes);
    const markers: HTMLElement[] = [];
    const lines = area.value.split("\n");

    for (let index = 0; index < lines.length; index++) {
        if (wanted.has(index)) {
            const marker = document.createElement("span");
            // 폭이 0 인 글자를 넣어야 자리가 잡힌다. 줄 맨 앞이라 줄바꿈에는 영향이 없다.
            marker.textContent = "​";
            mirror.appendChild(marker);
            markers.push(marker);
        }
        mirror.appendChild(document.createTextNode(lines[index] + "\n"));
    }

    document.body.appendChild(mirror);
    const tops = markers.map((marker) => marker.offsetTop);
    mirror.remove();

    return tops;
}

/** 미리보기에서 각 제목이 스크롤 상자 기준 몇 px 에 있는지 */
function measurePreviewTops(pane: HTMLElement, content: HTMLElement): number[] {
    const origin = pane.getBoundingClientRect().top - pane.scrollTop;
    return [...content.querySelectorAll("h1,h2,h3,h4,h5,h6")].map(
        (heading) => heading.getBoundingClientRect().top - origin
    );
}

/**
 * 기준점 목록. 두 축 모두에서 앞선 점보다 큰 것만 남긴다.
 *
 * 순서가 뒤집힌 점이 섞이면 그 구간의 기울기가 음수가 되어 반대로 움직인다.
 * 양 끝(0 과 끝까지)을 함께 넣으므로, 제목이 하나도 없으면 자연히 비율 방식이 된다.
 */
function buildAnchors(srcTops: number[], pvTops: number[], srcMax: number, pvMax: number): Anchor[] {
    const anchors: Anchor[] = [{ src: 0, pv: 0 }];
    const pairs = Math.min(srcTops.length, pvTops.length);

    for (let index = 0; index < pairs; index++) {
        const src = Math.min(srcTops[index], srcMax);
        const pv = Math.min(pvTops[index], pvMax);
        const last = anchors[anchors.length - 1];
        if (src > last.src && pv > last.pv) anchors.push({ src, pv });
    }

    const last = anchors[anchors.length - 1];
    if (srcMax > last.src && pvMax > last.pv) anchors.push({ src: srcMax, pv: pvMax });

    return anchors;
}

/** 한 축의 위치를 다른 축으로 옮긴다. 제목 사이는 그 두 점 사이로 비례 배분한다. */
function project(anchors: Anchor[], value: number, from: keyof Anchor): number {
    if (anchors.length < 2) return value;
    const to: keyof Anchor = from === "src" ? "pv" : "src";

    let index = 1;
    while (index < anchors.length - 1 && anchors[index][from] <= value) index++;

    const before = anchors[index - 1];
    const after = anchors[index];
    const span = after[from] - before[from];
    if (span <= 0) return after[to];

    return before[to] + ((value - before[from]) / span) * (after[to] - before[to]);
}

/**
 * 본문과 미리보기가 같은 곳을 보게 한다.
 *
 * 제목을 기준점으로 삼아 구간마다 따로 비율을 맞춘다. 전체를 하나의 비율로 맞추면
 * 표나 코드블록처럼 원문과 렌더 결과의 밀도가 다른 구간에서 밀린다 — 이 저장소의
 * 긴 글에서 평균 244px, 최대 594px 이었고 칸 높이가 679px 이니 거의 한 화면이다.
 * 제목마다 다시 맞추면 그 오차가 구간 안에 갇힌다.
 *
 * 다시 재는 시점은 스크롤이 시작될 때다. 타자를 칠 때마다 재면 긴 글에서는 거울을
 * 그리는 값이 매번 붙는데, 정작 그때는 스크롤하지 않는다.
 */
export function useScrollSync(
    write: RefObject<HTMLTextAreaElement | null>,
    preview: RefObject<HTMLElement | null>,
    previewContent: RefObject<HTMLElement | null>,
    html: string
) {
    useEffect(() => {
        const area = write.current;
        const pane = preview.current;
        const content = previewContent.current;
        if (!area || !pane || !content) return;

        let anchors: Anchor[] = [];
        let stale = true;
        // 맞춰준 쪽에서 scroll 이 되올라와 둘이 서로를 밀어내는 것을 막는다
        let syncing = false;

        const remeasure = () => {
            anchors = buildAnchors(
                measureSourceTops(area, headingLineIndexes(area.value)),
                measurePreviewTops(pane, content),
                area.scrollHeight - area.clientHeight,
                pane.scrollHeight - pane.clientHeight
            );
            stale = false;
        };

        const follow = (from: HTMLElement, to: HTMLElement, axis: keyof Anchor) => () => {
            if (syncing) return;

            const toMax = to.scrollHeight - to.clientHeight;
            // 좁은 화면에서는 한 쪽만 보인다. 감춰진 칸은 여기서 걸러진다.
            if (toMax <= 0 || from.clientHeight === 0) return;

            if (stale) remeasure();

            syncing = true;
            to.scrollTop = Math.max(0, Math.min(toMax, project(anchors, from.scrollTop, axis)));
            // 위 대입이 부른 scroll 이벤트가 지나간 뒤에 푼다
            requestAnimationFrame(() => {
                syncing = false;
            });
        };

        const onWrite = follow(area, pane, "src");
        const onPreview = follow(pane, area, "pv");
        area.addEventListener("scroll", onWrite, { passive: true });
        pane.addEventListener("scroll", onPreview, { passive: true });

        // 이미지가 늦게 뜨거나 칸 폭이 바뀌면 높이가 달라진다.
        // 미리보기 본문과 입력란의 크기 변화 하나로 두 경우를 모두 잡는다.
        const invalidate = () => {
            stale = true;
        };
        const observer = new ResizeObserver(invalidate);
        observer.observe(content);
        observer.observe(area);

        return () => {
            area.removeEventListener("scroll", onWrite);
            pane.removeEventListener("scroll", onPreview);
            observer.disconnect();
        };
        // html 이 바뀌면 이 effect 가 다시 돌며 stale 이 true 로 돌아간다
    }, [write, preview, previewContent, html]);
}
