import { requireAdmin } from "@/lib/auth";
import { classifyImages } from "@/lib/storage";
import AdminImagesView from "@/components/admin/AdminImagesView";

export const dynamic = "force-dynamic";

export default async function AdminImagesPage() {
    await requireAdmin();
    const { images, nextSweepAt } = await classifyImages();
    return <AdminImagesView images={images} nextSweepAt={nextSweepAt} />;
}
