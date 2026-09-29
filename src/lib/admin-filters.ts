/** 날짜 필터는 한국 시간의 시작일부터 종료일 전체까지 포함한다. */
export function withinAdminDates(iso: string, from = "", to = "") {
    const time = Date.parse(iso);
    return (!from || time >= Date.parse(`${from}T00:00:00+09:00`)) &&
        (!to || time < Date.parse(`${to}T00:00:00+09:00`) + 86_400_000);
}

export function adminDateLabel(from: string, to: string) {
    const dot = (date: string) => date.replaceAll("-", ".");
    if (from && to) return `${dot(from)} ~ ${dot(to)}`;
    return from ? `${dot(from)} 이후` : `${dot(to)} 이전`;
}

export function imageFormat(path: string) {
    const name = path.split("/").pop() ?? "";
    const extension = name.includes(".") ? name.split(".").pop()!.toLowerCase() : "";
    return extension === "jpg" ? "jpeg" : extension;
}

export const IMAGE_SIZES = [
    { value: "", label: "전체" },
    { value: "small", label: "100KB 미만" },
    { value: "medium", label: "100KB 이상 · 1MB 미만" },
    { value: "large", label: "1MB 이상" },
];
export function matchesImageSize(bytes: number, size: string) {
    return size === "small" ? bytes < 100 * 1024
        : size === "medium" ? bytes >= 100 * 1024 && bytes < 1024 * 1024
        : size === "large" ? bytes >= 1024 * 1024 : true;
}
