// SideList.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { SideListWrapper } from "./SideList.styled";
import { useRecentPosts } from "@/hooks/useRecentPosts";
import SidePost from "./SidePost";
import { SidePostWrapper } from "./SidePost.styled";
import { Skeleton } from "@/components/ui/Skeleton.styled";
import Link from "next/link";
import type { PostSummary } from "@/types/post";
import { fetchPostsSummary, queryKeys } from "@/lib/queries";

/** 메뉴를 열기 전에 헤더가 미리 받아 둘 수 있도록 옵션을 한곳에 둔다 */
export const postsSummaryQuery = {
  queryKey: queryKeys.postsSummary,
  queryFn: fetchPostsSummary,
  staleTime: 5 * 60_000,
};

type Props = {
  type?: string; // 기본값 없음, recent일 때만 최근 포스트
  onLinkClick?: () => void;
};

export default function SideList({ type, onLinkClick }: Props) {
  const isRecent = type === "recent";
  const title = isRecent ? "Recently viewed" : "Latest posts";

  const { recentPosts, isLoading: isRecentLoading } = useRecentPosts();
  const { data: posts = [], isLoading: isPostsLoading } = useQuery(postsSummaryQuery);

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
            // 실제 항목과 같은 썸네일·두 줄 자리. 최근 본 글은 개수를 이미 알고(localStorage) 있어 그만큼만 깐다
            <div role="status" aria-label="포스트를 불러오는 중">
              {Array.from({ length: isRecent ? recentPosts.length : 5 }, (_, i) => (
                <div key={i} className="side-link" aria-hidden>
                  <SidePostWrapper>
                    <Skeleton style={{ width: 40, height: 40, flexShrink: 0, borderRadius: "0.5rem" }} />
                    <div className="text-container" style={{ flex: 1 }}>
                      <Skeleton style={{ width: i % 2 ? "70%" : "85%", height: "0.95rem" }} />
                      <Skeleton style={{ width: "55%", height: "0.7rem" }} />
                    </div>
                  </SidePostWrapper>
                </div>
              ))}
            </div>
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
