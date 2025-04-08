// src/app/blog/page.tsx
import { allPosts } from "contentlayer/generated";
import Link from "next/link";

export default function BlogPage() {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold">Blog Posts</h1>
            <ul>
                {allPosts.map((post) => (
                    <li key={post._id}>
                        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
