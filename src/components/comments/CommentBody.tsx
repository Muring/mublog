import { Fragment } from "react";

// split 용은 캡처 그룹이 있어야 구분자까지 결과에 남는다.
const SPLIT_URL = /(https?:\/\/[^\s<>"']+)/g;
// 판별용은 반드시 non-global 이어야 한다.
// /g 정규식의 test() 는 lastIndex 를 들고 다녀서 같은 문자열에도 true/false 가 번갈아 나온다.
const IS_URL = /^https?:\/\/[^\s<>"']+$/;

/**
 * 댓글 본문을 평문으로 그린다.
 *
 * 포스트 본문과 정반대 정책이다. 포스트는 작성자가 나뿐이라 sanitize 없이
 * HTML 을 그대로 살리지만(그래야 <aside> 콜아웃이 유지된다), 댓글은
 * 신뢰할 수 없는 입력이라 HTML 을 아예 만들지 않는다.
 *
 * dangerouslySetInnerHTML 을 쓰지 않고 React 엘리먼트만 반환하므로
 * 저장형 XSS 표면이 원천적으로 존재하지 않는다. 줄바꿈은 CSS 의
 * white-space: pre-wrap 이 처리한다.
 */
export default function CommentBody({ text }: { text: string }) {
    const parts = text.split(SPLIT_URL);

    return (
        <>
            {parts.map((part, index) =>
                IS_URL.test(part) ? (
                    <a
                        key={index}
                        href={part}
                        target="_blank"
                        rel="nofollow ugc noopener noreferrer"
                    >
                        {part}
                    </a>
                ) : (
                    <Fragment key={index}>{part}</Fragment>
                )
            )}
        </>
    );
}
