"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Dropdown from "@/components/ui/Dropdown";
import { fetchImageLibrary, queryKeys } from "@/lib/queries";
import { useDialogKeys, useExitTransition, useScrollLock } from "@/hooks/useOverlay";
import { useImeInput } from "@/hooks/useImeInput";
import { useToast } from "@/providers/Toast";
import type { ImageUser, ManagedImage } from "@/lib/storage";
import { Button, Skeleton } from "./Admin.styled";
import { PickerOverlay, PickerBox, SourceTab } from "./ImagePicker.styled";
import ImageTile, { ImageTileSkeletons } from "./ImageTile";
import { imageUsers, IMAGE_SORT_OPTIONS } from "@/lib/admin-filters";

/** 무엇으로 쓰이는지로 거른다. 고르러 온 사람에게 중요한 건 파일 위치가 아니라 쓰임이다. */
type Filter = "all" | "thumbnail" | "body" | "unused";
type Sort = "newest" | "oldest" | "size";

const FILTERS: { key: Filter; label: string }[] = [
    { key: "all", label: "전체" },
    { key: "thumbnail", label: "썸네일" },
    { key: "body", label: "본문" },
    { key: "unused", label: "미사용" },
];

/** 목록을 못 받았을 때. 렌더마다 새 배열을 만들면 아래 useMemo 가 매번 다시 돈다 */
const NO_IMAGES: ManagedImage[] = [];

/** 글 필터에서 "지금 쓰는 글" 을 가리키는 값. slug 와 겹치지 않는다(slug 에는 : 가 없다) */
const THIS_POST = ":this";

/** 이 이미지를 쓰는 글. 썸네일로도 본문에도 쓰는 글은 한 번만 센다. */
const usersOf = (image: ManagedImage) => imageUsers(image).map(({ user }) => user);

/** 업로드 경로의 글 폴더. posts/<slug>/… · thumbnails/<slug>/… 가 아니면 null */
const folderSlug = (path: string) => /^(?:posts|thumbnails)\/([^/]+)\//.exec(path)?.[1] ?? null;

/** 그 글의 이미지: 지금 쓰는 것 + 그 글 폴더에 올렸지만 빠진 것(이미지 관리의 글 필터와 같은 기준) */
const belongsTo = (image: ManagedImage, slug: string) =>
    usersOf(image).some((user) => user.slug === slug) || folderSlug(image.path) === slug;

type Props = {
    /** 지금 골라져 있는 주소. 목록에서 표시한다 */
    current: string;
    /** 지금 쓰는 글의 주소. 있으면 글 필터 맨 위에 "이 글" 이 생긴다 */
    slug?: string;
    onSelect: (url: string) => void;
    onClose: () => void;
};

/**
 * 이미지 고르기.
 *
 * 이것이 없으면 에디터로 올린 이미지를 다시 쓸 방법이 없다. 주소가
 * `.../post-images/2026-09/<uuid>.png` 라 손으로 칠 수 없고, 훑어볼 화면도 없어서
 * Supabase 대시보드에서 주소를 복사해 오는 수밖에 없었다.
 *
 * 목록은 Storage 에 올린 이미지뿐이다. 글 이미지를 public/ 에 두지 않는다 (lib/storage.ts 참고).
 * 뜨고 닫히는 움직임·뒤 스크롤 잠금은 다른 창들과 같은 공용 동작(hooks/useOverlay)이다.
 */
export default function ImagePicker({ current, slug, onSelect, onClose }: Props) {
    const toast = useToast();
    // 방금 올린 이미지가 빠지면 고르기 화면의 쓸모가 없다. 열 때마다 다시 받는다(그동안은 지난 목록을 보여준다)
    const library = useQuery({ queryKey: queryKeys.imageLibrary, queryFn: fetchImageLibrary, staleTime: 0 });
    const images = library.data ?? (library.isError ? NO_IMAGES : null);
    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState<Filter>("all");
    const [post, setPost] = useState("");
    const [sort, setSort] = useState<Sort>("newest");
    // 한글은 조합이 끝났을 때만 거른다 — 조합 중에 상태를 바꾸면 자모가 풀린다(AGENTS §2)
    const { inputRef: searchRef, inputProps: searchInput } = useImeInput(query, setQuery);
    const boxRef = useRef<HTMLDivElement>(null);
    const { closing, requestClose, onAnimationEnd } = useExitTransition(onClose);
    useScrollLock();

    useEffect(() => {
        if (library.error) toast.error(library.error.message || "이미지 목록을 불러오지 못했습니다.");
    }, [library.error, toast]);

    const close = useCallback(() => requestClose(), [requestClose]);

    // 글 필터 드롭다운이 펼쳐져 있으면 Escape 는 그걸 먼저 닫는다(defaultPrevented).
    // 닫을 때 연 버튼으로 포커스를 돌려줘야 키보드 사용자가 자리를 잃지 않는다.
    useDialogKeys(boxRef, close, { initialFocus: searchRef, restoreFocus: true });

    /** 이미지가 딸린 글. 제목순(숫자는 값으로) — 이미지 관리의 글 필터와 같다 */
    const posts = useMemo(() => {
        if (!images) return [];
        const bySlug = new Map<string, ImageUser>();
        for (const image of images) for (const user of usersOf(image)) bySlug.set(user.slug, user);
        return [...bySlug.values()]
            .map((user) => ({ ...user, count: images.filter((image) => belongsTo(image, user.slug)).length }))
            .sort((a, b) => a.title.localeCompare(b.title, "ko", { numeric: true }));
    }, [images]);
    const thisCount = useMemo(() => (slug && images ? images.filter((image) => belongsTo(image, slug)).length : 0), [images, slug]);

    const filtered = useMemo(() => {
        if (!images) return [];
        const q = query.trim().toLowerCase();
        const scope = post === THIS_POST ? slug : post;
        const list = images.filter((image) => {
            const users = usersOf(image);
            if (filter === "thumbnail" && image.usedAsThumbnail.length === 0) return false;
            if (filter === "body" && image.usedInBody.length === 0) return false;
            if (filter === "unused" && users.length > 0) return false;
            if (scope && !belongsTo(image, scope)) return false;
            if (!q) return true;
            return (
                image.path.toLowerCase().includes(q) ||
                users.some((user) => user.slug.toLowerCase().includes(q) || user.title.toLowerCase().includes(q))
            );
        });
        if (sort === "oldest") return [...list].reverse();
        if (sort === "size") return [...list].sort((a, b) => b.size - a.size);
        return list;
    }, [images, query, filter, post, slug, sort]);

    const unused = filtered.filter((image) => usersOf(image).length === 0).length;
    const postOptions = [
        { value: "", label: "모든 글" },
        // 새 글은 저장 전이라 폴더도 쓰임도 없을 수 있다. 그래도 "이 글" 은 보여 0 개임을 알린다
        ...(slug ? [{ value: THIS_POST, label: "이 글", hint: String(thisCount) }] : []),
        ...posts.filter((p) => p.slug !== slug).map((p) => ({ value: p.slug, label: p.title, hint: String(p.count) })),
    ];

    return (
        <PickerOverlay
            data-closing={closing || undefined}
            onAnimationEnd={onAnimationEnd}
            // 막을 누르면 닫는다. 상자 안쪽 클릭이 올라와 닫히지 않도록 대상을 확인한다.
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) close();
            }}
        >
            <PickerBox ref={boxRef} role="dialog" aria-modal="true" aria-labelledby="picker-title">
                <div className="picker-head">
                    <h3 id="picker-title">이미지 선택</h3>
                    <div className="sources" role="group" aria-label="이미지 쓰임">
                        {FILTERS.map(({ key, label }) => (
                            <SourceTab
                                key={key}
                                type="button"
                                className={filter === key ? "active" : ""}
                                aria-pressed={filter === key}
                                onClick={() => setFilter(key)}
                            >
                                {label}
                            </SourceTab>
                        ))}
                    </div>
                    <div className="picker-filters">
                        <input
                            {...searchInput}
                            type="search"
                            placeholder="경로 · 글 제목 검색"
                            aria-label="이미지 검색"
                        />
                        <Dropdown className="post-filter" label="글 필터" size="md" value={post} searchable="글 제목 검색"
                            options={postOptions} onChange={setPost} />
                        <Dropdown label="이미지 정렬" size="md" value={sort} align="right"
                            options={IMAGE_SORT_OPTIONS}
                            onChange={(value) => setSort(value as Sort)} />
                    </div>
                </div>

                <div className="picker-body">
                    {images === null ? (
                        // 이미지 관리 스켈레톤과 같은 카드 자리
                        <div className="grid" role="status" aria-label="이미지를 불러오는 중">
                            <ImageTileSkeletons />
                        </div>
                    ) : filtered.length === 0 ? (
                        <p className="empty">찾는 이미지가 없습니다.</p>
                    ) : (
                        <div className="grid">
                            {filtered.map((image) => (
                                <ImageTile
                                    key={image.url}
                                    image={image}
                                    className={image.url === current ? "current" : ""}
                                    onClick={() => {
                                        onSelect(image.url);
                                        close();
                                    }}
                                    // 고르는 사람에게는 손볼 거리인 "미사용" 만 상태로 보인다
                                    status={usersOf(image).length === 0 && <span className="badge unused">미사용</span>}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div className="picker-foot">
                    {/* 불러오는 동안 "0개" 를 보이면 이미지가 없는 것처럼 읽힌다. 개수 자리는 막대로 지킨다 */}
                    {images === null ? (
                        <Skeleton aria-hidden style={{ width: "4rem", height: "0.9rem" }} />
                    ) : (
                        <span>
                            {filtered.length}개
                            {unused > 0 && ` · 미사용 ${unused}개`}
                        </span>
                    )}
                    <Button type="button" onClick={close}>
                        닫기
                    </Button>
                </div>
            </PickerBox>
        </PickerOverlay>
    );
}
