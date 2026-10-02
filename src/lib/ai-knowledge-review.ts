import { z } from "zod";
import { evidenceSchema, knowledgeDecisionIssues, knowledgeDecisionsSchema, legacyKnowledgeSchema, type Activity } from "./ai-activity";

/*
 * KB knowledge-review 대조 이력의 private 수신 계약.
 * 원본: dev-bootstrap skills/usage-report/references/knowledge-reviews.md(kb-review-delivery-20261002),
 * 상태 의미: MuRing-KB contracts/README.md 와 scripts/kb_knowledge.py review().
 * task.knowledgeReviews 는 시도별 불변 이력이다. 최신 시도를 승자로 고르거나 시도끼리 합치지 않고,
 * 실패·미상·원본이 바뀐 뒤의 결과를 현재 일치나 미사용으로 바꾸지 않는다. 공개 투영에는 싣지 않는다.
 */
const hex = (n: number) => z.string().regex(new RegExp(`^[a-f0-9]{${n}}$`));
const text = z.string().min(1).max(300);
export const REVIEW_STATES = ["matched", "missing_application_record", "not_applied", "decision_unknown", "uncollected", "broken_search_link", "search_unavailable", "not_recordable_document", "document_missing", "application_decision_conflict", "task_conflict", "recorded"] as const;
const sourceSchema = z.object({
    knowledgeDecisionsPresent: z.boolean(),
    knowledgeDecisions: knowledgeDecisionsSchema,
    knowledge: legacyKnowledgeSchema,
    evidence: evidenceSchema,
}).strict();
const rowSchema = z.object({
    project: text, task: text, document: text.nullable(), state: z.enum(REVIEW_STATES),
    decision: z.enum(["applied", "reference_only", "not_applicable", "deferred", "unknown"]).optional(),
    reason: z.string().min(1).max(2000).optional(),
    searchLink: z.enum(["direct", "linked", "broken_search_link", "search_unavailable"]).optional(),
    detail: z.string().min(1).max(2000).optional(),
    applicationEvent: z.string().min(1).max(2000).optional(),
}).strict();
export const knowledgeReviewSchema = z.object({
    schemaVersion: z.literal(1),
    id: hex(32),
    project: text,
    taskId: text,
    reviewedAt: z.iso.datetime({ offset: true }),
    status: z.enum(["completed", "failed", "unavailable"]),
    source: sourceSchema,
    sourceDigest: hex(64),
    result: z.object({
        schemaVersion: z.literal(1), visibility: z.literal("private"), rows: z.array(rowSchema).max(100),
        recordingRequested: z.boolean(), inferredApplications: z.literal(0),
    }).strict().nullable(),
    error: z.string().min(1).max(2000).nullable(),
}).strict().superRefine((r, ctx) => reviewIssues(r).forEach(message => ctx.addIssue({ code: "custom", message })));
export type KnowledgeReview = z.infer<typeof knowledgeReviewSchema>;
export type ReviewSource = KnowledgeReview["source"];
export type ReviewRow = KnowledgeReview["result"] extends infer R ? R extends { rows: (infer X)[] } ? X : never : never;

const APPLIED_STATES = new Set(["matched", "missing_application_record", "recorded", "document_missing", "not_recordable_document"]);
const NOT_APPLIED_STATES = new Set(["not_applied", "application_decision_conflict"]);

/** 계약의 의미 조건. 형식이 맞아도 실제 source 판단과 행 상태가 어긋나면 받지 않는다 */
function reviewIssues(r: z.infer<typeof knowledgeReviewSchema>): string[] {
    const issues: string[] = []; const fail = (m: string) => issues.push(m);
    const s = r.source;
    if (!s.knowledgeDecisionsPresent && s.knowledgeDecisions !== null) fail("Absent decisions must be null");
    const evidence = new Set(s.evidence.map(e => e.id));
    if (evidence.size !== s.evidence.length) fail("Duplicate evidence id");
    // activity 와 같은 공통 판정: 공백뿐인 문자열 금지, 근거 참조는 중복 없이 실제 근거만
    (function walk(value: unknown): void {
        if (typeof value === "string" && !value.trim()) fail("Blank string");
        else if (Array.isArray(value)) value.forEach(walk);
        else if (value && typeof value === "object") for (const [key, child] of Object.entries(value)) {
            if (key === "evidenceRefs") { const refs = child as string[]; if (new Set(refs).size !== refs.length || refs.some(ref => !evidence.has(ref))) fail("Invalid evidence reference"); }
            walk(child);
        }
    })(s);
    if (r.error !== null && !r.error.trim()) fail("Blank error");
    issues.push(...knowledgeDecisionIssues({ knowledgeDecisions: s.knowledgeDecisions ?? undefined, knowledge: s.knowledge }));
    if (sourceDigest(r.project, r.taskId, s) !== r.sourceDigest) fail("Source digest mismatch");
    if (r.status === "completed" ? !r.result || r.error !== null : r.result !== null || r.error === null) fail("Completed carries a result; failed/unavailable carry an error");
    if (!r.result) return issues;
    const rows = r.result.rows;
    const decisions = new Map((s.knowledgeDecisions ?? []).map(d => [d.document, d]));
    const seen = new Set<string>();
    rows.forEach(row => {
        if (row.project !== r.project || row.task !== r.taskId) fail("Row identity differs from the review");
        if (row.document === null) {
            if (!["uncollected", "task_conflict"].includes(row.state) || row.decision || row.reason || row.searchLink || row.detail || row.applicationEvent) fail("Task-level row is uncollected or task_conflict only");
            if (row.state === "uncollected" && s.knowledgeDecisions !== null) fail("Uncollected requires absent or null decisions");
            return;
        }
        const d = decisions.get(row.document);
        if (!d || seen.has(row.document)) { fail("Row document is missing from the source or duplicated"); return; }
        seen.add(row.document);
        if (row.decision !== d.decision || row.reason !== d.reason || !row.searchLink) fail("Row decision must equal the source decision");
        if ((row.searchLink === "direct") !== (d.selection === "direct")) fail("Search link contradicts the selection");
        if (row.state === "uncollected" || row.state === "task_conflict") fail("Document row cannot carry a task-level state");
        // KB review(): 검색 연결이 깨졌거나 미확보면 그 연결 상태가 곧 행 상태다(일치·미적용 등으로 넘어가지 않는다)
        const brokenLink = row.searchLink === "broken_search_link" || row.searchLink === "search_unavailable";
        if ((row.state === "broken_search_link" || row.state === "search_unavailable" || brokenLink) && row.searchLink !== row.state) fail("Search state must match its link");
        [row.reason, row.detail, row.applicationEvent].forEach(v => { if (v !== undefined && !v.trim()) fail("Blank string"); });
        if (row.state === "decision_unknown" && d.decision !== "unknown") fail("Unknown state needs an unknown decision");
        if (APPLIED_STATES.has(row.state) && d.decision !== "applied") fail("Application state needs an applied decision");
        if (NOT_APPLIED_STATES.has(row.state) && (d.decision === "applied" || d.decision === "unknown")) fail("Not-applied state needs a non-applied decision");
        if (row.detail !== undefined && row.state !== "not_recordable_document") fail("Detail belongs to not_recordable_document only");
        if (row.applicationEvent !== undefined && !(r.result!.recordingRequested && (row.state === "recorded" || row.state === "matched"))) fail("Application event only after an explicit recording run");
        if (row.state === "recorded" && (!r.result!.recordingRequested || !row.applicationEvent)) fail("Recorded needs a recording run and its event");
    });
    const taskRows = rows.filter(row => row.document === null);
    if (taskRows.length > 1 || (taskRows.length === 1 && rows.length !== 1)) fail("Task-level state is a single row");
    if (taskRows[0]?.state === "task_conflict") return issues;
    if (s.knowledgeDecisions === null) { if (taskRows[0]?.state !== "uncollected") fail("Absent decisions are reviewed as uncollected"); }
    else if (seen.size !== decisions.size) fail("Every source decision needs exactly one row");
    return issues;
}

/** 현재 activity 로 대조 source 를 만든다. 계약: 누락이면 present=false/null, 명시 null 은 true/null, knowledge 누락은 null, evidence 누락은 [] */
export function currentSource(activity: Activity | undefined): ReviewSource {
    const present = Boolean(activity && "knowledgeDecisions" in activity && activity.knowledgeDecisions !== undefined);
    return { knowledgeDecisionsPresent: present, knowledgeDecisions: present ? activity!.knowledgeDecisions ?? null : null, knowledge: activity?.knowledge ?? null, evidence: activity?.evidence ?? [] };
}

/** canonical JSON: 객체 키 사전순, 배열 순서 유지, 공백 없음, 유니코드 그대로(Python json.dumps(sort_keys, separators, ensure_ascii=False) 와 같은 바이트) */
export function canonicalJson(value: unknown): string {
    if (value === null || typeof value !== "object") return JSON.stringify(value);
    if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
    const entries = Object.entries(value as Record<string, unknown>).filter(([, v]) => v !== undefined).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0);
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalJson(v)}`).join(",")}}`;
}
export const sourceDigest = (project: string, taskId: string, source: ReviewSource) => sha256Hex(canonicalJson({ project, id: taskId, source }));

/** 화면용: 시도를 시간순(최신 위)으로 두고, 각 시도가 지금 원본과 같은 source 로 대조됐는지만 덧붙인다. 상태는 고치지 않는다 */
export function reviewHistory(reviews: KnowledgeReview[] | undefined, activity: Activity | undefined, project: string, taskId: string) {
    const now = sourceDigest(project, taskId, currentSource(activity));
    return [...(reviews ?? [])].sort((a, b) => Date.parse(b.reviewedAt) - Date.parse(a.reviewedAt) || a.id.localeCompare(b.id)).map(review => ({ review, sameSource: review.sourceDigest === now }));
}

// 동기 SHA-256(UTF-8). 수신 검증(서버)과 화면(브라우저)이 같은 함수를 쓴다
const K = Uint32Array.from([0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2]);
export function sha256Hex(input: string): string {
    const bytes = new TextEncoder().encode(input);
    const length = ((bytes.length + 9 + 63) >> 6) << 6;
    const data = new Uint8Array(length); data.set(bytes); data[bytes.length] = 0x80;
    const view = new DataView(data.buffer);
    view.setUint32(length - 8, Math.floor(bytes.length / 0x20000000)); view.setUint32(length - 4, (bytes.length << 3) >>> 0);
    const h = Uint32Array.from([0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]);
    const w = new Uint32Array(64);
    const rotr = (x: number, n: number) => (x >>> n) | (x << (32 - n));
    for (let off = 0; off < length; off += 64) {
        for (let i = 0; i < 16; i++) w[i] = view.getUint32(off + i * 4);
        for (let i = 16; i < 64; i++) {
            const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3), s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
            w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
        }
        let [a, b, c, d, e, f, g, hh] = h;
        for (let i = 0; i < 64; i++) {
            const t1 = (hh + (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + w[i]) >>> 0;
            const t2 = ((rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) >>> 0;
            hh = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
        }
        h[0] += a; h[1] += b; h[2] += c; h[3] += d; h[4] += e; h[5] += f; h[6] += g; h[7] += hh;
    }
    return [...h].map(x => x.toString(16).padStart(8, "0")).join("");
}
