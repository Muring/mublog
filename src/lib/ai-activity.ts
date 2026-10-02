import { z } from "zod";
// Structural contract: MuRing-KB contracts/ai-task-activity.schema.json.
const timestamp = z.iso.datetime({ offset: true }).regex(/T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/);
const structure = z.object({
schemaVersion: z.literal(1),
category: z.enum(["work_execution", "kb_maintenance", "mixed", "unknown"]),
purpose: z.union([z.string().min(1).max(2000), z.null()]),
actions: z.union([z.array(z.string().min(1).max(2000)).min(0).max(100), z.null()]),
aiRole: z.union([z.object({
tools: z.union([z.array(z.enum(["Codex", "Claude", "other"])).min(0).max(100), z.null()]),
contributions: z.array(z.string().min(1).max(2000)).min(0).max(100)
}).strict(), z.null()]),
humanRole: z.union([z.object({
decisions: z.array(z.string().min(1).max(2000)).min(0).max(100),
corrections: z.array(z.string().min(1).max(2000)).min(0).max(100)
}).strict(), z.null()]),
outcomes: z.union([z.array(z.object({
summary: z.string().min(1).max(2000),
artifact: z.union([z.string().min(1).max(2000), z.null()]),
evidenceRefs: z.array(z.string().min(1).max(300)).min(0).max(100)
}).strict()).min(0).max(100), z.null()]),
verification: z.union([z.object({
checks: z.array(z.object({
name: z.string().min(1).max(300),
method: z.string().min(1).max(2000),
result: z.enum(["pass", "fail", "not_run", "unknown"]),
limitation: z.union([z.string().min(1).max(2000), z.null()]),
evidenceRefs: z.array(z.string().min(1).max(300)).min(0).max(100)
}).strict()).min(0).max(100),
unverified: z.union([z.array(z.string().min(1).max(2000)).min(0).max(100), z.null()])
}).strict(), z.null()]),
followUps: z.union([z.array(z.object({
summary: z.string().min(1).max(2000),
status: z.enum(["pending", "delegated", "done", "unknown"])
}).strict()).min(0).max(100), z.null()]),
knowledge: z.union([z.array(z.object({
document: z.string().min(1).max(300),
usage: z.enum(["reference", "applied"]),
note: z.union([z.string().min(1).max(2000), z.null()])
}).strict()).min(0).max(100), z.null()]),
timing: z.object({
startedAt: z.union([timestamp.max(100), z.null()]),
endedAt: z.union([timestamp.max(100), z.null()]),
occurredAt: z.union([timestamp.max(100), z.null()]),
basis: z.enum(["user_confirmed", "source_record", "unknown"]),
evidenceRefs: z.array(z.string().min(1).max(300)).min(0).max(100),
occurredOn: z.union([z.iso.date().max(10), z.null()]),
precision: z.enum(["timestamp", "date", "unknown"]),
labelDate: z.union([z.object({
date: z.iso.date().max(10),
basis: z.literal("record_id")
}).strict(), z.null()])
}).strict(),
evidence: z.array(z.object({
id: z.string().min(1).max(300),
kind: z.enum(["user_statement", "tool_result", "artifact", "comparison", "session_record"]),
reference: z.string().min(1).max(2000),
note: z.union([z.string().min(1).max(2000), z.null()])
}).strict()).min(0).max(100),
effects: z.union([z.array(z.object({
kind: z.enum(["measured", "user_confirmed"]),
metric: z.string().min(1).max(300),
unit: z.union([z.string().min(1).max(300), z.null()]),
before: z.union([z.number().finite(), z.null()]),
after: z.union([z.number().finite(), z.null()]),
method: z.string().min(1).max(2000),
evidenceRefs: z.array(z.string().min(1).max(300)).min(1).max(100)
}).strict()).min(0).max(100), z.null()]),
publicCase: z.union([z.object({
status: z.enum(["draft", "in_review", "approved", "rejected", "withdrawn"]),
projection: z.union([z.object({
slug: z.string().max(100).regex(new RegExp("^[a-z0-9]+(?:-[a-z0-9]+)*$")),
title: z.string().min(1).max(300),
problem: z.string().min(1).max(2000),
aiUse: z.string().min(1).max(2000),
result: z.string().min(1).max(2000),
verification: z.string().min(1).max(2000),
limitations: z.union([z.array(z.string().min(1).max(2000)).min(0).max(100), z.null()]),
sourceUrl: z.union([z.string().max(2000).regex(new RegExp("^https://")), z.null()])
}).strict(), z.null()]),
evidenceRefs: z.array(z.string().min(1).max(300)).min(0).max(100),
review: z.union([z.object({
reviewedAt: timestamp.max(100),
reviewer: z.string().min(1).max(300),
evidenceRef: z.string().min(1).max(300)
}).strict(), z.null()])
}).strict(), z.null()]),
handoffs: z.union([z.array(z.object({
id: z.string().min(1).max(300),
from: z.object({
project: z.string().min(1).max(300),
taskId: z.union([z.string().min(1).max(300), z.null()])
}).strict(),
to: z.object({
project: z.string().min(1).max(300),
taskId: z.union([z.string().min(1).max(300), z.null()])
}).strict(),
request: z.string().min(1).max(2000),
events: z.array(z.object({
id: z.string().min(1).max(300),
kind: z.enum(["requested", "dispatch_accepted", "sent", "received", "started", "blocked", "completed", "failed", "cancelled"]),
reportedBy: z.enum(["sender", "recipient", "transport", "user"]),
at: z.union([timestamp.max(100), z.null()]),
occurredOn: z.union([z.iso.date().max(10), z.null()]),
precision: z.enum(["timestamp", "date", "unknown"]),
summary: z.string().min(1).max(2000),
evidenceRefs: z.array(z.string().min(1).max(300)).min(1).max(100),
result: z.union([z.object({
summary: z.string().min(1).max(2000),
artifacts: z.array(z.string().min(1).max(2000)).min(0).max(100),
verification: z.union([z.string().min(1).max(2000), z.null()])
}).strict(), z.null()])
}).strict()).min(1).max(100)
}).strict()).min(0).max(100), z.null()]).optional(),
knowledgeDecisions: z.union([z.array(z.object({
id: z.string().min(1).max(300),
document: z.string().min(1).max(300),
selection: z.enum(["search", "direct"]),
searchRefs: z.array(z.string().regex(/^[a-f0-9]{32}$/)).min(0).max(100),
decision: z.enum(["applied", "reference_only", "not_applicable", "deferred", "unknown"]),
reason: z.string().min(1).max(2000),
plannedUse: z.union([z.string().min(1).max(2000), z.null()]),
verification: z.union([z.object({
method: z.string().min(1).max(2000),
result: z.enum(["pass", "fail", "not_run", "unknown"]),
note: z.union([z.string().min(1).max(2000), z.null()]),
evidenceRefs: z.array(z.string().min(1).max(300)).min(0).max(100)
}).strict(), z.null()]),
evidenceRefs: z.array(z.string().min(1).max(300)).min(0).max(100)
}).strict()).min(0).max(100), z.null()]).optional()
}).strict();
export const activitySchema = structure.superRefine((a, ctx) => {
    const fail = (message: string) => ctx.addIssue({ code: 'custom', message });
    const evidence = new Map(a.evidence.map(e => [e.id, e]));
    if (evidence.size !== a.evidence.length) fail('Duplicate evidence id');
    const userEvidence = (refs: string[]) => refs.some(r => evidence.get(r)?.kind === 'user_statement');
    function walk(value: unknown): void {
        if (typeof value === 'string' && !value.trim()) fail('Blank activity string');
        if (Array.isArray(value)) value.forEach(walk);
        else if (value && typeof value === 'object') for (const [key, child] of Object.entries(value)) {
            if (key === 'evidenceRefs' || key === 'evidenceRef') {
                const refs: string[] = Array.isArray(child) ? child : [child];
                if (new Set(refs).size !== refs.length || refs.some(r => !evidence.has(r))) fail('Invalid evidence reference');
            }
            walk(child);
        }
    }
    walk(a);
    if ((a.actions?.length || a.aiRole || a.humanRole || a.outcomes?.length || a.knowledge?.length) && !evidence.size) fail('Work requires evidence');
    a.outcomes?.forEach(o => { if (!o.evidenceRefs.length) fail('Outcome requires evidence'); });
    a.verification?.checks.forEach(c => { if (['pass', 'fail'].includes(c.result) && !c.evidenceRefs.length) fail('Executed check requires evidence'); });
    const t = a.timing;
    if (t.precision === 'unknown') {
        if (t.basis !== 'unknown' || [t.startedAt, t.endedAt, t.occurredAt, t.occurredOn].some(v => v !== null)) fail('Unknown timing cannot carry dates');
    } else {
        if (t.basis === 'unknown' || !t.evidenceRefs.length) fail('Known timing requires evidence');
        if (t.precision === 'date' ? !t.occurredOn || [t.startedAt, t.endedAt, t.occurredAt].some(v => v !== null) : !t.occurredAt || t.occurredOn !== null) fail('Timing precision mismatch');
    }
    if (t.basis === 'user_confirmed' && !userEvidence(t.evidenceRefs)) fail('User timing requires user evidence');
    if (t.startedAt && t.endedAt && Date.parse(t.startedAt) > Date.parse(t.endedAt)) fail('Reversed timing');
    a.effects?.forEach(e => {
        if ((e.before === null) !== (e.after === null) || (e.kind === 'measured' && e.before === null)) fail('Invalid effect baseline');
        if (e.kind === 'user_confirmed' && !userEvidence(e.evidenceRefs)) fail('Effect requires user evidence');
    });
    const p = a.publicCase;
    if (p) {
        if (p.review && !userEvidence([p.review.evidenceRef])) fail('Review requires user evidence');
        if (p.status === 'approved' && (!p.review || !p.projection || !p.evidenceRefs.length)) fail('Approval requires review and projection');
        if (p.projection) {
            const privatePattern = /(?:\/(?:home|Users|mnt|tmp|var|etc|root)\/|(?:^|[^A-Za-z])[A-Za-z]:[\\/]|\\\\|~\/|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b|\b(?:sk-[A-Za-z0-9_-]{12,}|Bearer\s+\S+)|(?:api[_-]?key|password|secret|token)\s*[:=]\s*\S+)/i;
            if (privatePattern.test(JSON.stringify(p.projection))) fail('Private material in public projection');
            if (p.projection.sourceUrl) {
                try {
                    const u = new URL(p.projection.sourceUrl), host = u.hostname.replace(/\.$/, '');
                    if (u.protocol !== 'https:' || u.username || u.password || u.search || u.hash || !host.includes('.') || /(?:^localhost$|\.(?:local|internal|localhost)$)/.test(host)) fail('Invalid public source URL');
                    if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
                        const parts = host.split('.').map(Number);
                        const value = parts.reduce((n, octet) => n * 256 + octet, 0);
                        const blocked = [[0,8],[167772160,8],[2130706432,8],[2851995648,16],[2886729728,12],[3221225472,24],[3221225984,24],[3232235520,16],[3323068416,15],[3325256704,24],[3405803776,24],[4026531840,4],[1681915904,10]];
                        if (!['192.0.0.9', '192.0.0.10'].includes(host) && blocked.some(([start, bits]) => Math.floor(value / 2 ** (32 - bits)) === Math.floor(start / 2 ** (32 - bits)))) fail('Private source address');
                    }
                } catch { fail('Invalid public source URL'); }
            }
        }
    }
    const ids = new Set<string>();
    a.handoffs?.forEach(h => {
        if (ids.has(h.id)) fail('Duplicate handoff id'); ids.add(h.id);
        const eventIds = new Set<string>();
        h.events.forEach(e => {
            if (eventIds.has(e.id)) fail('Duplicate event id'); eventIds.add(e.id);
            if (e.precision === 'timestamp' ? !e.at || e.occurredOn !== null : e.precision === 'date' ? !e.occurredOn || e.at !== null : e.at !== null || e.occurredOn !== null) fail('Event precision mismatch');
            if (e.reportedBy === 'user' && !userEvidence(e.evidenceRefs)) fail('User event requires user evidence');
            if (e.kind === 'cancelled' && e.reportedBy === 'transport') fail('Transport cannot cancel');
            if (['received', 'started', 'blocked', 'completed', 'failed'].includes(e.kind) && !['recipient', 'user'].includes(e.reportedBy)) fail('Recipient event requires recipient evidence');
            if (e.kind === 'dispatch_accepted' && e.reportedBy !== 'transport') fail('Dispatch requires transport evidence');
            if (e.kind === 'requested' && !['sender', 'user'].includes(e.reportedBy)) fail('Request requires sender evidence');
            if (['completed', 'failed'].includes(e.kind) !== (e.result !== null)) fail('Result mismatch');
        });
    });
    knowledgeDecisionIssues(a).forEach(fail);
});
/** 선택 활동의 KB 판단 부분. 대조 결과(knowledge-review)의 source 사본도 같은 모양이다 */
export const knowledgeDecisionsSchema = structure.shape.knowledgeDecisions.unwrap();
export const legacyKnowledgeSchema = structure.shape.knowledge;
export const evidenceSchema = structure.shape.evidence;
type KnowledgePart = { knowledgeDecisions?: z.infer<typeof knowledgeDecisionsSchema>; knowledge: z.infer<typeof legacyKnowledgeSchema> };
/** KB 판단: MuRing-KB scripts/kb_knowledge.py validate_decisions 와 같은 판정. 검색·선택만으로 적용이 되지 않는다 */
export function knowledgeDecisionIssues(a: KnowledgePart): string[] {
    const issues: string[] = []; const fail = (m: string) => issues.push(m);
    const decisionIds = new Set<string>(), documents = new Set<string>();
    const legacy = new Map((a.knowledge ?? []).map(k => [k.document, k.usage]));
    a.knowledgeDecisions?.forEach(d => {
        const parts = d.document.split('/');
        if (d.document.startsWith('/') || d.document.includes('\\') || d.document.includes(':') || parts.some(x => x === '' || x === '.' || x === '..')) fail('Decision document must be a normalized KB-relative path');
        if (decisionIds.has(d.id) || documents.has(d.document)) fail('Duplicate knowledge decision id or document');
        decisionIds.add(d.id); documents.add(d.document);
        if ((d.selection === 'search') !== (d.searchRefs.length > 0)) fail('Search selection needs searchRefs');
        if (new Set(d.searchRefs).size !== d.searchRefs.length) fail('Duplicate search reference');
        if (d.decision !== 'unknown' && !d.evidenceRefs.length) fail('Known knowledge decision needs evidence');
        if (d.decision === 'applied' && (!d.plannedUse || !d.verification || !['pass', 'fail'].includes(d.verification.result) || !d.verification.evidenceRefs.length)) fail('Applied knowledge needs actual use and verified outcome evidence');
        const usage = legacy.get(d.document);
        if (d.decision !== 'unknown' && usage && (usage === 'applied') !== (d.decision === 'applied')) fail('Legacy knowledge and decision contradict each other');
    });
    return issues;
}
export type Activity = z.infer<typeof activitySchema>;
export type KnowledgeDecision = NonNullable<Activity['knowledgeDecisions']>[number];
export type Handoff = NonNullable<Activity['handoffs']>[number];
