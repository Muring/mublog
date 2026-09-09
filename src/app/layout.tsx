import type { Metadata } from "next";
import "./globals.css";
import "@/styles/prism-notion-theme.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RootProvider from "@/providers/RootProvider";
import VisitTracker from "@/components/stats/VisitTracker";
import { SITE_URL } from "@/lib/site";
import { SITE_DESCRIPTION, SITE_NAME, baseOpenGraph } from "./shared-metadata";

export const metadata: Metadata = {
    /*
     * canonical·og:url·og:image 의 상대경로를 절대 URL 로 바꾸는 기준점.
     * 없으면 상대경로를 쓴 순간 빌드가 깨진다.
     */
    metadataBase: new URL(SITE_URL),
    title: {
        default: SITE_NAME,
        template: `${SITE_NAME} | %s`, // 페이지 title이 있으면 "Mublog | %s"로
    },
    description: SITE_DESCRIPTION,
    icons: {
        icon: "/icons/mublog.svg", // 또는 "/icons/custom-icon.svg"
    },
    /*
     * alternates 도 얕게 상속된다 — 여기에 canonical 을 두면 그것을 정의하지 않은
     * 모든 하위 페이지가 "/" 를 정본으로 선언해 스스로를 중복으로 만든다.
     * canonical 은 반드시 페이지마다 적는다.
     */
    openGraph: {
        ...baseOpenGraph,
        type: "website",
        title: SITE_NAME,
        description: SITE_DESCRIPTION,
    },
    // 이미지는 og:image 를 그대로 쓴다. 페이지가 twitter 를 덮어쓰지 않으므로 전역으로 둔다.
    twitter: { card: "summary_large_image" },
    /*
     * Search Console 소유 확인용. HTML 에 그대로 나가는 공개 값이라 비밀이 아니다.
     * 확인이 끝난 뒤에도 지우지 않는다 — 태그가 사라지면 소유권이 풀려
     * 색인 보고서와 실적 데이터를 함께 잃는다.
     */
    verification: { google: "kGbNBEYanSm9iwXFVrOXhA9qzO1cntycveob4pv2iJQ" },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        // 본문이 한국어다. en 이면 한국어 질의에 대한 타겟팅이 어긋난다
        <html lang="ko" suppressHydrationWarning>
            <body>
                <RootProvider>
                    <VisitTracker />
                    <Header />
                    <main>{children}</main>
                    <Footer />
                </RootProvider>
            </body>
        </html>
    );
}
