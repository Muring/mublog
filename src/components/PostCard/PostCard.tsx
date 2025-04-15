import { CardWrapper } from "./PostCard.styled";
import { Post } from "contentlayer/generated";
import dayjs from "dayjs";
import Image from "next/image";

type PostCardProps = {
    post: Post;
};

export default function PostCard({ post }: PostCardProps) {
    const formattedDate = dayjs(post.date).format("YY년 MM월 DD일");

    return (
        <CardWrapper>
            {/* 이미지 */}
            <div className="image-wrapper">
                <Image
                    src="/icons/next.svg"
                    alt="thumbnail"
                    width={600}
                    height={600}
                    className="thumbnail"
                />
            </div>

            {/* 텍스트 영역 */}
            <div className="card-body">
                <h3 className="title">{post.title}</h3>
                <p className="description">{post.description}</p>

                <div className="footer">
                    <div className="tags">
                        <Image src="/icons/tag.svg" alt="tag icon" width={14} height={14} />
                        {post.tags?.map((tag) => (
                            <div key={tag}>#{tag}</div>
                        ))}
                    </div>
                    <div className="date">
                        <Image
                            src="/icons/calendar.svg"
                            alt="calendar icon"
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
