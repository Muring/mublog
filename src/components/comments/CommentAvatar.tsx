import type { CommentAuthor } from "@/types/comment";

/** 댓글 행 왼쪽의 아바타 칸. 사진이 없으면 이름 첫 글자, 지운 댓글처럼 작성자가 없으면 "?" */
export default function CommentAvatar({ author }: { author: Pick<CommentAuthor, "username" | "avatarUrl"> | null | undefined }) {
    return (
        <div className="avatar-col">
            {author?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="avatar" src={author.avatarUrl} alt="" />
            ) : (
                <div className="avatar avatar-fallback">
                    {author?.username.slice(0, 1).toUpperCase() ?? "?"}
                </div>
            )}
        </div>
    );
}
