// Phase 0 스모크 테스트: 파이프라인이 기대한 출력을 내는지 확인한다.
import { readFileSync } from "node:fs";
import matter from "gray-matter";
import { renderMarkdown, normalizeCallouts } from "../src/lib/markdown/render";

const checks: { name: string; pass: boolean; detail: string }[] = [];
function check(name: string, pass: boolean, detail = "") {
    checks.push({ name, pass, detail });
}

const read = (slug: string) =>
    matter(readFileSync(`backup/posts/${slug}.mdx`, "utf8")).content;

// 1. aside 정규화: 빈 줄 없는 케이스
const aside = read("docker-gcp-02-docker-installation");
check(
    "normalizeCallouts inserts blank line after <aside>",
    /<aside>\n\n/.test(normalizeCallouts(aside))
);

const asideHtml = await renderMarkdown(aside);
check(
    "aside 내부 **굵게** 가 <strong> 으로 렌더됨",
    /<aside>[\s\S]{0,200}<strong>/.test(asideHtml),
    asideHtml.slice(asideHtml.indexOf("<aside>"), asideHtml.indexOf("<aside>") + 160)
);
check("aside 요소 자체가 살아있음", asideHtml.includes("<aside>"));

// 2. jsx / tsx 하이라이팅 (refractor/common 이었다면 조용히 실패할 지점)
const spread = read("spread-and-rest-parameter");
const spreadHtml = await renderMarkdown(spread);
check(
    "tsx 코드블록에 token 클래스가 생성됨",
    /language-tsx/.test(spreadHtml) && /class="token /.test(spreadHtml)
);

const blogDev = read("salesforce-decorator-wire");
const blogDevHtml = await renderMarkdown(blogDev);
check(
    "jsx 코드블록에 token 클래스가 생성됨",
    /language-jsx/.test(blogDevHtml) && /class="token /.test(blogDevHtml)
);

// 3. prism-notion-theme.css 가 기대하는 클래스가 실제로 나오는지
// 2-1. js-extras 등록 순서 회귀 방지 (가장 조용히 깨지는 지점)
//
// js-extras 는 javascript 직후, jsx/tsx "앞"에 등록해야 한다.
// 뒤로 밀리면 javascript 에만 반영되고 jsx/tsx 에는 빠지는데,
// 그러면 method/arrow/property-access 로 잡히던 토큰이 전부 function 으로 넘어간다.
// .token.function 은 테마가 색을 입히는 클래스라 코드블록 색이 실제로 달라진다.
// 펜스 언어 존재 여부만 보는 검사로는 절대 잡히지 않는다.
const extrasProbe = await renderMarkdown(
    ["```jsx", 'import x from "y";', "const i = d.map((v) => v.n);", "console.log(i.length);", "```"].join("\n")
);
const probeCounts: Record<string, number> = {};
for (const m of extrasProbe.matchAll(/class="token ([a-z-]+)/g)) {
    probeCounts[m[1]] = (probeCounts[m[1]] ?? 0) + 1;
}
const probeTokens = (type: string) => probeCounts[type] ?? 0;

check(
    "js-extras 가 jsx 에 적용됨 (등록 순서)",
    probeTokens("method") > 0 && probeTokens("arrow") > 0,
    `method=${probeTokens("method")} arrow=${probeTokens("arrow")} function=${probeTokens("function")}` +
        " / js-extras 를 jsx 앞으로 옮겨야 합니다"
);

check("code-highlight 클래스 존재", spreadHtml.includes("code-highlight"));
check("code-line 클래스 존재", spreadHtml.includes("code-line"));

// 4. GFM 표 + 표 안 <br />
const ssh = read("ssh-key");
const sshHtml = await renderMarkdown(ssh);
check("GFM 표가 <table> 로 렌더됨", sshHtml.includes("<table>"));
check("표 셀 안 <br /> 생존", /<br\s*\/?>/.test(sshHtml));

// 5. rehype-slug 로 heading id 부여
check("heading 에 id 부여됨", /<h2 id="/.test(spreadHtml) || /<h3 id="/.test(spreadHtml));

// 6. 본문 이미지가 순수 <img> (기존 DOM 과 동일해야 함)
const ciCd = read("salesforce-ci-cd-basic");
const ciCdHtml = await renderMarkdown(ciCd);
check("본문 이미지가 <img> 로 렌더됨", /<img src="\/images\//.test(ciCdHtml));

let failed = 0;
for (const c of checks) {
    console.log(`${c.pass ? "PASS" : "FAIL"}  ${c.name}`);
    if (!c.pass) {
        failed++;
        if (c.detail) console.log(`      ${c.detail.replace(/\n/g, "\n").slice(0, 200)}`);
    }
}
console.log(`\n${checks.length - failed}/${checks.length} passed`);
process.exit(failed ? 1 : 0);
