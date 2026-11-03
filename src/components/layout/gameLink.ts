// Configure the public URLs before building the blog. Unconfigured production
// deployments must never send readers to localhost or an unclaimed domain.
const pick = (configured: string | undefined, devFallback: string) =>
    configured?.trim() || (process.env.NODE_ENV === "development" ? devFallback : null);

export type GameLink = {
    id: string;
    name: string;
    description: string;
    icon: string;
    url: string;
};

// NEXT_PUBLIC_ 값은 빌드 때 글자 그대로 치환되므로 process.env.X 를 직접 적어야 한다
const candidates = [
    {
        id: "dice-dungeon",
        name: "주사위 던전",
        description: "주사위를 배치해 던전을 탐험하는 턴제 게임",
        icon: "/icons/dice.svg",
        url: pick(process.env.NEXT_PUBLIC_DICE_DUNGEON_URL, "http://localhost:4173"),
    },
    {
        id: "bulmeong",
        name: "불멍",
        description: "모닥불을 피우고 바라보는 힐링 게임",
        icon: "/icons/fire.svg",
        url: pick(process.env.NEXT_PUBLIC_BULMEONG_URL, "http://localhost:5173"),
    },
];

export const games: GameLink[] = candidates.filter((game): game is GameLink => game.url !== null);
