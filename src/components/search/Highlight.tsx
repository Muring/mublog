import { Fragment } from "react";

/**
 * 검색어와 맞는 부분을 <mark> 로 감싼다.
 * HTML 문자열을 만들지 않고 조각을 나눠 엘리먼트로 그린다.
 */
export default function Highlight({ text, terms }: { text: string; terms: string[] }) {
    const needles = terms.filter(Boolean);
    if (needles.length === 0) return <>{text}</>;

    // 캡처 그룹으로 나누면 맞은 조각이 홀수 자리에 온다
    const pattern = new RegExp(`(${needles.map(escapeRegExp).join("|")})`, "gi");
    const parts = text.split(pattern);
    return (
        <>
            {parts.map((part, i) =>
                i % 2 === 1 ? (
                    <mark key={i}>{part}</mark>
                ) : (
                    <Fragment key={i}>{part}</Fragment>
                ),
            )}
        </>
    );
}

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
