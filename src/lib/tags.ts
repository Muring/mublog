/**
 * 태그 정렬 규칙.
 *
 * 서버(getAllTags)와 에디터의 TagSelector 가 같은 순서로 보여야 해서 한 곳에 둔다.
 * 한쪽만 고치면 관리 화면과 공개 화면의 태그 순서가 갈린다.
 *
 * lib/posts.ts 에 두지 않는 이유는 그쪽이 prisma 를 import 하는 서버 모듈이기 때문이다.
 * TagSelector 는 client 컴포넌트라 거기서 끌어오면 prisma 가 브라우저 번들로 따라온다.
 */

/** "etc" 는 분류되지 않은 것들이라 항상 마지막으로 민다. */
export function compareTags(a: string, b: string): number {
    if (a === "etc") return 1;
    if (b === "etc") return -1;
    return a.localeCompare(b);
}
