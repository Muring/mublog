import Link from "next/link";
import type { PostSummary } from "@/types/post";
import { SeriesBox } from "./SeriesNav.styled";

type Props = {
    /** 페이지가 이미 불러둔 발행글 전체. 여기서 시리즈만 거른다. */
    posts: PostSummary[];
    currentSlug: string;
};

/**
 * 본문 아래 "이 시리즈의 다른 글".
 *
 * 순서는 seriesOrder, 같으면 발행일. 현재 글에 시리즈가 없으면 아무것도 그리지 않는다.
 * 새 글이 시리즈에 들어와도 다른 글 페이지는 ISR 주기(1시간) 뒤에 따라온다 — 캐러셀과 같다.
 */
export default function SeriesNav({ posts, currentSlug }: Props) {
    const current = posts.find((post) => post.slug === currentSlug);
    if (!current?.series) return null;

    const series = posts
        .filter((post) => post.series === current.series)
        .sort(
            (a, b) =>
                (a.seriesOrder ?? Number.MAX_SAFE_INTEGER) - (b.seriesOrder ?? Number.MAX_SAFE_INTEGER) ||
                a.publishedAt.localeCompare(b.publishedAt)
        );
    if (series.length < 2) return null;

    const index = series.findIndex((post) => post.slug === currentSlug);
    const previous = series[index - 1];
    const next = series[index + 1];

    return (
        <SeriesBox aria-label={`${current.series} 시리즈`}>
            <div className="series-inner">
                <div className="series-head">
                    <span className="series-name">{current.series} 시리즈</span>
                    <span className="series-count">
                        {series.length}편 중 {index + 1}번째
                    </span>
                </div>
                <ol>
                    {series.map((post) => (
                        <li key={post.slug}>
                            <Link
                                href={`/${post.slug}`}
                                aria-current={post.slug === currentSlug ? "page" : undefined}
                            >
                                {post.title}
                            </Link>
                        </li>
                    ))}
                </ol>
                {(previous || next) && (
                    <div className="series-adjacent">
                        {previous && (
                            <Link href={`/${previous.slug}`} className="prev">
                                <span className="dir">← 이전 글</span>
                                <span className="title">{previous.title}</span>
                            </Link>
                        )}
                        {next && (
                            <Link href={`/${next.slug}`} className="next">
                                <span className="dir">다음 글 →</span>
                                <span className="title">{next.title}</span>
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </SeriesBox>
    );
}
