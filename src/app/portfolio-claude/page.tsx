import type { Metadata } from "next";
import Portfolio from "@/components/portfolio/Portfolio";
import Profile from "@/components/Profile";

export const metadata: Metadata = {
    title: "포트폴리오",
    description: "취업 전 SSAFY · 청년 CRM101 에서 만든 다섯 프로젝트 — 집우리, SEAS, 모모뱅크, Vita, Ohana Liquor",
    alternates: { canonical: "/portfolio-claude" },
};

/**
 * 포트폴리오. /about 과 같은 완전 정적 페이지다.
 *
 * 내용은 src/data/portfolio.ts 에, 이미지는 public/images/portfolio/ 에 있다.
 * 경로를 바꾸려면 이 폴더 이름과 위 canonical 을 함께 바꾼다.
 */
export default function PortfolioPage() {
    return (
        <div className="home">
            <Profile />
            <Portfolio />
        </div>
    );
}
