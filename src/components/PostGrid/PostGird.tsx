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

    const tags = Array.from(new Set(allPosts.flatMap((post) => post.tags ?? []))).sort();
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
