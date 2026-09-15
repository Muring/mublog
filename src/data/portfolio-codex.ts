import portfolioImages from "./portfolio-codex-images.json";

export const PORTFOLIO_PATH = "/portfolio-codex";

export type PortfolioProject = {
    id: string;
    name: string;
    category: string;
    period: string;
    team: string;
    role: string;
    summary: string;
    contributions: { title: string; description: string }[];
    stack: string[];
    repository: string;
    videos?: { label: string; url: string }[];
    images: {
        file: string;
        caption: string;
        group: string;
        width: number;
        height: number;
        originalUrl?: string;
    }[];
};

// Sources: each project's public README (Distributed Roles: 엄세현).
// Technology names were checked against package.json where available.
// Images are optimized copies of README assets; GIFs use a still frame.
// Dates describe the project period, and contributions describe individual work.
export const portfolioProjects: PortfolioProject[] = [
    {
        id: "ohana",
        name: "Ohana Liquor",
        category: "SALESFORCE · CRM",
        period: "2024.09.05 — 10.21",
        team: "4명",
        role: "프로그래밍 리더 · Salesforce Developer",
        summary:
            "신규 고객 유입부터 영업 기회와 주문 관리까지 연결하는 주류 영업 관리 플랫폼. 표준화된 영업 프로세스와 자동화로 담당자의 업무를 돕습니다.",
        contributions: [
            {
                title: "고객과 만나는 첫 화면",
                description:
                    "Experience Cloud 기반 Web-to-Lead 페이지를 디자인하고, LWC로 캐러셀과 리드 입력 폼을 구현했습니다.",
            },
            {
                title: "영업 단계의 표준화와 자동화",
                description:
                    "Opportunity의 Path와 필드를 구성하고, Stage 자동 업데이트 Flow 및 Validation Rule을 작성했습니다.",
            },
            {
                title: "업무 화면 안에서 이어지는 작업",
                description:
                    "Quick Order LWC, 중복 추가를 처리하는 캠페인 Screen Flow, 고객 위치를 보여주는 지도 컴포넌트를 개발했습니다.",
            },
        ],
        stack: ["Salesforce", "LWC", "Experience Cloud", "Sales Cloud", "Flow"],
        repository: "https://github.com/Muring/Ohana",
        videos: [
            { label: "신규 고객 데모", url: "https://youtu.be/Cv1ZEN650OQ" },
            { label: "기존 고객 데모", url: "https://youtu.be/O4k55pAiSh4" },
        ],
        images: portfolioImages.ohana,
    },
    {
        id: "vita",
        name: "Vita",
        category: "HEALTHCARE · GAMIFICATION",
        period: "2024.04.08 — 05.24",
        team: "4명",
        role: "프론트엔드 리더",
        summary:
            "건강 관리를 캐릭터의 일상과 연결한 건강 습관 서비스. 식단과 생활 습관 기록, 리포트, 게임과 챌린지를 통해 건강을 돌아볼 계기를 제공합니다.",
        contributions: [
            {
                title: "서비스의 시각적 정체성",
                description:
                    "UI, 캐릭터, 배경, 아이콘과 로고를 디자인하고 캐릭터의 걷기·운동 애니메이션을 제작했습니다.",
            },
            {
                title: "캐릭터와 함께하는 사용자 경험",
                description:
                    "메인·게임·상점·옵션 화면을 구현하고, 랭킹과 게임 결과, 아이템 구매 및 배경 변경 API를 연결했습니다.",
            },
            {
                title: "프론트엔드 공통 기반",
                description:
                    "초기 개발 환경을 구축하고 Axios와 이미지·아이콘 참조를 공통화했습니다. PWA를 적용해 설치 가능한 웹앱으로 구성했습니다.",
            },
        ],
        stack: ["Next.js 14", "React", "Zustand", "Sass", "Axios", "PWA"],
        repository: "https://github.com/Muring/Vita",
        videos: [{ label: "서비스 데모", url: "https://youtu.be/MQWlIO3RVfY" }],
        images: portfolioImages.vita,
    },
    {
        id: "momo",
        name: "MOMO Bank",
        category: "FINTECH · COMMUNITY",
        period: "2024.02.26 — 04.05",
        team: "6명",
        role: "프론트엔드 리더",
        summary:
            "모임 통장과 소통을 위한 피드를 결합한 모임 뱅킹 서비스. 회비 관리와 금융상품 추천, 모임 활동 공유를 한곳에서 지원합니다.",
        contributions: [
            {
                title: "계좌 개설부터 송금까지",
                description:
                    "뱅킹 메인, 계좌 개설·내역·송금 화면을 디자인하고, 재사용 컴포넌트와 API 연동을 구현했습니다.",
            },
            {
                title: "사용자에 맞춘 금융 탐색",
                description:
                    "사용자 성향 조사와 카드 추천 화면을 제작해 뱅킹 서비스의 탐색 흐름을 구성했습니다.",
            },
            {
                title: "인증과 공통 통신 환경",
                description:
                    "초기 개발 환경, 로그인·회원가입 화면, 전역 Axios 설정과 비로그인 사용자 라우팅을 담당했습니다.",
            },
        ],
        stack: ["Nuxt 3", "Vue 3", "Pinia", "Axios", "Sass", "Tailwind CSS"],
        repository: "https://github.com/Muring/MOMO",
        images: portfolioImages.momo,
    },
    {
        id: "seas",
        name: "SEAS",
        category: "EDUCATION · WEB",
        period: "2024.01 — 02",
        team: "6명",
        role: "프론트엔드 리더",
        summary:
            "바쁜 예비 개발자를 위한 CS 학습 서비스. 플래시카드와 퀴즈로 개념을 학습하고, 레벨과 랭킹으로 학습 현황을 확인할 수 있습니다.",
        contributions: [
            {
                title: "학습으로 이어지는 화면 설계",
                description:
                    "페이지 디자인과 초기 환경 구축을 맡고, 메인·메뉴·로그인·회원가입 화면을 제작했습니다.",
            },
            {
                title: "퀴즈와 랭킹 경험",
                description:
                    "퀴즈 풀이 및 랭킹 화면을 구현하고 각 화면에 필요한 Axios 요청을 구성했습니다.",
            },
            {
                title: "공통 API와 페이지 접근 흐름",
                description:
                    "Axios를 전역화하고 비로그인 사용자의 라우팅을 구현했습니다.",
            },
        ],
        stack: ["Vue 3", "Vuetify", "Pinia", "Axios", "Sass"],
        repository: "https://github.com/Muring/SEAS",
        images: portfolioImages.seas,
    },
    {
        id: "ghiburi",
        name: "집우리",
        category: "REAL ESTATE · MAP",
        period: "2023",
        team: "2명",
        role: "프론트엔드 개발 · 디자인",
        summary:
            "카카오 지도와 아파트 매매 실거래 자료를 활용한 부동산 웹 플랫폼. 지도에서 매물을 탐색하고 상세 정보와 주변 정보를 확인할 수 있습니다.",
        contributions: [
            {
                title: "서비스 전반의 화면 구현",
                description:
                    "초기 개발 환경과 페이지 디자인을 맡고, 공지사항·커뮤니티·지도·뉴스·로그인·회원가입·마이페이지를 제작했습니다.",
            },
            {
                title: "지도 기반 매물 탐색",
                description:
                    "카카오 지도 API를 연동해 지도 페이지를 구현했습니다.",
            },
            {
                title: "공통 통신과 접근 흐름",
                description:
                    "Axios 전역화 및 API 연동, 비로그인 사용자 라우팅을 담당했습니다.",
            },
        ],
        stack: ["Vue 3", "Pinia", "Ant Design Vue", "Axios", "Kakao Maps API"],
        repository: "https://github.com/Muring/GHIBURI",
        videos: [{ label: "서비스 데모", url: "https://youtu.be/7_Uw3czcmZU" }],
        images: portfolioImages.ghiburi,
    },
];
