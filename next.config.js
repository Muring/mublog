// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Next.js 16 기본 번들러(Turbopack)를 "의도적으로 사용"한다고 명시
    turbopack: {},
    // Prisma 는 네이티브 엔진을 로드하므로 번들링 대상에서 제외한다
    serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg"],
    /*
     * public/ 은 CDN 이 주는 정적 파일이지 함수가 읽을 것이 아니다. 서버 코드가
     * public/ 을 fs 로 읽으면(경로에 변수가 섞이면) 트레이서가 폴더를 통째로 함수 번들에
     * 싣고, 그것이 배포마다 쌓여 Vercel Function Storage 를 먹는다. 빌드도 lint 도
     * 잡아 주지 않으므로 여기서 아예 막는다.
     */
    outputFileTracingExcludes: { "/*": ["public/**"] },
    images: {
        remotePatterns: [
            // 에디터에서 업로드한 포스트 이미지
            {
                protocol: "https",
                hostname: "*.supabase.co",
                pathname: "/storage/v1/object/public/**",
            },
            // 댓글 작성자 아바타
            {
                protocol: "https",
                hostname: "avatars.githubusercontent.com",
                pathname: "/**",
            },
        ],
    },
};

module.exports = nextConfig;
