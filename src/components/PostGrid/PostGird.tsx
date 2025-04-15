"use client";

import { PostGridWrapper, GirdList } from "./PostGrid.styled";
import { useSearchParams } from "next/navigation";
import { allPosts } from "contentlayer/generated";
import TagMenu from "@/components/TagMenu/TagMenu";
import Link from "next/link";

export default function PostGrid() {
    const searchParams = useSearchParams();
    const selectedTag = searchParams.get("tag");

    const tags = [
        "all",
        ...Array.from(new Set(allPosts.flatMap((post) => post.tags ?? []))).sort(),
    ];

    const filteredPosts =
        !selectedTag || selectedTag === "all"
            ? allPosts
            : allPosts.filter((post) => post.tags?.includes(selectedTag));

    return (
        <PostGridWrapper>
            <TagMenu tags={tags} selectedTag={selectedTag} />
            <GirdList>
                {filteredPosts.map((post) => (
                    <li key={post._id}>
                        <Link href={`/${post.slug}`}>{post.title}</Link>
                    </li>
                ))}
            </GirdList>
        </PostGridWrapper>
    );
}
