import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { getImagePage, parseImageQuery } from "@/lib/admin-images";
import { DEFAULT_IMAGE_QUERY } from "@/lib/admin-image-query";
import { IMAGE_LIST_FIELDS, imageQueryOf, readListState, toSearchParams } from "@/lib/admin-navigation";
import AdminImagesView from "@/components/admin/AdminImagesView";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function AdminImagesPage({ searchParams }: Props) {
    await requireAdmin();
    // 주소에 남긴 조건(새로고침·링크)으로 첫 목록을 받는다. API 와 같은 검사를 거치고, 어긋나면 기본 조건으로 연다
    const params = toSearchParams(await searchParams);
    let initialQuery = DEFAULT_IMAGE_QUERY;
    try { initialQuery = parseImageQuery(new URLSearchParams(imageQueryOf(readListState(params, IMAGE_LIST_FIELDS)))); } catch { /* 기본 조건 */ }
    const initialPage = await getImagePage(initialQuery);
    return <Suspense><AdminImagesView initialPage={initialPage} initialQuery={initialQuery} /></Suspense>;
}
