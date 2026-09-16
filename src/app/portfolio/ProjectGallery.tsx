"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { PortfolioProject } from "@/data/portfolio";
import styles from "./portfolio.module.css";

type GalleryProject = Pick<PortfolioProject, "id" | "name" | "images">;

function GalleryViewer({ project }: { project: GalleryProject }) {
    const [index, setIndex] = useState(0);
    const [zoomed, setZoomed] = useState(false);
    const [opened, setOpened] = useState(false);
    const dialog = useRef<HTMLDialogElement>(null);
    const thumbnails = useRef<HTMLDivElement>(null);
    const canvas = useRef<HTMLDivElement>(null);
    const image = project.images[index];
    const source = `/images/portfolio/${image.file}.webp`;

    useEffect(() => {
        const strip = thumbnails.current;
        const selected = strip?.children[index] as HTMLElement | undefined;
        if (!strip || !selected) return;
        strip.scrollTo({
            left:
                selected.offsetLeft -
                strip.clientWidth / 2 +
                selected.clientWidth / 2,
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                .matches
                ? "instant"
                : "smooth",
        });
    }, [index]);

    useEffect(() => {
        if (!opened) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previous;
        };
    }, [opened]);

    function select(next: number) {
        setIndex(Math.max(0, Math.min(project.images.length - 1, next)));
        setZoomed(false);
        canvas.current?.scrollTo(0, 0);
    }

    function open() {
        setZoomed(false);
        dialog.current?.showModal();
        setOpened(true);
    }

    const navigation = (fullscreen = false) => (
        <div className={styles.viewerNavigation}>
            <button
                type="button"
                aria-label={`${project.name} 이전 화면${fullscreen ? " (전체 화면)" : ""}`}
                disabled={index === 0}
                onClick={() => select(index - 1)}
            >
                ←
            </button>
            <span aria-live="polite" aria-atomic="true">
                {String(index + 1).padStart(2, "0")}{" "}
                <span>/ {String(project.images.length).padStart(2, "0")}</span>
            </span>
            <button
                type="button"
                aria-label={`${project.name} 다음 화면${fullscreen ? " (전체 화면)" : ""}`}
                disabled={index === project.images.length - 1}
                onClick={() => select(index + 1)}
            >
                →
            </button>
        </div>
    );

    return (
        <div
            className={styles.galleryViewer}
            id={`gallery-${project.id}`}
            role="region"
            aria-label={`${project.name} 화면 갤러리`}
        >
            <figure>
                <button
                    className={styles.mainImage}
                    onClick={open}
                    type="button"
                    aria-label={`${image.caption} 전체 화면으로 보기`}
                >
                    <span
                        className={styles.imageTrack}
                        style={{ transform: `translateX(-${index * 100}%)` }}
                    >
                        {project.images.map((item, i) => (
                            <span
                                key={item.file}
                                className={styles.imageSlide}
                                aria-hidden={i !== index}
                            >
                                <Image
                                    src={`/images/portfolio/${item.file}.webp`}
                                    alt={item.caption}
                                    fill
                                    sizes="(max-width: 640px) calc(100vw - 44px), (max-width: 1100px) 65vw, 740px"
                                    loading={Math.abs(i - index) <= 1 ? "eager" : "lazy"}
                                />
                            </span>
                        ))}
                    </span>
                </button>
                <figcaption className={styles.viewerCaption}>
                    <div>
                        <p>{image.caption}</p>
                        <button type="button" onClick={open}>
                            전체 화면으로 확대 ↗
                        </button>
                        {image.originalUrl && (
                            <a
                                href={image.originalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                GIF 시연 보기 ↗
                            </a>
                        )}
                    </div>
                    {navigation()}
                </figcaption>
            </figure>
            {project.images.length > 1 && (
                <div
                    className={styles.thumbnailStrip}
                    ref={thumbnails}
                    role="group"
                    aria-label={`${project.name} 화면 선택`}
                >
                    {project.images.map((item, i) => (
                        <button
                            type="button"
                            key={item.file}
                            onClick={() => select(i)}
                            aria-label={`${i + 1}. ${item.caption}`}
                            aria-pressed={i === index}
                        >
                            <Image
                                src={`/images/portfolio/${item.file}.webp`}
                                alt=""
                                width={item.width}
                                height={item.height}
                                sizes="96px"
                            />
                            <span>{String(i + 1).padStart(2, "0")}</span>
                        </button>
                    ))}
                </div>
            )}
            <dialog
                ref={dialog}
                className={styles.imageDialog}
                aria-label={`${project.name} 이미지 확대 보기`}
                onClose={() => {
                    setOpened(false);
                    setZoomed(false);
                }}
                onKeyDown={(event) => {
                    if (
                        event.key === "ArrowLeft" ||
                        event.key === "ArrowRight"
                    ) {
                        // Arrow keys pan the native scroll area when zoomed in.
                        if (zoomed) return;
                        event.preventDefault();
                        select(index + (event.key === "ArrowRight" ? 1 : -1));
                    }
                }}
            >
                {opened && (
                    <>
                        <header className={styles.dialogToolbar}>
                            <div>
                                <strong>{project.name}</strong>
                                <p>{image.caption}</p>
                            </div>
                            <div className={styles.dialogActions}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setZoomed(!zoomed);
                                        canvas.current?.scrollTo(0, 0);
                                    }}
                                    aria-pressed={zoomed}
                                >
                                    {zoomed ? "화면에 맞추기" : "더 크게 보기"}
                                </button>
                                <a
                                    href={source}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    이미지 파일 ↗
                                </a>
                                <button
                                    type="button"
                                    onClick={() => dialog.current?.close()}
                                    autoFocus
                                    aria-label="확대 보기 닫기"
                                >
                                    닫기 ×
                                </button>
                            </div>
                        </header>
                        <div
                            ref={canvas}
                            className={`${styles.dialogCanvas} ${zoomed ? styles.zoomedCanvas : ""}`}
                            tabIndex={0}
                            aria-label="확대 이미지. 확대 상태에서는 스크롤하여 이동할 수 있습니다."
                        >
                            {/* Local optimized image; native dimensions also support the zoomed view. */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={source}
                                alt={image.caption}
                                width={image.width}
                                height={image.height}
                            />
                        </div>
                        <footer className={styles.dialogFooter}>
                            {navigation(true)}
                            {image.originalUrl && (
                                <a
                                    href={image.originalUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    GIF 시연 보기 ↗
                                </a>
                            )}
                        </footer>
                    </>
                )}
            </dialog>
        </div>
    );
}

export default function ProjectGallery({
    project,
}: {
    project: GalleryProject;
}) {
    const [group, setGroup] = useState("전체");
    const groups = Array.from(
        new Set(project.images.map((image) => image.group)),
    );
    const images =
        group === "전체"
            ? project.images
            : project.images.filter((image) => image.group === group);
    return (
        <section
            className={styles.gallerySection}
            aria-label={`${project.name} 서비스 화면`}
        >
            <div className={styles.galleryHeading}>
                <span>
                    서비스 화면 <strong>{project.images.length}</strong>
                </span>
                <label>
                    <span className={styles.srOnly}>
                        {project.name} 화면 종류
                    </span>
                    <select
                        value={group}
                        onChange={(event) => setGroup(event.target.value)}
                    >
                        <option value="전체">전체 화면</option>
                        {groups.map((name) => (
                            <option key={name} value={name}>
                                {name} (
                                {
                                    project.images.filter(
                                        (image) => image.group === name,
                                    ).length
                                }
                                )
                            </option>
                        ))}
                    </select>
                </label>
            </div>
            <GalleryViewer key={group} project={{ ...project, images }} />
        </section>
    );
}
