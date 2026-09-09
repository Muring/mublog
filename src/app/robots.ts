import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * /robots.txt.
 *
 * 크롤러를 막는 것이 목적이 아니라 사이트맵 위치를 알려주는 것이 목적이다.
 * disallow 는 색인돼도 의미 없는(로그인 상태에 따라 화면이 달라지는) 경로만 막는다 —
 * 접근 제어가 아니다. 실제 권한은 서버에서 profiles.role 로 판정한다.
 */
export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: ["/admin", "/api/", "/auth/", "/login"],
        },
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL,
    };
}
