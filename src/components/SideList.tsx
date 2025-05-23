// SideList.tsx
"use client";

import { allPosts } from "contentlayer/generated";
import { SideListWrapper } from "./SideList.styled";
import { useRecentPosts } from "@/hooks/useRecentPosts";
import SidePost from "./SidePost";
import Link from "next/link";

type Props = {
  type?: string; // 기본값 없음, recent일 때만 최근 포스트
  onLinkClick?: () => void;
};

export default function SideList({ type, onLinkClick }: Props) {
  const isRecent = type === "recent";
  const title = isRecent ? "Recently viewed" : "Latest posts";

  const { recentPosts, isLoading } = useRecentPosts();

  // 렌더링할 포스트 목록 결정
  const postsToRender = isRecent
    ? recentPosts
        .map((slug) => allPosts.find((post) => post.slug === slug))
        .filter((post): post is NonNullable<typeof post> => Boolean(post))
    : allPosts
        .slice()
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 5);

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
                key={post._id}
                href={`/${post.slug}`}
                className="side-link"
                onClick={onLinkClick}
              >
                <SidePost title={post.title} desc={post.description} thumbnail={post.thumbnail} />
              </Link>
            ))
          )}
        </div>
      </div>
    </SideListWrapper>
  );
}
