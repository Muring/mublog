/** 한국어 본문 기준 대략 분당 900자 */
export function estimateReadingTime(content: string): number {
    return Math.max(1, Math.ceil(content.length / 900));
}
