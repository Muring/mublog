"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Dropdown from "@/components/ui/Dropdown";
import FilterChips from "./FilterChips";
import styles from "./Management.module.css";
import ImageViewer from "@/components/ui/ImageViewer";
import { fetchJson, jsonRequest } from "@/lib/fetcher";
import { useConfirm } from "@/providers/Confirm";
import { useToast } from "@/providers/Toast";
import type { ImageUser, ManagedImage } from "@/lib/storage";
import { AdminListScroll, Button, TableToolbar } from "./Admin.styled";
import { ImageCard } from "./ImagePicker.styled";
import { DetailPanel, ImagesLayout } from "./AdminImages.styled";

type Filter = "all" | "thumbnail" | "body" | "unused" | "scheduled";
type Sort = "newest" | "oldest" | "size";

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

/** 정리 시각. Hobby 의 cron 은 정시가 아니라 그 한 시간 안 어딘가에 돈다 */
function sweepTime(iso: string) {
    const d = new Date(new Date(iso).getTime() + 9 * 60 * 60 * 1000);
    return `${d.getUTCMonth() + 1}/${d.getUTCDate()} ${d.getUTCHours()}시대`;
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

/** 업로드 경로의 글 폴더. posts/<slug>/… · thumbnails/<slug>/… 가 아니면 null */
function folderSlug(path: string) {
    return /^(?:posts|thumbnails)\/([^/]+)\//.exec(path)?.[1] ?? null;
}

type PostOption = { id: string; slug: string; title: string; count: number };

/**
 * 이 글의 이미지인가. 지금 쓰는 것에 더해, 그 글 폴더에 올라갔지만 본문에서 빠진 것도 포함한다 —
 * "이 글에 딸린 이미지 중 무엇이 버려졌나" 를 보려는 것이라 미사용이 빠지면 쓸모가 반이다.
 * slug 를 바꾼 글은 옛 폴더의 미사용 이미지가 걸리지 않는다(업로드 라우트 주석 참고).
 */
function belongsTo(image: ManagedImage, post: PostOption) {
    return usersOf(image).some(({ user }) => user.id === post.id) || folderSlug(image.path) === post.slug;
}

type Props = { images: ManagedImage[]; nextSweepAt: string };

/**
 * Storage 의 글 이미지 전부를 쓰임·상태와 함께 본다.
 *
 * 상태는 서버(classifyImages)가 sweep 과 같은 판정으로 정해 보낸다. 여기서 다시 계산하지 않는다.
 * 지울 수 있는 것은 아무 글도 쓰지 않는 이미지뿐이다. 쓰는 이미지는 먼저 글에서 빼야 한다.
 */
export default function AdminImagesView({ images, nextSweepAt }: Props) {
    const router = useRouter();
    const toast = useToast();
    const confirm = useConfirm();
    const [filter, setFilter] = useState<Filter>("all");
    const [sort, setSort] = useState<Sort>("newest");
    const [query, setQuery] = useState("");
    const [postId, setPostId] = useState("");
    const composing = useRef(false);
    const search = useRef<HTMLInputElement>(null);
    const [selectedPath, setSelectedPath] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [viewing, setViewing] = useState(false);

    /** 이미지가 하나라도 딸린 글. 제목순 — 글을 이름으로 찾아 들어오는 목록이다 */
    const posts = useMemo(() => {
        const byId = new Map<string, PostOption>();
        for (const image of images) {
            for (const { user } of usersOf(image)) {
                if (!byId.has(user.id)) byId.set(user.id, { id: user.id, slug: user.slug, title: user.title, count: 0 });
            }
        }
        const list = [...byId.values()];
        for (const post of list) post.count = images.filter((image) => belongsTo(image, post)).length;
        // numeric: "개발기 10" 이 "개발기 2" 앞에 오지 않게 숫자는 값으로 견준다
        return list.sort((a, b) => a.title.localeCompare(b.title, "ko", { numeric: true }));
    }, [images]);
    const post = posts.find((p) => p.id === postId) ?? null;

    /** 글·검색어로 거른 목록. 상태 버튼의 숫자도 이 안에서 센다 — "이 글에 미사용이 몇 장인가" 가 바로 보인다 */
    const scoped = useMemo(() => {
        const q = query.trim().toLowerCase();
        return images.filter((image) => {
            if (post && !belongsTo(image, post)) return false;
            if (!q) return true;
            return (
                image.path.toLowerCase().includes(q) ||
                usersOf(image).some(({ user }) => user.title.toLowerCase().includes(q) || user.slug.toLowerCase().includes(q))
            );
        });
    }, [images, post, query]);

    const counts = useMemo(
        () => Object.fromEntries(FILTERS.map(({ key, match }) => [key, scoped.filter(match).length])) as Record<Filter, number>,
        [scoped]
    );
    // 일괄 삭제는 지금 걸린 글·검색어 범위 안의 삭제 예정만 지운다. 보이는 숫자(삭제 예정 N)와 지워지는 수가 같아야 한다
    const scheduled = scoped.filter((image) => image.state === "scheduled");
    const scopedLabel = post || query.trim() ? "지금 조건의 " : "";
    const total = (list: ManagedImage[]) => list.reduce((sum, image) => sum + image.size, 0);

    const visible = useMemo(() => {
        const match = FILTERS.find((f) => f.key === filter)!.match;
        const list = scoped.filter(match);
        if (sort === "oldest") return [...list].reverse();
        if (sort === "size") return [...list].sort((a, b) => b.size - a.size);
        return list;
    }, [scoped, filter, sort]);

    const clearQuery = () => {
        if (search.current) search.current.value = "";
        setQuery("");
    };

    const selected = images.find((image) => image.path === selectedPath) ?? null;
    // 필터를 바꿔 고른 이미지가 목록에서 빠졌으면 그 한 장만 본다
    const viewList = selected && !visible.includes(selected) ? [selected] : visible;

    async function remove(targets: ManagedImage[], title: string, description: string) {
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
            if (selected && targets.includes(selected)) setSelectedPath(null);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "이미지를 삭제하지 못했습니다.");
        } finally {
            setDeleting(false);
            // 일부 묶음만 지워졌을 수 있으므로 실패해도 목록을 다시 받는다
            router.refresh();
        }
    }

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

    return (
        <>
            <TableToolbar>
                <div className="status-filters" role="group" aria-label="이미지 쓰임">
                    {FILTERS.map(({ key, label }) => (
                        <button key={key} type="button" aria-pressed={filter === key} onClick={() => setFilter(key)}>
                            {label} <span className="filter-count">{counts[key]}</span>
                        </button>
                    ))}
                </div>
                <input type="search" ref={search} defaultValue="" placeholder="경로 · 글 제목 검색" aria-label="이미지 검색"
                    onCompositionStart={() => { composing.current = true; }}
                    onCompositionEnd={(event) => { composing.current = false; setQuery(event.currentTarget.value); }}
                    onChange={(event) => { if (!composing.current) setQuery(event.currentTarget.value); }} />
                <Dropdown className="post-filter" label="글 필터" size="control" value={postId} searchable="글 제목 검색"
                    options={[{ value: "", label: "모든 글" }, ...posts.map((p) => ({ value: p.id, label: p.title, hint: String(p.count) }))]}
                    onChange={setPostId} />
                <Dropdown label="이미지 정렬" size="control" value={sort}
                    options={[{ value: "newest", label: "최신순" }, { value: "oldest", label: "오래된순" }, { value: "size", label: "용량순" }]}
                    onChange={(value) => setSort(value as Sort)} />
                <button type="button" disabled={filter === "all" && !postId && !query && sort === "newest"}
                    onClick={() => { setFilter("all"); setPostId(""); setSort("newest"); clearQuery(); }}>초기화</button>
                <button type="button" disabled={deleting || scheduled.length === 0}
                    onClick={() => remove(scheduled, `${scopedLabel}삭제 예정 ${scheduled.length}개를 지금 삭제할까요?`,
                        `어떤 글도 쓰지 않고 올린 지 하루가 지난 이미지입니다(${bytes(total(scheduled))}). 두면 ${sweepTime(nextSweepAt)} 자동 정리에서 지워집니다. 되돌릴 수 없습니다.`)}>
                    삭제 예정 지금 삭제
                </button>
            </TableToolbar>

            <FilterChips items={[
                ...(filter !== "all" ? [{ key: "status", name: "쓰임", value: FILTERS.find((f) => f.key === filter)!.label }] : []),
                ...(post ? [{ key: "post", name: "글", value: post.title }] : []),
                ...(query.trim() ? [{ key: "q", name: "검색", value: query.trim() }] : []),
            ]} onRemove={(key) => (key === "status" ? setFilter("all") : key === "post" ? setPostId("") : clearQuery())} />

            {/* 개수는 상태 버튼에 있으니 여기엔 버튼이 말하지 않는 용량과 정리 시각만 둔다 */}
            <p className={styles.summary}>
                총 용량 {bytes(total(images))}
                {visible.length !== images.length && ` · 지금 목록 ${bytes(total(visible))}`}
                {` · 다음 자동 정리 ${sweepTime(nextSweepAt)} (KST) — 어떤 글도 쓰지 않고 올린 지 하루가 지난 이미지를 지웁니다`}
            </p>

            <ImagesLayout>
                <AdminListScroll>
                    {visible.length === 0 ? (
                        <p className="empty">해당 조건의 이미지가 없습니다.</p>
                    ) : (
                        <div className="grid">
                            {visible.map((image) => {
                                const users = usersOf(image);
                                return (
                                    <ImageCard key={image.path} type="button" className={image.path === selectedPath ? "current" : ""}
                                        aria-pressed={image.path === selectedPath} onClick={() => setSelectedPath(image.path)}>
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
                </AdminListScroll>

                <DetailPanel aria-label="이미지 정보">
                    {!selected ? (
                        <p className="placeholder">이미지를 고르면 쓰임과 정보가 여기 나옵니다.</p>
                    ) : (
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
                    )}
                </DetailPanel>
            </ImagesLayout>

            {/*
              지금 걸러진 목록을 그대로 넘겨 뷰어 안에서 이전·다음으로 넘긴다.
              넘기면 상세 패널도 같은 이미지로 따라가서, 닫았을 때 보던 이미지의 정보가 남는다.
              원본 파일은 뷰어 툴바의 "이미지 파일" 링크가 새 탭으로 연다.
            */}
            <ImageViewer
                open={viewing && selected !== null}
                title="이미지 관리"
                images={viewList.map((image) => ({ src: image.url, caption: image.path }))}
                index={Math.max(0, viewList.findIndex((image) => image.path === selectedPath))}
                onIndexChange={(next) => setSelectedPath(viewList[next]?.path ?? null)}
                onClose={() => setViewing(false)}
            />
        </>
    );
}
