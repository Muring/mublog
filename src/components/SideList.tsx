// SideList.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { SideListWrapper } from "./SideList.styled";
import { useRecentPosts } from "@/hooks/useRecentPosts";
import SidePost from "./SidePost";
import Link from "next/link";
import type { PostSummary } from "@/types/post";
import { fetchJson } from "@/lib/fetcher";

type Props = {
  type?: string; // 기본값 없음, recent일 때만 최근 포스트
  onLinkClick?: () => void;
};

function fetchPosts(): Promise<PostSummary[]> {
  return fetchJson<PostSummary[]>("/api/posts/summary");
}

export default function SideList({ type, onLinkClick }: Props) {
  const isRecent = type === "recent";
  const title = isRecent ? "Recently viewed" : "Latest posts";

  const { recentPosts, isLoading: isRecentLoading } = useRecentPosts();
  const { data: posts = [], isLoading: isPostsLoading } = useQuery({
    queryKey: ["posts", "summary"],
    queryFn: fetchPosts,
    staleTime: 5 * 60_000,
  });

  const isLoading = isPostsLoading || (isRecent && isRecentLoading);

  // 렌더링할 포스트 목록 결정. 목록은 서버에서 이미 최신순으로 정렬돼 온다.
  const postsToRender = isRecent
    ? recentPosts
        .map((slug) => posts.find((post) => post.slug === slug))
        .filter((post): post is PostSummary => Boolean(post))
    : posts.slice(0, 5);

  return (
    <SideListWrapper>
      <div className="side-list-container">
        <div className="side-list-title">
          <h5>{title}</h5>
          <hr />
        </div>
        <div className="side-list-content">
          {isLoading ? (
            <p className="status-text desc">불러오는 중...</p>
          ) : postsToRender.length === 0 ? (
            <p className="status-text">표시할 포스트가 없습니다.</p>
          ) : (
            postsToRender.map((post) => (
              <Link
                key={post.id}
                href={`/${post.slug}`}
                className="side-link"
                onClick={onLinkClick}
              >
                <SidePost
                  title={post.title}
                  desc={post.description ?? undefined}
                  thumbnail={post.thumbnail ?? undefined}
                />
              </Link>
            ))
          )}
        </div>
      </div>
    </SideListWrapper>
  );
}
