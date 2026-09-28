"use client";
import { useQuery } from "@tanstack/react-query";
import { fetchPostLikeCounts, queryKeys } from "@/lib/queries";
import LikeIcon from "./LikeIcon";

export default function PostLikeCount({ slug }: { slug: string }) {
    const { data, isError } = useQuery({ queryKey: queryKeys.postLikeCounts, queryFn: fetchPostLikeCounts, refetchOnWindowFocus: true });
    const count = data?.[slug];
    return <span className="item" title={count === undefined ? (isError ? "좋아요를 불러오지 못했습니다" : "좋아요 집계 불러오는 중") : `좋아요 ${count}개`}>
        <LikeIcon /><span aria-label={count === undefined ? "좋아요 수 미확인" : `좋아요 ${count}개`}>{count === undefined ? "—" : count.toLocaleString("ko-KR")}</span>
    </span>;
}
