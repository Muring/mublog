import { statSync } from "node:fs";
import { resolve, sep } from "node:path";

// Offline audit: remote URLs are explicitly unverified, not missing local files.
export function checkLocalImage(reference: string, publicDirectory = "public") {
    if (/^https?:\/\//i.test(reference) || reference.startsWith("//")) {
        return { state: "remote-unverified" as const, reference };
    }
    if (!reference.startsWith("/")) return { state: "invalid" as const, reference };
    try {
        const pathname = decodeURIComponent(reference.split(/[?#]/, 1)[0]);
        const base = resolve(publicDirectory);
        const file = resolve(base, `.${pathname}`);
        if (!file.startsWith(base + sep) || pathname.includes("\0")) return { state: "invalid" as const, reference };
        return { state: statSync(file, { throwIfNoEntry: false })?.isFile() ? "present" as const : "missing" as const, reference };
    } catch {
        return { state: "invalid" as const, reference };
    }
}
