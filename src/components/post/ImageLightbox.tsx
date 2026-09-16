"use client";

import { useEffect, useState } from "react";
import ImageViewer, { type ViewerImage } from "@/components/ui/ImageViewer";

/**
 * 본문 이미지를 누르면 포트폴리오와 같은 전체 화면 뷰어로 보여준다.
 *
 * 본문은 서버가 렌더한 HTML 이라(CodeBlockTools 와 같은 사정) 이미지마다 핸들러를 달지 않고
 * #post-body 의 클릭을 위임으로 받는다. 링크 안의 이미지는 링크가 우선이라 건드리지 않는다.
 * 글 안의 이미지 전부를 목록으로 넘겨서 뷰어 안에서 이전·다음으로 옮길 수 있다.
 */
export default function ImageLightbox({ title, html }: { title: string; html: string }) {
    const [images, setImages] = useState<ViewerImage[]>([]);
    const [index, setIndex] = useState<number | null>(null);

    useEffect(() => {
        const body = document.getElementById("post-body");
        if (!body) return;

        const targets = Array.from(body.querySelectorAll<HTMLImageElement>("img")).filter(
            (img) => !img.closest("a"),
        );
        targets.forEach((img) => {
            img.style.cursor = "zoom-in";
        });

        const handleClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!(target instanceof HTMLImageElement)) return;
            const at = targets.indexOf(target);
            if (at === -1) return;
            event.preventDefault();
            // 목록은 누르는 시점에 만든다. currentSrc 는 로드가 끝나야 채워진다.
            setImages(
                targets.map((img) => ({
                    src: img.currentSrc || img.src,
                    caption: img.alt,
                    width: img.naturalWidth || undefined,
                    height: img.naturalHeight || undefined,
                })),
            );
            setIndex(at);
        };
        body.addEventListener("click", handleClick);
        return () => body.removeEventListener("click", handleClick);
    }, [html]);

    return (
        <ImageViewer
            open={index !== null}
            title={title}
            images={images}
            index={index ?? 0}
            onIndexChange={setIndex}
            onClose={() => setIndex(null)}
        />
    );
}
