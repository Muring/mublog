import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
export default async function LegacyAiAdminPage() {
    await requireAdmin();
    redirect("/ai/manage");
}
