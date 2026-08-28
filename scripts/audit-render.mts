// 25개 포스트 전체를 파이프라인에 통과시켜 무증상 회귀를 찾는다.
import { readdirSync, readFileSync, existsSync } from "node:fs";
import matter from "gray-matter";
import { renderMarkdown } from "../src/lib/markdown/render";

const DIR = "src/contents/posts";
const files = readdirSync(DIR).filter((f) => f.endsWith(".mdx"));
let problems = 0;

console.log(`포스트 ${files.length}개 검사\n`);

for (const file of files) {
    const slug = file.replace(/\.mdx$/, "");
    const raw = readFileSync(`${DIR}/${file}`, "utf8");
    const { data, content } = matter(raw);
    const issues: string[] = [];

    let html: string;
    try {
        html = await renderMarkdown(content);
    } catch (err) {
        console.log(`ERROR ${slug}: ${(err as Error).message}`);
        problems++;
        continue;
    }

    // 단언 3: <aside> 직후 굵게 문법이 문자 그대로 남았는가
    if (/<aside>\s*\*\*/.test(html)) issues.push("aside 내부 마크다운 미파싱");

    // 단언 4: 언어 지정 펜스 수 만큼 하이라이팅이 되었는가
    const fences = [...content.matchAll(/^```[a-zA-Z]+/gm)].map((m) => m[0].slice(3));
    const highlighted = [...html.matchAll(/class="[^"]*language-([a-zA-Z]+)/g)].map((m) => m[1]);
    for (const lang of new Set(fences)) {
        if (!highlighted.includes(lang)) issues.push(`${lang} 미하이라이팅`);
    }
    if (fences.length > 0 && !html.includes('class="token ')) {
        issues.push("token 클래스 전무");
    }

    // 프론트매터 필수 필드
    if (!data.title) issues.push("title 없음");
    if (!data.date) issues.push("date 없음");

    // 로컬 이미지 실재 여부
    const imgs = [...html.matchAll(/<img src="(\/[^"]+)"/g)].map((m) => m[1]);
    const thumb = data.thumbnail as string | undefined;
    for (const p of [...imgs, ...(thumb ? [thumb] : [])]) {
        if (!existsSync(`public${decodeURIComponent(p)}`)) issues.push(`이미지 없음: ${p}`);
    }

    if (issues.length) {
        problems++;
        console.log(`FAIL ${slug}`);
        issues.forEach((i) => console.log(`     - ${i}`));
    }
}

console.log(problems === 0 ? "\n모든 포스트 통과" : `\n문제 있는 포스트 ${problems}개`);
process.exit(problems ? 1 : 0);
