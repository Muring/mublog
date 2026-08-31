"use client";

import { Article } from "./PostContent.styled";
import Image from "next/image";
import Link from "next/link";
import { formatPostDate } from "@/lib/date";
import PostViews from "./PostViews";

type Props = {
    title: string;
    date: string;
    slug: string;
    viewCount: number;
    description?: string | null;
    tags?: string[];
    /** 저장 시점에 렌더된 본문 HTML. 작성자는 관리자뿐이므로 sanitize 하지 않는다. */
    html: string;
};

export default function PostContent({ title, date, slug, viewCount, description, tags, html }: Props) {
    const formattedDate = formatPostDate(date);

    return (
        <Article>
            <h1>{title}</h1>
            <h5>{description}</h5>
            <div className="article-detail">
                <div className="article-item">
                    <Image
                        src="/icons/calendar.svg"
                        alt="calendar icon"
                        width={16}
                        height={16}
                        className="article-detail-icon auto-dark"
                    />
                    <p className="desc">{formattedDate}</p>
                    <p className="desc views">
                        <PostViews slug={slug} initialViews={viewCount} />
                    </p>
                </div>

                <div className="article-item">
                    <Image
                        src="/icons/tag.svg"
                        alt="tag icon"
                        width={16}
                        height={16}
                        className="article-detail-icon auto-dark"
                    />
                    <ul>
                        {tags?.map((tag) => (
                            <li key={tag}>
                                <Link href={`/?tag=${encodeURIComponent(tag)}`}>
                                    <h4 className=" tag">{"#" + tag}</h4>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <hr />
            <div dangerouslySetInnerHTML={{ __html: html }} />
        </Article>
    );
}
