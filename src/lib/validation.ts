import { z } from "zod";

/**
 * slug 로 쓸 수 없는 값.
 *
 * 포스트 상세가 루트 동적 세그먼트(/[slug])라서 정적 라우트와 이름이 겹치면
 * 그 글은 영원히 열리지 않는다. 정적 라우트가 우선하기 때문이다.
 */
const RESERVED_SLUGS = new Set([
    "admin",
    "login",
    "logout",
    "auth",
    "api",
    "about",
    "ai",
    "portfolio",
    "privacy",
    "feed.xml",
    "_next",
    "favicon.ico",
    "robots.txt",
    "sitemap.xml",
]);

export const slugSchema = z
    .string()
    .trim()
    .min(1, "slug 를 입력하세요.")
    .max(120, "slug 가 너무 깁니다.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "영문 소문자·숫자·하이픈만 사용할 수 있습니다.")
    .refine((value) => !RESERVED_SLUGS.has(value), "예약된 주소라 사용할 수 없습니다.");

const tagsSchema = z.array(z.string().trim().min(1).max(40)).max(10);

export const postInputSchema = z.object({
    slug: slugSchema,
    title: z.string().trim().min(1, "제목을 입력하세요.").max(200),
    description: z.string().trim().max(300).nullish(),
    tags: tagsSchema.default([]),
    thumbnail: z.string().trim().max(500).nullish(),
    series: z.string().trim().max(60, "시리즈 이름이 너무 깁니다.").nullish(),
    seriesOrder: z.number().int().min(1).max(999).nullish(),
    contentMd: z.string().max(200_000),
    status: z.enum(["DRAFT", "PUBLISHED"]),
    publishedAt: z.string().datetime().nullish(),
});

/**
 * 고칠 필드만 받는다. .partial() 은 .default() 를 지우지 않아서, 그대로 두면 빠진 tags 가 [] 로 채워져
 * 저장된 태그를 지운다(본문만 보낸 요청에서 실제로 지워졌다). 기본값이 있는 필드는 여기서 기본값 없이 다시 둔다.
 */
export const postPatchSchema = postInputSchema.extend({ tags: tagsSchema }).partial();

export const commentInputSchema = z.object({
    body: z.string().trim().min(1, "내용을 입력하세요.").max(2000, "2000자를 넘을 수 없습니다."),
    parentId: z.string().cuid().nullish(),
});
