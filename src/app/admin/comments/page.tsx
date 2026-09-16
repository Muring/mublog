import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getCommentsForAdmin } from "@/lib/comments";
import { commentListUrl, safeAdminReturn } from "@/lib/admin-navigation";
import AdminCommentsView from "@/components/admin/AdminCommentsView";

export const dynamic = "force-dynamic";
type Props = { searchParams: Promise<{ post?: string; status?: string; page?: string; returnTo?: string }> };

export default async function AdminCommentsPage({ searchParams }: Props) {
    await requireAdmin();
    const params = await searchParams;
    const status = params.status === "live" || params.status === "deleted" ? params.status : "all";
    const requestedPage = Number(params.page ?? 1);
    const returnTo = safeAdminReturn(params.returnTo);
    const result = await getCommentsForAdmin({ slug: params.post, status, page: requestedPage });
    if (params.post && !result.post) notFound();
    const href = (patch: { post?: string; status?: string; page?: number } = {}) => commentListUrl({ post: params.post, status, page: result.page, returnTo, ...patch });
    if (requestedPage !== result.page) redirect(href());
    return <AdminCommentsView result={result} status={status} postSlug={params.post} returnTo={returnTo} />;
}
