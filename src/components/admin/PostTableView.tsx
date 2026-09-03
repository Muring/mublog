"use client";

import { useMemo, useState } from "react";
import { PostTable, TableScroll, TableToolbar } from "./Admin.styled";
import PostTableRow from "./PostTableRow";

type Row = {
    id: string;
    slug: string;
    title: string;
    tags: string[];
    status: "DRAFT" | "PUBLISHED";
    publishedAt: string | null;
    commentCount: number;
};

/**
 * 포스트 목록 + 검색.
 *
 * 검색을 서버로 보내지 않는다. 목록 조회가 26행에 15ms 라 행 수는 병목이 아니고,
 * 이미 받아온 배열을 거르면 왕복 없이 즉시 반응한다. 수백 행까지는 이 편이 낫다.
 *
 * 서버 페이지네이션으로 넘어가야 하는 시점은 "글이 많아졌을 때" 가 아니라
 * 한 번에 받는 양이 눈에 띄게 무거워졌을 때다. 그때는 @@index([status, publishedAt desc])
 * 가 이미 있으므로 커서 방식으로 바꾸면 된다.
 */
export default function PostTableView({ posts }: { posts: Row[] }) {
    const [query, setQuery] = useState("");

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return posts;
        return posts.filter(
            (p) =>
                p.title.toLowerCase().includes(q) ||
                p.slug.toLowerCase().includes(q) ||
                p.tags.some((t) => t.toLowerCase().includes(q))
        );
    }, [posts, query]);

    return (
        <>
            <TableToolbar>
                <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="제목 · 주소 · 태그로 거르기"
                    aria-label="포스트 검색"
                />
                <span className="count">
                    {query.trim() ? `${filtered.length} / ${posts.length}` : `${posts.length}개`}
                </span>
            </TableToolbar>

            {/* 표만 스크롤한다. 머리글은 sticky 라 스크롤해도 열 이름이 남는다 */}
            <TableScroll>
                <PostTable>
                    <thead>
                        <tr>
                            <th>제목</th>
                            <th>상태</th>
                            <th>태그</th>
                            <th>발행일</th>
                            <th>댓글</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((post) => (
                            <PostTableRow key={post.id} post={post} />
                        ))}
                    </tbody>
                </PostTable>

                {filtered.length === 0 && <p className="empty">찾는 글이 없습니다.</p>}
            </TableScroll>
        </>
    );
}
