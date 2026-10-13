import { prisma } from "@/lib/prisma";
import { renderMarkdown } from "@/lib/markdown/render";
import { estimateReadingTime } from "@/lib/reading-time";

/*
 * 포스트 저장 라우트(생성·수정·slug 확인)가 같이 쓰는 것.
 * posts.ts 에 두지 않는다 — 그쪽은 공개 페이지들이 읽는 DAL 이라 마크다운 파이프라인까지 함께 실리게 된다.
 */

export const SLUG_TAKEN_MESSAGE = "이미 사용 중인 slug 입니다.";

/** 다른 글이 이 주소를 쓰는가. 수정 중인 글 자신(excludeId)은 세지 않는다 */
export async function isSlugTaken(slug: string, excludeId?: string | null): Promise<boolean> {
    const existing = await prisma.post.findUnique({ where: { slug }, select: { id: true } });
    return Boolean(existing) && existing?.id !== excludeId;
}

/** 본문과 함께 저장하는 파생값. 원문만 바꾸고 HTML·읽는 시간을 빠뜨리면 화면이 옛 본문을 보여준다 */
export async function renderedContent(contentMd: string) {
    return {
        contentMd,
        contentHtml: await renderMarkdown(contentMd),
        readingTime: estimateReadingTime(contentMd),
    };
}
