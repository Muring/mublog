import { allPosts } from "contentlayer/generated";
import { notFound } from "next/navigation";
import MDXRenderer from "@/components/MDXRenderer";

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
    return allPosts.map((post) => ({
        slug: post.slug,
    }));
}

export default async function PostPage(props: Props) {
    const { slug } = await props.params;

    const post = allPosts.find((post) => post.slug === slug);
    if (!post) return notFound();

    return (
        <article className="prose mx-auto p-8">
            <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
            <p>{post.description}</p>
            <MDXRenderer code={post.body.code} />
        </article>
    );
}
