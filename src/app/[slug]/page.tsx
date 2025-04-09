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
        <MDXRenderer
            title={post.title}
            date={post.date}
            description={post.description}
            tags={post.tags}
            code={post.body.code}
        />
    );
}
