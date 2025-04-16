"use client";

import { PostGridWrapper, GridList } from "./PostGrid.styled";
import { useSearchParams } from "next/navigation";
import { allPosts } from "contentlayer/generated";
import TagMenu from "@/components/TagMenu/TagMenu";
import Link from "next/link";
import PostCard from "../PostCard/PostCard";

export default function PostGrid() {
    const searchParams = useSearchParams();
    const selectedTag = searchParams.get("tag");

    // 태그 etc 마지막 정렬
    const tags = Array.from(new Set(allPosts.flatMap((post) => post.tags ?? []))).sort((a, b) => {
        if (a === "etc") return 1;
        if (b === "etc") return -1;
        return a.localeCompare(b);
    });

    // 태그 선택에 따른 포스트 불러오기
    const filteredPosts =
        !selectedTag || selectedTag === "all"
            ? allPosts
            : allPosts.filter((post) => post.tags?.includes(selectedTag));

    return (
        <PostGridWrapper>
            <TagMenu tags={tags} selectedTag={selectedTag} />
            <GridList>
                {filteredPosts.map((post) => (
                    <li key={post._id}>
                        <Link href={`/${post.slug}`}>
                            <PostCard post={post} />
                        </Link>
                    </li>
                ))}
            </GridList>
        </PostGridWrapper>
    );
}
