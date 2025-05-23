"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Post } from "contentlayer/generated";
import Link from "next/link";
import PostCard from "./PostCard";
import Carousel from "./CarouselSlider.styled";

interface CarouselSliderProps {
  posts: Post[];
  tags?: string[];
  currentSlug: string;
}

const visibleCount = 3;
const cardWidth = 330;
const cardGap = 20;

export default function CarouselSlider({ posts, tags, currentSlug }: CarouselSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(visibleCount);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const autoSlideRef = useRef<NodeJS.Timeout | null>(null);

  const relatedPosts = useMemo(() => {
    // 현재글 제외된 최신글 (중복 제거용으로도 사용)
    const latestPosts = posts
      .filter((post) => post.slug !== currentSlug)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // 태그 일치 + 현재글 제외
    const taggedPosts = latestPosts.filter((post) => post.tags?.some((tag) => tags?.includes(tag)));

    // taggedPosts에서 최대 5개 확보, 부족하면 latestPosts로 보완
    const result: Post[] = [...taggedPosts];

    for (const post of latestPosts) {
      if (result.length >= 5) break;
      if (!result.some((p) => p._id === post._id)) {
        result.push(post);
      }
    }

    return result.slice(0, 5);
  }, [posts, tags, currentSlug]);

  const duplicatedPosts = useMemo(() => {
    return [
      ...relatedPosts.slice(-visibleCount),
      ...relatedPosts,
      ...relatedPosts.slice(0, visibleCount),
    ];
  }, [relatedPosts]);

  const totalSlides = relatedPosts.length;

  const handleNext = () => {
    setCurrentIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => prev - 1);
  };

  useEffect(() => {
    if (autoSlideRef.current) clearInterval(autoSlideRef.current);
    if (!isPaused) {
      autoSlideRef.current = setInterval(() => {
        handleNext();
      }, 3000);
    }
    return () => {
      if (autoSlideRef.current) clearInterval(autoSlideRef.current);
    };
  }, [isPaused]);

  useEffect(() => {
    if (currentIndex === 0) {
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(totalSlides);
      }, 500);
    } else if (currentIndex === duplicatedPosts.length - visibleCount) {
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(visibleCount);
      }, 500);
    } else {
      setIsTransitioning(true);
    }
  }, [currentIndex, duplicatedPosts.length, totalSlides]);

  return (
    <Carousel.Container>
      <h4>연관된 글</h4>
      <Carousel.ArrowButton
        className="left"
        onClick={handlePrev}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        &lt;
      </Carousel.ArrowButton>
      <Carousel.Wrapper>
        <Carousel.Track
          ref={trackRef}
          cardGap={cardGap}
          cardWidth={cardWidth}
          currentIndex={currentIndex}
          isTransitioning={isTransitioning}
        >
          {duplicatedPosts.map((post, index) => (
            <Carousel.Slide key={`${post._id}-${index}`} cardWidth={cardWidth}>
              <Link href={`/${post.slug}`}>
                <PostCard post={post} style={{ animationDelay: `${index * 0.05}s` }} />
              </Link>
            </Carousel.Slide>
          ))}
        </Carousel.Track>
      </Carousel.Wrapper>
      <Carousel.ArrowButton
        className="right"
        onClick={handleNext}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        &gt;
      </Carousel.ArrowButton>
      {/* <Dots>
        {relatedPosts.map((_, idx) => (
          <Dot
            key={idx}
            className={currentIndex % totalSlides === idx ? "active" : ""}
            onClick={() => setCurrentIndex(idx + visibleCount)}
          />
        ))}
      </Dots> */}
    </Carousel.Container>
  );
}
