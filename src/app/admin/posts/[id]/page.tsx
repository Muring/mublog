import { notFound } from "next/navigation";
import { getAllTags, getPostForEdit } from "@/lib/posts";
import PostEditor from "@/components/admin/PostEditor";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditPostPage({ params }: Props) {
    const { id } = await params;
    const [post, knownTags] = await Promise.all([getPostForEdit(id), getAllTags()]);

    if (!post) notFound();

    return (
        <PostEditor
            knownTags={knownTags}
            initial={{
                id: post.id,
                slug: post.slug,
                title: post.title,
                description: post.description ?? "",
                tags: post.tags,
                thumbnail: post.thumbnail ?? "",
                contentMd: post.contentMd,
                status: post.status,
                publishedAt: post.publishedAt,
            }}
        />
    );
}
