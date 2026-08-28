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

    if (previousSlug && previousSlug !== slug) {
        revalidateTag(`post:${previousSlug}`, PURGE);
        revalidatePath(`/${previousSlug}`);
    }
}
