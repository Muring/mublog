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

/**
 * 한 줄에 들어가는 태그 수.
 *
 * 폭을 재서 몇 개가 들어가는지 계산할 수도 있지만, 그러면 하이드레이션 전후로
 * 개수가 달라져 화면이 한 번 흔들린다. 실제 데이터가 대부분 태그 1~2개이므로
 * 개수로 자르고 나머지는 +N 으로 접는다.
 */
const VISIBLE_TAGS = 2;

export default function PostCard({
    post,
    style,
}: {
    post: PostSummary;
    style?: React.CSSProperties;
}) {
    const formattedDate = formatCardDate(post.publishedAt);
    const shownTags = post.tags.slice(0, VISIBLE_TAGS);
    const hiddenTags = post.tags.slice(VISIBLE_TAGS);

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
                {/* 태그가 없어도 자리는 지킨다. 비면 그 카드만 짧아진다 */}
                <Card.Tags>
                    {shownTags.map((tag) => (
                        <span key={tag} className="chip">
                            #{tag}
                        </span>
                    ))}
                    {hiddenTags.length > 0 && (
                        <span
                            className="chip more"
                            title={hiddenTags.map((t) => `#${t}`).join(" ")}
                        >
                            +{hiddenTags.length}
                            <span className="popover" aria-hidden>
                                {hiddenTags.map((t) => `#${t}`).join(" ")}
                            </span>
                        </span>
                    )}
                </Card.Tags>

                {/* 잘렸을 때 전체를 확인할 수 있도록 title 속성을 함께 둔다 */}
                <Card.Title title={post.title}>{post.title}</Card.Title>

                <Card.Desc>{post.description ?? ""}</Card.Desc>

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
