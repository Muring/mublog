import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { getAllPostsForAdmin } from "@/lib/posts";
import PostTableView from "@/components/admin/PostTableView";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
    await requireAdmin();
    const posts = await getAllPostsForAdmin();
    return <Suspense><PostTableView posts={posts} /></Suspense>;
}
