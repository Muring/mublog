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
      {/* All 태그 */}
      <Link href="/" className={!selectedTag ? "active" : ""}>
        <h6>all</h6>
      </Link>

      {/* 실제 태그 리스트 */}
      {tags.map((tag) => (
        <Link
          key={tag}
          href={`?tag=${encodeURIComponent(tag)}`}
          className={selectedTag === tag ? "active" : ""}
        >
          <h6>{tag}</h6>
          <p>( {tags.length} )</p>
        </Link>
      ))}
    </TagWrapper>
  );
}
