import { CardWrapper } from "./PostCard.styled";
import { Post } from "contentlayer/generated";
import dayjs from "dayjs";
import Image from "next/image";

export default function PostCard({ post, style }: { post: Post; style?: React.CSSProperties }) {
    const formattedDate = dayjs(post.date).format("YY년 MM월 DD일");
    const thumbnailSrc =
        post.thumbnail && post.thumbnail.trim() !== "" ? post.thumbnail : "/thumbnails/default.svg";

    return (
        <CardWrapper style={style}>
            {/* 이미지 */}
            <div className="image-wrapper ">
                <Image
                    src={post.thumbnail ?? "/thumbnails/page-not-found.svg"}
                    alt="thumbnail"
                    width={600}
                    height={250}
                    quality={100}
                    className="thumbnail"
                />
            </div>

            {/* 텍스트 영역 */}
            <div className="card-body">
                <h5 className="title">{post.title}</h5>
                <p className="description">{post.description}</p>

                <div className="footer">
                    <div className="tags ">
                        <Image
                            src="/icons/tag.svg"
                            alt="tag icon"
                            className="auto-dark"
                            width={14}
                            height={14}
                        />
                        {post.tags?.map((tag) => (
                            <div key={tag}>#{tag}</div>
                        ))}
                    </div>
                    <div className="date">
                        <Image
                            src="/icons/calendar.svg"
                            alt="calendar icon"
                            className="auto-dark"
                            width={14}
                            height={14}
                        />
                        <div>{formattedDate}</div>
                    </div>
                </div>
            </div>
        </CardWrapper>
    );
}
