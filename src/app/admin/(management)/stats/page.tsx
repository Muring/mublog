import { requireAdmin } from "@/lib/auth";
import { seoulDateKey } from "@/lib/date";
import AdminAnalytics from "@/components/admin/AdminAnalytics";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
    await requireAdmin();
    return <AdminAnalytics today={seoulDateKey()} />;
}
