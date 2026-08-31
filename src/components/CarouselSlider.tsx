"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { PostSummary } from "@/types/post";
import { byNewest } from "@/lib/date";
import Link from "next/link";
import PostCard from "./PostCard";
import Carousel, { CARD_GAP } from "./CarouselSlider.styled";

interface CarouselSliderProps {
  posts: PostSummary[];
  tags?: string[];
  currentSlug: string;
}

const MAX_RELATED = 5;
const AUTO_SLIDE_MS = 3000;
const SLIDE_MS = 500;

/** 카드 한 장이 최소한 가져야 할 폭. 이보다 좁아지면 장수를 줄인다. */
const MIN_CARD_WIDTH = 240;
const MAX_VISIBLE = 3;

/**
 * 한 화면에 보일 카드 수.
 *
 * 카드 폭을 330px 로 못박아 두어 3장(330×3 + 간격 40 = 1030px)이
 * 804px 짜리 컨테이너에 들어가려다 양끝이 잘렸다.
 * 들어갈 장수를 폭에서 거꾸로 구하고, 폭 자체는 CSS 가 나눠 갖는다.
 */
function visibleCountFor(width: number) {
  const fits = Math.floor((width + CARD_GAP) / (MIN_CARD_WIDTH + CARD_GAP));
  return Math.max(1, Math.min(MAX_VISIBLE, fits));
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    // currentColor 라서 테마 토큰을 그대로 따른다 (auto-dark 반전 불필요)
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={direction === "left" ? "M15 5 8 12l7 7" : "M9 5l7 7-7 7"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function CarouselSlider({ posts, tags, currentSlug }: CarouselSliderProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  // 서버에서는 폭을 알 수 없다. CSS 가 폭을 나누므로 장수만 있으면 그려진다.
  const [visible, setVisible] = useState(MAX_VISIBLE);
  const [currentIndex, setCurrentIndex] = useState(MAX_VISIBLE);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const relatedPosts = useMemo(() => {
    // 현재글 제외된 최신글 (중복 제거용으로도 사용)
    const latestPosts = posts
      .filter((post) => post.slug !== currentSlug)
      .sort((a, b) => byNewest(a.publishedAt, b.publishedAt));

    // 태그 일치 + 현재글 제외
    const taggedPosts = latestPosts.filter((post) => post.tags?.some((tag) => tags?.includes(tag)));

    // taggedPosts에서 최대 5개 확보, 부족하면 latestPosts로 보완
    const result: PostSummary[] = [...taggedPosts];

    for (const post of latestPosts) {
      if (result.length >= MAX_RELATED) break;
      if (!result.some((p) => p.id === post.id)) {
        result.push(post);
      }
    }

    return result.slice(0, MAX_RELATED);
  }, [posts, tags, currentSlug]);

  useLayoutEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const measure = (width: number) => {
      if (width > 0) setVisible(visibleCountFor(width));
    };

    measure(el.clientWidth);
    const observer = new ResizeObserver(([entry]) => measure(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const totalSlides = relatedPosts.length;
  // 카드가 화면을 다 채우지 못하면 감을 것이 없다. 복제하면 같은 글이 나란히 보인다.
  const isLooping = totalSlides > visible;

  const slides = useMemo(
    () =>
      isLooping
        ? [...relatedPosts.slice(-visible), ...relatedPosts, ...relatedPosts.slice(0, visible)]
        : relatedPosts,
    [relatedPosts, visible, isLooping],
  );

  // 보일 장수가 바뀌면 복제 구간의 위치도 달라진다
  useEffect(() => {
    setIsTransitioning(false);
    setCurrentIndex(isLooping ? visible : 0);
  }, [visible, isLooping]);

  useEffect(() => {
    if (!isLooping || isPaused || reducedMotion) return;
    const id = setInterval(() => setCurrentIndex((prev) => prev + 1), AUTO_SLIDE_MS);
    return () => clearInterval(id);
  }, [isLooping, isPaused, reducedMotion]);

  useEffect(() => {
    if (!isLooping) return;

    const atClone = currentIndex === 0 || currentIndex === slides.length - visible;
    if (!atClone) {
      setIsTransitioning(true);
      return;
    }

    // 복제 구간 끝에 닿으면 애니메이션이 끝난 뒤 진짜 위치로 조용히 되돌린다
    const id = setTimeout(() => {
      setIsTransitioning(false);
      setCurrentIndex(currentIndex === 0 ? totalSlides : visible);
    }, SLIDE_MS);
    return () => clearTimeout(id);
  }, [currentIndex, slides.length, totalSlides, visible, isLooping]);

  if (totalSlides === 0) return null;

  return (
    <Carousel.Container
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      <h4>연관된 글</h4>

      {isLooping && (
        <Carousel.ArrowButton
          className="left"
          type="button"
          aria-label="이전 글 보기"
          onClick={() => setCurrentIndex((prev) => prev - 1)}
        >
          <Chevron direction="left" />
        </Carousel.ArrowButton>
      )}

      <Carousel.Wrapper ref={wrapperRef}>
        <Carousel.Track
          visible={visible}
          currentIndex={currentIndex}
          isTransitioning={isTransitioning && !reducedMotion}
        >
          {slides.map((post, index) => {
            // 앞뒤 복제본은 읽히거나 탭 순서에 잡히면 안 된다
            const isClone = isLooping && (index < visible || index >= visible + totalSlides);
            return (
              <Carousel.Slide key={`${post.id}-${index}`} aria-hidden={isClone || undefined}>
                <Link href={`/${post.slug}`} tabIndex={isClone ? -1 : undefined}>
                  <PostCard post={post} style={{ animationDelay: `${index * 0.05}s` }} />
                </Link>
              </Carousel.Slide>
            );
          })}
        </Carousel.Track>
      </Carousel.Wrapper>

      {isLooping && (
        <Carousel.ArrowButton
          className="right"
          type="button"
          aria-label="다음 글 보기"
          onClick={() => setCurrentIndex((prev) => prev + 1)}
        >
          <Chevron direction="right" />
        </Carousel.ArrowButton>
      )}
    </Carousel.Container>
  );
}
