"use client";

import { useMDXComponent } from "next-contentlayer/hooks";
import { Article } from "./PostContent.styled";
import Image from "next/image";
import Link from "next/link";
import dayjs from "dayjs";

type Props = {
    title: string;
    date: string;
    description?: string;
    tags?: string[];
    code: string;
};

export default function PostContent({ title, date, description, tags, code }: Props) {
    const MDXContent = useMDXComponent(code);
    const formattedDate = dayjs(date).format("YYYY년 M월 D일");

    return (
        <Article>
            <h1>{title}</h1>
            <p className="desc">{description}</p>
            <div className="article-detail">
                <Image
                    src="/icons/calendar.svg"
                    alt="calendar icon"
                    width={18}
                    height={18}
                    className="article-detail-icon"
                />
                <p>{formattedDate}</p>
                <ul>
                    <Image
                        src="/icons/tag.svg"
                        alt="tag icon"
                        width={18}
                        height={18}
                        className="article-detail-icon"
                    />
                    {tags?.map((tag) => (
                        <li key={tag}>
                            <Link href={`/?tag=${tag}`}>{"#" + tag}</Link>
                        </li>
                    ))}
                </ul>
            </div>
            <MDXContent />
        </Article>
    );
}
