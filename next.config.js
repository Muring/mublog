// next.config.js

const { withContentlayer } = require("next-contentlayer2");

// module.exports = withContentlayer({});
// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Next.js 16 기본 번들러(Turbopack)를 “의도적으로 사용”한다고 명시
    turbopack: {},
};
module.exports = withContentlayer(nextConfig);

// const baseConfig = {
//     webpack(config, { dev }) {
//         if (dev) {
//             config.watchOptions = {
//                 ignored: ["**/node_modules/**", "**/.git/**", "**/.next/**"],
//             };
//         }
//         return config;
//     },
// };

// module.exports = withContentlayer(baseConfig);
