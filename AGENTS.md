# AGENTS.md

이 프로젝트의 실제 개발 규칙은 **[CLAUDE.md](./CLAUDE.md)** 에 있다. 그쪽을 읽는다.

이 파일은 아래 블록을 담아두는 자리다. `next dev` 는 에이전트가 감지되면
`AGENTS.md` 나 `CLAUDE.md` 에 자기 블록을 써 넣는데, 끄는 설정이 없다.
`AGENTS.md` 가 블록을 갖고 있으면 `CLAUDE.md` 는 건드리지 않으므로
(`node_modules/next/dist/server/lib/generate-agent-files.js`),
손으로 쓴 규칙과 도구가 관리하는 텍스트를 이렇게 갈라 둔다.

마커 사이는 Next 가 덮어쓴다. 거기에 우리 내용을 적지 않는다.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
