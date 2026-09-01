// src/app/page.tsx

import Profile from "@/components/Profile";
import PostGrid from "@/components/post/PostGrid";
import SiteStats from "@/components/SiteStats";
import { getAllTags, getPublishedPosts } from "@/lib/posts";
import { Suspense } from "react";

export const revalidate = 3600;

export default async function Home() {
  const [posts, tags] = await Promise.all([getPublishedPosts(), getAllTags()]);

  return (
    <div className="home">
      <Profile />
      <SiteStats />
      {/*
        PostGrid 가 useSearchParams 를 쓰므로 Suspense 경계가 필요하다.
        fallback 이 한 줄짜리면 목록이 채워질 때 높이가 크게 뛰므로
        그리드와 같은 높이를 미리 잡아둔다.
      */}
      <Suspense fallback={<div style={{ minHeight: "80vh" }} />}>
        <PostGrid posts={posts} tags={tags} />
      </Suspense>
    </div>
  );
}
