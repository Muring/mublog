"use client";

import { HeroWrapper, Value } from "./PortfolioHero.styled";

export default function PortfolioHero() {
    return (
        <HeroWrapper>
            <h1>
                안녕하세요! 👋
                <br />
                저는 <em>엄세현</em>입니다.
            </h1>

            <Value>
                <h4>
                    <mark>사용자 경험</mark> ⭐ 을 먼저 생각합니다.
                </h4>
                <p>
                    화면은 사용자가 서비스를 처음 만나는 곳이라고 믿습니다. 다섯 프로젝트 모두 Figma 로
                    화면을 먼저 그린 뒤 코드를 썼고, 캐릭터와 애니메이션이 필요하면 그것도 직접
                    만들었습니다.
                </p>
            </Value>

            <Value>
                <h4>
                    <mark>팀이 달릴 길</mark> 🛠️ 을 먼저 닦습니다.
                </h4>
                <p>
                    초기 환경 · Axios 전역화 · 라우팅 가드를 첫 주에 세워 팀원이 각자의 페이지에만
                    집중하도록 합니다. 프론트엔드로 시작해 지금은 Salesforce 개발자로 일하며, 코드와
                    선언적 도구 사이에서 유지보수가 쉬운 쪽을 고릅니다.
                </p>
            </Value>
        </HeroWrapper>
    );
}
