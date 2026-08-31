import { getAllTags } from "@/lib/posts";
import PostEditor from "@/components/admin/PostEditor";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
    const knownTags = await getAllTags();

    return (
        <PostEditor
            knownTags={knownTags}
            initial={{
                id: null,
                slug: "",
                title: "",
                description: "",
                tags: [],
                thumbnail: "",
                contentMd: "",
                status: "DRAFT",
                publishedAt: null,
            }}
        />
    );
}
