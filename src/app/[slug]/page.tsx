import type { Metadata } from "next";
import { allPosts } from "contentlayer/generated";
import { notFound } from "next/navigation";
import PostContent from "@/components/PostContent";
import RecentPostTracker from "@/components/trackers/RecentPostTracker";
import CarouselSlider from "@/components/CarouselSlider";
import RelatedContent from "@/components/RelatedContent";

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
    return allPosts.map((post) => ({
        slug: post.slug,
    }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = allPosts.find((post) => post.slug === slug);

    if (!post) return {};

    return {
        title: post.title, // RootLayout의 template에 의해 "Mublog | post.title"가 됨
        description: post.description,
        // (선택) OG/Twitter까지 같이 맞추고 싶으면 아래도 추가
        // openGraph: {
        //     title: post.title,
        //     description: post.description,
        // },
        // twitter: {
        //     title: post.title,
        //     description: post.description,
        // },
    };
}

export default async function PostPage(props: Props) {
    const { slug } = await props.params;
    const post = allPosts.find((post) => post.slug === slug);

    if (!post) return notFound();

    return (
        <div>
            <RecentPostTracker slug={slug} />
            <PostContent
                title={post.title}
                date={post.date}
                description={post.description}
                tags={post.tags}
                code={post.body.code}
            />
            <RelatedContent />
            <CarouselSlider posts={allPosts} tags={post.tags} currentSlug={post.slug} />
        </div>
    );
}
