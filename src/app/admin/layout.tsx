import type { Metadata } from "next";

export const metadata: Metadata = { title: "관리" };

// 관리자 화면은 항상 최신 상태를 봐야 하므로 캐시하지 않는다
export const dynamic = "force-dynamic";

// 데이터 접근 전 인가는 각 page에서 수행한다. 관리 탭 공통 UI는 (management)/layout에서 유지한다.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
