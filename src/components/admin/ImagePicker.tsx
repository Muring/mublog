"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchJson } from "@/lib/fetcher";
import { useToast } from "@/providers/Toast";
import { Button } from "./Admin.styled";
import { PickerOverlay, PickerBox, SourceTab, ImageCard } from "./ImagePicker.styled";

/** lib/storage.ts 의 LibraryImage 와 같은 모양. 서버 모듈을 client 로 끌어오지 않으려고 따로 적는다. */
type LibraryImage = {
    url: string;
    name: string;
    size: number;
    createdAt: string;
    usedAsThumbnail: string[];
    usedInBody: string[];
};

/** 무엇으로 쓰이는지로 거른다. 고르러 온 사람에게 중요한 건 파일 위치가 아니라 쓰임이다. */
type Filter = "all" | "thumbnail" | "body" | "unused";

const FILTERS: { key: Filter; label: string }[] = [
    { key: "all", label: "전체" },
    { key: "thumbnail", label: "썸네일" },
    { key: "body", label: "본문" },
    { key: "unused", label: "미사용" },
];

const kb = (bytes: number) => (bytes / 1024).toFixed(0) + "KB";

/** 이 이미지를 쓰는 글. 썸네일로도 본문에도 쓰는 글은 한 번만 센다. */
const usersOf = (image: LibraryImage) => [
    ...new Set([...image.usedAsThumbnail, ...image.usedInBody]),
];

type Props = {
    /** 지금 골라져 있는 주소. 목록에서 표시한다 */
    current: string;
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
 */
export default function ImagePicker({ current, onSelect, onClose }: Props) {
    const toast = useToast();
    const [images, setImages] = useState<LibraryImage[] | null>(null);
    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState<Filter>("all");
    const searchRef = useRef<HTMLInputElement>(null);
    // 이 화면을 연 버튼. 닫을 때 포커스를 돌려줘야 키보드 사용자가 자리를 잃지 않는다.
    const openerRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        openerRef.current = document.activeElement as HTMLElement | null;
        return () => openerRef.current?.focus();
    }, []);

    useEffect(() => {
        let cancelled = false;
        fetchJson<{ images: LibraryImage[] }>("/api/admin/images")
            .then((data) => {
                if (!cancelled) setImages(data.images);
            })
            .catch((error: unknown) => {
                if (cancelled) return;
                toast.error(
                    error instanceof Error ? error.message : "이미지 목록을 불러오지 못했습니다."
                );
                setImages([]);
            });
        return () => {
            cancelled = true;
        };
    }, [toast]);

    const close = useCallback(() => onClose(), [onClose]);

    useEffect(() => {
        searchRef.current?.focus();

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                event.preventDefault();
                close();
                return;
            }
            // Tab 을 이 안에 가둔다. 그러지 않으면 뒤에 가려진 에디터로 빠져나가
            // 보이지 않는 곳에 포커스가 놓인다.
            if (event.key !== "Tab") return;

            const focusable = Array.from(
                document.querySelectorAll<HTMLElement>(
                    "[data-image-picker] button, [data-image-picker] input"
                )
            );
            if (focusable.length === 0) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
        // images 가 늦게 와서 카드가 생기면 목록도 다시 잡아야 한다
    }, [close, images]);

    const filtered = useMemo(() => {
        if (!images) return [];
        const q = query.trim().toLowerCase();
        return images.filter((image) => {
            const users = usersOf(image);
            if (filter === "thumbnail" && image.usedAsThumbnail.length === 0) return false;
            if (filter === "body" && image.usedInBody.length === 0) return false;
            if (filter === "unused" && users.length > 0) return false;
            if (!q) return true;
            return (
                image.name.toLowerCase().includes(q) ||
                image.url.toLowerCase().includes(q) ||
                users.some((slug) => slug.toLowerCase().includes(q))
            );
        });
    }, [images, query, filter]);

    const unused = filtered.filter((image) => usersOf(image).length === 0).length;

    return (
        <PickerOverlay
            // 막을 누르면 닫는다. 상자 안쪽 클릭이 올라와 닫히지 않도록 대상을 확인한다.
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) close();
            }}
        >
            <PickerBox data-image-picker role="dialog" aria-modal="true" aria-labelledby="picker-title">
                <div className="picker-head">
                    <h3 id="picker-title">이미지 선택</h3>
                    <input
                        ref={searchRef}
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="파일 이름 · 쓰는 글로 거르기"
                        aria-label="이미지 검색"
                    />
                    <div className="sources">
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
                </div>

                <div className="picker-body">
                    {images === null ? (
                        <p className="loading">불러오는 중...</p>
                    ) : filtered.length === 0 ? (
                        <p className="empty">찾는 이미지가 없습니다.</p>
                    ) : (
                        <div className="grid">
                            {filtered.map((image) => (
                                <ImageCard
                                    key={image.url}
                                    type="button"
                                    className={image.url === current ? "current" : ""}
                                    onClick={() => {
                                        onSelect(image.url);
                                        close();
                                    }}
                                >
                                    {/* 목록 미리보기라 next/image 최적화를 태우지 않는다 */}
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={image.url} alt="" loading="lazy" />
                                    <span className="name" title={image.name}>
                                        {image.name}
                                    </span>
                                    <span className="meta">
                                        {/*
                                          썸네일·본문은 분류라 중립색을 쓴다. globals.css 의
                                          상태색(ok/warn)은 "정상/주의" 라는 뜻을 이미 갖고 있어
                                          분류에 돌려쓰면 안 된다. 손볼 거리인 "미사용" 만
                                          상태색을 쓴다 — 그건 실제로 상태다.
                                        */}
                                        {image.usedAsThumbnail.length > 0 && (
                                            <span className="badge">썸네일</span>
                                        )}
                                        {image.usedInBody.length > 0 && (
                                            <span className="badge">본문</span>
                                        )}
                                        {usersOf(image).length === 0 && (
                                            <span className="badge unused">미사용</span>
                                        )}
                                        <span>{usersOf(image).join(", ") || kb(image.size)}</span>
                                    </span>
                                </ImageCard>
                            ))}
                        </div>
                    )}
                </div>

                <div className="picker-foot">
                    <span>
                        {filtered.length}개
                        {unused > 0 && ` · 미사용 ${unused}개`}
                    </span>
                    <Button type="button" onClick={close}>
                        닫기
                    </Button>
                </div>
            </PickerBox>
        </PickerOverlay>
    );
}
