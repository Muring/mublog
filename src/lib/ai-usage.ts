import { z } from "zod";
import { activitySchema } from "./ai-activity";
import { knowledgeReviewSchema } from "./ai-knowledge-review";

const count = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const text = z.string().max(300);
const date = z.iso.date();
export const totalsSchema = z.object({ input: count, cache_read: count, cache_write: count, output: count, reasoning: count, responses: count, total: count, non_cache_read_input: count }).strict().refine(t => t.total === t.input + t.output && t.non_cache_read_input === t.input - t.cache_read && t.cache_read + t.cache_write <= t.input && t.reasoning <= t.output, "토큰 합계 불일치");
const groupSchema = z.object({ project: text, tool: z.enum(["Codex", "Claude"]), model: text, effort: text, totals: totalsSchema }).strict();
const diagnosticsSchema = z.object(Object.fromEntries(["calls", "outputs", "output_chars", "large_outputs", "truncations", "repeated_calls", "known_failed_outputs", "unknown_output_outcomes", "kb_searches", "kb_empty_searches", "kb_selections", "kb_applications", "kb_search_mentions", "compactions"].map(k => [k, count])));
export const weekSchema = z.object({ week: date, ended: z.boolean(), observed: z.boolean(), partial: z.boolean(), totals: totalsSchema, groups: z.array(groupSchema), states: z.record(z.string(), totalsSchema), diagnostics: diagnosticsSchema }).strict();
export const taskPresentationSchema = z.object({
    title: text, summary: z.string().max(2000), occurredAt: z.iso.datetime({ offset: true }).nullable(),
    checks: z.array(z.object({ title: text, method: z.string().max(1000), result: z.enum(["pass", "fail", "not_run", "unknown"]), reason: z.string().max(1000).nullable() }).strict()),
    followUps: z.array(z.object({ title: text, status: z.enum(["pending", "delegated", "unknown"]), note: z.string().max(1000) }).strict()),
    knowledge: z.array(z.object({ document: text, usage: z.enum(["reference", "applied"]), note: z.string().max(1000) }).strict()),
    evidence: z.array(z.string().max(1000)),
}).strict();
export type TaskPresentation = z.infer<typeof taskPresentationSchema>;
const taskSchema = z.object({ id: text, project: text, type: text.nullable(), status: text, verification: z.array(z.object({ name: text, result: z.enum(["pass", "fail", "not_run", "unknown"]) }).strict()), rework: z.union([count, z.boolean()]).nullable(), conflict: z.boolean(), totals: totalsSchema, presentation: taskPresentationSchema.optional(), activity: activitySchema.optional(), knowledgeReviews: z.array(knowledgeReviewSchema).max(1000).optional() }).strict().refine(t => (t.activity?.handoffs ?? []).every(h => [h.from, h.to].some(e => e.project === t.project && (e.taskId === null || e.taskId === t.id))), "인계 작업 연결 불일치").refine(t => (t.knowledgeReviews ?? []).every(r => r.project === t.project && r.taskId === t.id), "대조 이력 작업 불일치").refine(t => new Set((t.knowledgeReviews ?? []).map(r => r.id)).size === (t.knowledgeReviews?.length ?? 0), "대조 시도 id 중복");
export const yearSchema = z.object({ year: z.number().int().min(2020).max(2200), weeks: z.array(weekSchema).max(54), devices: z.array(z.object({ device: text, since: z.iso.datetime({ offset: true }).nullable(), until: z.iso.datetime({ offset: true }).nullable() }).strict()), tasks: z.array(taskSchema), quality: z.object({ problems: z.array(z.object({ device: text.optional(), code: text, count: count.optional() }).strict()), fallback_identities: count, task_conflicts: count, ambiguous_task_responses: count, comparison: z.literal("withheld") }).strict(), fieldObservations: z.record(z.string(), count) }).strict().refine(y => new Set(y.weeks.map(w => w.week)).size === y.weeks.length && y.weeks.every(w => w.week.startsWith(String(y.year)) && new Date(w.week).getUTCDay() === 1), "주 중복 또는 연도 불일치");
export const ingestSchema = z.object({ schema: z.literal(1), metrics: z.literal("usage-v1"), sequence: z.number().int().positive().max(Number.MAX_SAFE_INTEGER), sourceRevision: z.string().regex(/^[a-f0-9]{40,64}$/), generatedAt: z.iso.datetime({ offset: true }), years: z.array(yearSchema).min(1).max(100), improvements: z.array(z.object({ date, kind: text, summary: z.string().max(3000) }).strict()) }).strict().refine(v => new Set(v.years.map(y => y.year)).size === v.years.length, "연도 중복");
export type Totals = z.infer<typeof totalsSchema>;
export type UsageYear = z.infer<typeof yearSchema>;
export type UsageWeek = UsageYear["weeks"][number];
export type PublicWeek = Pick<UsageWeek, "week" | "ended" | "observed" | "partial" | "totals"> & { tools: { tool: string; totals: Totals }[] };
export type PublicYear = { year: number; weeks: PublicWeek[]; observedUntil: string | null; attention: boolean; cacheObserved: boolean };
export const emptyTotals = (): Totals => ({ input: 0, cache_read: 0, cache_write: 0, output: 0, reasoning: 0, responses: 0, total: 0, non_cache_read_input: 0 });
export function sumTotals(values: Totals[]): Totals {
    const total = emptyTotals();
    for (const value of values) for (const key of Object.keys(total) as (keyof Totals)[]) total[key] += value[key];
    return total;
}
/** Explicit public projection: never spread the private source into a response. */
export function publicYear(year: UsageYear): PublicYear {
    return { year: year.year, observedUntil: year.devices.map(d => d.until).filter((v): v is string => !!v).sort().at(-1) ?? null, attention: year.quality.problems.length > 0, cacheObserved: (year.fieldObservations.cache_read ?? 0) > 0 && year.fieldObservations.cache_read === sumTotals(year.weeks.map(w => w.totals)).responses,
        weeks: year.weeks.map(w => ({ week: w.week, ended: w.ended, observed: w.observed, partial: w.partial, totals: w.totals, tools: ["Codex", "Claude"].map(tool => ({ tool, totals: sumTotals(w.groups.filter(g => g.tool === tool).map(g => g.totals)) })) })) };
}
export function visibleWeeks<T extends { week: string }>(weeks: T[], period: string, today = new Date()): T[] {
    if (period === "year") return weeks;
    const n = [4, 8, 12].includes(Number(period)) ? Number(period) : 8;
    const latest = weeks.at(-1)?.week;
    if (!latest) return [];
    const current = new Date(today.toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" }) + "T00:00:00Z");
    current.setUTCDate(current.getUTCDate() - (current.getUTCDay() + 6) % 7);
    const end = latest.slice(0, 4) === String(current.getUTCFullYear()) ? current : new Date(latest + "T00:00:00Z");
    end.setUTCDate(end.getUTCDate() - (n - 1) * 7);
    return weeks.filter(w => w.week >= end.toISOString().slice(0, 10));
}
/** Series whose published posts are listed as related writing on /ai. */
export const AI_POST_SERIES = ["MuRing-KB 개발기"];

export const DEFAULT_AI_INTRO = { title: "AI를 쓰고, 기록하고, 개선합니다.", body: "Codex와 Claude를 개발에 활용하고, 결과를 검증합니다. 다시 쓸 지식과 선호는 MuRing-KB에 모으고, 사용 기록을 살펴 반복 작업을 줄입니다. 이곳에는 그 운영 방식과 관측한 데이터를 함께 남깁니다." };
