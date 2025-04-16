// SideMenu.tsx
"use client";

import { allPosts } from "contentlayer/generated";
import { SideListWrapper } from "./SideList.styled";
import SidePost from "../SidePost/SidePost";
import Link from "next/link";
import dayjs from "dayjs";

type Props = {
    title: string;
};

export default function SideList({ title }: Props) {
    const latestPosts = allPosts
        .slice() // 원본 변경 방지
        .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf())
        .slice(0, 5);

    return (
        <SideListWrapper>
            <div className="side-list-container">
                <div className="side-list-title">
                    {title}
                    <hr />
                </div>
                <div className="side-list-content">
                    {latestPosts.map((post) => (
                        <Link key={post._id} href={`/${post.slug}`} className="side-link">
                            <SidePost
                                title={post.title}
                                desc={post.description}
                                thumbnail={post.thumbnail}
                            />
                        </Link>
                    ))}
                </div>
            </div>
        </SideListWrapper>
    );
}
