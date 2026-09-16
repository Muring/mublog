"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Dropdown from "@/components/ui/Dropdown";
import ImageViewer from "@/components/ui/ImageViewer";
import type { PortfolioProject } from "@/data/portfolio";
import styles from "./portfolio.module.css";

type GalleryProject = Pick<PortfolioProject, "id" | "name" | "images">;

function GalleryViewer({ project }: { project: GalleryProject }) {
    const [index, setIndex] = useState(0);
    const [opened, setOpened] = useState(false);
    const thumbnails = useRef<HTMLDivElement>(null);
    const image = project.images[index];

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

    function select(next: number) {
        setIndex(Math.max(0, Math.min(project.images.length - 1, next)));
    }

    function open() {
        setOpened(true);
    }

    const navigation = () => (
        <div className={styles.viewerNavigation}>
            <button
                type="button"
                aria-label={`${project.name} 이전 화면`}
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
                aria-label={`${project.name} 다음 화면`}
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
                            전체 화면으로 확대
                        </button>
                        {image.originalUrl && (
                            <a
                                href={image.originalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                GIF 시연 보기
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
            <ImageViewer
                open={opened}
                title={project.name}
                images={project.images.map((item) => ({
                    src: `/images/portfolio/${item.file}.webp`,
                    caption: item.caption,
                    width: item.width,
                    height: item.height,
                    extraLink: item.originalUrl ? { label: "GIF 시연 보기", url: item.originalUrl } : undefined,
                }))}
                index={index}
                onIndexChange={select}
                onClose={() => setOpened(false)}
            />
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
                <Dropdown
                    label={`${project.name} 화면 종류`}
                    align="right"
                    value={group}
                    options={[
                        { value: "전체", label: "전체 화면" },
                        ...groups.map((name) => ({
                            value: name,
                            label: `${name} (${
                                project.images.filter((image) => image.group === name).length
                            })`,
                        })),
                    ]}
                    onChange={setGroup}
                />
            </div>
            <GalleryViewer key={group} project={{ ...project, images }} />
        </section>
    );
}
