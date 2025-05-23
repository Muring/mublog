import Card from "./PostCard.styled";
import { Post } from "contentlayer/generated";
import dayjs from "dayjs";
import Image from "next/image";

export default function PostCard({ post, style }: { post: Post; style?: React.CSSProperties }) {
  const formattedDate = dayjs(post.date).format("YY년 MM월 DD일");

  return (
    <Card.Wrapper style={style}>
      {/* 이미지 */}
      <Card.ImageWrapper>
        <Card.StyledImage
          src={post.thumbnail ?? "/thumbnails/page-not-found.svg"}
          alt="thumbnail"
          width={400}
          height={200}
          quality={100}
        />
      </Card.ImageWrapper>

      {/* 텍스트 영역 */}
      <Card.Body>
        <Card.Title>{post.title}</Card.Title>
        <Card.Desc>{post.description}</Card.Desc>

        <Card.Footer>
          <Card.Tag>
            <Image
              src="/icons/tag.svg"
              alt="tag icon"
              className="auto-dark"
              width={14}
              height={14}
            />
            <div className="tags">
              <Card.Text>{post.tags?.map((tag) => `#${tag}`).join(" ")}</Card.Text>
            </div>
          </Card.Tag>
          <Card.Date>
            <Image
              src="/icons/calendar.svg"
              alt="calendar icon"
              className="auto-dark"
              width={14}
              height={14}
            />
            <Card.Text>{formattedDate}</Card.Text>
          </Card.Date>
        </Card.Footer>
      </Card.Body>
    </Card.Wrapper>
  );
}
