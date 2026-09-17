"use client";

import { useSearchParams } from "next/navigation";
import { filterAdminPosts, postListState, postListUrl, type PostSort, type PostStatusFilter } from "@/lib/admin-navigation";
import { PostTable, TableScroll } from "./Admin.styled";
import PostTableRow from "./PostTableRow";
import PostTableHead from "./PostTableHead";
import PostTableToolbar from "./PostTableToolbar";

type Row = {
    id: string;
    slug: string;
    title: string;
    tags: string[];
    status: "DRAFT" | "PUBLISHED";
    publishedAt: string | null;
    updatedAt: string;
    createdAt: string;
    /** 발행 후 누적 조회수 */
    viewCount: number;
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
    const params = useSearchParams();
    const { q: query, status, sort } = postListState(new URLSearchParams(params));
    const returnTo = postListUrl({ q: query, status, sort });
    const update = (patch: Partial<{ q: string; status: PostStatusFilter; sort: PostSort }>) => {
        window.history.replaceState(null, "", postListUrl({ q: query, status, sort, ...patch }));
    };

    const matching = filterAdminPosts(posts, { q: query, status: "all", sort });
    const filtered = matching.filter((post) => status === "all" || post.status === status);

    return (
        <>
            <PostTableToolbar state={{ q: query, status, sort }} onChange={update}
                counts={{ all: matching.length, PUBLISHED: matching.filter(p => p.status === "PUBLISHED").length, DRAFT: matching.filter(p => p.status === "DRAFT").length }} />

            {/* 표만 스크롤한다. 머리글은 sticky 라 스크롤해도 열 이름이 남는다 */}
            <TableScroll>
                <PostTable>
                    <PostTableHead />
                    <tbody>
                        {filtered.map((post) => (
                            <PostTableRow key={post.id} post={post} returnTo={returnTo} />
                        ))}
                    </tbody>
                </PostTable>

                {filtered.length === 0 && <p className="empty">찾는 글이 없습니다.</p>}
            </TableScroll>
        </>
    );
}
