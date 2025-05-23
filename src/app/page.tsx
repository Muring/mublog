// src/app/page.tsx

import Profile from "@/components/Profile";
import PostGrid from "@/components/PostGird";
import { Suspense } from "react";

export default function Home() {
  return (
    <div className="home">
      <Profile />
      <Suspense fallback={<div>Loading posts...</div>}>
        <PostGrid />
      </Suspense>
    </div>
  );
}
