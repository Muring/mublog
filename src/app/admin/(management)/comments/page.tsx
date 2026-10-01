import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getCommentsForAdmin } from "@/lib/comments";
import { commentDates, commentListUrl, commentQuery, safeAdminReturn } from "@/lib/admin-navigation";
import AdminCommentsView from "@/components/admin/AdminCommentsView";
import { joinMulti } from "@/lib/multi-value";

export const dynamic = "force-dynamic";
type Props = { searchParams: Promise<{ post?: string | string[]; author?: string | string[]; q?: string; from?: string; to?: string; status?: string; sort?: string; page?: string; returnTo?: string }> };
// profiles.id 는 uuid 컬럼이라 아무 문자열이나 넣으면 Postgres 가 500 으로 죽는다. 모양이 아니면 404 로 보낸다.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function AdminCommentsPage({ searchParams }: Props) {
    await requireAdmin();
    const params = await searchParams;
    const status = params.status === "live" || params.status === "deleted" ? params.status : "all";
    const sort = params.sort === "oldest" ? "oldest" : "newest";
    const q = commentQuery(params.q) || undefined;
    const { from, to } = commentDates(params.from, params.to);
    const requestedPage = Number(params.page ?? 1);
    const returnTo = safeAdminReturn(params.returnTo);
    // ?post=a&post=b 처럼 여러 개를 고를 수 있다. 하나면 문자열, 여럿이면 배열로 온다
    const slugs = [...new Set([params.post ?? []].flat().filter(Boolean))];
    const authorIds = [...new Set([params.author ?? []].flat().filter(Boolean))];
    if (authorIds.some((id) => !UUID.test(id))) notFound();
    const result = await getCommentsForAdmin({ slugs, authorIds, q, from, to, status, sort, page: requestedPage });
    if (result.missing) notFound();
    const post = joinMulti(slugs) || undefined;
    const author = joinMulti(authorIds) || undefined;
    const href = (patch: { post?: string; status?: string; page?: number } = {}) => commentListUrl({ post, author, q, from, to, status, sort, page: result.page, returnTo, ...patch });
    if (requestedPage !== result.page) redirect(href());
    return <AdminCommentsView result={result} status={status} sort={sort} q={q} from={from} to={to} postSlug={post} authorId={author} returnTo={returnTo} />;
}
