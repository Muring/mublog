"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/fetcher";
import type { AdminAiData } from "@/lib/ai-usage-data";
import { publicYear, visibleWeeks, sumTotals, type UsageYear } from "@/lib/ai-usage";
import { Button } from "@/components/admin/Admin.styled";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton.styled";
import { number, UsageCards, WeekTable } from "./AiUsageView";
import AiFilterBar, { countOptions } from "./AiFilterBar";
import { AiBadge, AiScroll } from "./AiControls";
import Info from "./Info";
import TaskRecords, { taskStatus } from "./TaskRecords";
import { selectTaskPeriod } from "@/lib/ai-task-records";
import { splitMulti } from "@/lib/multi-value";
import styles from "./AiDashboard.module.css";
import manage from "./AiManagement.module.css";

function RefreshIcon() {
    return <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7v5h-5" /><path d="M4 17v-5h5" /><path d="M6.1 6.1A8 8 0 0 1 19.7 10M4.3 14A8 8 0 0 0 17.9 17.9" /></svg>;
}

const SKELETON_ROWS = Array.from({ length: 10 }, (_, i) => i);
/** 불러오는 동안 실제 카드·표·패널과 같은 상자를 깔아 둔다. 글자 자리는 막대로만 보인다 */
function LoadingBody({ tab }: { tab: string }) {
    const bar = (width: string) => <Skeleton style={{ display: "inline-block", width, maxWidth: "100%", height: ".8em", verticalAlign: "middle" }} />;
    if (tab === "quality") return <div className={`${styles.contentScroll} ${manage.records}`} role="status" aria-label="작업 기록을 불러오는 중"><div className={manage.loadingRows} aria-hidden="true">{SKELETON_ROWS.map(row => <div key={row} className={manage.loadingRecord}><SkeletonText>작업 제목과 결과를 불러오는 중입니다</SkeletonText><p>{bar("80%")}</p><span>{bar("8em")}{bar("5em")}{bar("3em")}</span></div>)}</div></div>;
    const columns = [["주", "6.5em", "center"], ["프로젝트", "8em"], ["도구", "3.5em", "center"], ["모델", "9em"], ["추론", "4em", "center"], ["캐시 제외 입력", "6em", "number"], ["출력", "5em", "number"], ["응답", "3em", "number"]];
    return <div className={manage.loadingUsage} role="status" aria-label="사용량을 불러오는 중">
        <div className={manage.summaryCards} aria-hidden="true"><div className={styles.grid}>{["전체 토큰", "캐시 제외 입력", "출력", "캐시 읽기 비율"].map(label => <div className={styles.card} key={label}><span className={styles.note}><SkeletonText>{label}</SkeletonText></span><strong><SkeletonText>3,238,083,469</SkeletonText></strong></div>)}</div></div>
        <div className={styles.tableScroll} aria-hidden="true"><table><thead><tr>{columns.map(([label]) => <th key={label}><SkeletonText>{label}</SkeletonText></th>)}</tr></thead>
            <tbody>{SKELETON_ROWS.map(row => <tr key={row}>{columns.map(([label, width, align]) => <td key={label} data-center={align === "center" || undefined} data-number={align === "number" || undefined}>{bar(width)}</td>)}</tr>)}</tbody></table></div>
    </div>;
}

/* 화면 글은 한국어로 맞춘다. 수집 자료의 열거값은 여기서 옮기고, 모델·도구 이름과 작업 ID 같은 고유 식별자만 원문으로 둔다 */
const projectLabel = (v: string) => v === "unmapped" ? "프로젝트 미분류" : v;
const EFFORTS: Record<string, string> = { none: "없음", minimal: "최소", low: "낮음", medium: "보통", high: "높음", xhigh: "매우 높음", max: "최대", unknown: "미상" };
const effortLabel = (v: string) => EFFORTS[v] ?? v;
const GROUP_FIELDS = [["project", "프로젝트"], ["tool", "도구"], ["model", "모델"], ["effort", "추론 수준"]] as const;
const NO_GROUP_FILTERS = { project: "", tool: "", model: "", effort: "" };
const NO_TASK_FILTERS = { project: "", type: "", status: "" };
export default function AdminAi({ asOf }: { asOf: string }) {
    const query = useQuery({ queryKey: ["admin-ai"], queryFn: () => fetchJson<AdminAiData>("/api/admin/ai"), staleTime: 60_000 });
    const [tab, setTab] = useState("usage"); const [year, setYear] = useState(""); const [period, setPeriod] = useState("8"); const [view, setView] = useState("groups");
    const [filters, setFilters] = useState(NO_GROUP_FILTERS);
    const [taskFilters, setTaskFilters] = useState(NO_TASK_FILTERS);
    const [q, setQ] = useState("");
    // 블로그 관리 목록처럼 최신이 위. 주 문자열(YYYY-MM-DD)은 사전순이 곧 날짜순이다
    const [sort, setSort] = useState<"newest" | "oldest">("newest");
    const byWeek = <T extends { week: string }>(rows: T[]) => [...rows].sort((a, b) => sort === "newest" ? b.week.localeCompare(a.week) : a.week.localeCompare(b.week));
    const data = query.data; const snapshot = data?.snapshots.find(s => String(s.year) === year) ?? data?.snapshots[0];
    const latestYear = String(data?.snapshots[0]?.year ?? "");
    const privateYear = snapshot?.data; const weeks = visibleWeeks(privateYear?.weeks ?? [], period, new Date(data?.checkedAt ?? asOf));
    const publicWeeks = privateYear ? visibleWeeks(publicYear(privateYear).weeks, period, new Date(data?.checkedAt ?? asOf)) : [];
    const groups = weeks.flatMap(w => w.groups.map(g => ({ ...g, week: w.week })));
    const needle = q.trim().toLowerCase();
    const matches = (...values: string[]) => !needle || values.some(v => v.toLowerCase().includes(needle));
    // 같은 조건 안에서는 고른 값 중 하나(또는), 조건끼리는 모두(그리고)
    const pass = <K extends string>(selected: Record<K, string>, row: { [P in K]: string }) => (Object.entries(selected) as [K, string][]).every(([k, v]) => !v || splitMulti(v).includes(row[k]));
    const filtered = groups.filter(g => pass<keyof typeof filters>(filters, g) && matches(g.tool, g.model, g.effort, effortLabel(g.effort)));
    const narrowed = Boolean(needle) || Object.values(filters).some(Boolean);
    // 조건이 걸리면 카드와 주별 표도 걸린 행만 다시 더한다. 표 구성은 보는 방식일 뿐 같은 조건을 따른다
    const shownWeeks = narrowed ? publicWeeks.map(w => ({ ...w, totals: sumTotals(filtered.filter(g => g.week === w.week).map(g => g.totals)), observed: filtered.some(g => g.week === w.week) })) : publicWeeks;
    const taskRow = (t: UsageYear["tasks"][number]) => ({ project: t.project, type: taskType(t), status: taskStatus(t)[0] });
    const tasks = (privateYear?.tasks ?? []).filter(t => pass(taskFilters, taskRow(t)) && matches(t.activity?.purpose ?? "", ...(t.activity?.actions ?? []), ...(t.activity?.aiRole?.contributions ?? []), ...(t.activity?.outcomes?.map(o => o.summary) ?? []), ...(t.activity?.knowledgeDecisions?.flatMap(d => [d.document, d.reason, d.plannedUse ?? ""]) ?? []), ...(t.activity?.handoffs?.flatMap(h => [h.request, ...h.events.flatMap(e => [e.summary, e.result?.summary ?? ""])]) ?? []), t.presentation?.title ?? "", t.presentation?.summary ?? "", ...t.verification.map(v => v.name), ...(t.presentation?.checks.flatMap(c => [c.title, c.method, c.reason ?? ""]) ?? []), ...(t.presentation?.followUps.flatMap(f => [f.title, f.note]) ?? []), ...(t.presentation?.knowledge.flatMap(k => [k.document, k.note]) ?? [])));
    const taskGroups = privateYear ? selectTaskPeriod(tasks, privateYear, period, sort, new Date(data?.checkedAt ?? asOf)) : { dated: [], undated: [], total: 0 };
    const allTasks = privateYear?.tasks ?? [];
    const yearField = { key: "year", label: "연도", options: (data?.snapshots ?? []).map(s => ({ value: String(s.year), label: `${s.year}년` })) };
    const received = snapshot ? `수신 ${new Date(snapshot.receivedAt).toLocaleString("ko-KR", { timeZone: "Asia/Seoul", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })}${data && Date.parse(data.checkedAt ?? asOf) - Date.parse(snapshot.receivedAt) > 48 * 3600_000 ? " · 갱신 지연" : ""}` : "아직 수신 없음";
    const count = tab === "quality" ? `작업 ${number(taskGroups.total)}건` : tab === "status" ? `${number(weeks.length)}주` : view === "weeks" ? `${number(shownWeeks.length)}주` : `${number(filtered.length)}행`;
    const resetFilters = () => { setQ(""); setYear(""); if (tab === "quality") setTaskFilters(NO_TASK_FILTERS); else setFilters(NO_GROUP_FILTERS); };
    return <section className={`${styles.workspace} ${manage.workspace}`} aria-label="AI 관리" data-ai-workspace>
        {/* 블로그 관리와 같은 밑줄 탭. 넓으면 제목과 한 줄, 좁으면 탭만 아래 줄을 꽉 채운다 */}
        <header className={manage.heading}><h1>AI 관리</h1>
            <div className={manage.tabs} role="tablist" aria-label="AI 관리 항목">{[["usage", "사용량"], ["quality", "작업 기록"], ["status", "수집 상태"]].map(([value, label]) => <button key={value} type="button" role="tab" aria-selected={tab === value} onClick={() => { setTab(value); setQ(""); }}>{label}</button>)}</div>
            <Button className={manage.refresh} onClick={() => query.refetch()} disabled={query.isFetching} aria-label={query.isFetching ? "새로고침 중" : "새로고침"} title="새로고침" aria-busy={query.isFetching}><RefreshIcon /></Button>
        </header>
        {query.isError && <p className={styles.warning} role="alert">{query.error.message} · 기존 데이터가 있으면 유지합니다.</p>}
        {(data || query.isPending) && <AiFilterBar key={tab} loading={!data} period={period} onPeriod={setPeriod} view={tab === "usage" ? { value: view, onChange: setView } : undefined}
            sort={sort} onSort={setSort} q={q} onSearch={setQ}
            searchPlaceholder={tab === "status" ? undefined : "내용 검색"}
            fields={tab === "status" ? [yearField] : tab === "quality" ? [yearField,
                { key: "project", label: "프로젝트", search: "프로젝트 검색", multiple: true, options: countOptions(allTasks.map(t => t.project), projectLabel) },
                { key: "type", label: "유형", multiple: true, options: countOptions(allTasks.map(taskType)) },
                { key: "status", label: "상태", multiple: true, options: countOptions(allTasks.map(t => taskStatus(t)[0])) },
            ] : [yearField, ...GROUP_FIELDS.map(([key, label]) => ({ key, label, multiple: true, search: key === "project" || key === "model" ? `${label} 검색` : undefined, options: countOptions(groups.map(g => g[key]), key === "project" ? projectLabel : key === "effort" ? effortLabel : undefined) }))]}
            values={{ year: year || latestYear, ...(tab === "quality" ? taskFilters : filters) }} defaults={{ year: latestYear }}
            onApply={({ year: nextYear, ...rest }) => { setYear(nextYear === latestYear ? "" : nextYear); if (tab === "quality") setTaskFilters({ ...NO_TASK_FILTERS, ...rest }); else setFilters({ ...NO_GROUP_FILTERS, ...rest }); }}
            onReset={resetFilters}
            summary={data ? <span className={manage.summaryLine}>{count} · {received}<Info label="집계 읽는 법">작업과 세션 연결이 아직 부족해 효율 비교는 보류합니다.{tab === "status" && " 이 탭은 연도·기간만 따르고, 다른 탭의 검색·필터와는 무관합니다."}{tab === "quality" && " 행을 누르면 상세가 펼쳐집니다. ‘기록명 기준’ 날짜와 날짜 미상 기록은 기간·날짜 정렬에서 빼고 표 아래에 둡니다."}</Info></span> : "불러오는 중"} />}
        {!data ? query.isPending ? <LoadingBody tab={tab} /> : <p role="status">데이터 연결을 확인해 주세요.</p> : <>
            {tab === "usage" ? <>
                <div className={manage.summaryCards}><UsageCards weeks={shownWeeks} cacheObserved={privateYear ? publicYear(privateYear).cacheObserved : false} /></div>
                {view === "weeks" ? <WeekTable weeks={byWeek(shownWeeks)} compact /> :
                    <AiScroll className={styles.tableScroll} tabIndex={0} aria-label="프로젝트별 집계 스크롤"><table><thead><tr>{["주", "프로젝트", "도구", "모델", "추론", "캐시 제외 입력", "출력", "응답"].map(x => <th key={x}>{x}</th>)}</tr></thead><tbody>{byWeek(filtered).map((g, i) => <tr key={i}><td data-center>{g.week}</td><td>{projectLabel(g.project)}</td><td data-center>{g.tool}</td><td>{g.model}</td><td data-center>{effortLabel(g.effort)}</td><td data-number>{number(g.totals.non_cache_read_input)}</td><td data-number>{number(g.totals.output)}</td><td data-number>{number(g.totals.responses)}</td></tr>)}</tbody></table>{!filtered.length && <p className={manage.empty}>선택 조건의 기록이 없습니다.</p>}</AiScroll>}
            </> : tab === "status" ? privateYear ? <AiScroll className={`${styles.contentScroll} ${manage.statusScroll}`} tabIndex={0} aria-label="수집 상태 스크롤"><Diagnostics year={privateYear} weeks={byWeek(weeks)} /></AiScroll> : <p>수집 데이터가 아직 없습니다.</p> : privateYear ? <TaskRecords dated={taskGroups.dated} undated={taskGroups.undated} allTasks={data?.snapshots.flatMap(s => s.data.tasks) ?? []} /> : <p>수집 데이터가 아직 없습니다.</p>}
        </>}
    </section>;
}
const observedTime = (value: string | null) => value ? new Date(Date.parse(value) + 9 * 3600_000).toISOString().slice(0, 16).replace("T", " ") + " KST" : "미상";
const TASK_TYPES: Record<string, string> = { feature: "기능", fix: "수정", bugfix: "수정", docs: "문서", documentation: "문서", refactor: "리팩터링", test: "테스트", tests: "테스트", chore: "관리", research: "조사", validation: "검증", verification: "검증", review: "검토", maintenance: "유지보수", design: "디자인" };
const taskType = (t: UsageYear["tasks"][number]) => t.type ? TASK_TYPES[t.type] ?? t.type : "미상";
const DIAGNOSTICS = ["큰 출력", "잘림", "반복 호출", "KB 검색", "KB 선택", "KB 적용", "미분류 토큰"];
const DIAGNOSTIC_HELP = [
    ["큰 출력 · 건", "8,000자를 넘는 도구 출력입니다. 조회 범위를 좁히거나 필요한 부분만 읽을 후보입니다."],
    ["잘림 · 건", "도구 출력에 잘림 표시가 발견된 횟수입니다. 확인에 필요한 내용이 빠졌는지 살펴봅니다."],
    ["반복 호출 · 건", "같은 세션에서 동일한 도구·입력으로 다시 호출한 횟수입니다. 재검사·대기 조회도 포함하므로 낭비로 단정하지 않습니다."],
    ["KB 검색·선택·적용 · 건", "지식 검색, 참고 문서 선택, 실제 활용이 각각 기록된 횟수입니다. 기록 방식이 달라 전환율이나 지식의 효과로 해석하지 않습니다."],
    ["미분류 토큰 · 토큰", "한 작업에 명확히 연결하지 못한 사용량입니다. 작업 기록과 세션 연결을 확인할 때 참고하며 실패나 낭비를 뜻하지 않습니다."],
];
const COLLECTION_PROBLEMS: Record<string, [string, string]> = {
    collection_attention: ["수집 확인 필요", "해당 기기의 수집 로그에서 경고를 확인하세요."],
    stale_device: ["기기 자료 갱신 지연", "기기가 켜져 있는지와 수집·동기화 실행 여부를 확인하세요."],
    no_successful_snapshot: ["정상 수집 기록 없음", "해당 기기에서 수집이 성공했는지 확인하세요."],
    incompatible_metrics: ["집계 버전 불일치", "기기별 수집기의 지표 버전을 확인하세요."],
    shard_integrity: ["자료 무결성 오류", "동기화된 집계 파일과 원본 자료를 확인하세요."],
    event_conflict: ["활동 기록 충돌", "여러 기기의 동일 활동 기록이 서로 다른지 확인하세요."],
    request_conflict: ["응답 기록 충돌", "동일 응답의 사용량 기록이 서로 다른지 확인하세요."],
};
const collectionLabel = (code: string) => COLLECTION_PROBLEMS[code]?.[0] ?? code;

function Diagnostics({ year, weeks }: { year: UsageYear; weeks: UsageYear["weeks"] }) {
    return <div className={manage.quality}>
        <section className={manage.qualityPanel} aria-labelledby="quality-diagnostics">
            <header><h3 id="quality-diagnostics">반복·잘림 살펴보기</h3><p className={styles.note}>큰 출력과 잘림이 많은 주는 조회 범위를, 반복 호출이 많은 주는 재확인 과정을 살펴보세요. 횟수만으로 낭비나 품질을 판단하지 않습니다.</p><p className={manage.scope}>선택 연도·기간의 주별 집계 · 작업 검색·필터와 무관 · 횟수는 건, 미분류 사용량은 토큰</p></header>
            <details className={manage.metricGuide}><summary>지표 뜻과 읽는 법</summary><dl>{DIAGNOSTIC_HELP.map(([label, help]) => <div key={label}><dt>{label}</dt><dd>{help}</dd></div>)}</dl></details>
            <AiScroll className={manage.qualityTable} tabIndex={0} aria-label="주별 진단 스크롤"><table className={manage.diagTable}><thead><tr><th>주</th>{DIAGNOSTICS.map(x => <th key={x}>{x}</th>)}</tr></thead><tbody>{weeks.map(w => <tr key={w.week}><td data-label="주" data-center>{w.week}{(!w.observed || w.partial || !w.ended) && <span className={manage.weekScope}>{!w.observed ? "미관측" : [w.partial && "부분 관측", !w.ended && "진행 중"].filter(Boolean).join(" · ")}</span>}</td>{[w.diagnostics.large_outputs, w.diagnostics.truncations, w.diagnostics.repeated_calls, w.diagnostics.kb_searches, w.diagnostics.kb_selections, w.diagnostics.kb_applications, w.states.unclassified?.total ?? 0].map((n, i) => <td data-number data-label={DIAGNOSTICS[i]} key={i}>{w.observed ? number(n) : "—"}</td>)}</tr>)}</tbody></table>{!weeks.length && <p className={manage.empty}>선택 기간의 주별 진단 기록이 없습니다.</p>}</AiScroll>
        </section>
        <section className={manage.qualityPanel} aria-labelledby="quality-devices">
            <header><h3 id="quality-devices" className={manage.titleWithInfo}>자료 누락 확인<Info label="수집 상태 읽는 법">관측 시작·종료는 수집 자료에 포함된 시각입니다. 그 사이 모든 기록이 수집됐다는 보장은 아닙니다. 식별 불확실은 응답 식별에 대체 값을 쓴 기록 수, 작업 충돌은 서로 다른 결과가 기록된 작업 수, 연결 모호는 여러 작업에 연결된 응답 수입니다.</Info></h3><p className={styles.note}>기기별 관측 종료가 기대한 시점까지 도달했는지 확인하세요. 보고된 문제가 없어도 자료가 완전하다는 뜻은 아닙니다.</p><p className={manage.scope}>{year.year}년 수집 자료 · 기간·작업 검색·필터와 무관</p></header>
            <p className={manage.collectionSummary}>식별 불확실 <strong>{number(year.quality.fallback_identities)}</strong> · 작업 충돌 <strong>{number(year.quality.task_conflicts)}</strong> · 연결 모호 <strong>{number(year.quality.ambiguous_task_responses)}</strong></p>
            <AiScroll className={manage.qualityTable} tabIndex={0} aria-label="기기별 자료 범위 스크롤"><table className={manage.deviceTable}><thead><tr><th>기기</th><th>관측 시작</th><th>관측 종료</th><th>수집 상태</th></tr></thead><tbody>{year.devices.map(d => {
                const problems = year.quality.problems.filter(p => p.device === d.device);
                return <tr key={d.device}><td data-label="기기">{d.device}</td><td data-label="관측 시작" data-center>{observedTime(d.since)}</td><td data-label="관측 종료" data-center>{observedTime(d.until)}</td><td data-label="수집 상태" data-meta data-center><span className={manage.badges}>{problems.length ? problems.map((p, i) => <AiBadge key={`${p.code}-${i}`} data-tone="warn">{collectionLabel(p.code)}</AiBadge>) : <AiBadge data-tone="neutral">보고된 문제 없음</AiBadge>}</span></td></tr>;
            })}</tbody></table>{!year.devices.length && <p className={manage.empty}>수집된 기기 자료가 없습니다.</p>}</AiScroll>
            {year.quality.problems.length > 0 && <ul className={manage.problemList} aria-label="수집 문제와 확인할 항목">{year.quality.problems.map((p, i) => <li key={i}><strong>{p.device ?? "전체 자료"} · {collectionLabel(p.code)}{p.count !== undefined ? ` (${number(p.count)}건)` : ""}</strong><span>{COLLECTION_PROBLEMS[p.code]?.[1] ?? "수집 로그에서 이 코드의 상세 내용을 확인하세요."}</span></li>)}</ul>}
        </section>
    </div>;
}
