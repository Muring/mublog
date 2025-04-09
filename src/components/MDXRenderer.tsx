"use client";

import { useMDXComponent } from "next-contentlayer/hooks";
import { Article } from "./styledArticle";
import Link from "next/link";
import dayjs from "dayjs";

type Props = {
    title: string;
    date: string;
    description?: string;
    tags?: string[];
    code: string;
};

export default function MDXRenderer({ title, date, description, tags, code }: Props) {
    const MDXContent = useMDXComponent(code);
    const formattedDate = dayjs(date).format("YYYY년 M월 D일");

    return (
        <Article>
            <h1>{title}</h1>
            <div className="article-header">
                <p>{formattedDate}</p>
                <ul>
                    {tags?.map((tag) => (
                        <li key={tag}>
                            <Link href={`/`}>{tag}</Link>
                        </li>
                    ))}
                </ul>
            </div>
            <p>{description}</p>
            <MDXContent />
        </Article>
    );
}
