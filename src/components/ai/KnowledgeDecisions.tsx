"use client";
import type { Activity, KnowledgeDecision } from "@/lib/ai-activity";
import { AiBadge, type Tone } from "./AiControls";
import { Fact, TagList } from "./RecordFacts";
import manage from "./AiManagement.module.css";

const DECISIONS: Record<KnowledgeDecision["decision"], [string, Tone]> = { applied: ["적용", "ok"], reference_only: ["참고만", "neutral"], not_applicable: ["해당 없음", "neutral"], deferred: ["보류", "warn"], unknown: ["판단 미상", "neutral"] };
const CHECKS: Record<NonNullable<KnowledgeDecision["verification"]>["result"], [string, Tone]> = { pass: ["확인 통과", "ok"], fail: ["확인 실패", "danger"], not_run: ["확인 안 함", "warn"], unknown: ["확인 미상", "neutral"] };

/**
 * KB 검색 → 문서 선택 → 적용 판단 → 검증. 기록된 판단만 보여 주고, 검색·선택만으로 적용이라 하지 않는다.
 * 실제 적용 이력(usage 기록)은 이 자료에 실려 오지 않으므로 여기서 대조했다고 말하지 않는다.
 */
export default function KnowledgeDecisions({ activity: a }: { activity: Activity }) {
    const decisions = a.knowledgeDecisions;
    // 판단 없이 남은 예전 knowledge(applied) 항목은 판단 기록이 빠진 것으로 따로 알린다
    const undecided = (a.knowledge ?? []).filter(k => k.usage === "applied" && !decisions?.some(d => d.document === k.document));
    if (decisions === undefined && !undecided.length) return null;
    return <Fact label="KB 판단">
        {decisions == null ? (decisions === null || !undecided.length) && <span className={manage.factEmpty}>{decisions === null ? "판단 기록 미상" : "판단 기록 미수집"}</span>
            : !decisions.length ? <span className={manage.factEmpty}>확인한 판단 대상 없음</span>
                : <TagList items={decisions.map(d => {
                    const [label, tone] = DECISIONS[d.decision];
                    const history = d.decision === "applied" ? "적용 이력은 KB knowledge-review로 대조" : d.decision === "unknown" ? "적용 여부 미정" : "실제 미적용 · 이력 대상 아님";
                    return { badge: <AiBadge data-tone={tone}>{label}</AiBadge>, body: <>
                        <code className={manage.factCode}>{d.document}</code>
                        <small>{d.selection === "search" ? <span title={d.searchRefs.join(", ")}>KB 검색 {d.searchRefs.length}건에서 선택</span> : "직접 읽음"} · {d.reason}</small>
                        {d.plannedUse && <small>{d.decision === "applied" ? "적용한 곳" : "쓰려던 곳"} · {d.plannedUse}</small>}
                        <small>{d.verification ? <>검증 · {CHECKS[d.verification.result][0]} · {d.verification.method}{d.verification.note && ` · ${d.verification.note}`}</> : "검증 기록 없음"} · {history}</small>
                    </> };
                })} />}
        {undecided.length > 0 && <small className={decisions === undefined ? undefined : manage.factSub}>판단 기록 없이 적용으로만 남은 문서 · {undecided.map(k => k.document).join(", ")}</small>}
    </Fact>;
}
