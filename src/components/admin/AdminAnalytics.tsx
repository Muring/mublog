"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { analyticsDateError, analyticsDataKey, analyticsDataUrl, analyticsRange, analyticsRank, analyticsUrl, type AnalyticsData, type AnalyticsRange } from "@/lib/admin-analytics";
import { fetchJson } from "@/lib/fetcher";
import { replaceListUrl, safeAdminReturn } from "@/lib/admin-navigation";
import { Button } from "./Admin.styled";
import { AnalyticsRoot } from "./Analytics.styled";
import AnalyticsResults from "./AnalyticsResults";
import { Skeleton } from "@/components/ui/Skeleton.styled";
import AnalyticsSkeleton from "./AnalyticsSkeleton";
import { useAdminRefresh } from "./RefreshButton";

/** 기간 선택기는 데이터 로딩·실패와 무관하게 같은 DOM을 유지한다. */
export default function AdminAnalytics({ today }: { today: string }) {
    const params = useSearchParams();
    const range = analyticsRange(new URLSearchParams(params), today);
    const [dateError, setDateError] = useState<string | null>(null);
    const urlError = params.get("period") === "custom" ? analyticsDateError(params.get("from"), params.get("to"), today) : null;
    const fromInput = useRef<HTMLInputElement>(null);
    const toInput = useRef<HTMLInputElement>(null);
    // 필터 줄은 스크롤하면 헤더 밑에 붙는다(sticky). 붙어 있는 동안만 data-stuck 을 달아 바탕을 바꾼다 —
    // 붙는 자리(top 64px)보다 1px 위를 관찰 경계로 잡으면, 붙어 있는 동안만 그 줄의 윗변이 잘려 보인다
    const controls = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            for (const entry of entries) entry.target.toggleAttribute("data-stuck", entry.intersectionRatio < 1 && entry.boundingClientRect.top < 65);
        }, { rootMargin: "-65px 0px 0px 0px", threshold: 1 });
        if (controls.current) observer.observe(controls.current);
        return () => observer.disconnect();
    }, []);
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
    // 통계는 화면이 받아 온다. 머리줄 새로고침이 지금 기간의 집계를 다시 받게 한다
    const { refetch } = query;
    useAdminRefresh(useCallback(() => void refetch(), [refetch]), query.isFetching);
    const navigate = (next: AnalyticsRange) => {
        setDateError(null);
        const url = analyticsUrl(next, safeAdminReturn(params.get("returnTo")), analyticsRank(params.get("rank")));
        const selected = analyticsRange(new URL(url, window.location.origin).searchParams, today);
        if (fromInput.current) { fromInput.current.value = selected.from; fromInput.current.max = selected.to; }
        if (toInput.current) { toInput.current.value = selected.to; toInput.current.min = selected.from; }
        // 기간을 바꿔도 뒤로 가기 기록을 쌓지 않는다(다른 관리 목록과 같은 규칙)
        if (`${window.location.pathname}${window.location.search}` !== url) replaceListUrl(url);
    };
    /*
     * 날짜를 고르면 적용 버튼 없이 바로 그 기간을 조회한다. 키보드로 연·일을 칠 때는 칸마다 값이 바뀌어
     * (예: 일 "1" → "15") 중간 날짜마다 요청이 나가므로, 올바른 날짜가 잠깐(400ms) 그대로일 때만 조회한다.
     * Enter 는 기다리지 않고 바로 조회한다
     */
    const applyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => () => { if (applyTimer.current) clearTimeout(applyTimer.current); }, []);
    const applyDates = (delay: number) => {
        if (applyTimer.current) clearTimeout(applyTimer.current);
        const from = fromInput.current?.value ?? "", to = toInput.current?.value ?? "";
        if (fromInput.current) fromInput.current.max = to || today;
        if (toInput.current) toInput.current.min = from || "1970-01-01";
        const error = analyticsDateError(from, to, today);
        setDateError(error);
        if (error || (from === range.from && to === range.to)) return;
        applyTimer.current = setTimeout(() => navigate({ ...range, preset: "custom", from, to }), delay);
    };
    const submitDates = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); applyDates(0); };
    const displayedData = query.data && { ...query.data, range: { ...query.data.range, bucket: range.bucket } };
    const comparisonRange = query.isPlaceholderData && displayedData ? displayedData.range : range;
    return <AnalyticsRoot className="an-dashboard an-analyticsRoot">
        {/*
          * 한 장의 카드(제목 · 필터 · 비교 설명)를 위·가운데·아래 세 조각으로 나눠 그린다. 필터 줄이 카드 밖(결과 끝)까지 붙어 있으려면
          * sticky 요소의 부모가 결과까지 감싸는 상자여야 해서, section 은 display: contents 로 풀어 조각들을 바깥 flex 에 직접 올린다
          */}
        <section className="an-periodCard" aria-label="통계 기간">
            <div className="an-toolbar an-periodTop">
                <h3>조회 기간</h3>
                <span className="an-note" role="status">{range.from} ~ {range.to} · KST</span>
            </div>
            <div ref={controls} className="an-periodControls">
                <form className="an-dates" onSubmit={submitDates} onChange={() => applyDates(400)} noValidate>
                    <label>시작일<input ref={fromInput} name="from" type="date" required min="1970-01-01" max={range.to} aria-invalid={Boolean(dateError || urlError)} aria-describedby={dateError || urlError ? "analytics-date-error" : undefined} defaultValue={range.from} /></label>
                    <label>종료일<input ref={toInput} name="to" type="date" required min={range.from} max={today} aria-invalid={Boolean(dateError || urlError)} aria-describedby={dateError || urlError ? "analytics-date-error" : undefined} defaultValue={range.to} /></label>
                </form>
                <div className="an-shortcuts" role="group" aria-label="기간 빠른 조회">
                    <span>빠른 조회</span>
                    {[7, 30, 90].map(days => <Button key={days} type="button" onClick={() => navigate({ ...range, preset: String(days) })} aria-label={`최근 ${days}일`}>{days}일</Button>)}
                </div>
            </div>
            <div className="an-periodBottom">
                {(dateError || urlError) && <p id="analytics-date-error" className="an-note" role="alert">{dateError || urlError}</p>}
                {!urlError && <div className="an-comparison" aria-label="증감 비교 기준">
                    <span><strong>{query.isPlaceholderData ? "현재 표시 결과의 비교 대상" : "비교 대상"} · 선택 기간 바로 앞 {comparisonRange.days}일</strong> {comparisonRange.previousFrom} ~ {comparisonRange.previousTo}</span>
                    <span>모든 증감은 선택한 {comparisonRange.days}일 합계에서 위 기간의 합계를 뺀 값입니다.{comparisonRange.to === today && " 오늘은 집계 중입니다."}</span>
                </div>}
                <div className="an-refreshStatus" role="status">
                    {pending && displayedData && !urlError && <><Skeleton aria-hidden style={{ width: "100%", height: 3 }} /><span>조회 중 · 현재 표시는 {displayedData.range.from} ~ {displayedData.range.to} 결과</span></>}
                </div>
            </div>
        </section>
        <div className="an-dashboard an-periodResults" aria-busy={pending && !urlError} aria-label="통계 결과">
            {urlError ? null : query.isError ? <section className="an-panel" role="alert">
                <h3>통계를 불러오지 못했습니다.</h3><p className="an-note">{query.error.message}</p>
                <Button type="button" onClick={() => void query.refetch()}>다시 시도</Button>
            </section> : <>
                {displayedData ? <AnalyticsResults data={displayedData} onBucketChange={bucket => navigate({ ...range, bucket })} /> : <AnalyticsSkeleton />}
            </>}

        </div>
    </AnalyticsRoot>;
}
