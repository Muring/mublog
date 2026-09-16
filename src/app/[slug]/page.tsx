import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostContent from "@/components/post/PostContent";
import RecentPostTracker from "@/components/trackers/RecentPostTracker";
import CarouselSlider from "@/components/post/CarouselSlider";
import RelatedContent from "@/components/post/RelatedContent";
import SeriesNav from "@/components/post/SeriesNav";
import HeaderTitleSetter from "@/components/trackers/HeaderTitleTracker";
import Comments from "@/components/comments/Comments";
import { getPostBySlug, getPublishedPosts, getPublishedSlugs } from "@/lib/posts";
import { baseOpenGraph } from "../shared-metadata";

const { images: _defaultCard, ...baseOpenGraphWithoutImages } = baseOpenGraph;

type Props = {
    params: Promise<{ slug: string }>;
};

export const revalidate = 3600;

export async function generateStaticParams() {
    // 빌드 시점에 DB 를 조회한다. Supabase 무료 프로젝트가 정지돼 있거나
    // 빌드 환경에 DATABASE_URL 이 없으면 배포 전체가 깨지므로,
    // 실패 시 빈 배열로 떨어뜨려 온디맨드 렌더링으로 degrade 시킨다.
    try {
        const slugs = await getPublishedSlugs();
        return slugs.map((slug) => ({ slug }));
    } catch {
        return [];
    }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) return {};

    const url = `/${post.slug}`;
    const description = post.description ?? undefined;
    return {
        title: post.title, // RootLayout 의 template 에 의해 "Mublog | title" 이 된다
        description,
        alternates: { canonical: url },
        openGraph: {
            /*
             * images 는 일부러 넣지 않는다. 글마다 opengraph-image.tsx 가 제목·요약·썸네일을
             * 담은 카드를 굽는데, 여기서 images 를 정하면 그 파일 규약이 밀린다.
             * (baseOpenGraph 의 기본 카드도 같은 이유로 뺀다)
             */
            ...baseOpenGraphWithoutImages,
            type: "article",
            url,
            title: post.title,
            description,
            publishedTime: post.publishedAt,
            tags: post.tags,
        },
    };
}

export default async function PostPage(props: Props) {
    const { slug } = await props.params;
    const post = await getPostBySlug(slug);

    if (!post) return notFound();

    const posts = await getPublishedPosts();

    return (
        <div>
            <HeaderTitleSetter title={post.title} />
            <RecentPostTracker slug={slug} />
            <PostContent
                title={post.title}
                date={post.publishedAt}
                slug={post.slug}
                viewCount={post.viewCount}
                description={post.description}
                tags={post.tags}
                html={post.contentHtml}
            />
            <SeriesNav posts={posts} currentSlug={post.slug} />
            <RelatedContent />
            {/*
              댓글은 클라이언트에서 가져온다.
              그래야 이 페이지가 정적 캐시 + ISR 상태를 그대로 유지한다.
            */}
            <Comments slug={post.slug} />
            <CarouselSlider posts={posts} tags={post.tags} currentSlug={post.slug} />
        </div>
    );
}
