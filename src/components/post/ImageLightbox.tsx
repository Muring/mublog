"use client";

import { useEffect, useState } from "react";
import { LightboxOverlay } from "./ImageLightbox.styled";

type Opened = { src: string; alt: string };

/**
 * 본문 이미지를 누르면 화면에 꽉 차게 보여준다.
 *
 * 본문은 서버가 렌더한 HTML 이라(CodeBlockTools 와 같은 사정) 이미지마다 핸들러를 달지 않고
 * #post-body 의 클릭을 위임으로 받는다. 링크 안의 이미지는 링크가 우선이라 건드리지 않는다.
 */
export default function ImageLightbox({ html }: { html: string }) {
    const [opened, setOpened] = useState<Opened | null>(null);

    useEffect(() => {
        const body = document.getElementById("post-body");
        if (!body) return;

        body.querySelectorAll<HTMLImageElement>("img").forEach((img) => {
            if (!img.closest("a")) img.style.cursor = "zoom-in";
        });

        const handleClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!(target instanceof HTMLImageElement) || target.closest("a")) return;
            event.preventDefault();
            setOpened({ src: target.currentSrc || target.src, alt: target.alt });
        };
        body.addEventListener("click", handleClick);
        return () => body.removeEventListener("click", handleClick);
    }, [html]);

    useEffect(() => {
        if (!opened) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const handleKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpened(null);
        };
        window.addEventListener("keydown", handleKey);
        return () => {
            document.body.style.overflow = previous;
            window.removeEventListener("keydown", handleKey);
        };
    }, [opened]);

    if (!opened) return null;

    return (
        <LightboxOverlay role="dialog" aria-modal="true" aria-label="이미지 확대" onClick={() => setOpened(null)}>
            <figure onClick={(event) => event.stopPropagation()} style={{ margin: 0, maxWidth: "100%", maxHeight: "100%", display: "flex", justifyContent: "center" }}>
                {/* 원본을 그대로 보여주는 자리라 next/image 의 최적화를 거치지 않는다 */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={opened.src} alt={opened.alt} onClick={() => setOpened(null)} style={{ cursor: "zoom-out" }} />
                {opened.alt && <figcaption>{opened.alt}</figcaption>}
            </figure>
            <button type="button" className="close" aria-label="닫기" onClick={() => setOpened(null)} autoFocus>
                ×
            </button>
        </LightboxOverlay>
    );
}
