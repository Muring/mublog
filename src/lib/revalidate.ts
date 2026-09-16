import { revalidatePath, revalidateTag } from "next/cache";

// Next 16 부터 revalidateTag 는 두 번째 인자를 요구한다.
// 인자 없이 호출하던 기존 동작(전체 purge)에 해당하는 값이 "max" 다.
const PURGE = "max";

/**
 * 포스트 변경 후 캐시 무효화.
 *
 * previousSlug 를 반드시 넘겨야 한다. slug 를 바꿨을 때 옛 주소의 캐시를
 * 지우지 않으면 이전 URL 에 낡은 페이지가 계속 남는다.
 */
export function revalidatePost(slug: string, previousSlug?: string | null) {
    revalidateTag("posts:list", PURGE);
    revalidateTag(`post:${slug}`, PURGE);
    revalidatePath("/");
    revalidatePath(`/${slug}`);
    /*
     * 다른 글 페이지도 지운다. 글 하나가 바뀌면 같은 시리즈의 글들(시리즈 상자)과
     * 연관 글 캐러셀이 같이 바뀐다. 글이 수십 편이라 비용은 없다 —
     * 다음에 열리는 페이지만 그때 다시 그린다.
     */
    revalidatePath("/[slug]", "page");

    if (previousSlug && previousSlug !== slug) {
        revalidateTag(`post:${previousSlug}`, PURGE);
        revalidatePath(`/${previousSlug}`);
    }
}

/**
 * 글과 무관하게 전부 지운다. 스크립트가 DB 를 직접 고쳤을 때(백필·태그 정리·초안 등록)
 * /api/admin/revalidate 가 부른다. 에디터를 거친 변경은 revalidatePost 로 충분하다.
 */
export function revalidateEverything() {
    revalidateTag("posts:list", PURGE);
    revalidatePath("/");
    revalidatePath("/[slug]", "page");
    revalidatePath("/feed.xml");
    revalidatePath("/sitemap.xml");
}
