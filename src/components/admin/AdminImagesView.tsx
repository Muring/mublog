"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import Dropdown from "@/components/ui/Dropdown";
import FilterChips from "./FilterChips";
import ImageViewer from "@/components/ui/ImageViewer";
import { fetchJson, jsonRequest } from "@/lib/fetcher";
import { splitMulti, withoutMulti } from "@/lib/multi-value";
import { useConfirm } from "@/providers/Confirm";
import { useToast } from "@/providers/Toast";
import type { ImageUser, ManagedImage } from "@/lib/storage";
import { AdminListScroll, Button, ResultBar } from "./Admin.styled";
import { ImageCard } from "./ImagePicker.styled";
import { DetailPanel, ImageSheetPanel, ImagesLayout, SHEET_MEDIA } from "./AdminImages.styled";
import { adminDateLabel, IMAGE_SIZES } from "@/lib/admin-filters";
import FilterBar from "./FilterBar";
import AdminSheet from "./AdminSheet";

import { imagePageUrl, type ImageFilter as Filter, type ImageSort as Sort, type ImagePage } from "@/lib/admin-image-query";
import { useAdminImages } from "@/hooks/useAdminImages";

const FILTERS: { key: Filter; label: string; match: (image: ManagedImage) => boolean }[] = [
    { key: "all", label: "전체", match: () => true },
    { key: "thumbnail", label: "썸네일", match: (image) => image.usedAsThumbnail.length > 0 },
    { key: "body", label: "본문", match: (image) => image.usedInBody.length > 0 },
    { key: "unused", label: "미사용", match: (image) => image.state !== "used" },
    { key: "scheduled", label: "삭제 예정", match: (image) => image.state === "scheduled" },
];

/** 한 번에 보낼 수 있는 경로 수. API 스키마의 상한과 같다 */
const DELETE_BATCH = 100;

function bytes(size: number) {
    if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))}KB`;
    return `${(size / 1024 / 1024).toFixed(1)}MB`;
}

/**
 * 한국 시간으로 "2026-09-29 14:03".
 * Intl 은 서버(Node)와 브라우저의 ICU 가 문구를 조금씩 다르게 내서 하이드레이션이 갈릴 수 있다. 손으로 만든다.
 */
function kst(iso: string, withTime = true) {
    const d = new Date(new Date(iso).getTime() + 9 * 60 * 60 * 1000);
    const pad = (n: number) => String(n).padStart(2, "0");
    const date = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
    return withTime ? `${date} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}` : date;
}

/** 정리 시각. Hobby 의 cron 은 정시가 아니라 그 한 시간 안 어딘가에 돌아서 구간으로 적는다 */
function sweepTime(iso: string) {
    const d = new Date(new Date(iso).getTime() + 9 * 60 * 60 * 1000);
    const hour = d.getUTCHours();
    return `${d.getUTCMonth() + 1}/${d.getUTCDate()} ${hour}~${(hour + 1) % 24}시 사이`;
}

/** 썸네일로도 본문에도 쓰는 글은 한 줄로 합친다 */
function usersOf(image: ManagedImage) {
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

type Props = { initialPage: ImagePage };

/**
 * Storage 의 글 이미지 전부를 쓰임·상태와 함께 본다.
 *
 * 상태는 서버(classifyImages)가 sweep 과 같은 판정으로 정해 보낸다. 여기서 다시 계산하지 않는다.
 * 지울 수 있는 것은 아무 글도 쓰지 않는 이미지뿐이다. 쓰는 이미지는 먼저 글에서 빼야 한다.
 */
export default function AdminImagesView({ initialPage }: Props) {
    const toast = useToast();
    const confirm = useConfirm();
    const [filter, setFilter] = useState<Filter>("all");
    const [sort, setSort] = useState<Sort>("newest");
    const [query, setQuery] = useState("");
    const [postId, setPostId] = useState("");
    const [imageFilters, setImageFilters] = useState({ from: "", to: "", format: "", size: "" });
    const requestQuery = { filter, sort, q: query, post: postId, ...imageFilters };
    const { page, pending, stale, loadingMore, error, loadMore, refresh, retry } = useAdminImages(initialPage, requestQuery);
    const { images, posts, formats, counts, nextSweepAt } = page;
    const scrollRoot = useRef<HTMLDivElement>(null);
    const sentinel = useRef<HTMLDivElement>(null);
    const queryKey = JSON.stringify(requestQuery);
    const currentQuery = useRef(queryKey);
    useEffect(() => {
        currentQuery.current = queryKey;
        scrollRoot.current?.scrollTo({ top: 0 });
    }, [queryKey]);
    const composing = useRef(false);
    const search = useRef<HTMLInputElement>(null);
    const [selection, setSelection] = useState<ManagedImage | null>(null);
    const selectedPath = selection?.path ?? null;
    const [deleting, setDeleting] = useState(false);
    const [viewing, setViewing] = useState(false);
    // 좁은 화면에서 상세를 시트로 띄웠는가. 넓은 화면은 옆 패널이 늘 보이므로 쓰지 않는다
    const [sheetOpen, setSheetOpen] = useState(false);
    // 시트는 이 함수가 바뀔 때마다 포커스·스크롤 잠금을 다시 잡으므로 고정해 둔다
    const closeSheet = useCallback(() => setSheetOpen(false), []);

    /*
     * 좁은 화면에서는 패널이 그리드 맨 아래로 밀려 눌러도 반응이 없는 것처럼 보인다.
     * 그래서 고르는 순간 시트로 띄운다. 폭은 누르는 시점에 한 번만 본다 — 렌더 중에 재면
     * 하이드레이션 전에는 알 수 없어서 화면이 갈린다(AGENTS §3 레이아웃).
     */
    const select = (path: string) => {
        setSelection(images.find(image => image.path === path) ?? null);
        if (window.matchMedia(SHEET_MEDIA).matches) setSheetOpen(true);
    };

    // 시트를 연 채로 화면이 넓어지면 옆 패널이 같은 내용을 보여주므로 닫는다
    useEffect(() => {
        if (!sheetOpen) return;
        const media = window.matchMedia(SHEET_MEDIA);
        const onChange = () => { if (!media.matches) setSheetOpen(false); };
        media.addEventListener("change", onChange);
        return () => media.removeEventListener("change", onChange);
    }, [sheetOpen]);

    // 홈페이지 PostGrid처럼 끝을 감지하되, 다음 묶음은 서버에서 받아온다.
    useEffect(() => {
        if (pending || loadingMore || error || !page.nextCursor || !sentinel.current || !scrollRoot.current) return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) void loadMore();
        }, { root: scrollRoot.current, rootMargin: "0px 0px 120px 0px" });
        observer.observe(sentinel.current);
        return () => observer.disconnect();
    }, [pending, loadingMore, error, page.nextCursor, loadMore]);
    const chosenPosts = splitMulti(postId);
    const visible = images;
    const scopedLabel = chosenPosts.length || query.trim() || Object.values(imageFilters).some(Boolean) ? "지금 조건의 " : "";

    const clearQuery = () => {
        if (search.current) search.current.value = "";
        setQuery("");
    };

    const selected = images.find((image) => image.path === selectedPath) ?? selection;
    // 필터를 바꿔 고른 이미지가 목록에서 빠졌으면 그 한 장만 본다
    const viewList = selected && !visible.some(image => image.path === selected.path) ? [selected] : visible;
    useEffect(() => {
        if (viewing && !pending && !error && page.nextCursor && images.slice(-3).some(image => image.path === selectedPath)) {
            void loadMore();
        }
    }, [viewing, pending, error, page.nextCursor, images, selectedPath, loadMore]);

    async function remove(targets: { path: string; size: number }[], title: string, description: string) {
        if (deleting || targets.length === 0) return;
        if (!(await confirm({ title, description, confirmLabel: "삭제", danger: true }))) return;
        setDeleting(true);
        try {
            let freed = 0;
            for (let i = 0; i < targets.length; i += DELETE_BATCH) {
                const paths = targets.slice(i, i + DELETE_BATCH).map((image) => image.path);
                const result = await fetchJson<{ freedBytes: number }>("/api/admin/images", jsonRequest("DELETE", { paths }));
                freed += result.freedBytes;
            }
            toast.success(`${targets.length}개를 삭제했습니다. ${bytes(freed)} 확보.`);
            if (selected && targets.some(image => image.path === selected.path)) {
                setSelection(null);
                setSheetOpen(false);
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "이미지를 삭제하지 못했습니다.");
        } finally {
            setDeleting(false);
            // 일부 묶음만 지워졌을 수 있으므로 실패해도 목록을 다시 받는다
            scrollRoot.current?.scrollTo({ top: 0 });
            refresh();
        }
    }

    const [preparingDelete, setPreparingDelete] = useState(false);
    const removeScheduled = async () => {
        if (preparingDelete || deleting || pending || stale || error) return;
        setPreparingDelete(true);
        try {
            // 아직 불러오지 않은 항목까지 포함해 확인 대화상자 전에 대상을 확정한다.
            const { targets } = await fetchJson<{ targets: { path: string; size: number }[] }>(imagePageUrl(requestQuery, undefined, true));
            if (currentQuery.current !== queryKey) return;
            if (!targets.length) { toast.success("삭제 예정 이미지가 없습니다."); refresh(); return; }
            await remove(targets, `${scopedLabel}삭제 예정 ${targets.length}개를 지금 삭제할까요?`,
                `어떤 글도 쓰지 않고 올린 지 하루가 지난 이미지입니다(${bytes(targets.reduce((sum, image) => sum + image.size, 0))}). 두면 ${sweepTime(nextSweepAt)} 자동 정리에서 지워집니다. 되돌릴 수 없습니다.`);
        } catch (cause) { toast.error(cause instanceof Error ? cause.message : "삭제 대상을 불러오지 못했습니다."); }
        finally { setPreparingDelete(false); }
    };

    const removeOne = (image: ManagedImage) =>
        remove(
            [image],
            "이 이미지를 삭제할까요?",
            image.state === "grace"
                ? "올린 지 하루가 안 된 이미지입니다. 아직 저장하지 않은 글에서 쓰고 있다면 그 글에서 깨집니다. 되돌릴 수 없습니다."
                : "어떤 글도 쓰지 않는 이미지입니다. 되돌릴 수 없습니다."
        );

    const copyUrl = async (url: string) => {
        try {
            await navigator.clipboard.writeText(url);
            toast.success("주소를 복사했습니다.");
        } catch {
            toast.error("주소를 복사하지 못했습니다.");
        }
    };

    const details = selected && (
        <>
            {/* 누르면 본문·포트폴리오와 같은 전체 화면 뷰어로 크게 본다 */}
            <button type="button" className="preview-button" onClick={() => setViewing(true)} aria-label="이미지 크게 보기">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="preview" src={selected.url} alt="" />
            </button>
            <dl>
                <dt>경로</dt>
                <dd className="path">{selected.path}</dd>
                <dt>크기</dt>
                <dd>{bytes(selected.size)}</dd>
                <dt>올린 시각</dt>
                <dd>{kst(selected.createdAt)} (KST)</dd>
            </dl>

            <div className={`state ${selected.state}`} role="note">
                <span className="icon" aria-hidden>{selected.state === "scheduled" ? "⚠" : "ⓘ"}</span>
                <span>
                    {selected.state === "used" && "글에서 쓰고 있습니다. 지우려면 먼저 아래 글에서 제거해야 합니다."}
                    {selected.state === "grace" && `아무 글도 쓰지 않지만 올린 지 하루가 안 됐습니다. 저장 전인 글이 쓰고 있을 수 있습니다. 그대로 두면 ${sweepTime(selected.deletesAt!)} 자동 정리에서 지워집니다.`}
                    {selected.state === "scheduled" && `아무 글도 쓰지 않습니다. ${sweepTime(selected.deletesAt!)} 자동 정리에서 지워집니다.`}
                </span>
            </div>

            {selected.state === "used" && (
                <div>
                    <h3>쓰는 글</h3>
                    <ul className="users">
                        {usersOf(selected).map(({ user, kinds }) => (
                            <li key={user.id}>
                                <Link href={`/admin/posts/${user.id}`}>
                                    <span className={`badge ${user.status === "DRAFT" ? "draft" : ""}`}>{user.status === "DRAFT" ? "초안" : "공개"}</span>
                                    <span className="title" title={user.title}>{user.title}</span>
                                    <span className="kind">{kinds.join(" · ")}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="actions">
                <Button type="button" onClick={() => copyUrl(selected.url)}>주소 복사</Button>
                <Button type="button" onClick={() => setViewing(true)}>크게 보기</Button>
                <Button type="button" className="danger" disabled={selected.state === "used" || deleting} onClick={() => removeOne(selected)}>
                    삭제
                </Button>
            </div>
        </>
    );

    const chips = [
        ...(filter !== "all" ? [{ key: "usage", name: "쓰임", value: FILTERS.find((item) => item.key === filter)!.label }] : []),
        // 여러 개를 골랐으면 값마다 칩을 하나씩 두어 하나씩 풀 수 있게 한다
        ...chosenPosts.map((id) => ({ key: `post:${id}`, name: "글", value: posts.find((p) => p.id === id)?.title ?? id })),
        ...(imageFilters.from || imageFilters.to ? [{ key: "date", name: "업로드일", value: adminDateLabel(imageFilters.from, imageFilters.to) }] : []),
        ...splitMulti(imageFilters.format).map((format) => ({ key: `format:${format}`, name: "형식", value: format.toUpperCase() })),
        ...(imageFilters.size ? [{ key: "size", name: "용량", value: IMAGE_SIZES.find((item) => item.value === imageFilters.size)!.label }] : []),
    ];
    // 초기화는 걸린 조건만 푼다. 정렬은 보는 방식이지 조건이 아니다(포스트·댓글과 같다)
    const resetFilters = () => { setFilter("all"); setPostId(""); setImageFilters({ from: "", to: "", format: "", size: "" }); clearQuery(); };

    return (
        <>
            <FilterBar
                status={
                    <div className="status-filters" role="group" aria-label="이미지 쓰임">
                        {FILTERS.map(({ key, label }) => (
                            <button key={key} type="button" aria-pressed={filter === key} onClick={() => setFilter(key)}>
                                {label} <span className="filter-count">{counts[key]}</span>
                            </button>
                        ))}
                    </div>
                }
                sort={
                    <Dropdown className="sort-control" label="이미지 정렬" size="control" variant="ghost" value={sort} align="right"
                        options={[{ value: "newest", label: "최신순" }, { value: "oldest", label: "오래된순" }, { value: "size", label: "용량순" }]}
                        onChange={(value) => setSort(value as Sort)} />
                }
                search={
                    <input type="search" ref={search} defaultValue="" placeholder="경로 · 글 제목 검색" aria-label="이미지 검색"
                        onCompositionStart={() => { composing.current = true; }}
                        onCompositionEnd={(event) => { composing.current = false; setQuery(event.currentTarget.value); }}
                        onChange={(event) => { if (!composing.current) setQuery(event.currentTarget.value); }} />
                }
                fields={[
                    { key: "post", label: "글", search: "글 제목 검색", multiple: true, options: [{ value: "", label: "전체" }, ...posts.map((p) => ({ value: p.id, label: p.title, hint: String(p.count) }))] },
                    { key: "format", label: "파일 형식", multiple: true, options: [{ value: "", label: "전체" }, ...formats.map((value) => ({ value, label: value.toUpperCase() }))] },
                    { key: "size", label: "용량", options: IMAGE_SIZES },
                ]}
                dateRange="업로드일"
                dateBefore="format"
                values={{ post: postId, ...imageFilters }}
                onApply={({ post, from, to, format, size }) => { setPostId(post); setImageFilters({ from, to, format, size }); }}
                fieldCount={new Set(chips.filter((chip) => chip.key !== "usage").map((chip) => chip.key.split(":")[0])).size}
                pending={pending}
                summary={error ? "목록을 불러오지 못했습니다." : `${page.count.toLocaleString("ko-KR")}개 중 ${images.length.toLocaleString("ko-KR")}개 표시`}
                chips={<FilterChips items={chips} onClear={resetFilters} canClear={chips.length > 0 || Boolean(query.trim()) || filter !== "all"}
                    onRemove={(key) => {
                        if (key === "usage") setFilter("all");
                        else if (key.startsWith("post:")) setPostId((current) => withoutMulti(current, key.slice(5)));
                        else if (key.startsWith("format:")) setImageFilters((current) => ({ ...current, format: withoutMulti(current.format, key.slice(7)) }));
                        else setImageFilters((current) => ({ ...current, ...(key === "date" ? { from: "", to: "" } : { [key]: "" }) }));
                    }} />}
            />

            {/*
              결과 요약 아래에 용량·정리 안내를 둔다.
              일괄 삭제는 조건이 아니라 결과에 거는 동작이라 필터 바가 아니라 이 줄의 오른쪽 끝에 둔다.
            */}
            <ResultBar>
                <p>
                    총 용량 {bytes(page.totalBytes)}
                    {page.count !== page.totalCount && ` · 지금 목록 ${bytes(page.bytes)}`}
                    <span className="cleanup-note">다음 자동 정리 {sweepTime(nextSweepAt)} (KST). 미사용 이미지는 업로드 하루 후 정리됩니다.</span>
                </p>
                <Button type="button" className="danger" disabled={deleting || preparingDelete || pending || stale || Boolean(error) || page.scheduledCount === 0}
                    onClick={removeScheduled}>
                    {preparingDelete ? "삭제 대상 확인 중…" : `삭제 예정 ${page.scheduledCount}개 지금 삭제`}
                </Button>
            </ResultBar>

            <ImagesLayout aria-busy={pending || stale}>
                <AdminListScroll ref={scrollRoot}>
                    {visible.length === 0 ? (
                        <p className="empty">해당 조건의 이미지가 없습니다.</p>
                    ) : (
                        <div className="grid">
                            {visible.map((image) => {
                                const users = usersOf(image);
                                return (
                                    <ImageCard key={image.path} type="button" className={image.path === selectedPath ? "current" : ""}
                                        aria-pressed={image.path === selectedPath} onClick={() => select(image.path)}>
                                        {/* 목록 미리보기라 next/image 최적화를 태우지 않는다 */}
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={image.url} alt="" loading="lazy" />
                                        <span className="name" title={image.path}>{image.name}</span>
                                        <span className="meta">
                                            {image.usedAsThumbnail.length > 0 && <span className="badge">썸네일</span>}
                                            {image.usedInBody.length > 0 && <span className="badge">본문</span>}
                                            {image.state === "grace" && <span className="badge grace">유예 중</span>}
                                            {image.state === "scheduled" && <span className="badge unused">삭제 예정</span>}
                                            <span>{users.map(({ user }) => user.slug).join(", ") || bytes(image.size)}</span>
                                        </span>
                                    </ImageCard>
                                );
                            })}
                        </div>
                    )}
                    <div ref={sentinel} className="load-more">
                        {error && <p role="alert">{error}</p>}
                        {(page.nextCursor || error) && <Button type="button" disabled={pending || loadingMore} onClick={() => void (error ? retry() : loadMore())}>
                            {loadingMore ? "이미지를 더 불러오는 중…" : error ? "다시 시도" : "이미지 더 보기"}
                        </Button>}
                    </div>
                </AdminListScroll>

                {/* 넓은 화면에서는 그리드 옆에 붙어 있고, 좁은 화면에서는 CSS 가 숨기고 아래 시트가 대신한다 */}
                <DetailPanel className="inline-panel" aria-label="이미지 정보">
                    {details ?? <p className="placeholder">이미지를 선택하세요.</p>}
                </DetailPanel>
            </ImagesLayout>

            {sheetOpen && details && (
                <AdminSheet title="이미지 정보" onClose={closeSheet} Panel={ImageSheetPanel}>{details}</AdminSheet>
            )}

            {/*
              지금 불러온 목록으로 이전·다음을 넘기고, 끝에 가까워지면 다음 묶음을 받는다.
              넘기면 상세 패널도 같은 이미지로 따라가서, 닫았을 때 보던 이미지의 정보가 남는다.
              원본 파일은 뷰어 툴바의 "이미지 파일" 링크가 새 탭으로 연다.
            */}
            <ImageViewer
                open={viewing && selected !== null}
                title="이미지 관리"
                images={viewList.map((image) => ({ src: image.url, caption: image.path }))}
                index={Math.max(0, viewList.findIndex((image) => image.path === selectedPath))}
                onIndexChange={(next) => setSelection(viewList[next] ?? null)}
                onClose={() => setViewing(false)}
            />
        </>
    );
}
