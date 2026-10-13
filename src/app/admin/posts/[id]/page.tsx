import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getAllSeries, getAllTags, getPostForEdit } from "@/lib/posts";
import PostEditor from "@/components/admin/PostEditor";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditPostPage({ params }: Props) {
    await requireAdmin();

    const { id } = await params;
    const [post, knownTags, knownSeries] = await Promise.all([
        getPostForEdit(id),
        getAllTags(),
        getAllSeries(),
    ]);

    if (!post) notFound();

    return (
        <PostEditor
            knownTags={knownTags}
            knownSeries={knownSeries}
            initial={post}
        />
    );
}
