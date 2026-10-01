/**
 * 다중 선택 필터 값.
 *
 * 필터 폼·드롭다운은 값을 문자열 하나로 주고받는다. 여러 개를 고르면 이 구분자로 이어 붙인다.
 * 태그·시리즈 이름에 쉼표가 들어가도 깨지지 않게, 사람이 입력하지 않는 제어 문자(Unit Separator)를 쓴다.
 * 주소창에는 이 문자열이 아니라 같은 이름의 파라미터를 반복해 싣는다(?tag=a&tag=b).
 */
export const MULTI_SEPARATOR = "\u001f";

export function splitMulti(value: string | null | undefined): string[] {
    return value ? value.split(MULTI_SEPARATOR).filter(Boolean) : [];
}

export function joinMulti(values: Iterable<string>): string {
    return [...new Set(values)].filter(Boolean).join(MULTI_SEPARATOR);
}

/** ?tag=a&tag=b 와 옛 한 개짜리 ?tag=a 를 모두 읽는다 */
export function readMultiParam(params: URLSearchParams, key: string): string {
    return joinMulti(params.getAll(key));
}

export function appendMultiParam(params: URLSearchParams, key: string, value: string | null | undefined) {
    for (const item of splitMulti(value)) params.append(key, item);
}

/** 여러 값 중 하나만 빼거나(칩 해제) 없으면 그대로 둔다 */
export function withoutMulti(value: string | null | undefined, item: string): string {
    return joinMulti(splitMulti(value).filter((v) => v !== item));
}
