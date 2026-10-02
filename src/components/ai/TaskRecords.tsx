"use client";
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { AiTask } from "@/lib/ai-task-records";
import { describedTitle, taskDate, taskTitle } from "@/lib/ai-task-records";
import { AiBadge, AiRecordTable, type Tone } from "./AiControls";
import { AdminListScroll } from "@/components/admin/Admin.styled";
import manage from "./AiManagement.module.css";

import { mergeHandoffs, type HandoffView } from "@/lib/ai-handoffs";
import HandoffTimeline from "./HandoffTimeline";
import SourceRecord from "./SourceRecord";
import ActivityDetails from "./ActivityDetails";
import KnowledgeDecisions from "./KnowledgeDecisions";
import { Checks, Fact, TagList } from "./RecordFacts";

const STATUS: Record<string, [string, Tone]> = { completed: ["완료", "ok"], done: ["완료", "ok"], partial: ["부분 완료", "warn"], cancelled: ["취소", "neutral"], canceled: ["취소", "neutral"], in_progress: ["진행 중", "neutral"], blocked: ["막힘", "warn"], failed: ["실패", "danger"], abandoned: ["중단", "warn"], stopped: ["중단", "warn"] };
export const taskStatus = (t: AiTask): [string, Tone] => t.conflict ? ["충돌", "warn"] : STATUS[t.status] ?? [t.status, "neutral"];
const taskKey = (t: AiTask) => `${t.project}/${t.id}`;
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
/**
 * 작업 기록 상자 안에서만 스크롤한다. scrollIntoView 는 고정해 둔 페이지까지 끌어올려 필터·탭이 화면 밖으로 밀린다.
 * 도착하면 onArrive 를 부른다(움직일 거리가 없거나 줄인 움직임이면 바로). scrollend 를 못 받는 브라우저를 위해 시간 안전망을 둔다.
 */
function scrollInList(el: HTMLElement | null, onArrive?: () => void) {
    const box = el?.closest<HTMLElement>("[data-record-scroll]");
    if (!el || !box) { onArrive?.(); return () => {}; }
    const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
    const top = Math.max(0, Math.min(box.scrollHeight - box.clientHeight, el.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop - margin));
    if (reducedMotion() || Math.abs(box.scrollTop - top) < 2) { box.scrollTop = top; onArrive?.(); return () => {}; }
    let done = false;
    const arrive = () => { if (done) return; done = true; box.removeEventListener("scrollend", arrive); window.clearTimeout(timer); onArrive?.(); };
    const timer = window.setTimeout(arrive, 1200);
    box.addEventListener("scrollend", arrive);
    box.scrollTo({ top, behavior: "smooth" });
    return () => { done = true; box.removeEventListener("scrollend", arrive); window.clearTimeout(timer); };
}
function Record({ task, handoffs, allTasks, onTask, initiallyOpen = false, focused = false, onFocused }: { task: AiTask; handoffs: HandoffView[]; allTasks: AiTask[]; onTask: (task: AiTask) => void; initiallyOpen?: boolean; focused?: boolean; onFocused?: () => void }) {
    const [open, setOpen] = useState(initiallyOpen);
    // 닫을 때는 접히는 움직임이 끝난 뒤에 상세를 내린다
    const [shown, setShown] = useState(initiallyOpen);
    // 펼침·접힘 때 제목이 가운데로 내려가거나 두 줄로 펼쳐지는 변화는 CSS 로 이어지지 않는다(줄 수·표시 방식이 바뀐다).
    // 바뀌기 직전 제목 상자를 재 두고, 바뀐 뒤 그 차이만큼에서 제자리로 움직이게 한다(FLIP)
    const titleRef = useRef<HTMLSpanElement>(null);
    const before = useRef<DOMRect | null>(null);
    const toggle = () => {
        before.current = titleRef.current?.getBoundingClientRect() ?? null;
        if (open) { setOpen(false); return; }
        setOpen(true); setShown(true);
    };
    useLayoutEffect(() => {
        const el = titleRef.current, from = before.current;
        before.current = null;
        if (!el || !from || reducedMotion()) return;
        const to = el.getBoundingClientRect();
        // 펼칠 때는 아래로만 움직인다. 새 자리가 더 위(dy>0)면 위로 튀어 보이니 옮기지 않고 아래로 펼쳐지는 것만 보인다
        const dy = open ? Math.min(0, from.top - to.top) : from.top - to.top, grow = to.height - from.height;
        const frames: Keyframe[] = [{ transform: `translateY(${dy}px)`, clipPath: grow > 0 ? `inset(0 0 ${grow}px 0)` : "inset(0)" }, { transform: "none", clipPath: "inset(0)" }];
        if (Math.abs(dy) > .5 || grow > .5) el.animate(frames, { duration: 220, easing: "ease" });
        // 접을 때 다시 나타나는 한 줄 요약은 옅게 들어온다
        if (!open) row.current?.querySelector("p")?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 180, easing: "ease" });
    }, [open]);
    useEffect(() => {
        if (open || !shown) return;
        const timer = window.setTimeout(() => setShown(false), reducedMotion() ? 0 : 220);
        return () => window.clearTimeout(timer);
    }, [open, shown]);
    const [flash, setFlash] = useState(false);
    const [arrived, setArrived] = useState(false);
    const row = useRef<HTMLTableRowElement>(null);
    // 인계 링크로 불려 오면 그 자리에서 펼친다(렌더 중에 한 번만 상태를 바꾼다)
    if (focused !== arrived) {
        setArrived(focused);
        if (focused) { setOpen(true); setShown(true); }
    }
    // 펼친 행까지 부드럽게 스크롤하고, 도착한 뒤에야 강조를 켠다. 이동 중에 강조가 다 사라지지 않게 한다
    useEffect(() => {
        if (!focused) return;
        row.current?.querySelector("button")?.focus({ preventScroll: true });
        // 요청은 도착한 뒤에 지운다. 먼저 지우면 이 효과가 정리되면서 도착 알림까지 취소된다
        // 행 상세가 펼쳐지는 움직임(220ms)이 끝나야 목록 높이가 다 잡힌다. 그 전에 재면 끝쪽 행은 덜 올라간 채 멈춘다
        let cancel = () => {};
        const timer = window.setTimeout(() => { cancel = scrollInList(row.current, () => { setFlash(true); onFocused?.(); }); }, reducedMotion() ? 0 : 240);
        return () => { window.clearTimeout(timer); cancel(); };
    }, [focused, onFocused]);
    useEffect(() => {
        if (!flash) return;
        const timer = window.setTimeout(() => setFlash(false), 2200);
        return () => window.clearTimeout(timer);
    }, [flash]);
    const p = task.presentation;
    // 보완 설명도 activity 도 없는 기록. 빈 절을 늘어놓지 않고 원본 검사만 보여 준다
    const bare = !p && !task.activity;
    const purpose = task.activity?.purpose;
    // 제목 아래 한 줄: 보완 설명 요약 → 없으면 첫 결과 → 한글 설명이 아예 없으면 그 사실. 모든 행이 같은 높이·같은 구조가 된다
    const firstOutcome = task.activity?.outcomes?.[0];
    const leadFromOutcome = !p?.summary && Boolean(firstOutcome);
    const rowSummary = p?.summary ?? firstOutcome?.summary ?? (describedTitle(task) ? undefined : "한글 설명 보완 전 기록 · 원본 검사만 있음");
    // 상세 맨 위에는 늘 그 요약 전체를 쓰고, 펼친 동안 행의 한 줄은 흐리게 감춘다(자리는 남아 행 높이가 그대로다).
    // 요약이 첫 결과에서 왔으면 '결과' 줄에서 그 문장을 빼서 같은 문장이 두 번 보이지 않게 한다
    const lead = rowSummary;
    const date = taskDate(task);
    const [label, tone] = taskStatus(task);
    const checks = task.activity?.verification?.checks ?? p?.checks ?? task.verification;
    const failures = checks.filter(c => c.result === "fail").length;
    const unverified = checks.filter(c => c.result === "not_run" || c.result === "unknown").length;
    const result: [string, Tone] = failures ? [`실패 ${failures}건`, "danger"] : unverified ? [`미확인 ${unverified}건`, "warn"] : checks.length ? ["검사 통과", "ok"] : ["검사 기록 없음", "neutral"];
    const uniqueId = useId();
    const id = `task-${uniqueId}`;
    return <><tr ref={row} data-open={open || undefined} data-flash={flash || undefined} onClick={() => { if (!window.getSelection()?.toString()) toggle(); }}>
        <td data-label="작업"><button className={manage.recordToggle} type="button" aria-expanded={open} aria-controls={open ? id : undefined} onClick={e => { e.stopPropagation(); toggle(); }}><svg className={manage.recordChevron} aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ transform: open ? "rotate(90deg)" : undefined }}><path d="m9 6 6 6-6 6" /></svg><span ref={titleRef} title={describedTitle(task) ? taskTitle(task) : `${taskTitle(task)} · ${task.id}`}>{taskTitle(task)}</span></button>{rowSummary && <p className={manage.recordSummary} aria-hidden={open || undefined} title={rowSummary}>{rowSummary}</p>}</td>
        <td data-label="프로젝트"><span className={manage.recordProject} title={task.project}>{task.project === "unmapped" ? "미분류" : task.project}</span></td>
        <td data-label="확인한 결과" data-center><AiBadge data-tone={result[1]}>{result[0]}</AiBadge>{failures > 0 && unverified > 0 && <span className={manage.dateBasis}>미확인 {unverified}건</span>}</td>
        <td data-label="작업일" data-center>{date ? <>{date.day}{date.basis === "name" && <span className={manage.dateBasis}>기록명 기준</span>}</> : "날짜 미상"}</td>
        <td data-label="상태" data-center><AiBadge data-tone={tone}>{label}</AiBadge></td>
    </tr>{shown && <tr className={manage.recordDetail} data-closing={!open || undefined}><td colSpan={5} id={id}>
        {/* 높이 0 에서 내용 높이로 펼쳐지고, 닫을 때는 거꾸로 접힌다(styles: .detailBody) */}
        <div className={manage.detailBody}><div><div className={manage.recordSections}>
            {/* 맨 위 한 줄로 무엇을 했는지, 그 아래 이름·값 줄로 세부. 근거와 원본은 맨 끝 한 곳에 접어 둔다 */}
            {lead && <p className={bare ? manage.recordReason : manage.recordLead}>{lead}{leadFromOutcome && firstOutcome?.artifact && <small><code className={manage.factCode}>{firstOutcome.artifact}</code></small>}</p>}
            {task.conflict && <p className={manage.recordReason}>같은 작업의 기록이 서로 달라 완료 상태를 확정할 수 없습니다.</p>}
            <dl className={manage.facts}>
                {task.activity && <ActivityDetails activity={task.activity} showPurpose={Boolean(purpose) && purpose !== lead && purpose !== taskTitle(task)} skipFirstOutcome={leadFromOutcome} reviews={task.knowledgeReviews} project={task.project} taskId={task.id} />}
                {!task.activity && !!task.knowledgeReviews?.length && <KnowledgeDecisions activity={undefined} reviews={task.knowledgeReviews} project={task.project} taskId={task.id} />}
                {bare && <Fact label="검증"><Checks checks={task.verification} /></Fact>}
                {p && !task.activity?.verification && <Fact label="검증"><Checks checks={p.checks.map(c => ({ name: c.title, result: c.result, detail: [c.method, c.result !== "pass" ? `${c.reason || "이유 기록 없음"}${c.result === "fail" ? " · 현재 해결 여부는 이 기록만으로 확정하지 않습니다." : ""}` : null] }))} /></Fact>}
                {p && task.activity?.followUps == null && <Fact label="남은 일"><TagList items={p.followUps.map(f => ({ badge: <AiBadge data-tone="neutral">{f.status === "delegated" ? "다른 세션에 전달" : f.status === "pending" ? "대기" : "진행 여부 미상"}</AiBadge>, body: <>{f.title}{f.note && <small>{f.note}</small>}</> }))} empty="기록된 남은 일 없음" /></Fact>}
                {!!p?.knowledge.length && task.activity?.knowledge == null && <Fact label="KB 근거"><TagList items={p.knowledge.map(k => ({ badge: <AiBadge data-tone="neutral">{k.usage === "applied" ? "적용 기록" : "참고 문서"}</AiBadge>, body: <><code className={manage.factCode}>{k.document}</code>{k.note && <small>{k.note}</small>}</> }))} /></Fact>}
                <HandoffTimeline task={task} handoffs={handoffs} allTasks={allTasks} onTask={onTask} />
            </dl>
            <SourceRecord task={task} />
        </div></div></div>
    </td></tr>}</>;
}
export default function TaskRecords({ dated, undated, allTasks }: { dated: AiTask[]; undated: AiTask[]; allTasks: AiTask[] }) {
    const handoffs = useMemo(() => mergeHandoffs(allTasks), [allTasks]);
    const [linked, setLinked] = useState<AiTask | null>(null);
    const [focus, setFocus] = useState<string | null>(null);
    const linkedRef = useRef<HTMLElement>(null);
    const rows = [...dated, ...undated];
    // 연결 작업이 지금 표에 있으면 그 행으로 가고, 조건에 걸러져 없을 때만 표 위 칸에 띄운다
    const openTask = (target: AiTask) => {
        if (rows.some(t => taskKey(t) === taskKey(target))) { setLinked(null); setFocus(taskKey(target)); }
        else setLinked(target);
    };
    const clearFocus = useMemo(() => () => setFocus(null), []);
    // 칸이 새로 열릴 때만 그리로 옮긴다. 다른 행을 펼치며 다시 그려질 때는 끌어올리지 않는다
    useEffect(() => {
        if (!linked) return;
        linkedRef.current?.focus({ preventScroll: true });
        return scrollInList(linkedRef.current);
    }, [linked]);
    return <><AdminListScroll className={manage.records} tabIndex={0} aria-label="작업 기록 스크롤" data-record-scroll>
        {linked && <section ref={linkedRef} className={manage.linkedTask} aria-label="연결 작업 상세" tabIndex={-1}><div><strong>연결 작업 · {linked.project}<small>지금 조건에 걸러진 작업이라 표 위에 따로 보여 줍니다</small></strong><button type="button" onClick={() => setLinked(null)}>닫기</button></div><AiRecordTable className={manage.recordTable}><tbody><Record key={taskKey(linked)} task={linked} handoffs={handoffs} allTasks={allTasks} onTask={openTask} initiallyOpen /></tbody></AiRecordTable></section>}
        {!rows.length ? <p className={manage.empty}>조건에 맞는 기록이 없습니다.</p> : <AiRecordTable className={manage.recordTable}><thead><tr><th>한 일</th><th>프로젝트</th><th>확인 결과</th><th>날짜 · KST</th><th>작업 상태</th></tr></thead><tbody>{rows.map(t => <Record key={taskKey(t)} task={t} handoffs={handoffs} allTasks={allTasks} onTask={openTask} focused={focus === taskKey(t)} onFocused={clearFocus} />)}</tbody></AiRecordTable>}
    </AdminListScroll></>;
}
