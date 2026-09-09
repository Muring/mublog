"use client";

import { useState, useRef, useEffect } from "react";
import { PostGridWrapper, GridList } from "./PostGrid.styled";
import TagMenu from "@/components/post/TagMenu";
import Link from "next/link";
import PostCard from "./PostCard";
import type { PostSummary } from "@/types/post";

const BATCH_SIZE = 6;

type Props = {
  /** 서버에서 최신순으로 정렬해 내려준다 */
  posts: PostSummary[];
  tags: string[];
  /**
   * 선택된 태그. 여기서 useSearchParams 로 직접 읽지 않는다 —
   * 읽는 순간 이 컴포넌트가 정적 셸에서 빠져 서버 HTML 에 카드가 사라진다.
   * page.tsx 가 searchParams 에서 뽑아 내려준다.
   */
  selectedTag: string | null;
};

export default function PostGrid({ posts, tags, selectedTag }: Props) {
  // 포스트 필터링
  const filteredPosts =
    !selectedTag || selectedTag === "all"
      ? posts
      : posts.filter((post) => post.tags.includes(selectedTag));

  // 한 번에 보여줄 포스트 개수 6개 정의
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const observerRef = useRef<HTMLDivElement | null>(null);

  // Lazy loading 구현
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((prev) => prev + BATCH_SIZE);
        }
      },
      { threshold: 1 }
    );

    // observeRef에 연결된 div가 보일 때마다 다음 6개 포스트 로딩
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, []);

  const visiblePosts = filteredPosts.slice(0, visibleCount);

  return (
    <PostGridWrapper>
      <TagMenu tags={tags} selectedTag={selectedTag} />
      <GridList key={selectedTag}>
        {visiblePosts.map((post, index) => (
          <li key={post.id}>
            <Link href={`/${post.slug}`}>
              <PostCard post={post} style={{ animationDelay: `${index * 0.05}s` }} />
            </Link>
          </li>
        ))}
      </GridList>
      <div ref={observerRef} style={{ height: "1px" }} />
    </PostGridWrapper>
  );
}
