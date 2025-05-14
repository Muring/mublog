"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Post } from "contentlayer/generated";
import Link from "next/link";
import styled from "@emotion/styled";
import PostCard from "./PostCard/PostCard";

interface CarouselSliderProps {
  posts: Post[];
  tags?: string[];
}

const visibleCount = 3;
const cardWidth = 330;
const cardGap = 20;

export default function CarouselSlider({ posts, tags }: CarouselSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(visibleCount);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const autoSlideRef = useRef<NodeJS.Timeout | null>(null);

  const relatedPosts = useMemo(() => {
    return posts
      .filter((post) => post.tags?.some((tag: string) => tags?.includes(tag)))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [posts, tags]);

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
    <CarouselContainer>
      <h4>연관된 글</h4>
      <ArrowButton
        className="left"
        onClick={handlePrev}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        &lt;
      </ArrowButton>
      <CarouselWrapper>
        <CarouselTrack
          ref={trackRef}
          style={{
            transform: `translateX(-${(cardWidth + cardGap) * currentIndex - 70}px)`,
            transition: isTransitioning ? "transform 0.5s ease-in-out" : "none",
          }}
        >
          {duplicatedPosts.map((post, index) => (
            <CarouselSlide key={`${post._id}-${index}`}>
              <Link href={`/${post.slug}`}>
                <PostCard post={post} style={{ animationDelay: `${index * 0.05}s` }} />
              </Link>
            </CarouselSlide>
          ))}
        </CarouselTrack>
      </CarouselWrapper>
      <ArrowButton
        className="right"
        onClick={handleNext}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        &gt;
      </ArrowButton>
      <Dots>
        {relatedPosts.map((_, idx) => (
          <Dot
            key={idx}
            className={currentIndex % totalSlides === idx ? "active" : ""}
            onClick={() => setCurrentIndex(idx + visibleCount)}
          />
        ))}
      </Dots>
    </CarouselContainer>
  );
}

const CarouselContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 900px;
  margin: 0 auto 1rem auto;
  padding: 0 40px;

  h4 {
    padding: 2rem 0;
  }
`;

const CarouselWrapper = styled.div`
  overflow: hidden;
  width: 100%;
`;

const CarouselTrack = styled.div`
  display: flex;
  gap: ${cardGap}px;
`;

const CarouselSlide = styled.div`
  flex-shrink: 0;
  width: ${cardWidth}px;
  box-sizing: border-box;
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: translateY(-4px) !important;
    box-shadow: 0px 6px 5px -2px rgba(0, 0, 0, 0.15);
  }
`;

const ArrowButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: #fff;
  border: none;
  font-size: 36px;
  cursor: pointer;
  z-index: 1;

  &.left {
    left: 0;
  }

  &.right {
    right: 0;
  }
`;

const Dots = styled.div`
  text-align: center;
  margin-top: 10px;
`;

const Dot = styled.button`
  display: inline-block;
  width: 10px;
  height: 10px;
  background: #ccc;
  border-radius: 50%;
  margin: 0 5px;
  border: none;
  cursor: pointer;

  &.active {
    background: #333;
  }
`;
