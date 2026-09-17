import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getCommentsForAdmin } from "@/lib/comments";
import { commentListUrl, safeAdminReturn } from "@/lib/admin-navigation";
import AdminCommentsView from "@/components/admin/AdminCommentsView";

export const dynamic = "force-dynamic";
type Props = { searchParams: Promise<{ post?: string; author?: string; status?: string; page?: string; returnTo?: string }> };
// profiles.id 는 uuid 컬럼이라 아무 문자열이나 넣으면 Postgres 가 500 으로 죽는다. 모양이 아니면 404 로 보낸다.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function AdminCommentsPage({ searchParams }: Props) {
    await requireAdmin();
    const params = await searchParams;
    const status = params.status === "live" || params.status === "deleted" ? params.status : "all";
    const requestedPage = Number(params.page ?? 1);
    const returnTo = safeAdminReturn(params.returnTo);
    if (params.author && !UUID.test(params.author)) notFound();
    const result = await getCommentsForAdmin({ slug: params.post, authorId: params.author, status, page: requestedPage });
    if ((params.post && !result.post) || (params.author && !result.author)) notFound();
    const href = (patch: { post?: string; status?: string; page?: number } = {}) => commentListUrl({ post: params.post, author: params.author, status, page: result.page, returnTo, ...patch });
    if (requestedPage !== result.page) redirect(href());
    return <AdminCommentsView result={result} status={status} postSlug={params.post} authorId={params.author} returnTo={returnTo} />;
}
