import Image from "next/image";
import { SidePostWrapper } from "./SidePost.styled";

type SidePostProps = {
  title: string;
  desc?: string;
  thumbnail?: string;
};

export default function SidePost({ title, desc, thumbnail }: SidePostProps) {
  return (
    <SidePostWrapper>
      {/*
        화면에는 40px 로 그려진다. width 가 srcset 을 정하므로 400 을 주면 828px 짜리를 받고,
        처음 보는 크기면 최적화기가 원본부터 다시 만들어 메뉴가 늦게 채워진다.
        64 는 가로로 긴 썸네일을 cover 로 잘라도 2x 화면에서 흐려지지 않는 선이다.
      */}
      <Image
        src={thumbnail ?? "/thumbnails/page-not-found.svg"}
        alt="thumbnail"
        width={64}
        height={64}
        className="thumbnail"
      />
      <div className="text-container">
        <h6 className="side-title">{title}</h6>
        <p className="side-desc">{desc}</p>
      </div>
    </SidePostWrapper>
  );
}
