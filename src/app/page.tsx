// src/app/blog/page.tsx
import Profile from "@/components/Profile";
import { allPosts } from "contentlayer/generated";
import Link from "next/link";

export default function Home() {
    return (
        <div>
            <Profile />
            <ul>
                {allPosts.map((post) => (
                    <li key={post._id}>
                        <Link href={`/${post.slug}`}>{post.title}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
