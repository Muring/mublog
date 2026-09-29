"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchJson } from "@/lib/fetcher";
import { DEFAULT_IMAGE_QUERY, imagePageUrl, type ImagePage, type ImageQuery } from "@/lib/admin-image-query";

/** 조건 변경 요청을 취소하고, 이전 조건의 늦은 응답이 현재 목록에 섞이지 않게 한다. */
export function useAdminImages(initialPage: ImagePage, query: ImageQuery) {
    const key = JSON.stringify(query);
    const [snapshot, setSnapshot] = useState({ key: JSON.stringify(DEFAULT_IMAGE_QUERY), page: initialPage });
    const [pending, setPending] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState("");
    const [errorKind, setErrorKind] = useState<"page" | "more">("page");
    const [revision, setRevision] = useState(0);
    const lastQuery = useRef(key);
    const mountedPage = useRef(initialPage);
    const generation = useRef(0);
    const moreRequest = useRef<AbortController | null>(null);
    const refresh = useCallback(() => setRevision(value => value + 1), []);

    useEffect(() => {
        const current = ++generation.current;
        moreRequest.current?.abort();
        moreRequest.current = null;
        const unchangedInitial = lastQuery.current === key && key === JSON.stringify(DEFAULT_IMAGE_QUERY)
            && revision === 0 && mountedPage.current === initialPage;
        lastQuery.current = key;
        if (unchangedInitial) return () => { moreRequest.current?.abort(); };
        const controller = new AbortController();
        const run = async () => {
            setPending(true);
            setLoadingMore(false);
            setError("");
            try {
                const page = await fetchJson<ImagePage>(imagePageUrl(JSON.parse(key)), { signal: controller.signal });
                if (current === generation.current && !controller.signal.aborted) setSnapshot({ key, page });
            } catch (cause) {
                if (current === generation.current && !controller.signal.aborted) {
                    setError(cause instanceof Error ? cause.message : "이미지 목록을 불러오지 못했습니다.");
                    setErrorKind("page");
                }
            } finally {
                if (current === generation.current && !controller.signal.aborted) setPending(false);
            }
        };
        // 한글 조합은 입력창에서 처리하고, 여기서는 연속 검색 요청을 합친다.
        const timer = window.setTimeout(run, 200);
        return () => { clearTimeout(timer); controller.abort(); moreRequest.current?.abort(); };
    }, [key, revision, initialPage]);

    const replacing = pending || snapshot.key !== key;
    const loadMore = useCallback(async () => {
        if (replacing || !snapshot.page.nextCursor || moreRequest.current) return;
        const controller = new AbortController();
        moreRequest.current = controller;
        const current = generation.current;
        const cursor = snapshot.page.nextCursor;
        setLoadingMore(true);
        setError("");
        try {
            const next = await fetchJson<ImagePage>(imagePageUrl(JSON.parse(key), cursor), { signal: controller.signal });
            if (controller.signal.aborted || current !== generation.current) return;
            setSnapshot(previous => {
                if (previous.key !== key || previous.page.nextCursor !== cursor) return previous;
                const seen = new Set(previous.page.images.map(image => image.path));
                return { key, page: { ...next, images: [...previous.page.images, ...next.images.filter(image => !seen.has(image.path))] } };
            });
        } catch (cause) {
            if (!controller.signal.aborted && current === generation.current) {
                setError(cause instanceof Error ? cause.message : "다음 이미지를 불러오지 못했습니다.");
                setErrorKind("more");
            }
        } finally {
            if (moreRequest.current === controller) { moreRequest.current = null; setLoadingMore(false); }
        }
    }, [key, replacing, snapshot]);

    return {
        page: snapshot.page, stale: snapshot.key !== key, pending: replacing && !error, loadingMore, error, loadMore, refresh,
        retry: errorKind === "more" ? loadMore : refresh,
    };
}
