import Image from "next/image";
import { SidePostWrapper } from "./SidePost.styled";
import Link from "next/link";

type SidePostProps = {
    title: string;
    desc?: string;
    thumbnail?: string;
};

export default function SidePost({ title, desc, thumbnail }: SidePostProps) {
    return (
        <SidePostWrapper>
            <Image
                src={thumbnail ?? "/thumbnails/page-not-found.svg"}
                alt="thumbnail"
                width={400}
                height={400}
                quality={100}
                className="thumbnail"
            />
            <div className="text-container">
                <p className="side-title">{title}</p>
                <p className="side-desc">{desc}</p>
            </div>
        </SidePostWrapper>
    );
}
