"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchJson, jsonRequest } from "@/lib/fetcher";
import type { AdminAiData } from "@/lib/ai-usage-data";
import { publicYear, visibleWeeks, sumTotals, DEFAULT_AI_INTRO, type UsageYear } from "@/lib/ai-usage";
import { Button } from "@/components/admin/Admin.styled";
import Dropdown from "@/components/ui/Dropdown";
import { AiSegments, number, UsageCards, WeekTable } from "./AiUsageView";
import { AiScroll } from "./AiControls";
import ParagraphText from "./ParagraphText";
import AiIntroTitle from "./AiIntroTitle";
import styles from "./AiDashboard.module.css";
import manage from "./AiManagement.module.css";

function ControlIcon({ kind }: { kind: "refresh" | "filter" }) {
    return <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{kind === "refresh" ? <><path d="M20 7v5h-5" /><path d="M4 17v-5h5" /><path d="M6.1 6.1A8 8 0 0 1 19.7 10M4.3 14A8 8 0 0 0 17.9 17.9" /></> : <><path d="M4 7h16M4 17h16" /><circle cx="9" cy="7" r="2" fill="var(--cardbackground)" /><circle cx="15" cy="17" r="2" fill="var(--cardbackground)" /></>}</svg>;
}

const blank = () => ({ id: undefined as string | undefined, kind: "improvement", title: "", body: "", date: new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" }), postId: null as string | null, published: false });
function Editor({ data }: { data: AdminAiData }) {
    const client = useQueryClient();
    const [form, setForm] = useState(blank);
    const [preview, setPreview] = useState(false);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState("");
    async function save(event: FormEvent, published: boolean) {
        event.preventDefault(); if (busy) return;
        setBusy(true); setMessage("");
        try { const result = await fetchJson<{ id: string }>("/api/admin/ai/content", jsonRequest("POST", { ...form, published })); setForm(f => ({ ...f, id: result.id, published })); await client.invalidateQueries({ queryKey: ["admin-ai"] }); setMessage(published ? "공개했습니다." : "비공개로 저장했습니다."); }
        catch (e) { setMessage(e instanceof Error ? e.message : "저장 실패"); }
        finally { setBusy(false); }
    }
    return <AiScroll className={`${styles.contentScroll} ${manage.editor}`}>
        <div className={styles.toolbar}><Dropdown floating label="편집할 항목" value={form.id ?? "new"} options={[{ value: "new", label: "새 개선 기록" }, ...data.entries.map(e => ({ value: e.id, label: `${e.published ? "공개" : "비공개"} · ${e.title}` }))]} onChange={id => { const entry = data.entries.find(e => e.id === id); setForm(entry ? { id: entry.id, kind: entry.kind, title: entry.title, body: entry.body, date: entry.date, postId: entry.postId, published: entry.published } : blank()); setMessage(""); }} /><Button onClick={() => { const entry = data.entries.find(e => e.kind === "intro"); setForm(entry ? { id: entry.id, kind: entry.kind, title: entry.title, body: entry.body, date: entry.date, postId: entry.postId, published: entry.published } : { ...blank(), id: "intro", kind: "intro", ...DEFAULT_AI_INTRO }); }}>소개 편집</Button></div>
        <form className={`${styles.form} ${manage.editorForm}`} onSubmit={e => save(e, false)}>
            <p className={`${styles.note} ${manage.formNote}`}>{form.kind === "intro" ? "공개 페이지 상단 소개" : "개선 기록"} · 효과를 단정하기보다 변경·관찰·미확인 범위를 함께 작성하세요.</p>
            <label className={manage.titleField}>제목<input required maxLength={100} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></label>
            <label className={manage.dateField}>날짜<input required type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></label>
            <label className={manage.bodyField}>내용<textarea required maxLength={8000} value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} /></label>
            <Dropdown floating className={manage.postField} label="관련 발행 글" value={form.postId ?? ""} options={[{ value: "", label: "관련 글 없음" }, ...data.posts.map(p => ({ value: p.id, label: p.title }))]} onChange={id => setForm({ ...form, postId: id || null })} searchable="글 제목 검색" />
            <div className={`${styles.toolbar} ${manage.formActions}`}><Button type="button" onClick={() => setPreview(!preview)} aria-expanded={preview}>미리보기</Button><Button disabled={busy} type="submit">{busy ? "저장 중…" : "비공개로 저장"}</Button><Button disabled={busy || !form.title.trim() || !form.body.trim()} type="button" onClick={e => save(e, true)}>검토 완료 · 공개</Button></div>
            <p className={`${styles.status} ${manage.formStatus}`} role="status">{message}</p>
        </form>
        {preview && <article className={styles.card}><span className={styles.note}>{form.date} · 미리보기</span><h2>{form.kind === "intro" ? <AiIntroTitle title={form.title} /> : form.title}</h2><p className={styles.prose}><ParagraphText>{form.body}</ParagraphText></p>{form.postId && <p>{data.posts.find(p => p.id === form.postId)?.title}</p>}</article>}
        <details className={styles.section}><summary>내부 개선 기록 참고</summary><p className={styles.note}>이 내용은 자동으로 공개되지 않습니다.</p>{data.snapshots[0]?.data.improvements.map((e, i) => <p key={i}>{e.date} · {e.kind} · {e.summary}</p>)}</details>
    </AiScroll>;
}
export default function AdminAi({ asOf }: { asOf: string }) {
    const query = useQuery({ queryKey: ["admin-ai"], queryFn: () => fetchJson<AdminAiData>("/api/admin/ai"), staleTime: 60_000 });
    const [tab, setTab] = useState("usage"); const [year, setYear] = useState(""); const [period, setPeriod] = useState("8"); const [view, setView] = useState("groups");
    const [filters, setFilters] = useState({ project: "", tool: "", model: "", effort: "" });
    const data = query.data; const snapshot = data?.snapshots.find(s => String(s.year) === year) ?? data?.snapshots[0];
    const privateYear = snapshot?.data; const weeks = visibleWeeks(privateYear?.weeks ?? [], period, new Date(data?.checkedAt ?? asOf));
    const publicWeeks = privateYear ? visibleWeeks(publicYear(privateYear).weeks, period, new Date(data?.checkedAt ?? asOf)) : [];
    const groups = weeks.flatMap(w => w.groups.map(g => ({ ...g, week: w.week })));
    const filtered = groups.filter(g => Object.entries(filters).every(([k, v]) => !v || g[k as keyof typeof filters] === v));
    const tasks = privateYear?.tasks ?? [];
    const cardWeeks = view === "groups" ? publicWeeks.map(w => ({ ...w, totals: sumTotals(filtered.filter(g => g.week === w.week).map(g => g.totals)), observed: filtered.some(g => g.week === w.week) })) : publicWeeks;
    return <section className={`${styles.workspace} ${manage.workspace}`} aria-label="AI 현황" data-ai-workspace>
        <header className={manage.heading}><h1>AI 현황</h1><Link className={`${styles.link} ${manage.publicLink}`} href="/ai">공개 화면 ↗</Link>
        <div className={manage.navigation}><AiSegments aria-label="AI 현황 항목">{[["usage", "사용량"], ["quality", "작업·품질"], ["content", "공개 콘텐츠"]].map(([value, label]) => <button key={value} aria-pressed={tab === value} onClick={() => setTab(value)}>{label}</button>)}</AiSegments><Button className={manage.refresh} onClick={() => query.refetch()} disabled={query.isFetching} aria-label={query.isFetching ? "새로고침 중" : "새로고침"} title="새로고침" aria-busy={query.isFetching}><ControlIcon kind="refresh" /></Button></div></header>
        {query.isError && <p className={styles.warning} role="alert">{query.error.message} · 기존 데이터가 있으면 유지합니다.</p>}
        {!data ? <p role="status">{query.isPending ? "AI 데이터를 불러오는 중…" : "데이터 연결을 확인해 주세요."}</p> : tab === "content" ? <Editor data={data} /> : <>
            <div className={manage.controls}>
            <div className={manage.range}><Dropdown floating label="조회 연도" value={String(snapshot?.year ?? "")} options={data.snapshots.map(s => ({ value: String(s.year), label: `${s.year}년` }))} onChange={setYear} /><Dropdown floating label="조회 기간" value={period} options={[{ value: "4", label: "4주" }, { value: "8", label: "8주" }, { value: "12", label: "12주" }, { value: "year", label: "연도 전체" }]} onChange={setPeriod} />{tab === "usage" && <Dropdown floating label="표 구성" value={view} options={[{ value: "groups", label: "프로젝트·모델별" }, { value: "weeks", label: "주별" }]} onChange={setView} />}</div>
            {tab === "usage" && view === "groups" && <details className={manage.disclosure} name="ai-options"><summary className={manage.filterSummary}><ControlIcon kind="filter" />필터 · {Object.values(filters).filter(Boolean).length ? `${Object.values(filters).filter(Boolean).length}개 적용` : "전체"}</summary><AiScroll className={`${manage.panel} ${manage.filters}`}>{(["project", "tool", "model", "effort"] as const).map((key, i) => <Dropdown floating key={key} label={["프로젝트", "도구", "모델", "추론 수준"][i]} value={filters[key]} options={[{ value: "", label: `${["프로젝트", "도구", "모델", "추론 수준"][i]} 전체` }, ...Array.from(new Set(groups.map(g => g[key]))).sort().map(v => ({ value: v, label: v }))]} onChange={v => setFilters({ ...filters, [key]: v })} />)}<Button onClick={() => setFilters({ project: "", tool: "", model: "", effort: "" })}>필터 초기화</Button></AiScroll></details>}
            </div>
            {tab === "usage" && <div className={manage.summaryCards}><UsageCards weeks={cardWeeks} cacheObserved={privateYear ? publicYear(privateYear).cacheObserved : false} /></div>}
            <p className={`${styles.note} ${manage.collectionStatus}`}>수신: {snapshot ? new Date(snapshot.receivedAt).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }) : "아직 없음"}{snapshot && Date.parse(data.checkedAt ?? asOf) - Date.parse(snapshot.receivedAt) > 48 * 3600_000 ? " · 갱신 지연" : ""}. 작업 연결이 부족하므로 효율 비교는 보류합니다.</p>
            {tab === "usage" ? <>
                {view === "weeks" ? <WeekTable weeks={publicWeeks} compact /> : <>

                    <AiScroll className={styles.tableScroll} tabIndex={0} aria-label="프로젝트별 집계 스크롤"><table><thead><tr>{["주", "프로젝트", "도구", "모델", "추론", "캐시 제외 입력", "출력", "응답"].map(x => <th key={x}>{x}</th>)}</tr></thead><tbody>{filtered.map((g, i) => <tr key={i}><td>{g.week}</td><td>{g.project}</td><td>{g.tool}</td><td>{g.model}</td><td>{g.effort}</td><td data-number>{number(g.totals.non_cache_read_input)}</td><td data-number>{number(g.totals.output)}</td><td data-number>{number(g.totals.responses)}</td></tr>)}</tbody></table>{!filtered.length && <p>선택 조건의 기록이 없습니다.</p>}</AiScroll>
                </>}
            </> : privateYear ? <Quality year={privateYear} weeks={weeks} tasks={tasks} /> : <p>수집 데이터가 아직 없습니다.</p>}
        </>}
    </section>;
}
const observedTime = (value: string | null) => value ? new Date(value).toLocaleString("ko-KR", { timeZone: "Asia/Seoul", dateStyle: "short", timeStyle: "short" }) + " KST" : "미상";
function Quality({ year, weeks, tasks }: { year: UsageYear; weeks: UsageYear["weeks"]; tasks: UsageYear["tasks"] }) {
    return <AiScroll className={`${styles.tableScroll} ${manage.quality}`} tabIndex={0} aria-label="작업과 수집 품질 스크롤">
        <table><caption>기기별 자료 범위 · 건강 상태</caption><thead><tr><th>기기</th><th>관측 시작</th><th>관측 종료</th><th>확인할 사항</th></tr></thead><tbody>{year.devices.map(d => <tr key={d.device}><td data-label="기기">{d.device}</td><td data-label="관측 시작">{observedTime(d.since)}</td><td data-label="관측 종료">{observedTime(d.until)}</td><td data-label="확인할 사항">{year.quality.problems.filter(p => p.device === d.device).map(p => p.code).join(", ") || "보고된 문제 없음"}</td></tr>)}</tbody></table>
        <p className={styles.note}>식별 불확실 {year.quality.fallback_identities} · 작업 충돌 {year.quality.task_conflicts} · 연결 모호 {year.quality.ambiguous_task_responses}. 미기록은 실패나 성공으로 추정하지 않습니다.</p>
        <table><caption>선택 기간의 진단 · 반복 호출은 낭비의 확정치가 아닙니다</caption><thead><tr>{["주", "큰 출력", "잘림", "반복 호출", "KB 검색", "KB 선택", "KB 적용", "미분류 토큰"].map(x => <th key={x}>{x}</th>)}</tr></thead><tbody>{weeks.map(w => <tr key={w.week}><td data-label="주">{w.week}</td>{[w.diagnostics.large_outputs, w.diagnostics.truncations, w.diagnostics.repeated_calls, w.diagnostics.kb_searches, w.diagnostics.kb_selections, w.diagnostics.kb_applications, w.states.unclassified?.total ?? 0].map((n, i) => <td data-number data-label={["큰 출력", "잘림", "반복 호출", "KB 검색", "KB 선택", "KB 적용", "미분류 토큰"][i]} key={i}>{number(n)}</td>)}</tr>)}</tbody></table>
        <table><caption>기록된 작업 · 연결된 토큰만 선택 연도의 합계에 포함, 연결 시각이 없는 작업 목록은 전체 기록</caption><thead><tr>{["프로젝트 / 작업", "유형", "상태", "검증", "재작업", "연결 토큰"].map(x => <th key={x}>{x}</th>)}</tr></thead><tbody>{tasks.map(t => <tr key={t.project + "/" + t.id}><td data-label="프로젝트 / 작업">{t.project} / {t.id}</td><td data-label="유형">{t.type ?? "미상"}</td><td data-label="상태">{t.conflict ? "충돌" : t.status}</td><td data-label="검증">{t.verification.map(v => `${v.name}: ${v.result}`).join(" · ") || "미상"}</td><td data-label="재작업">{t.rework === null ? "미상" : String(t.rework)}</td><td data-number data-label="연결 토큰">{t.totals.responses ? number(t.totals.total) : "연결 없음"}</td></tr>)}</tbody></table>
    </AiScroll>;
}
