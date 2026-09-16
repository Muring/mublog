import { requireAdmin } from "@/lib/auth";
import { getAllSeries, getAllTags } from "@/lib/posts";
import PostEditor from "@/components/admin/PostEditor";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
    await requireAdmin();

    const [knownTags, knownSeries] = await Promise.all([getAllTags(), getAllSeries()]);

    return (
        <PostEditor
            knownTags={knownTags}
            knownSeries={knownSeries}
            initial={{
                id: null,
                slug: "",
                title: "",
                description: "",
                tags: [],
                thumbnail: "",
                series: "",
                seriesOrder: "",
                contentMd: "",
                status: "DRAFT",
                publishedAt: null,
            }}
        />
    );
}
