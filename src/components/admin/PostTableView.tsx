"use client";

import { useSearchParams } from "next/navigation";
import { filterAdminPosts, postListState, postListUrl, type PostListState } from "@/lib/admin-navigation";
import { PostTable, AdminListScroll } from "./Admin.styled";
import PostTableRow from "./PostTableRow";
import { joinMulti, splitMulti, withoutMulti } from "@/lib/multi-value";
import PostTableHead from "./PostTableHead";
import PostTableToolbar from "./PostTableToolbar";

type Row = {
    id: string;
    slug: string;
    title: string;
    tags: string[];
    series: string | null;
    status: "DRAFT" | "PUBLISHED";
    publishedAt: string | null;
    updatedAt: string;
    createdAt: string;
    /** 발행 후 누적 조회수 */
    viewCount: number;
    commentCount: number;
    likeCount: number;
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
    const state = postListState(new URLSearchParams(params));
    const returnTo = postListUrl(state);
    const update = (patch: Partial<PostListState>) => {
        window.history.replaceState(null, "", postListUrl({ ...state, ...patch }));
    };

    // 표의 태그를 누르면 태그 필터에 더한다(같은 조건이라 "또는"). 이미 걸린 태그면 뺀다
    const selectedTags = splitMulti(state.tag);
    const toggleTag = (tag: string) => update({ tag: selectedTags.includes(tag) ? withoutMulti(state.tag, tag) : joinMulti([...selectedTags, tag]) });

    const matching = filterAdminPosts(posts, { ...state, status: "all" });
    const filtered = matching.filter((post) => state.status === "all" || post.status === state.status);

    return (
        <>
            <PostTableToolbar state={state} onChange={update} options={{ tags: tally(posts.flatMap((p) => p.tags)), series: tally(posts.flatMap((p) => p.series ? [p.series] : [])) }}
                counts={{ all: matching.length, PUBLISHED: matching.filter(p => p.status === "PUBLISHED").length, DRAFT: matching.filter(p => p.status === "DRAFT").length }} />

            {/* 표만 스크롤한다. 머리글은 sticky 라 스크롤해도 열 이름이 남는다 */}
            <AdminListScroll>
                <PostTable>
                    <PostTableHead />
                    <tbody>
                        {filtered.map((post) => (
                            <PostTableRow key={post.id} post={post} returnTo={returnTo} onTagSelect={toggleTag} selectedTags={selectedTags} />
                        ))}
                    </tbody>
                </PostTable>

                {filtered.length === 0 && <p className="empty">찾는 글이 없습니다.</p>}
            </AdminListScroll>
        </>
    );
}

/** 드롭다운 항목. 많이 쓴 것부터, 같으면 가나다순. 개수는 초안 포함 전체 글 기준이다 */
function tally(values: string[]) {
    const counts = new Map<string, number>();
    for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
    return [...counts].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "ko"));
}
