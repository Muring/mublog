"use client";

import Link from "next/link";
import { useState } from "react";
import { changeLabel, metricSummary, rankPosts, tagPerformance, topPostShare, weekdayAverages, type AnalyticsData } from "@/lib/admin-analytics";
import type { BucketKey } from "@/lib/admin-chart";
import { Pills } from "./VisitorChart.styled";
import PostStatusBadge from "./PostStatusBadge";
import AnalyticsHelp from "./AnalyticsHelp";
import AnalyticsChart from "./AnalyticsChart";
import styles from "./Analytics.module.css";

const number = (value: number | null, unit = "") => value === null ? "기록 없음" : `${value.toLocaleString("ko-KR", { maximumFractionDigits: 1 })}${unit}`;
export default function AnalyticsResults({ data, onBucketChange }: { data: AnalyticsData; onBucketChange: (bucket: BucketKey) => void }) {
    const { range, today, visits, views, visitsSince, viewsSince, posts } = data;
    const [sort, setSort] = useState<"views" | "growth" | "days">("views");
    const visitsSummary = metricSummary(visits, visitsSince, range, today);
    const viewsSummary = metricSummary(views, viewsSince, range, today);
    const canCompare = viewsSummary.previous !== null;
    const ranked = rankPosts(posts, sort === "growth" && !canCompare ? "views" : sort);
    const top = topPostShare(posts);
    const tags = tagPerformance(posts);
    const visitWeek = weekdayAverages(visits, visitsSince, range, today);
    const viewWeek = weekdayAverages(views, viewsSince, range, today);
    return <>
        <div className={styles.summary}>
            {([{ title: "기간 방문", unit: "명", summary: visitsSummary }, { title: "기간 조회", unit: "회", summary: viewsSummary }]).map(({ title, unit, summary }) => <section key={title} className={`${styles.panel} ${styles.summaryCard}`}>
                <div className={styles.summaryMain}><h3>{title}</h3><strong className={styles.value}>{number(summary.value, unit)}</strong></div>
                <div className={styles.summaryAside}>
                    <span>{summary.previous === null ? `직전 ${range.days}일 기록 부족 · 비교 불가` : <>직전 {range.days}일 대비 <strong>{changeLabel(summary.value, summary.previous, unit)}</strong></>}</span>
                    <span>오늘 {number(summary.today, unit)} · 집계 중</span>
                    {summary.partial && <span>선택 기간 일부만 기록됨</span>}
                </div>
            </section>)}
        </div>
        <section className={styles.panel}>
            <AnalyticsHelp title="방문·조회 추이" controls={<Pills role="group" aria-label="그래프 집계 단위">
                {([['daily', '일별'], ['weekly', '주별'], ['monthly', '월별']] as const).map(([bucket, label]) => <button key={bucket} type="button" aria-pressed={range.bucket === bucket} onClick={() => onBucketChange(bucket)}>{label}</button>)}
            </Pills>}><dl>
                <div><dt>집계 단위</dt><dd>일별은 하루, 주별은 월~일, 월별은 매월 1일~말일입니다.</dd></div>
                <div><dt>기간 경계</dt><dd>첫·마지막 주나 월은 선택 기간에 포함된 날짜만 합산합니다.</dd></div>
                <div><dt>방문 수</dt><dd>일별 방문 수의 합계입니다. 같은 사람이 다른 날 방문하면 각각 셉니다.</dd></div>
            </dl></AnalyticsHelp>
            <div className={styles.charts}>
                <AnalyticsChart title="방문" unit="명" points={visits} since={visitsSince} range={range} today={today} />
                <AnalyticsChart title="조회" unit="회" points={views} since={viewsSince} range={range} today={today} />
            </div>
        </section>
        <section className={styles.panel}>
            <AnalyticsHelp title="글별 성과" controls={<Pills role="group" aria-label="글별 성과 정렬">
                {([['views', '조회수순'], ['growth', '증가량순'], ['days', '조회 일수순']] as const).map(([key, label]) => <button key={key} type="button" disabled={key === "growth" && !canCompare} aria-pressed={(sort === "growth" && !canCompare ? "views" : sort) === key} onClick={() => setSort(key)}>{label}</button>)}
            </Pills>}><dl>
                <div><dt>조회수</dt><dd>선택 기간에 발생한 조회의 합계입니다.</dd></div>
                <div><dt>증감</dt><dd>선택 기간 합계 − 바로 앞 {range.days}일 합계<span className={styles.helpDetail}>비교 기간: {range.previousFrom} ~ {range.previousTo}</span></dd></div>
                <div><dt>조회 일수</dt><dd>조회가 한 번 이상 발생한 날짜 수입니다.</dd></div>
                <div><dt>집계 대상</dt><dd>현재 남아 있는 글입니다. 초안으로 전환한 글도 포함합니다.</dd></div>
            </dl></AnalyticsHelp>
            <p className={styles.note}>{top.share === null ? "비중을 계산할 조회가 없습니다." : `조회 상위 ${top.count}개 글이 전체 조회의 ${number(top.share, "%")}를 차지합니다.`} {!canCompare && `직전 ${range.days}일의 기록이 부족해 증감을 비교할 수 없습니다.`}</p>
            {canCompare && <p className={`${styles.note} ${styles.mobileComparison}`}>증감은 직전 {range.days}일 대비</p>}
            {ranked.length === 0 ? <p className={styles.empty}>{sort === "growth" && canCompare ? "조회가 증가한 글이 없습니다." : "선택 기간에 조회된 글이 없습니다."}</p> : <div className={styles.tableScroll}><table className={`${styles.table} ${styles.performanceTable}`} role="table">
                <caption className={styles.srOnly}>선택 기간 글별 성과 상위 10개 · 증감은 직전 {range.days}일 대비</caption>
                <thead role="rowgroup"><tr role="row"><th scope="col" role="columnheader">글</th><th scope="col" role="columnheader">조회수</th><th scope="col" role="columnheader">조회 일수</th></tr></thead>
                <tbody role="rowgroup">{ranked.map(post => <tr key={post.id} role="row">
                    <td role="cell" className={styles.postTitle}><div className={styles.postHeading}><Link href={`/admin/posts/${post.id}`}>{post.title}</Link><PostStatusBadge status={post.status} /></div></td>
                    <td role="cell"><span className={styles.mobileLabel}>조회수</span><strong>{number(post.views, "회")}</strong>{canCompare && <span className={styles.status}><span className={styles.comparisonLabel}>직전 {range.days}일 대비 </span>{changeLabel(post.views, post.previous, "회")}</span>}</td>
                    <td role="cell"><span className={styles.mobileLabel}>조회 일수</span>{post.activeDays}일</td>
                </tr>)}</tbody>
            </table></div>}

        </section>
        <div className={styles.secondary}>
            <section className={styles.panel}><AnalyticsHelp title="태그별 조회"><dl>
                <div><dt>태그 기준</dt><dd>글에 현재 붙어 있는 태그로 집계합니다.</dd></div>
                <div><dt>중복 집계</dt><dd>태그가 여러 개인 글은 각 태그에 조회수를 더합니다.</dd></div>
                <div><dt>비중</dt><dd>해당 태그 조회수 ÷ 전체 태그 조회수 합계 × 100</dd></div>
            </dl></AnalyticsHelp>
                {tags.length ? <ul className={styles.tags}>{tags.map(tag => <li key={tag.tag}><div className={styles.tagRow}><span>{tag.tag}</span><span>{number(tag.views, "회")} · {number(tag.share, "%")}</span></div><div className={styles.bar} aria-hidden><span style={{ width: `${tag.share}%` }} /></div></li>)}</ul> : <p className={styles.empty}>집계된 태그 조회가 없습니다.</p>}
            </section>
            <section className={styles.panel}><AnalyticsHelp title="요일별 하루 평균"><dl>
                <div><dt>평균</dt><dd>해당 요일의 합계 ÷ 집계한 날짜 수입니다. 괄호 안은 날짜 수입니다.</dd></div>
                <div><dt>집계 날짜</dt><dd>선택 기간에서 오늘과 기록 시작 전 날짜를 제외합니다. 방문·조회가 0인 날은 포함합니다.</dd></div>
                <div><dt>해석 주의</dt><dd>집계한 날짜가 적으면 요일별 경향을 판단하기 어렵습니다.</dd></div>
            </dl><p className={styles.helpFootnote}>기록 시작일<span className={styles.helpDetail}>방문: {visitsSince ?? "기록 없음"} · 조회: {viewsSince ?? "기록 없음"}</span></p></AnalyticsHelp><p className={styles.note}>오늘 제외 · 괄호는 집계한 날짜 수</p>
                <div className={styles.tableScroll}><table className={`${styles.table} ${styles.weekday}`}><caption className={styles.srOnly}>요일별 평균 방문과 조회</caption><thead><tr><th scope="col">요일</th><th scope="col">방문 평균</th><th scope="col">조회 평균</th></tr></thead><tbody>{visitWeek.map((row, i) => <tr key={row.label}><th scope="row">{row.label}</th><td>{number(row.average, "명")} <span className={styles.status}>({row.days}일)</span></td><td>{number(viewWeek[i].average, "회")} <span className={styles.status}>({viewWeek[i].days}일)</span></td></tr>)}</tbody></table></div>

            </section>
        </div>
    </>;
}
