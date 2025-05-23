"use client";

import { useEffect } from "react";
import { useRecentPosts } from "@/hooks/useRecentPosts";

export default function RecentPostTracker({ slug }: { slug: string }) {
  const { addRecentPost } = useRecentPosts();

  useEffect(() => {
    addRecentPost(slug);
  }, [slug, addRecentPost]);

  return null; // UI는 없고 side-effect만 발생
}
