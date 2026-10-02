"use client";
import type { Activity, KnowledgeDecision } from "@/lib/ai-activity";
import { reviewHistory, type KnowledgeReview, type ReviewRow } from "@/lib/ai-knowledge-review";
import { AiBadge, type Tone } from "./AiControls";
import { Fact, TagList } from "./RecordFacts";
import manage from "./AiManagement.module.css";

const DECISIONS: Record<KnowledgeDecision["decision"], [string, Tone]> = { applied: ["적용", "ok"], reference_only: ["참고만", "neutral"], not_applicable: ["해당 없음", "neutral"], deferred: ["보류", "warn"], unknown: ["판단 미상", "neutral"] };
const CHECKS: Record<NonNullable<KnowledgeDecision["verification"]>["result"], [string, Tone]> = { pass: ["확인 통과", "ok"], fail: ["확인 실패", "danger"], not_run: ["확인 안 함", "warn"], unknown: ["확인 미상", "neutral"] };
/** KB knowledge-review 상태의 원래 뜻 그대로의 이름. 미상·연결 오류를 일치나 미적용으로 바꾸지 않는다 */
const REVIEW: Record<ReviewRow["state"], [string, Tone, string]> = {
    matched: ["이력 일치", "ok", "적용 판단과 KB 적용 이력이 함께 있습니다."],
    recorded: ["이력 기록됨", "ok", "확인된 적용을 이번 대조에서 KB 적용 이력으로 기록했습니다."],
    missing_application_record: ["이력 누락", "warn", "적용으로 판단·검증했지만 KB 적용 이력이 없습니다."],
    not_applied: ["미적용 확인", "neutral", "적용하지 않은 판단이고 적용 이력도 없습니다."],
    application_decision_conflict: ["판단·이력 충돌", "danger", "적용하지 않았다고 판단했는데 KB 적용 이력이 있습니다."],
    decision_unknown: ["판단 미상", "neutral", "판단이 미상이라 이력과 대조하지 않았습니다."],
    broken_search_link: ["검색 연결 오류", "danger", "연결한 검색이 이 작업·프로젝트·반환 문서와 맞지 않습니다."],
    search_unavailable: ["검색 기록 미확보", "neutral", "연결한 검색 기록을 찾지 못해 대조하지 못했습니다(미상)."],
    document_missing: ["문서 없음", "warn", "KB에 해당 문서가 없어 이력을 대조하지 못했습니다."],
    not_recordable_document: ["기록 대상 외", "neutral", "KB 적용 이력을 남기지 않는 문서라 누락으로 보지 않습니다."],
    task_conflict: ["작업 기록 충돌", "danger", "같은 작업의 기록이 서로 달라 대조하지 않았습니다."],
    uncollected: ["판단 미수집", "neutral", "이 작업에는 KB 판단 기록이 없어 대조할 대상이 없습니다."],
};
const kst = (at: string) => new Date(Date.parse(at) + 9 * 3600_000).toISOString().slice(0, 16).replace("T", " ");

const STATUS = { completed: ["대조 완료", "neutral"], failed: ["대조 실패", "warn"], unavailable: ["대조 불가", "warn"] } as const;
const SHOWN = 3;

/** 대조 시도 한 건. 그 시각에 관측한 상태 그대로이며 지금도 같다는 보증이 아니다 */
function Attempt({ review, sameSource }: { review: KnowledgeReview; sameSource: boolean }) {
    const [label, tone] = STATUS[review.status];
    return <li>
        <span className={manage.factTags}><AiBadge data-tone={tone}>{label}</AiBadge><AiBadge data-tone={sameSource ? "neutral" : "warn"}>{sameSource ? "지금 판단과 같은 원본" : "이전 원본의 대조"}</AiBadge></span>
        <small>{kst(review.reviewedAt)} KST 당시 관측{review.result?.recordingRequested && " · 적용 이력 기록 요청 실행"}</small>
        {review.result ? review.result.rows.length === 0 ? <small>대조할 판단이 없었습니다.</small>
            : <ul className={manage.checkList}>{review.result.rows.map((row, i) => {
                const [name, rowTone, meaning] = REVIEW[row.state];
                return <li key={i}><AiBadge data-tone={rowTone}>{name}</AiBadge><span>{row.document ? <code className={manage.factCode}>{row.document}</code> : "작업 전체"}<small>{meaning}{row.detail && ` · ${row.detail}`}</small></span></li>;
            })}</ul>
            : <small>{review.error} · 이력 일치 여부는 미상입니다.</small>}
    </li>;
}

/**
 * KB 검색 → 문서 선택 → 적용 판단 → 검증, 그리고 KB 적용 이력 대조 시도들.
 * 판단은 activity 그대로 두고, 대조는 task.knowledgeReviews 의 시도를 최신 순으로 모두 보여 준다(최신을 승자로 고르지 않는다).
 * 시도가 없으면 안내만 남긴다. 실패·대조 불가·이전 원본의 결과는 현재 일치나 미사용으로 읽히지 않게 그 사실을 함께 적는다.
 */
export default function KnowledgeDecisions({ activity: a, reviews, project, taskId }: { activity: Activity | undefined; reviews: KnowledgeReview[] | undefined; project: string; taskId: string }) {
    const decisions = a?.knowledgeDecisions;
    // 판단 없이 남은 예전 knowledge(applied) 항목은 판단 기록이 빠진 것으로 따로 알린다
    const undecided = (a?.knowledge ?? []).filter(k => k.usage === "applied" && !decisions?.some(d => d.document === k.document));
    const history = reviewHistory(reviews, a, project, taskId);
    if (decisions === undefined && !undecided.length && !history.length) return null;
    const hasApplied = decisions?.some(d => d.decision === "applied");
    return <Fact label="KB 판단">
        {decisions == null ? (decisions === null || !undecided.length) && <span className={manage.factEmpty}>{decisions === null ? "판단 기록 미상" : "판단 기록 미수집"}</span>
            : !decisions.length ? <span className={manage.factEmpty}>확인한 판단 대상 없음</span>
                : <TagList items={decisions.map(d => {
                    const [label, tone] = DECISIONS[d.decision];
                    return { badge: <AiBadge data-tone={tone}>{label}</AiBadge>, body: <>
                        <code className={manage.factCode}>{d.document}</code>
                        <small>{d.selection === "search" ? <span title={d.searchRefs.join(", ")}>KB 검색 {d.searchRefs.length}건에서 선택</span> : "직접 읽음"} · {d.reason}</small>
                        {d.plannedUse && <small>{d.decision === "applied" ? "적용한 곳" : "쓰려던 곳"} · {d.plannedUse}</small>}
                        <small>{d.verification ? <>검증 · {CHECKS[d.verification.result][0]} · {d.verification.method}{d.verification.note && ` · ${d.verification.note}`}</> : "검증 기록 없음"}</small>
                    </> };
                })} />}
        {undecided.length > 0 && <small className={decisions === undefined ? undefined : manage.factSub}>판단 기록 없이 적용으로만 남은 문서 · {undecided.map(k => k.document).join(", ")}</small>}
        {history.length === 0 ? hasApplied && <small className={manage.factSub}>KB 적용 이력 대조 결과가 아직 없습니다(knowledge-review 실행 전).</small>
            : <div className={manage.reviewHistory}>
                <small className={manage.reviewTitle}>KB 적용 이력 대조 {history.length}회 · 최신 순 · 각 결과는 그 시각의 관측입니다</small>
                <ul className={manage.reviewList}>{history.slice(0, SHOWN).map(({ review, sameSource }) => <Attempt key={review.id} review={review} sameSource={sameSource} />)}</ul>
                {history.length > SHOWN && <details><summary>이전 시도 {history.length - SHOWN}회</summary><ul className={manage.reviewList}>{history.slice(SHOWN).map(({ review, sameSource }) => <Attempt key={review.id} review={review} sameSource={sameSource} />)}</ul></details>}
            </div>}
    </Fact>;
}
