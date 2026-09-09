export const SITE_NAME = "Mublog";
export const SITE_DESCRIPTION = "Muring's blog";

/**
 * 모든 페이지가 함께 쓰는 og 필드.
 *
 * metadata 는 세그먼트 사이에서 **얕게** 병합된다 — 페이지가 `openGraph` 를
 * 하나라도 정의하면 레이아웃의 `openGraph` 는 통째로 사라진다(중첩 병합이 아니다).
 * 그래서 페이지에서 og 를 손댈 때는 반드시 이걸 펼쳐 넣는다.
 * 빠뜨려도 빌드·lint 는 통과하고, 공유 카드에서 사이트 이름만 조용히 사라진다.
 */
export const baseOpenGraph = {
    siteName: SITE_NAME,
    locale: "ko_KR",
    /*
     * 썸네일이 없는 포스트와 글이 아닌 페이지가 함께 쓰는 기본 카드.
     * scripts/make-og-image.mts 가 로고에서 구워 커밋한 파일이다 —
     * SVG 는 대부분의 미리보기 수집기가 거르므로 여기에 넣지 않는다.
     */
    images: ["/og-default.png"],
};
