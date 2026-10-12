/**
 * 관리 목록 상자(AdminListScroll)를 코드로 굴릴 때 쓴다.
 * 넓은 화면은 상자가 제 안에서 스크롤하고, 좁은 화면은 상자가 펼쳐져 페이지가 스크롤한다.
 * 페이지가 스크롤할 때는 위에 붙은 필터 바(data-filter-bar)에 가리지 않는 곳까지만 올린다.
 */

/** 상자가 제 안에서 스크롤하는가. 펼쳐진 상자(overflow: visible)는 페이지가 대신 스크롤한다 */
export const scrollsInside = (box: HTMLElement) => getComputedStyle(box).overflowY !== "visible";

/** 페이지 스크롤에서 가리지 않는 맨 윗선: 위에 붙은 필터 바의 아래 끝 */
export const coveredTop = () => document.querySelector("[data-filter-bar]")?.getBoundingClientRect().bottom ?? 0;

/** 조건이 바뀌어 목록을 처음부터 보여 줄 때. 페이지 스크롤이면 목록 첫머리가 필터 밑에 가려졌을 때만 올린다 */
export function scrollListToTop(box: HTMLElement | null) {
    if (!box) return;
    if (scrollsInside(box)) { box.scrollTo({ top: 0 }); return; }
    const hidden = coveredTop() - box.getBoundingClientRect().top;
    if (hidden > 0) window.scrollBy({ top: -hidden });
}
