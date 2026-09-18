import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getPostBySlug } from "@/lib/posts";
import { SITE_NAME } from "@/app/shared-metadata";
import { SITE_URL } from "@/lib/site";

export const alt = "글 미리보기 카드";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 3600;

/*
 * 글꼴은 assets/fonts 의 TTF 다. public/fonts 의 woff2 는 satori 가 못 읽는다.
 * process.cwd() 기준의 고정 경로로 읽어야 Next 가 서버리스 번들에 그 두 파일만 싣는다.
 *
 * 여기 말고는 서버에서 fs 로 파일을 읽지 않는다. 경로에 변수가 섞이면 Next 는 그 폴더를
 * 통째로 번들에 넣는다 — public/ 을 그렇게 읽다가 19MB 가 배포마다 쌓여
 * Vercel Function Storage 상한을 건드렸다.
 */
const fontsDir = join(process.cwd(), "assets", "fonts");
const bold = readFile(join(fontsDir, "NanumSquareNeo-Bold.ttf"));
const regular = readFile(join(fontsDir, "NanumSquareNeo-Regular.ttf"));

/**
 * 썸네일을 data URI 로 만든다. satori 는 상대경로를 못 읽으므로 받아와서 넣는다.
 * 글 썸네일은 전부 Storage 에 있다. 루트 경로가 오면 사이트 주소를 붙여 CDN 에서 받는다 —
 * 정적 파일이라 함수를 다시 부르지 않고, public/ 을 fs 로 읽지 않는다(위 주석).
 * 실패하면 없는 것으로 친다 — 카드가 깨지는 것보다 낫다.
 */
async function thumbnailDataUri(thumbnail: string | null): Promise<string | null> {
    if (!thumbnail || thumbnail.endsWith(".svg")) return null;
    try {
        const response = await fetch(thumbnail.startsWith("/") ? SITE_URL + thumbnail : thumbnail);
        if (!response.ok) return null;
        const type = response.headers.get("content-type") ?? "image/jpeg";
        const buffer = Buffer.from(await response.arrayBuffer());
        return `data:${type};base64,${buffer.toString("base64")}`;
    } catch {
        return null;
    }
}

// 라이트 테마 토큰과 같은 값. og:image 는 한 벌뿐이라 테마를 따라갈 수 없다.
const COLORS = { background: "#ffffff", foreground: "#171717", desc: "#6b6b6b", accent: "#0064dc", border: "#e6e6e6" };

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);
    const [boldData, regularData] = await Promise.all([bold, regular]);
    const fonts = [
        { name: "NanumSquareNeo", data: boldData, weight: 700 as const, style: "normal" as const },
        { name: "NanumSquareNeo", data: regularData, weight: 400 as const, style: "normal" as const },
    ];

    if (!post) {
        return new ImageResponse(
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: COLORS.background, color: COLORS.foreground, fontSize: 64, fontFamily: "NanumSquareNeo", fontWeight: 700 }}>
                {SITE_NAME}
            </div>,
            { ...size, fonts },
        );
    }

    const thumbnail = await thumbnailDataUri(post.thumbnail);
    const titleSize = post.title.length > 28 ? 52 : 60;
    // "개발기 7 (" 처럼 여는 괄호 앞에서 줄이 끊기지 않게 그 공백만 붙여 둔다.
    const title = post.title.replace(/ \(/g, "\u00a0(");

    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    background: COLORS.background,
                    fontFamily: "NanumSquareNeo",
                    padding: 64,
                }}
            >
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
                            {post.tags.slice(0, 3).map((tag) => (
                                <div key={tag} style={{ padding: "6px 16px", border: `2px solid ${COLORS.border}`, borderRadius: 999, fontSize: 22, color: COLORS.desc, fontWeight: 700 }}>
                                    {tag}
                                </div>
                            ))}
                        </div>
                        <div style={{ fontSize: titleSize, fontWeight: 700, color: COLORS.foreground, lineHeight: 1.3, wordBreak: "keep-all", display: "block", lineClamp: 3 }}>
                            {title}
                        </div>
                        {post.description && (
                            <div style={{ marginTop: 24, fontSize: 28, color: COLORS.desc, lineHeight: 1.5, wordBreak: "keep-all", display: "block", lineClamp: 2 }}>
                                {post.description}
                            </div>
                        )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 28, fontWeight: 700, color: COLORS.foreground }}>
                        <div style={{ width: 14, height: 14, borderRadius: 999, background: COLORS.accent }} />
                        {SITE_NAME}
                    </div>
                </div>
                {thumbnail && (
                    <div style={{ display: "flex", marginLeft: 48, width: 360, height: 360, alignSelf: "center", borderRadius: 24, overflow: "hidden", border: `2px solid ${COLORS.border}` }}>
                        <img src={thumbnail} alt="" width={360} height={360} style={{ objectFit: "cover" }} />
                    </div>
                )}
            </div>
        ),
        { ...size, fonts },
    );
}
