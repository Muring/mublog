// // next.config.js

const { withContentlayer } = require("next-contentlayer");

// module.exports = withContentlayer({});
// next.config.js

/** @type {import('next').NextConfig} */
const baseConfig = {
  webpack(config, { dev }) {
    if (dev) {
      config.watchOptions = {
        ignored: ["**/node_modules/**", "**/.git/**", "**/.next/**"],
      };
    }
    return config;
  },
};

module.exports = withContentlayer(baseConfig);
