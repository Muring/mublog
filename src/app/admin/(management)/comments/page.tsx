import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getCommentsForAdmin } from "@/lib/comments";
import { commentListState, commentListUrl, toSearchParams } from "@/lib/admin-navigation";
import AdminCommentsView from "@/components/admin/AdminCommentsView";
import { splitMulti } from "@/lib/multi-value";

export const dynamic = "force-dynamic";
type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };
// profiles.id 는 uuid 컬럼이라 아무 문자열이나 넣으면 Postgres 가 500 으로 죽는다. 모양이 아니면 404 로 보낸다.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function AdminCommentsPage({ searchParams }: Props) {
    await requireAdmin();
    const state = commentListState(toSearchParams(await searchParams));
    // ?post=a&post=b 처럼 여러 개를 고를 수 있다
    const authorIds = splitMulti(state.author);
    if (authorIds.some((id) => !UUID.test(id))) notFound();
    const { q, from, to, status, sort, page } = state;
    const result = await getCommentsForAdmin({ slugs: splitMulti(state.post), authorIds, q, from, to, status, sort, page });
    if (result.missing) notFound();
    if (page !== result.page) redirect(commentListUrl({ ...state, page: result.page }));
    return <AdminCommentsView result={result} state={state} />;
}
