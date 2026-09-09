// src/app/page.tsx

import type { Metadata } from "next";
import Profile from "@/components/Profile";
import PostGrid from "@/components/post/PostGrid";
import SiteStats from "@/components/stats/SiteStats";
import { getAllTags, getPublishedPosts } from "@/lib/posts";
import { SITE_DESCRIPTION, SITE_NAME, baseOpenGraph } from "./shared-metadata";

/*
 * 태그는 `?tag=` 로 오므로 이 페이지는 요청 시점 렌더링이다.
 * 정적 프리렌더를 포기하는 대신 목록이 서버 HTML 에 실린다 —
 * 예전처럼 PostGrid 안에서 useSearchParams 를 읽으면 Next 가 그 서브트리를
 * 정적 셸에서 빼버려서, 크롤러에게는 빈 div 하나만 남았다.
 * 데이터는 getPublishedPosts 의 unstable_cache 가 받치므로 DB 는 매 요청 안 탄다.
 */
export const metadata: Metadata = {
  // `?tag=` 변형들이 각각 색인되지 않도록 전부 "/" 를 가리킨다
  alternates: { canonical: "/" },
  openGraph: {
    ...baseOpenGraph,
    type: "website",
    url: "/",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

type Props = {
  searchParams: Promise<{ tag?: string | string[] }>;
};

export default async function Home({ searchParams }: Props) {
  const [{ tag }, posts, tags] = await Promise.all([
    searchParams,
    getPublishedPosts(),
    getAllTags(),
  ]);

  // `?tag=a&tag=b` 로 오면 배열이다. 필터는 하나만 받는다.
  const selectedTag = typeof tag === "string" ? tag : null;

  return (
    <div className="home">
      <Profile />
      <SiteStats />
      <PostGrid posts={posts} tags={tags} selectedTag={selectedTag} />
    </div>
  );
}
