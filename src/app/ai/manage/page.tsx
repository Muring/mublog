import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import AdminAi from "@/components/ai/AdminAi";
import styles from "@/components/ai/AiManagement.module.css";

export const metadata: Metadata = { title: "AI 현황", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default async function AiManagementPage() {
    await requireAdmin();
    return <div className={styles.shell}><AdminAi asOf={new Date().toISOString()} /></div>;
}
