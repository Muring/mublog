/**
 * 포트폴리오 페이지의 정적 데이터.
 *
 * 취업 전(SSAFY · 청년 CRM101)에 만든 다섯 프로젝트다. 내용은 각 저장소의
 * README 에서 가져왔고, "한 일" 은 Distributed Roles 의 내 몫만 적는다.
 * 이미지는 public/images/portfolio/ 에 WebP 로 줄여 두었다(원본은 저장소 README).
 */

export type Shot = {
    src: string;
    alt: string;
    width: number;
    height: number;
};

export type Project = {
    /** 앵커와 이미지 파일 접두사 */
    id: string;
    name: string;
    /** 한 줄 소개 */
    tagline: string;
    period: string;
    /** "6주 · 6인" 처럼 규모를 한눈에 */
    scale: string;
    /** 어느 과정에서 한 프로젝트인지 */
    program: string;
    role: string;
    description: string[];
    /** 첫 장이 표지다 */
    shots: Shot[];
    contributions: string[];
    stack: string[];
    links: { label: string; href: string }[];
};

const img = (id: string, name: string, alt: string, width: number, height: number): Shot => ({
    src: `/images/portfolio/${id}-${name}.webp`,
    alt,
    width,
    height,
});

/** 최근 것이 앞에 온다 */
export const projects: Project[] = [
    {
        id: "ohana",
        name: "Ohana Liquor",
        tagline: "Sales Cloud 위에 세운 주류 영업관리 플랫폼",
        period: "2024.09 – 2024.10",
        scale: "7주 · 4인",
        program: "청년 CRM101 2기",
        role: "PL · Salesforce Developer",
        description: [
            "리드 유입부터 기회·견적·주문까지 영업 사원마다 제각각이던 프로세스를 하나로 표준화하고, 단계 전환과 검증을 자동화해 실수를 줄이는 것이 목표였습니다. 임원진·본부장·영업사원이 각자의 홈에서 오늘 할 일과 지표를 바로 보도록 대시보드를 나눴습니다.",
            "네 명 중 개발을 이끄는 PL 을 맡아, 외부에 노출되는 Web-to-Lead 페이지와 영업의 중심인 Opportunity 화면을 직접 설계하고 구현했습니다.",
        ],
        shots: [
            img("ohana", "main", "Ohana Liquor Web-to-Lead 페이지", 1200, 551),
            img("ohana", "process", "Opportunity Path 와 단계별 지표", 1200, 361),
            img("ohana", "flow", "Stage 자동 업데이트 Flow", 1200, 417),
            img("ohana", "order", "Quick Order LWC 컴포넌트", 566, 499),
            img("ohana", "map", "고객사 위치 지도 컴포넌트", 1156, 1038),
        ],
        contributions: [
            "Experience Cloud 로 신규 고객 유입용 Web-to-Lead 페이지 설계·개발 — 캐러셀 슬라이드와 리드 폼을 LWC 로 만들고 이미지 리소스를 Static Resource 로 관리",
            "Opportunity 페이지 레이아웃 설계 — Path 단계와 지표를 정의하고 필드를 배치",
            "단계별 자동 Stage 업데이트 Flow 와 Validation Rule 로 입력 실수를 시스템이 막도록 구성",
            "Quick Order LWC — 주문 입력 여부를 한눈에 표시하고, 입력칸을 벗어나면 금액을 천 단위로 포맷",
            "Quick Campaign Add Screen Flow — 이미 추가된 캠페인은 예외 처리하고 성공 화면까지 제공",
            "Account 페이지에 표준 지도 기반 고객사 위치 컴포넌트(LWC) 추가",
        ],
        stack: ["Salesforce Sales Cloud", "Experience Cloud", "LWC", "Apex", "Flow", "Validation Rule", "Jira", "Notion"],
        links: [
            { label: "GitHub", href: "https://github.com/Muring/Ohana" },
            { label: "시연 영상 · 신규 고객", href: "https://youtu.be/Cv1ZEN650OQ" },
            { label: "시연 영상 · 기존 고객", href: "https://youtu.be/O4k55pAiSh4" },
        ],
    },
    {
        id: "vita",
        name: "Vita",
        tagline: "내 몸을 닮은 캐릭터를 키우는 건강 관리 PWA",
        period: "2024.04 – 2024.05",
        scale: "7주 · 4인",
        program: "SSAFY 10기 자율 프로젝트",
        role: "Frontend Leader",
        description: [
            "건강에 소홀한 사람이 게임하듯 습관을 만들도록, 사용자의 신체 정보로 다마고치 캐릭터를 만들고 식단 분석·일일 검진·챌린지 결과에 따라 캐릭터의 수명이 오르내리게 했습니다. 음식 사진을 올리면 영양분을 분석하고, 흡연·음주 같은 습관을 AI 가 진단합니다.",
            "프론트엔드 리더로 초기 환경을 세우고, 화면에 보이는 캐릭터·배경·아이콘과 애니메이션을 픽셀아트로 직접 그렸습니다.",
        ],
        shots: [
            img("vita", "main", "Vita 메인 화면 — 남은 수명과 캐릭터", 419, 925),
            img("vita", "game", "게임 랭킹 화면", 419, 925),
            img("vita", "hospital", "병원 — AI 의사 진단", 419, 925),
            img("vita", "report", "다마고치 종합 리포트", 419, 925),
            img("vita", "shop", "상점 — 수명으로 배경 구매", 419, 925),
        ],
        contributions: [
            "Next.js 14 프로젝트 초기 환경 구축과 Axios 전역화",
            "UI · 캐릭터(남성·여성·NPC) · 배경 · 아이콘 · 로고 디자인과 걷기·덤벨 애니메이션 제작",
            "메인 · 게임 · 상점 · 옵션 페이지 제작 및 API 연동 (상점 목록·구매, 배경 변경, 랭킹, 게임 결과 등록, 디버프, 캐릭터 정보)",
            "이미지와 아이콘을 동적으로 불러오는 전역 리소스 구조",
            "next-pwa 로 PWA 적용 — 홈 화면에 설치해 앱처럼 쓰도록",
        ],
        stack: ["Next.js 14", "React 18", "TypeScript", "Zustand", "Sass", "Axios", "next-pwa"],
        links: [
            { label: "GitHub", href: "https://github.com/Muring/Vita" },
            { label: "시연 영상", href: "https://youtu.be/MQWlIO3RVfY" },
        ],
    },
    {
        id: "momo",
        name: "모모뱅크",
        tagline: "모임 통장과 피드를 합친 모임 뱅킹",
        period: "2024.02 – 2024.04",
        scale: "6주 · 6인",
        program: "SSAFY 10기 특화 프로젝트",
        role: "Frontend Leader",
        description: [
            "모임마다 회비를 걷고 쓰는 일이 늘 한 사람에게 몰립니다. 모임별 통장을 만들고 성향 설문으로 통장·카드를 추천하며, 소비 내역을 피드로 공유해 투명하게 만드는 서비스입니다. 백엔드는 MSA(Kafka · Kubernetes)로 구성했습니다.",
            "프론트엔드 두 명 중 리더로 뱅킹 영역 전체를 맡았습니다 — 계좌 개설부터 송금까지가 제 화면입니다.",
        ],
        shots: [
            img("momo", "main", "모모뱅크 뱅킹 메인 화면", 520, 933),
            img("momo", "account", "계좌 개설 — 상품 선택", 520, 929),
            img("momo", "card", "성향 설문 기반 카드 추천", 520, 939),
            img("momo", "remit", "송금 — 은행 선택", 520, 936),
            img("momo", "group", "모임 상세", 520, 1132),
            img("momo", "structure", "시스템 구성도", 1200, 573),
        ],
        contributions: [
            "Nuxt 3 초기 환경 구축, Axios 전역화, 비로그인 라우팅 가드",
            "휴대폰 인증을 거치는 회원가입과 로그인 페이지",
            "뱅킹 영역 전담 — 메인 · 계좌 개설 · 거래 내역 · 송금 · 사용자 성향 설문 · 카드 추천 페이지 디자인과 제작",
            "뱅킹 공통 컴포넌트 제작과 API 연동",
        ],
        stack: ["Nuxt 3", "Vue 3", "Pinia", "Tailwind CSS", "Sass", "Axios", "Spring Cloud Gateway", "Kafka", "Kubernetes"],
        links: [{ label: "GitHub", href: "https://github.com/Muring/MOMO" }],
    },
    {
        id: "seas",
        name: "SEAS",
        tagline: "플래시카드와 퀴즈로 항해하는 CS 학습 서비스",
        period: "2024.01 – 2024.02",
        scale: "6주 · 6인",
        program: "SSAFY 10기 공통 프로젝트",
        role: "Frontend Leader",
        description: [
            "포트폴리오와 코딩 테스트로 바쁜 신입 개발자가 CS 용어를 짧게 자주 익히도록 만들었습니다. 플래시카드로 익히고 퀴즈로 점검하는데, SM-2 · WRS 알고리즘이 잘 모르는 내용을 더 자주 꺼내 줍니다. 티어와 랭킹으로 남들과 비교해 볼 수 있습니다.",
            "여섯 명 중 프론트엔드 리더로 항해 컨셉의 화면을 디자인하고 핵심 흐름인 퀴즈와 랭킹을 맡았습니다.",
        ],
        shots: [
            img("seas", "main", "SEAS 메인 화면", 1073, 595),
            img("seas", "card", "플래시카드 학습", 1064, 598),
            img("seas", "quiz", "퀴즈 풀이", 1200, 591),
            img("seas", "rank", "랭킹", 1200, 587),
            img("seas", "architecture", "시스템 아키텍처", 1200, 828),
        ],
        contributions: [
            "Vue 3 + Vuetify 초기 개발 환경 구축과 페이지 디자인",
            "메인 · 메뉴 · 로그인 · 회원가입 · 퀴즈 · 랭킹 페이지 제작",
            "퀴즈와 랭킹 API 연동, Axios 전역화",
            "비로그인 사용자를 걸러내는 라우팅 가드",
        ],
        stack: ["Vue 3", "Vuetify", "Pinia", "Axios", "GSAP", "D3", "Sass", "Figma", "Spring Boot", "Redis", "Jenkins", "Docker"],
        links: [{ label: "GitHub", href: "https://github.com/Muring/SEAS" }],
    },
    {
        id: "ghiburi",
        name: "집우리 GHIBURI",
        tagline: "지도 위에서 찾고 나란히 비교하는 아파트 실거래",
        period: "2023",
        scale: "2인",
        program: "SSAFY 10기 관통 프로젝트",
        role: "Frontend",
        description: [
            "카카오 지도 API 와 아파트 매매 실거래 공공데이터를 엮은 부동산 웹입니다. 지도에서 지역 매물을 군집으로 보고 편의시설로 거르며, 상세에서 로드뷰를 확인하고 근처 매물과 면적 · 면적당 가격 · 완공 연도를 나란히 비교합니다.",
            "둘이서 만든 첫 프로젝트라 프론트엔드를 혼자 맡았습니다. 이후 프로젝트마다 반복하게 되는 초기 환경 구축과 Axios 전역화가 여기서 시작됐습니다.",
        ],
        shots: [
            img("ghiburi", "main", "집우리 메인 화면", 1200, 680),
            img("ghiburi", "map", "카카오 지도 위 매물 클러스터링", 1200, 680),
            img("ghiburi", "detail", "매물 상세와 로드뷰", 1200, 680),
            img("ghiburi", "compare", "두 매물 나란히 비교", 1200, 681),
        ],
        contributions: [
            "Vue 초기 환경 구축과 모든 페이지 디자인",
            "카카오 지도 API — 매물 검색, 지역 매물 클러스터링, 편의시설 필터",
            "매물 상세(로드뷰 · 찜)와 비교(면적 · 면적당 가격 · 완공 연도) 페이지",
            "메인 · 공지사항 · 커뮤니티 · 뉴스 · 로그인 · 회원가입 · 마이페이지 제작",
            "Axios 전역화와 비로그인 라우팅",
        ],
        stack: ["Vue 3", "JavaScript", "SCSS", "Axios", "Kakao Map API", "공공데이터 API"],
        links: [
            { label: "GitHub", href: "https://github.com/Muring/GHIBURI" },
            { label: "시연 영상", href: "https://youtu.be/7_Uw3czcmZU" },
        ],
    },
];

/**
 * "무엇을 만들었다" 가 아니라 "어떤 성향이고, 무엇을 할 수 있고, 무엇을 선호하는가" 를 적는다.
 * 만든 것은 위의 프로젝트가 이미 말하고 있다.
 */
export const skills: { title: string; items: string[] }[] = [
    {
        title: "Web",
        items: [
            "HTML · CSS · JavaScript 를 프레임워크 없이도 다룰 수 있으며 시맨틱 마크업과 반응형을 기본으로 생각합니다.",
            "브라우저가 HTML 을 파싱하고 그리는 과정을 이해하고 있어 화면이 이상할 때 DOM 과 CSS 부터 봅니다.",
            "레이아웃 계산은 JS 가 아니라 CSS(grid · calc · aspect-ratio)에 맡기는 것을 선호합니다.",
            "색은 값이 아니라 토큰으로 다루며 라이트 · 다크 두 테마를 한 벌씩 함께 설계할 수 있습니다.",
            "대비는 감이 아니라 수치(WCAG AA)로 확인합니다.",
            "role · aria 속성과 포커스 흐름을 챙기고 키보드로만 써 보는 것이 습관입니다.",
            "TypeScript 로 props 와 API 응답에 타입을 붙여 데이터 계약을 코드에 두는 것을 선호합니다.",
        ],
    },
    {
        title: "Vue · Nuxt",
        items: [
            "Vue 3 · Pinia · Vue Router 로 팀 프로젝트의 프론트엔드를 처음부터 세울 수 있습니다.",
            "Nuxt 3 의 페이지 · 레이아웃 · 컴포저블 구조에 익숙하고 모바일 우선 화면도 만들 수 있습니다.",
            "Vuetify 든 Tailwind CSS 든 프로젝트 성격에 맞춰 고를 수 있습니다.",
            "디자인 시안이 있을 때는 SCSS 로 직접 잡는 쪽을 선호합니다.",
            "Axios 인스턴스 전역화와 도메인별 API 모듈 구조를 첫 주에 세웁니다.",
        ],
    },
    {
        title: "React · Next.js",
        items: [
            "Next.js App Router 에서 서버 컴포넌트와 클라이언트 컴포넌트의 경계를 나눠 설계할 수 있습니다.",
            "SSG · ISR · 온디맨드 렌더를 상황에 맞게 섞고 캐시 태그로 재배포 없이 내용을 갱신할 수 있습니다.",
            "서버 상태는 TanStack Query 로, 클라이언트 상태는 Zustand 로 나누는 것을 선호합니다.",
            "낙관적 갱신과 롤백까지 구현할 수 있습니다.",
            "Emotion · Sass 를 모두 써 봤고 팀의 기존 선택을 따르는 쪽입니다.",
            "알림 · 확인창 같은 공통 UI 는 컨텍스트 + 훅으로 한 곳에 두어 어디서든 같은 모양이 나오게 만듭니다.",
        ],
    },
    {
        title: "Salesforce",
        items: [
            "Sales Cloud 위에서 LWC · Apex · Flow · Validation Rule 을 함께 씁니다.",
            "코드로 풀 것과 선언적으로 풀 것을 나눠 유지보수가 쉬운 쪽을 고릅니다.",
            "표준 · 커스텀 객체를 설계하고 Path · 레이아웃 · 자동화까지 영업 프로세스를 한 화면에 얹을 수 있습니다.",
            "Experience Cloud 로 외부에 노출되는 페이지를 만들 수 있습니다.",
            "표준 컴포넌트가 못 하는 화면은 LWC 로 채웁니다.",
            "SFDX · Git 기반 CI/CD 를 구성할 수 있으며 메타데이터를 손으로 옮기는 것보다 파이프라인에 태우는 것을 선호합니다.",
            "Agentforce · Data Cloud 로 AI 챗봇을 만들어 봤고 새 기능이 나오면 먼저 써 보는 편입니다.",
        ],
    },
    {
        title: "Backend · Infra",
        items: [
            "PostgreSQL(Supabase) + Prisma 로 스키마부터 API 까지 혼자 세울 수 있습니다.",
            "RLS · 트리거 · 인덱스는 raw SQL 로 다룹니다.",
            "무료 티어처럼 제약이 있는 환경을 좋아하고 그 제약이 설계를 결정하게 두는 편입니다.",
            "Docker 로 서비스를 띄우고 클라우드 VM 에 배포할 수 있습니다.",
            "Compose 파일로 환경을 문서화하는 것을 선호합니다.",
            "TypeORM 으로 풀스택을 설계 · 구현한 경험이 있어 API 계약부터 함께 잡습니다.",
            "권한 판별의 단일 진실 · 노출되는 키 · 익명 접근 경로를 설계 단계에서 확인합니다.",
        ],
    },
    {
        title: "Design",
        items: [
            "Figma 로 화면을 먼저 그리고 시작합니다.",
            "디자이너가 없는 팀에서 디자인을 맡을 수 있습니다.",
            "픽셀아트로 캐릭터 · 배경 · 아이콘과 애니메이션을 직접 만들 수 있습니다.",
            "디자인 시스템을 토큰과 조각(버튼 · 면 · 말줄임)으로 나눠 코드에 옮기는 것을 선호합니다.",
            "\"예뻐 보이는가\" 보다 \"읽히는가\" 를 먼저 봅니다.",
        ],
    },
    {
        title: "ETC",
        items: [
            "Git 으로 협업하며 브랜치 전략과 커밋 단위를 지키려고 노력합니다.",
            "커밋 메시지에 \"왜\" 를 남깁니다.",
            "Jira · Notion · Slack 으로 일정과 명세를 관리하는 데 익숙합니다.",
            "백엔드와 API 명세를 먼저 맞춘 뒤 화면을 붙입니다.",
            "WSL2 · Linux 환경에서 개발하는 것을 선호하고 CLI 에 익숙합니다.",
            "반복 작업은 스크립트로 만들어 둡니다.",
            "고친 것은 README 와 블로그에 이유와 함께 남깁니다.",
            "리더를 맡으면 초기 환경과 공통 규칙을 먼저 세워 팀원이 각자의 몫에만 집중하게 합니다.",
        ],
    },
];

export const contacts: { label: string; value: string; href: string; icon: string }[] = [
    { label: "Email", value: "esh5218@gmail.com", href: "mailto:esh5218@gmail.com", icon: "/icons/mail.svg" },
    { label: "GitHub", value: "github.com/Muring", href: "https://github.com/Muring", icon: "/icons/github.svg" },
    { label: "Blog", value: "muring-blog.vercel.app", href: "/", icon: "/icons/blog.svg" },
];
