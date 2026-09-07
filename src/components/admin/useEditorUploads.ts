import { useCallback, useState, type RefObject } from "react";
import { useToast } from "@/providers/Toast";
import { fetchJson } from "@/lib/fetcher";

/**
 * 에디터의 이미지 업로드.
 *
 * 본문 드래그드롭·붙여넣기와 썸네일이 같은 라우트를 쓴다. 브라우저에서 Storage 로
 * 직접 올리지 않고 /api/admin/upload 를 거치므로 인가 경로가 하나로 유지된다.
 *
 * 본문에 넣을 때는 먼저 자리표시자를 꽂고, 올라온 뒤 주소로 바꾼다.
 * 그러지 않으면 큰 파일에서 몇 초 동안 아무 일도 없는 것처럼 보인다.
 *
 * slug 와 쓰임을 함께 보낸다 — 라우트가 그것으로 저장 경로를 정한다.
 * slug 는 타자를 치는 동안 계속 바뀌므로 매번 지금 값을 넘긴다.
 */
export function useEditorUploads(
    textareaRef: RefObject<HTMLTextAreaElement | null>,
    setContentMd: (update: (previous: string) => string) => void,
    setThumbnail: (url: string) => void,
    slug: string
) {
    const toast = useToast();
    const [isUploadingThumb, setIsUploadingThumb] = useState(false);

    /** 실패하면 문구를 띄우고 null 을 돌려준다. */
    const upload = useCallback(
        async (file: File, kind: "thumbnail" | "body"): Promise<string | null> => {
            const body = new FormData();
            body.append("file", file);
            body.append("kind", kind);
            body.append("slug", slug);
            try {
                const { url } = await fetchJson<{ url: string }>("/api/admin/upload", {
                    method: "POST",
                    body,
                });
                return url;
            } catch (error) {
                toast.error(
                    error instanceof Error ? error.message : "이미지 업로드에 실패했습니다."
                );
                return null;
            }
        },
        [toast, slug]
    );

    const uploadIntoBody = useCallback(
        async (files: File[]) => {
            const el = textareaRef.current;
            if (!el) return;

            for (const file of files) {
                if (!file.type.startsWith("image/")) continue;

                const token = "![업로드 중 " + crypto.randomUUID().slice(0, 8) + "]()";
                const { selectionStart: pos, value } = el;
                setContentMd(() => value.slice(0, pos) + token + value.slice(pos));

                const url = await upload(file, "body");
                setContentMd((previous) =>
                    previous.replace(token, url ? "![](" + url + ")" : "")
                );
                if (url) toast.success("이미지를 올렸습니다.");
            }
        },
        [textareaRef, setContentMd, upload, toast]
    );

    const uploadThumbnail = useCallback(
        async (file: File) => {
            // 파일 선택창은 accept 로 걸러지지만 끌어다 놓는 길에는 무엇이든 온다
            if (!file.type.startsWith("image/")) {
                toast.error("이미지 파일만 올릴 수 있습니다.");
                return;
            }

            setIsUploadingThumb(true);
            const url = await upload(file, "thumbnail");
            setIsUploadingThumb(false);
            if (url) setThumbnail(url);
        },
        [upload, setThumbnail, toast]
    );

    return { isUploadingThumb, uploadIntoBody, uploadThumbnail };
}
