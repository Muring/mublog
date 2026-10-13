"use client";

import type { ComponentProps, ReactNode } from "react";
import type { ManagedImage } from "@/lib/storage";
import { formatBytes, imageUsers } from "@/lib/admin-filters";
import { Skeleton } from "./Admin.styled";
import { SkeletonLine } from "@/components/ui/Skeleton.styled";
import { ImageCard } from "./ImagePicker.styled";

type Props = Omit<ComponentProps<typeof ImageCard>, "children"> & {
    image: ManagedImage;
    /** 쓰임 배지 뒤에 붙는 상태 배지. 화면마다 보여줄 상태가 다르다(고르기는 미사용, 관리는 유예·삭제 예정) */
    status?: ReactNode;
};

/**
 * 이미지 카드 한 장. 이미지 관리와 이미지 고르기가 같은 모양을 쓴다.
 *
 * 썸네일·본문은 분류라 중립색 배지를 쓴다. globals.css 의 상태색(ok/warn)은 "정상/주의" 라는 뜻을
 * 이미 갖고 있어 분류에 돌려쓰지 않는다 — 상태 배지(status)만 상태색을 쓴다.
 */
export default function ImageTile({ image, status, ...button }: Props) {
    const users = imageUsers(image);
    return (
        <ImageCard type="button" {...button}>
            {/* 목록 미리보기라 next/image 최적화를 태우지 않는다 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.url} alt="" loading="lazy" />
            <span className="name" title={image.path}>{image.name}</span>
            <span className="meta">
                {image.usedAsThumbnail.length > 0 && <span className="badge">썸네일</span>}
                {image.usedInBody.length > 0 && <span className="badge">본문</span>}
                {status}
                <span>{users.map(({ user }) => user.slug).join(", ") || formatBytes(image.size)}</span>
            </span>
        </ImageCard>
    );
}

/** 불러오는 동안 카드 자리를 지킨다. 그리드(.grid)는 부르는 쪽이 둔다 */
export function ImageTileSkeletons({ count = 12 }: { count?: number }) {
    return Array.from({ length: count }, (_, i) => (
        <ImageCard key={i} as="span" aria-hidden>
            <Skeleton style={{ width: "100%", aspectRatio: "16 / 9", height: "auto" }} />
            <span className="name"><SkeletonLine style={{ width: "80%" }} /></span>
            <span className="meta"><SkeletonLine style={{ width: "50%" }} /></span>
        </ImageCard>
    ));
}
