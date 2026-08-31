import { NextResponse } from "next/server";
import { getPublishedPosts } from "@/lib/posts";

// 사이드 메뉴(SideList)는 Header > root layout 안쪽 client 트리에 있어서
// 서버 props 를 받을 수 없다. 그래서 목록을 API 로 내려준다.
// 같은 태그 DAL 을 쓰므로 revalidateTag("posts:list") 로 함께 갱신된다.
export const revalidate = 3600;

export async function GET() {
    try {
        const posts = await getPublishedPosts();
        return NextResponse.json(posts);
    } catch (error) {
        console.error("[api/posts/summary]", error);
        return NextResponse.json({ error: "포스트를 불러오지 못했습니다." }, { status: 500 });
    }
}
