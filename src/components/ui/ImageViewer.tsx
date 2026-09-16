"use client";

import { useEffect, useRef, useState } from "react";
import { ViewerDialog } from "./ImageViewer.styled";

export type ViewerImage = {
    src: string;
    /** 툴바에 나오는 설명. 이미지 alt 로도 쓴다. */
    caption: string;
    width?: number;
    height?: number;
    /** 새 탭으로 여는 원본 링크. 없으면 src. */
    fileUrl?: string;
    /** 툴바 아래 더 보여줄 링크(예: GIF 시연). */
    extraLink?: { label: string; url: string };
};

type Props = {
    open: boolean;
    /** 툴바 왼쪽의 굵은 이름(프로젝트 이름, 글 제목). */
    title: string;
    images: ViewerImage[];
    index: number;
    onIndexChange: (index: number) => void;
    onClose: () => void;
};

/**
 * 전체 화면 이미지 뷰어. 네이티브 dialog 를 showModal 로 띄운다 —
 * Escape 와 포커스 가두기를 브라우저가 해준다. 포트폴리오 갤러리와 본문 이미지가 같이 쓴다.
 */
export default function ImageViewer({ open, title, images, index, onIndexChange, onClose }: Props) {
    const dialog = useRef<HTMLDialogElement>(null);
    const canvas = useRef<HTMLDivElement>(null);
    const [zoomed, setZoomed] = useState(false);
    const image = images[index];
    const many = images.length > 1;

    useEffect(() => {
        const element = dialog.current;
        if (!element) return;
        if (open && !element.open) {
            setZoomed(false);
            element.showModal();
        } else if (!open && element.open) {
            element.close();
        }
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previous;
        };
    }, [open]);

    function select(next: number) {
        if (next < 0 || next >= images.length) return;
        setZoomed(false);
        canvas.current?.scrollTo(0, 0);
        onIndexChange(next);
    }

    return (
        <ViewerDialog
            ref={dialog}
            aria-label={`${title} 이미지 확대 보기`}
            onClose={onClose}
            onKeyDown={(event) => {
                if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
                // 확대 상태에서는 화살표가 스크롤을 옮긴다
                if (zoomed || !many) return;
                event.preventDefault();
                select(index + (event.key === "ArrowRight" ? 1 : -1));
            }}
        >
            {open && image && (
                <>
                    <header className="viewer-toolbar">
                        <div>
                            <strong>{title}</strong>
                            {image.caption && <p>{image.caption}</p>}
                        </div>
                        <div className="viewer-actions">
                            <button
                                type="button"
                                aria-pressed={zoomed}
                                onClick={() => {
                                    setZoomed(!zoomed);
                                    canvas.current?.scrollTo(0, 0);
                                }}
                            >
                                {zoomed ? "화면에 맞추기" : "더 크게 보기"}
                            </button>
                            <a href={image.fileUrl ?? image.src} target="_blank" rel="noopener noreferrer">
                                이미지 파일
                            </a>
                            <button type="button" onClick={() => dialog.current?.close()} autoFocus aria-label="확대 보기 닫기">
                                닫기 ×
                            </button>
                        </div>
                    </header>
                    <div
                        ref={canvas}
                        className="viewer-canvas"
                        data-zoomed={zoomed}
                        tabIndex={0}
                        aria-label="확대 이미지. 확대 상태에서는 스크롤하여 이동할 수 있습니다."
                    >
                        {/* 원본을 그대로 보여주는 자리라 next/image 를 거치지 않는다. 치수가 있으면 확대 시 그 크기가 기준이다. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={image.src} alt={image.caption} width={image.width} height={image.height} />
                    </div>
                    {(many || image.extraLink) && (
                        <footer className="viewer-footer">
                            {many && (
                                <div className="viewer-nav">
                                    <button type="button" aria-label="이전 이미지" disabled={index === 0} onClick={() => select(index - 1)}>
                                        ←
                                    </button>
                                    <span aria-live="polite" aria-atomic="true">
                                        {String(index + 1).padStart(2, "0")} <span>/ {String(images.length).padStart(2, "0")}</span>
                                    </span>
                                    <button type="button" aria-label="다음 이미지" disabled={index === images.length - 1} onClick={() => select(index + 1)}>
                                        →
                                    </button>
                                </div>
                            )}
                            {image.extraLink && (
                                <a href={image.extraLink.url} target="_blank" rel="noopener noreferrer">
                                    {image.extraLink.label}
                                </a>
                            )}
                        </footer>
                    )}
                </>
            )}
        </ViewerDialog>
    );
}
