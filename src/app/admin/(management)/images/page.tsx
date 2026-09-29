import { requireAdmin } from "@/lib/auth";
import { getImagePage } from "@/lib/admin-images";
import AdminImagesView from "@/components/admin/AdminImagesView";

export const dynamic = "force-dynamic";

export default async function AdminImagesPage() {
    await requireAdmin();
    const initialPage = await getImagePage();
    return <AdminImagesView initialPage={initialPage} />;
}
