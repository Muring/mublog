"use client";

import { useState, useRef, useEffect } from "react";
import { PostGridWrapper, GridList } from "./PostGrid.styled";
import { useSearchParams } from "next/navigation";
import { allPosts } from "contentlayer/generated";
import TagMenu from "@/components/TagMenu/TagMenu";
import Link from "next/link";
import PostCard from "../PostCard/PostCard";

const BATCH_SIZE = 6;

export default function PostGrid() {
    const searchParams = useSearchParams();
    const selectedTag = searchParams.get("tag");

    // 태그 정렬
    const tags = Array.from(new Set(allPosts.flatMap((post) => post.tags ?? []))).sort((a, b) => {
        if (a === "etc") return 1;
        if (b === "etc") return -1;
        return a.localeCompare(b);
    });

    // 포스트 필터링
    const filteredPosts =
        !selectedTag || selectedTag === "all"
            ? allPosts
            : allPosts.filter((post) => post.tags?.includes(selectedTag));

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

    // 검색된 포스트 최신 작성 날짜 순으로 정렬
    const sortedPosts = [...filteredPosts].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const visiblePosts = sortedPosts.slice(0, visibleCount);

    return (
        <PostGridWrapper>
            <TagMenu tags={tags} selectedTag={selectedTag} />
            <GridList key={selectedTag}>
                {visiblePosts.map((post, index) => (
                    <li key={post._id}>
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
