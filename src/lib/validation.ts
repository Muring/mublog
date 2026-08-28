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

export const postInputSchema = z.object({
    slug: slugSchema,
    title: z.string().trim().min(1, "제목을 입력하세요.").max(200),
    description: z.string().trim().max(300).nullish(),
    tags: z.array(z.string().trim().min(1).max(40)).max(10).default([]),
    thumbnail: z.string().trim().max(500).nullish(),
    contentMd: z.string().max(200_000),
    status: z.enum(["DRAFT", "PUBLISHED"]),
    publishedAt: z.string().datetime().nullish(),
});

export const postPatchSchema = postInputSchema.partial();

export const commentInputSchema = z.object({
    body: z.string().trim().min(1, "내용을 입력하세요.").max(2000, "2000자를 넘을 수 없습니다."),
    parentId: z.string().cuid().nullish(),
});

export type PostInput = z.infer<typeof postInputSchema>;
