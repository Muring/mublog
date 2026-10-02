"use client";
import type { Activity } from "@/lib/ai-activity";
import type { AiTask } from "@/lib/ai-task-records";
import { AiBadge, number } from "./AiControls";
import { CHECK_RESULTS, TagList } from "./RecordFacts";
import manage from "./AiManagement.module.css";

type Evidence = Activity["evidence"][number];
const KINDS: Record<Evidence["kind"], string> = { user_statement: "사용자 발언", tool_result: "도구 결과", artifact: "산출물", comparison: "대조", session_record: "세션 기록" };
// 작업일이 어디서 왔는지만 쉬운 말로 적는다. 대조 과정을 적은 원문 메모는 감사용이라 마우스를 올리면 보이게 둔다
const BASIS = { user_confirmed: "사용자가 수행일로 확인·허용한 날짜", source_record: "원본 기록의 시각과 대조해 확인한 날짜", unknown: "근거 없음" } as const;
const kst = (at: string | null | undefined) => at ? new Date(Date.parse(at) + 9 * 3600_000).toISOString().slice(0, 16).replace("T", " ") : null;

/** 근거 id 가 activity 의 어느 항목을 뒷받침하는지 모은다. 무엇의 근거인지 모르면 '작업 근거'로 뭉뚱그리지 않는다 */
function evidenceUses(a: Activity) {
    const uses = new Map<string, Set<string>>();
    const add = (refs: string[] | undefined, label: string) => refs?.forEach(r => { if (!uses.has(r)) uses.set(r, new Set()); uses.get(r)!.add(label); });
    add(a.timing.evidenceRefs, "작업일");
    a.outcomes?.forEach(o => add(o.evidenceRefs, "결과"));
    a.verification?.checks.forEach(c => add(c.evidenceRefs, "검증"));
    a.effects?.forEach(e => add(e.evidenceRefs, "효과"));
    a.knowledgeDecisions?.forEach(d => { add(d.evidenceRefs, "KB 판단"); add(d.verification?.evidenceRefs, "KB 판단"); });
    a.handoffs?.forEach(h => h.events.forEach(e => add(e.evidenceRefs, "인계")));
    if (a.publicCase) { add(a.publicCase.evidenceRefs, "공개 사례"); if (a.publicCase.review) add([a.publicCase.review.evidenceRef], "공개 사례"); }
    return uses;
}

/**
 * 원본 기록과 근거. 근거는 '무엇의 근거인지'를 앞에 달고, 같은 문장은 한 번만 보여 준다.
 * 날짜만 보완된 기록의 근거(ID 날짜 사용 허용·ID 자체)는 작업 내용의 근거가 아니므로 작업일 줄에 붙여 둔다.
 * presentation.evidence 는 한글 설명을 어디서 대조해 썼는지의 출처라 '설명 출처'로 부른다(작업을 했다는 근거가 아니다).
 */
export default function SourceRecord({ task }: { task: AiTask }) {
    const a = task.activity, p = task.presentation;
    const uses = a ? evidenceUses(a) : new Map<string, Set<string>>();
    const dateOnly = (e: Evidence) => { const u = uses.get(e.id); return Boolean(u) && u!.size === 1 && u!.has("작업일"); };
    const timingEvidence = a?.evidence.filter(dateOnly) ?? [];
    // 날짜 근거의 원문 메모(사용자 발언 쪽 우선). 화면에는 쉬운 말만 쓰고 이 원문은 title 로만 둔다
    const timingNote = (timingEvidence.find(e => e.kind === "user_statement") ?? timingEvidence[0])?.note;
    const workEvidence = a?.evidence.filter(e => !dateOnly(e)) ?? [];
    const day = a ? a.timing.occurredOn ?? kst(a.timing.occurredAt) : kst(p?.occurredAt);
    const rework = task.rework === null ? "기록 없음" : task.rework === false || task.rework === 0 ? "없음" : task.rework === true ? "있음" : `${task.rework}회`;
    return <details className={manage.rawRecord}><summary>원본 기록과 근거</summary>
        <dl>
            <dt>작업일 · KST</dt><dd>{day ?? "확인되지 않음"}
                {a && a.timing.precision !== "unknown" && <small title={timingNote ?? undefined}>{BASIS[a.timing.basis]}</small>}
            </dd>
            <dt>내부 ID</dt><dd><code className={manage.factCode}>{task.id}</code></dd>
            <dt>연결 토큰</dt><dd>{task.totals.responses ? number(task.totals.total) : "연결 없음"}</dd>
            <dt>재작업</dt><dd>{rework}</dd>
            {task.verification.length > 0 && <><dt>원본 검사</dt><dd><TagList items={task.verification.map(v => ({ badge: <AiBadge data-tone={CHECK_RESULTS[v.result][1]}>{CHECK_RESULTS[v.result][0]}</AiBadge>, body: v.name }))} /></dd></>}
            {workEvidence.length > 0 && <><dt>작업 근거</dt><dd><ul className={manage.factList}>{workEvidence.map(e => {
                const used = [...(uses.get(e.id) ?? [])];
                return <li key={e.id}>{e.note ?? KINDS[e.kind]}<small>{used.length ? `${used.join("·")}의 근거` : "연결된 항목 없음"} · {KINDS[e.kind]} · <code className={manage.factCode}>{e.reference}</code></small></li>;
            })}</ul></dd></>}
            {!!p?.evidence.length && <><dt>설명 출처</dt><dd><ul className={manage.factList}>{[...new Set(p.evidence)].map(e => <li key={e}>{e}</li>)}</ul></dd></>}
        </dl>
    </details>;
}
