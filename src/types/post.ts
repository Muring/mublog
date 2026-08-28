/** 목록·카드·캐러셀에서 쓰는 포스트 요약. 본문을 포함하지 않는다. */
export type PostSummary = {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    tags: string[];
    thumbnail: string | null;
    /** ISO 문자열. 캐시 직렬화와 hydration 안정성을 위해 Date 를 노출하지 않는다. */
    publishedAt: string;
    readingTime: number;
    viewCount: number;
    commentCount: number;
};

/** 포스트 상세. 렌더링된 본문 HTML 을 포함한다. */
export type PostDetail = PostSummary & {
    contentHtml: string;
};
