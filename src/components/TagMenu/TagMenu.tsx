"use client";

import Link from "next/link";
import { TagWrapper } from "./TagMenu.styled";

type TagMenuProps = {
    tags: string[];
    selectedTag?: string | null;
};

export default function TagMenu({ tags, selectedTag }: TagMenuProps) {
    return (
        <TagWrapper>
            {tags.map((tag) => (
                <Link
                    key={tag}
                    href={`?tag=${encodeURIComponent(tag)}`}
                    className={selectedTag === tag ? "active" : ""}
                >
                    {tag}
                </Link>
            ))}
        </TagWrapper>
    );
}
