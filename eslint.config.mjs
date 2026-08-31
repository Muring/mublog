import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

/**
 * ESLint flat config.
 *
 * Next 15 에서 `next lint` 가 사라져 package.json 의 lint 스크립트가
 * 죽어 있었다. eslint 를 직접 물린다.
 */
export default [
    {
        ignores: [
            ".next/**",
            "node_modules/**",
            // prisma generate 산출물. 우리 코드가 아니고 크다.
            "src/generated/**",
            // Next 가 만들고 직접 편집하지 않는 파일
            "next-env.d.ts",
        ],
    },

    ...nextCoreWebVitals,
    ...nextTypeScript,

    {
        rules: {
            // 쓰지 않는 값은 지운다. 다만 _ 로 시작하면 의도적으로 버린 것으로 본다.
            "@typescript-eslint/no-unused-vars": [
                "warn",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "^_",
                },
            ],
        },
    },

    {
        // 스크립트는 콘솔 출력이 곧 결과물이다.
        files: ["scripts/**/*.mts"],
        rules: {
            "no-console": "off",
        },
    },

    {
        /*
         * .styled.tsx 는 이 저장소 전체가 `export default { Wrapper, Body, ... }` 로
         * 이름 묶음을 내보내는 규칙을 따른다. 쓰는 쪽에서 `Card.Wrapper` 로 읽히는 게
         * 목적이라, 규칙에 맞추려고 변수를 하나 더 두는 것은 이득이 없다.
         */
        files: ["**/*.styled.tsx", "eslint.config.mjs"],
        rules: {
            "import/no-anonymous-default-export": "off",
        },
    },
];
