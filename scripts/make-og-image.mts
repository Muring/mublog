/**
 * 공유 카드용 og:image (public/og-default.png) 를 로고에서 만든다.
 *
 *   yarn make:og
 *
 * 결과물은 커밋한다 — 빌드가 만들어내지 않는다. 로고(public/icons/mublog.svg)나
 * 아래 문구를 바꿨을 때만 다시 돌리면 된다.
 *
 * SVG 를 그대로 og:image 로 쓸 수 없어서 굽는다. 카카오톡·슬랙·X 등 대부분의
 * 미리보기 수집기가 SVG 를 거른다. 크기는 1200x630 (1.91:1) 로 고정하는데,
 * 정사각형 로고를 그대로 주면 수집기마다 다르게 잘라 로고가 반쯤 날아간다.
 */
import { readFileSync } from "node:fs";
import sharp from "sharp";

const WIDTH = 1200;
const HEIGHT = 630;
const LOGO = 260;

/** 로고 + 글자를 한 덩어리로 보고 가로 가운데에 맞춘 좌표 */
const LOGO_LEFT = 245;
const TEXT_LEFT = 585;

/*
 * 글자는 시스템 폰트로 굽는다. 본문 폰트(NanumSquareNeo)는 woff2 뿐이라
 * 렌더러가 읽지 못한다 — 여기 문구가 전부 로마자라 티가 나지 않는다.
 * 한글을 넣게 되면 폰트부터 해결해야 한다.
 */
const FONT = "Ubuntu Sans, DejaVu Sans, sans-serif";

const logoSvg = readFileSync("public/icons/mublog.svg");

const logo = await sharp(logoSvg, { density: 600 })
    .resize(LOGO, LOGO, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

const wordmark = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
       <text x="${TEXT_LEFT}" y="317" font-family="${FONT}" font-size="104" font-weight="700" fill="#171717">Mublog</text>
       <text x="${TEXT_LEFT + 4}" y="383" font-family="${FONT}" font-size="40" font-weight="400" fill="#6b6b6b">Muring&#8217;s blog</text>
     </svg>`
);

// 배경은 라이트 테마의 --background. og:image 는 한 벌뿐이라 테마를 따라갈 수 없다.
await sharp({ create: { width: WIDTH, height: HEIGHT, channels: 4, background: "#ffffff" } })
    .composite([
        { input: logo, top: (HEIGHT - LOGO) / 2, left: LOGO_LEFT },
        { input: wordmark, top: 0, left: 0 },
    ])
    .png()
    .toFile("public/og-default.png");

console.log(`OK  public/og-default.png  ${WIDTH}x${HEIGHT}`);
