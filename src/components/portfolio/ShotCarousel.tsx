"use client";

import { useRef, useState } from "react";
import type { Shot as ShotData } from "@/data/portfolio";
import { Arrow, Dots, Frame, Shot, Slide, Track } from "./ShotCarousel.styled";

/**
 * 세로(모바일) 화면은 한 장씩 넘기면 옆이 텅 빈다. 연속된 세로 화면은
 * 세 장까지 한 슬라이드에 나란히 세우고, 가로 화면은 한 장이 한 슬라이드다.
 */
function groupShots(shots: ShotData[]): ShotData[][] {
    const slides: ShotData[][] = [];
    for (const shot of shots) {
        const portrait = shot.height > shot.width;
        const last = slides[slides.length - 1];
        const lastPortrait = last && last.every((s) => s.height > s.width);
        if (portrait && lastPortrait && last.length < 3) {
            last.push(shot);
        } else {
            slides.push([shot]);
        }
    }
    return slides;
}

export default function ShotCarousel({ shots, label, priority = false }: { shots: ShotData[]; label: string; priority?: boolean }) {
    const trackRef = useRef<HTMLDivElement>(null);
    const [index, setIndex] = useState(0);
    const slides = groupShots(shots);

    const goTo = (next: number) => {
        const track = trackRef.current;
        if (!track) return;
        const clamped = Math.max(0, Math.min(slides.length - 1, next));
        track.scrollTo({ left: clamped * track.clientWidth });
    };

    /*
     * 현재 장은 IntersectionObserver 가 아니라 scrollLeft 로 센다.
     * 숨겨진 탭에는 옵저버 콜백이 오지 않지만 scroll 이벤트는 온다.
     */
    const handleScroll = () => {
        const track = trackRef.current;
        if (!track) return;
        setIndex(Math.round(track.scrollLeft / track.clientWidth));
    };

    return (
        <Frame aria-roledescription="carousel" aria-label={label}>
            <Track ref={trackRef} onScroll={handleScroll}>
                {slides.map((slide, i) => (
                    <Slide
                        key={slide[0].src}
                        role="group"
                        aria-roledescription="slide"
                        aria-label={`${i + 1} / ${slides.length}`}
                    >
                        {slide.map((shot) => (
                            <Shot
                                key={shot.src}
                                src={shot.src}
                                alt={shot.alt}
                                width={shot.width}
                                height={shot.height}
                                /*
                                 * 최적화기를 태우지 않는다. 이미 1200px 이하 WebP 로 줄여 둔 파일이라
                                 * 얻을 것이 없고, 개발에서는 요청마다 리사이즈해 첫 표시가 수 초 걸렸다.
                                 */
                                unoptimized
                                priority={priority && i === 0}
                            />
                        ))}
                    </Slide>
                ))}
            </Track>

            {slides.length > 1 && (
                <>
                    <Arrow type="button" data-dir="prev" aria-label="이전 화면" disabled={index === 0} onClick={() => goTo(index - 1)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </Arrow>
                    <Arrow
                        type="button"
                        data-dir="next"
                        aria-label="다음 화면"
                        disabled={index === slides.length - 1}
                        onClick={() => goTo(index + 1)}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </Arrow>
                    <Dots>
                        {slides.map((slide, i) => (
                            <button
                                key={slide[0].src}
                                type="button"
                                aria-label={`${i + 1}번째 화면`}
                                aria-current={i === index ? "true" : undefined}
                                onClick={() => goTo(i)}
                            />
                        ))}
                    </Dots>
                </>
            )}
        </Frame>
    );
}
