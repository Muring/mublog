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
                <Link href={`/?tag=${tag}`}>
                  <h4 className=" tag">{"#" + tag}</h4>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <hr />
      <MDXContent />
    </Article>
  );
}
