"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { analyticsDateError, analyticsDataKey, analyticsDataUrl, analyticsRange, analyticsUrl, type AnalyticsData, type AnalyticsRange } from "@/lib/admin-analytics";
import { fetchJson } from "@/lib/fetcher";
import { safeAdminReturn } from "@/lib/admin-navigation";
import { Button } from "./Admin.styled";
import AnalyticsResults from "./AnalyticsResults";
import { Skeleton } from "@/components/ui/Skeleton.styled";
import AnalyticsSkeleton from "./AnalyticsSkeleton";
import styles from "./Analytics.module.css";

/** 기간 선택기는 데이터 로딩·실패와 무관하게 같은 DOM을 유지한다. */
export default function AdminAnalytics({ today }: { today: string }) {
    const params = useSearchParams();
    const range = analyticsRange(new URLSearchParams(params), today);
    const [dateError, setDateError] = useState<string | null>(null);
    const urlError = params.get("period") === "custom" ? analyticsDateError(params.get("from"), params.get("to"), today) : null;
    const fromInput = useRef<HTMLInputElement>(null);
    const toInput = useRef<HTMLInputElement>(null);
    useEffect(() => {
        if (fromInput.current) { fromInput.current.value = range.from; fromInput.current.max = range.to; }
        if (toInput.current) { toInput.current.value = range.to; toInput.current.min = range.from; }
    }, [range.from, range.to]);

    const query = useQuery({
        // 단위와 정렬은 표시 방식이다. 요청·캐시 키에 넣으면 같은 데이터를 다시 기다리게 된다.
        queryKey: analyticsDataKey(range, today),
        queryFn: ({ signal }) => fetchJson<AnalyticsData>(analyticsDataUrl(range), { signal, cache: "no-store" }),
        retry: false,
        enabled: !urlError,
        placeholderData: keepPreviousData,
    });
    const pending = query.isPending || query.isFetching;
    const navigate = (next: AnalyticsRange) => {
        setDateError(null);
        const url = analyticsUrl(next, safeAdminReturn(params.get("returnTo")));
        const selected = analyticsRange(new URL(url, window.location.origin).searchParams, today);
        if (fromInput.current) { fromInput.current.value = selected.from; fromInput.current.max = selected.to; }
        if (toInput.current) { toInput.current.value = selected.to; toInput.current.min = selected.from; }
        if (`${window.location.pathname}${window.location.search}` !== url) window.history.pushState(null, "", url);
    };
    const submitDates = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const fields = new FormData(event.currentTarget);
        const from = String(fields.get("from")), to = String(fields.get("to"));
        const error = analyticsDateError(from, to, today);
        setDateError(error);
        if (error) { toInput.current?.focus(); return; }
        navigate({ ...range, preset: "custom", from, to });
    };
    const updateDates = () => {
        const from = fromInput.current?.value ?? "", to = toInput.current?.value ?? "";
        if (fromInput.current) fromInput.current.max = to || today;
        if (toInput.current) toInput.current.min = from || "1970-01-01";
        setDateError(analyticsDateError(from, to, today));
    };
    const displayedData = query.data && { ...query.data, range: { ...query.data.range, bucket: range.bucket } };
    const comparisonRange = query.isPlaceholderData && displayedData ? displayedData.range : range;
    return <div className={`${styles.dashboard} ${styles.analyticsRoot}`}>
        <section className={styles.panel} aria-label="통계 기간">
            <div className={styles.toolbar}>
                <h3>조회 기간</h3>
                <span className={styles.note} role="status">{range.from} ~ {range.to} · KST</span>
            </div>
            <div className={styles.periodControls}>
                <form className={styles.dates} onSubmit={submitDates} onChange={updateDates} noValidate>
                    <label>시작일<input ref={fromInput} name="from" type="date" required min="1970-01-01" max={range.to} aria-invalid={Boolean(dateError || urlError)} aria-describedby={dateError || urlError ? "analytics-date-error" : undefined} defaultValue={range.from} /></label>
                    <label>종료일<input ref={toInput} name="to" type="date" required min={range.from} max={today} aria-invalid={Boolean(dateError || urlError)} aria-describedby={dateError || urlError ? "analytics-date-error" : undefined} defaultValue={range.to} /></label>
                    <Button type="submit">기간 적용</Button>
                </form>
                <div className={styles.shortcuts} role="group" aria-label="기간 빠른 조회">
                    <span>빠른 조회</span>
                    {[7, 30, 90].map(days => <Button key={days} type="button" onClick={() => navigate({ ...range, preset: String(days) })}>최근 {days}일</Button>)}
                </div>
            </div>
            {(dateError || urlError) && <p id="analytics-date-error" className={styles.note} role="alert">{dateError || urlError}</p>}
            {!urlError && <div className={styles.comparison} aria-label="증감 비교 기준">
                <span><strong>{query.isPlaceholderData ? "현재 표시 결과의 비교 대상" : "비교 대상"} · 선택 기간 바로 앞 {comparisonRange.days}일</strong> {comparisonRange.previousFrom} ~ {comparisonRange.previousTo}</span>
                <span>모든 증감은 선택한 {comparisonRange.days}일 합계에서 위 기간의 합계를 뺀 값입니다.{comparisonRange.to === today && " 오늘은 집계 중입니다."}</span>
            </div>}
            <div className={styles.refreshStatus} role="status">
                {pending && displayedData && !urlError && <><Skeleton aria-hidden style={{ width: "100%", height: 3 }} /><span>조회 중 · 현재 표시는 {displayedData.range.from} ~ {displayedData.range.to} 결과</span></>}
            </div>
        </section>
        <div className={styles.dashboard} aria-busy={pending && !urlError} aria-label="통계 결과">
            {urlError ? null : query.isError ? <section className={styles.panel} role="alert">
                <h3>통계를 불러오지 못했습니다.</h3><p className={styles.note}>{query.error.message}</p>
                <Button type="button" onClick={() => void query.refetch()}>다시 시도</Button>
            </section> : <>
                {displayedData ? <AnalyticsResults data={displayedData} onBucketChange={bucket => navigate({ ...range, bucket })} /> : <AnalyticsSkeleton />}
            </>}

        </div>
    </div>;
}
