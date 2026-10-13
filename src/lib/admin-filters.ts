import { IMAGE_SIZE_KEYS } from "./admin-image-query";
import type { ImageUser, ManagedImage } from "./storage";

/** 필터 선택지 맨 앞의 "전체". 빈 값은 거르지 않는다는 뜻이다 */
export const ALL_OPTION = { value: "", label: "전체" };

/** 이름과 개수가 있는 항목(태그·시리즈·글·작성자)을 "전체" 뒤에 개수를 붙여 늘어놓는다 */
export function facetOptions<T extends { count: number }>(items: readonly T[], value: (item: T) => string, label: (item: T) => string = value) {
    return [ALL_OPTION, ...items.map((item) => ({ value: value(item), label: label(item), hint: String(item.count) }))];
}

export const NEWEST_OLDEST = [{ value: "newest", label: "최신순" }, { value: "oldest", label: "오래된순" }];
/** 이미지 목록은 용량순이 더 있다 */
export const IMAGE_SORT_OPTIONS = [...NEWEST_OLDEST, { value: "size", label: "용량순" }];

/** 파일 크기. 1MB 미만은 KB(최소 1), 그 이상은 소수 한 자리 MB */
export function formatBytes(size: number) {
    if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))}KB`;
    return `${(size / 1024 / 1024).toFixed(1)}MB`;
}

/** 이 이미지를 쓰는 글. 썸네일로도 본문에도 쓰는 글은 한 줄로 합치고 쓰임을 kinds 에 모은다 */
export function imageUsers(image: Pick<ManagedImage, "usedAsThumbnail" | "usedInBody">) {
    const users = new Map<string, { user: ImageUser; kinds: string[] }>();
    for (const [list, kind] of [[image.usedAsThumbnail, "썸네일"], [image.usedInBody, "본문"]] as const) {
        for (const user of list) {
            const entry = users.get(user.id) ?? { user, kinds: [] };
            entry.kinds.push(kind);
            users.set(user.id, entry);
        }
    }
    return [...users.values()];
}

export function imageFormat(path: string) {
    const name = path.split("/").pop() ?? "";
    const extension = name.includes(".") ? name.split(".").pop()!.toLowerCase() : "";
    return extension === "jpg" ? "jpeg" : extension;
}

/** 구간을 늘리면 여기서 이름이 빠졌다고 타입이 알려 준다 */
const SIZE_LABELS: Record<typeof IMAGE_SIZE_KEYS[number], string> = {
    small: "100KB 미만",
    medium: "100KB 이상 · 1MB 미만",
    large: "1MB 이상",
};
export const IMAGE_SIZES = [
    ALL_OPTION,
    ...IMAGE_SIZE_KEYS.map((value) => ({ value, label: SIZE_LABELS[value] })),
];
export function matchesImageSize(bytes: number, size: string) {
    return size === "small" ? bytes < 100 * 1024
        : size === "medium" ? bytes >= 100 * 1024 && bytes < 1024 * 1024
        : size === "large" ? bytes >= 1024 * 1024 : true;
}
