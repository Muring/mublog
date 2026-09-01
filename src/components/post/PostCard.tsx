import Card from "./PostCard.styled";
import type { PostSummary } from "@/types/post";
import { formatCardDate } from "@/lib/date";

/**
 * 목록·캐러셀에서 쓰는 포스트 카드.
 *
 * 태그와 날짜가 한 줄을 다투던 것이 잘림의 원인이었다.
 * 태그는 제목 위로 올려 줄바꿈을 허용하고, 아래 한 줄은 숫자 정보만 갖는다.
 * 그래서 태그도 제목도 잘리지 않는다.
 */

/** 아이콘은 currentColor 라 테마를 그대로 따른다 (파일도 invert 필터도 필요 없다) */
const iconProps = {
    width: 13,
    height: 13,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
};

const CalendarIcon = () => (
    <svg {...iconProps}>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
);

const EyeIcon = () => (
    <svg {...iconProps}>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const CommentIcon = () => (
    <svg {...iconProps}>
        <path d="M21 11.5a8.4 8.4 0 0 1-9 8.3 9.5 9.5 0 0 1-3.4-.6L3 21l1.9-5.1A8.2 8.2 0 0 1 4 11.5a8.4 8.4 0 0 1 9-8.3 8.4 8.4 0 0 1 8 8.3Z" />
    </svg>
);

export default function PostCard({
    post,
    style,
}: {
    post: PostSummary;
    style?: React.CSSProperties;
}) {
    const formattedDate = formatCardDate(post.publishedAt);

    return (
        <Card.Wrapper style={style}>
            <Card.ImageWrapper>
                <Card.StyledImage
                    src={post.thumbnail ?? "/thumbnails/page-not-found.svg"}
                    alt=""
                    width={400}
                    height={200}
                    quality={75}
                />
            </Card.ImageWrapper>

            <Card.Body>
                {post.tags.length > 0 && (
                    <Card.Tags>
                        {post.tags.map((tag) => (
                            <span key={tag} className="chip">
                                #{tag}
                            </span>
                        ))}
                    </Card.Tags>
                )}

                <Card.Title>{post.title}</Card.Title>

                {post.description && <Card.Desc>{post.description}</Card.Desc>}

                <Card.Meta>
                    <div className="group">
                        <span className="item">
                            <CalendarIcon />
                            {formattedDate}
                        </span>
                    </div>
                    <div className="group">
                        <span className="item" title={`조회 ${post.viewCount}`}>
                            <EyeIcon />
                            {post.viewCount.toLocaleString("ko-KR")}
                        </span>
                        <span className="item" title={`댓글 ${post.commentCount}`}>
                            <CommentIcon />
                            {post.commentCount.toLocaleString("ko-KR")}
                        </span>
                    </div>
                </Card.Meta>
            </Card.Body>
        </Card.Wrapper>
    );
}
