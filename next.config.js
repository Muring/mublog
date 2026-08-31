// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Next.js 16 기본 번들러(Turbopack)를 "의도적으로 사용"한다고 명시
    turbopack: {},
    // Prisma 는 네이티브 엔진을 로드하므로 번들링 대상에서 제외한다
    serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg"],
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
