import dayjs from "dayjs";

/** 포스트 상세 헤더용 날짜 (예: 2026년 1월 6일) */
export function formatPostDate(date: string | Date): string {
    return dayjs(date).format("YYYY년 M월 D일");
}

/** 포스트 카드용 날짜 (예: 26년 01월 06일) */
export function formatCardDate(date: string | Date): string {
    return dayjs(date).format("YY년 MM월 DD일");
}

/** 방문자 집계 기준일. 서버 타임존과 무관하게 KST 기준 YYYY-MM-DD 를 돌려준다. */
export function seoulDateKey(at: Date = new Date()): string {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(at);
}

/** 최신순 정렬 비교자. ISO 문자열과 Date 를 모두 받는다. */
export function byNewest(a: string | Date, b: string | Date): number {
    return new Date(b).getTime() - new Date(a).getTime();
}
