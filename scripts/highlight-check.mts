import { unified } from "unified";
import rehypeRaw from "rehype-raw";
import type { Element, Root, RootContent } from "hast";
import { refractor } from "../src/lib/markdown/prism";

type Node = Root | RootContent;
const children = (node: Node): RootContent[] => "children" in node ? node.children : [];
const text = (node: Node): string => node.type === "text" ? node.value : children(node).map(text).join("");
const classes = (node: Element): string[] => (node.properties.className as string[] | undefined) ?? [];
type TokenNode = { type: string; properties?: { className?: unknown }; children?: TokenNode[] };
const hasToken = (node: TokenNode): boolean =>
    (node.type === "element" && Array.isArray(node.properties?.className) && node.properties.className.includes("token")) ||
    (node.children ?? []).some(hasToken);

/** 언어 클래스는 미등록 언어에도 붙는다. 각 블록의 문법 등록과 실제 토큰을 따로 검사한다. */
export async function checkCodeHighlighting(html: string): Promise<string[]> {
    const root = await unified().use(rehypeRaw).run({ type: "root", children: [{ type: "raw", value: html }] } as Root);
    const issues: string[] = [];
    function visit(node: Node) {
        if (node.type === "element" && node.tagName === "pre") {
            for (const code of node.children) {
                if (code.type !== "element" || code.tagName !== "code") continue;
                const label = classes(code).find((name) => name.startsWith("language-"))?.slice(9).toLowerCase();
                if (!label) continue;
                const language = label.startsWith("diff-") ? label.slice(5) : label;
                if (!refractor.registered(language)) {
                    issues.push(`${label} 문법 미등록`);
                } else if (hasToken(refractor.highlight(text(code), language)) && !hasToken(code)) {
                    issues.push(`${label} 코드블록 토큰 누락`);
                }
                // text 및 문법상 토큰이 없는 식별자·빈 블록은 정상이다.
            }
        }
        children(node).forEach(visit);
    }
    visit(root);
    return issues;
}
