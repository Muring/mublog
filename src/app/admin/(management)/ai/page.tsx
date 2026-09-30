import { requireAdmin } from "@/lib/auth";
import AdminAi from "@/components/ai/AdminAi";
export default async function AiAdminPage() {
    await requireAdmin();
    return <AdminAi asOf={new Date().toISOString()} />;
}
