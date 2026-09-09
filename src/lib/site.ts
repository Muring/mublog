/**
 * 사이트의 정본 origin.
 *
 * canonical·og:url·sitemap 이 전부 이 값으로 절대 URL 을 만든다.
 * 여기가 틀리면 빌드도 lint 도 통과하고 화면도 멀쩡한데 색인만 조용히 망가진다 —
 * 그래서 값이 없을 때 localhost 로 곧장 떨어지지 않고 Vercel 이 주는
 * 프로덕션 도메인을 한 단계 거친다.
 *
 * `NEXT_PUBLIC_` 이라 빌드 시점에 번들로 인라인된다. 런타임에 바꿀 수 없다.
 */
function resolveSiteUrl(): string {
    const explicit = process.env.NEXT_PUBLIC_SITE_URL;
    if (explicit) return explicit;

    // Vercel 이 프로젝트 환경변수 없이도 채워주는 프로덕션 도메인 (프로토콜 없음)
    const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
    if (vercel) return `https://${vercel}`;

    return "http://localhost:3000";
}

/** 뒤 슬래시는 지운다. `${SITE_URL}/sitemap.xml` 이 `//` 로 겹치지 않게. */
export const SITE_URL = resolveSiteUrl().replace(/\/+$/, "");
