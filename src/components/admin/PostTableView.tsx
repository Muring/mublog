"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Dropdown from "@/components/ui/Dropdown";
import { filterAdminPosts, postListState, postListUrl, type PostSort, type PostStatusFilter } from "@/lib/admin-navigation";
import { PostTable, TableScroll, TableToolbar } from "./Admin.styled";
import PostTableRow from "./PostTableRow";

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
    const input = useRef<HTMLInputElement>(null);
    const composing = useRef(false);
    useEffect(() => {
        if (input.current && !composing.current) input.current.value = query;
    }, [query]);
    const returnTo = postListUrl({ q: query, status, sort });
    const update = (patch: Partial<{ q: string; status: PostStatusFilter; sort: PostSort }>) => {
        window.history.replaceState(null, "", postListUrl({ q: query, status, sort, ...patch }));
    };

    const filtered = filterAdminPosts(posts, { q: query, status, sort });

    return (
        <>
            <TableToolbar>
                <div className="status-filters" role="group" aria-label="포스트 상태">
                    {([['all', '전체'], ['PUBLISHED', '공개'], ['DRAFT', '초안']] as const).map(([value, label]) => (
                        <button key={value} type="button" aria-pressed={status === value} onClick={() => update({ status: value })}>
                            {label} {posts.filter((p) => value === 'all' || p.status === value).length}
                        </button>
                    ))}
                </div>
                <input
                    type="search"
                    ref={input}
                    defaultValue={query}
                    onCompositionStart={() => { composing.current = true; }}
                    onCompositionEnd={(event) => { composing.current = false; update({ q: event.currentTarget.value }); }}
                    onChange={(event) => { if (!composing.current) update({ q: event.currentTarget.value }); }}
                    placeholder="제목 · 주소 · 태그로 거르기"
                    aria-label="포스트 검색"
                />
                <Dropdown className="sort-control" label="포스트 정렬" size="control" value={sort}
                    options={[{ value: 'newest', label: '최신순' }, { value: 'updated', label: '수정순' }, { value: 'views', label: '조회순' }, { value: 'comments', label: '댓글순' }]}
                    onChange={(value) => update({ sort: value as PostSort })} />
                {(query || status !== "all" || sort !== "newest") && <button type="button" onClick={() => update({ q: "", status: "all", sort: "newest" })}>초기화</button>}
                <span className="count">{filtered.length}개</span>
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
                            <th>수정일</th>
                            <th>누적 조회</th>
                            <th>댓글</th>
                            <th></th>
                        </tr>
                    </thead>
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
