// src/app/page.tsx

import Profile from "@/components/Profile";
import PostGrid from "@/components/PostGrid";
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
      {/* PostGrid 가 useSearchParams 를 쓰므로 Suspense 경계가 필요하다 */}
      <Suspense fallback={<div>Loading posts...</div>}>
        <PostGrid posts={posts} tags={tags} />
      </Suspense>
    </div>
  );
}
