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

    const tags = Array.from(new Set(allPosts.flatMap((post) => post.tags ?? []))).sort((a, b) => {
        if (a === "etc") return 1;
        if (b === "etc") return -1;
        return a.localeCompare(b);
    });

    const filteredPosts =
        !selectedTag || selectedTag === "all"
            ? allPosts
            : allPosts.filter((post) => post.tags?.includes(selectedTag));

    const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
    const observerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisibleCount((prev) => prev + BATCH_SIZE);
                }
            },
            { threshold: 1 }
        );

        if (observerRef.current) observer.observe(observerRef.current);
        return () => observer.disconnect();
    }, []);

    const visiblePosts = filteredPosts.slice(0, visibleCount);

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
