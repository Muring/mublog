# Next.js basic starter

The most simple format of how to start Next.js project in Typescript with Emotion.

## Directory example

```
mublog/
├── public/
│   └── images/
│       └── profile.jpg
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # 공통 레이아웃
│   │   ├── page.tsx                    # 홈 페이지
│   │   ├── about/page.tsx              # About 페이지
│   │   ├── projects/page.tsx           # 프로젝트 목록
│   │   ├── projects/[slug]/page.tsx    # 동적 라우팅
│   │   └── not-found.tsx               # 404 페이지
│   │
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── ProjectCard.tsx
│   │   └── ThemeToggle.tsx
│   │
│   ├── styles/
│   │   ├── global.ts              # Emotion 글로벌 스타일
│   │   └── theme.ts               # 다크/라이트 테마 정의
│   │
│   ├── content/                   # 정적 콘텐츠 (MDX 등)
│   │   └── projects/
│   │       └── my-project.mdx
│   │
│   ├── lib/                       # 유틸 함수, 데이터 처리 등
│   │   └── getProjects.ts
│   │
│   └── types/                     # 공통 타입 정의
│       └── project.ts
│
├── contentlayer.config.ts        # Contentlayer 설정 (사용 시)
├── next.config.js
├── tsconfig.json
├── .eslintrc.js
└── package.json
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

-   [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
-   [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
