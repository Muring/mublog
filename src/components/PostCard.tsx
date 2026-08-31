import Card from "./PostCard.styled";
import type { PostSummary } from "@/types/post";
import { formatCardDate } from "@/lib/date";
import Image from "next/image";

export default function PostCard({ post, style }: { post: PostSummary; style?: React.CSSProperties }) {
    const formattedDate = formatCardDate(post.publishedAt);

    return (
        <Card.Wrapper style={style}>
            {/* 이미지 */}
            <Card.ImageWrapper>
                <Card.StyledImage
                    src={post.thumbnail ?? "/thumbnails/page-not-found.svg"}
                    alt="thumbnail"
                    width={400}
                    height={200}
                    quality={75}
                />
            </Card.ImageWrapper>

            {/* 텍스트 영역 */}
            <Card.Body>
                <Card.Title>{post.title}</Card.Title>
                <Card.Desc>{post.description}</Card.Desc>

                <Card.Footer>
                    <Card.Tag>
                        <Image src="/icons/tag.svg" alt="tag icon" className="auto-dark" width={14} height={14} />
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
