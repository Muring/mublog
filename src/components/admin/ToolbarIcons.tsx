/**
 * 에디터 툴바 아이콘.
 *
 * 글자로 적어두면 "인라인코드" 처럼 긴 라벨이 툴바를 밀어내고, 좁은 화면에서
 * 줄바꿈된다. 아이콘은 폭이 일정해서 그 문제가 없다.
 *
 * currentColor 를 쓰므로 버튼의 색을 그대로 따라간다. 호버하면 면이 밝아지고
 * 글자색이 뒤집히는데, 아이콘도 함께 뒤집혀야 보이기 때문이다.
 * 크기는 부모의 font-size 를 따르도록 em 으로 둔다.
 */

const base = {
    width: "1.15em",
    height: "1.15em",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
};

/** 인라인 코드: 꺾쇠 한 쌍 */
export const InlineCodeIcon = () => (
    <svg {...base}>
        <polyline points="9 8 5 12 9 16" />
        <polyline points="15 8 19 12 15 16" />
    </svg>
);

/** 코드블록: 창 안의 꺾쇠 */
export const CodeBlockIcon = () => (
    <svg {...base}>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <polyline points="9 10 7 12 9 14" />
        <polyline points="13 10 15 12 13 14" />
    </svg>
);

/** 링크: 사슬 */
export const LinkIcon = () => (
    <svg {...base}>
        <path d="M10 13a5 5 0 0 0 7.1 0l3-3a5 5 0 0 0-7.1-7.1L11.5 4.5" />
        <path d="M14 11a5 5 0 0 0-7.1 0l-3 3a5 5 0 0 0 7.1 7.1l1.5-1.4" />
    </svg>
);

/** 콜아웃: 전구 */
export const CalloutIcon = () => (
    <svg {...base}>
        <path d="M9 18h6" />
        <path d="M10 21h4" />
        <path d="M12 3a6 6 0 0 0-3.5 10.9c.4.3.6.7.6 1.1h5.8c0-.4.2-.8.6-1.1A6 6 0 0 0 12 3Z" />
    </svg>
);

/** 인용: 여는 따옴표 */
export const QuoteIcon = () => (
    <svg {...base}>
        <path d="M7 15c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3c0 3.5-1.5 5.5-4 6.5" />
        <path d="M17 15c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3c0 3.5-1.5 5.5-4 6.5" />
    </svg>
);
