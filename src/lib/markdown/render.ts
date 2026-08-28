import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypePrismGenerator from "rehype-prism-plus/generator";
import rehypeStringify from "rehype-stringify";
import { refractor } from "./prism";

// 플러그인 순서가 결과를 좌우한다.
//
// remarkRehype 의 allowDangerousHtml 로 원본 HTML 을 raw 노드로 흘려보낸 뒤,
// rehypeRaw 가 parse5 로 재파싱해 실제 엘리먼트로 만든다. 이 단계 전까지
// <aside> 는 불투명한 문자열이라 Prism 이 내부 코드블록을 볼 수 없다.
// 따라서 rehypeRaw 는 반드시 remarkRehype 뒤, rehypePrism 앞에 와야 한다.
const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypePrismGenerator(refractor), { ignoreMissing: true })
    .use(rehypeStringify, { allowDangerousHtml: true });

/**
 * Notion 에서 옮겨온 <aside> 콜아웃 보정.
 *
 * MDX 는 <aside> 를 JSX flow element 로 파싱해 내부 마크다운을 그대로 처리했지만,
 * CommonMark 는 HTML 블록으로 보고 다음 빈 줄까지 전부 raw HTML 로 삼킨다.
 * 그 결과 **굵게** 같은 문법이 문자 그대로 렌더된다.
 * 여는/닫는 태그 주변에 빈 줄을 넣어 내부를 다시 마크다운으로 파싱시킨다.
 */
export function normalizeCallouts(markdown: string): string {
    return markdown
        .replace(/^([ \t]*<aside>[ \t]*)\n(?!\n)/gm, "$1\n\n")
        .replace(/(?<!\n)\n([ \t]*<\/aside>[ \t]*)$/gm, "\n\n$1");
}

/** 마크다운 원문을 포스트 본문 HTML 로 변환한다. 저장 시점에 1회 호출된다. */
export async function renderMarkdown(markdown: string): Promise<string> {
    const file = await processor.process(normalizeCallouts(markdown));
    return String(file);
}
