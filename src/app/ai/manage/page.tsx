import { Suspense } from "react";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import AdminAi from "@/components/ai/AdminAi";
import { AiRoot } from "@/components/ai/Ai.styled";

export const metadata: Metadata = { title: "AI 관리", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default async function AiManagementPage() {
    await requireAdmin();
    // 보기 상태는 주소에서 읽는다(useSearchParams). 포스트 목록처럼 Suspense 로 감싼다
    return <AiRoot className="aim-shell"><Suspense><AdminAi asOf={new Date().toISOString()} /></Suspense></AiRoot>;
}
