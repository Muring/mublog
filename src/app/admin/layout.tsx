import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "관리" };

// 관리자 화면은 항상 최신 상태를 봐야 하므로 캐시하지 않는다
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    // 실패 시 404 를 던진다. 저장소가 public 이라 /admin 의 존재를 알리지 않는다.
    // 미들웨어의 리다이렉트는 UX 용이고, 실제 인가는 여기서 확정된다.
    await requireAdmin();
    return <>{children}</>;
}
