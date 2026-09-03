import type { Metadata } from "next";

export const metadata: Metadata = { title: "관리" };

// 관리자 화면은 항상 최신 상태를 봐야 하므로 캐시하지 않는다
export const dynamic = "force-dynamic";

/**
 * 인가를 여기서 하지 않는다. 각 page.tsx 가 requireAdmin() 을 부른다.
 *
 * 레이아웃에서 await 하면 그것이 끝날 때까지 껍데기가 흘러나가지 못한다.
 * loading.tsx 는 페이지의 Suspense 폴백이라 레이아웃 안쪽에 있고, 레이아웃이
 * 막혀 있으면 함께 막힌다. 그 사이 브라우저는 이전 화면에 머문다 —
 * "관리를 눌렀는데 홈에 몇 초 있다가 넘어간다" 가 이것이었다.
 *
 * 레이아웃을 비우면 껍데기와 loading.tsx 가 즉시 뜨고, 그 다음에 페이지가
 * 인가를 확인하며 스트리밍된다. 인가 경계는 그대로다 — 데이터를 그리는 것은
 * 페이지이고, 그 전에 requireAdmin() 이 통과해야 한다.
 * 로그인하지 않은 사람은 proxy 가 이미 /login 으로 돌려보낸다.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
