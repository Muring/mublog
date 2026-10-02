import type { AiTask } from './ai-task-records';
import type { Activity, Handoff } from './ai-activity';
const canonical = (v: unknown): string => JSON.stringify(v && typeof v === 'object' ? Array.isArray(v) ? v.map(x => JSON.parse(canonical(x))) : Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b)).map(([k, x]) => [k, JSON.parse(canonical(x))])) : v);
type Event = Omit<Handoff['events'][number], 'evidenceRefs'> & { evidence: Omit<Activity['evidence'][number], 'id'>[] };
export type HandoffView = { id: string; headers: Pick<Handoff, 'from' | 'to' | 'request'>[]; events: Event[]; conflict: boolean };
/** Evidence IDs are local to each activity: compare resolved evidence, preserving every conflicting variant. */
export function mergeHandoffs(tasks: AiTask[]): HandoffView[] {
    const groups = new Map<string, { headers: Map<string, HandoffView['headers'][number]>; events: Map<string, Map<string, Event>>; conflict: boolean }>();
    const identities = new Map<string, Set<string>>();
    for (const t of tasks) {
        const key = JSON.stringify([t.project, t.id]);
        if (!identities.has(key)) identities.set(key, new Set());
        identities.get(key)!.add(canonical(t));
    }
    for (const t of tasks) for (const h of t.activity?.handoffs ?? []) {
        if (!groups.has(h.id)) groups.set(h.id, { headers: new Map(), events: new Map(), conflict: false });
        const g = groups.get(h.id)!;
        g.conflict ||= t.conflict || identities.get(JSON.stringify([t.project, t.id]))!.size > 1;
        const header = { from: h.from, to: h.to, request: h.request };
        g.headers.set(canonical(header), header);
        for (const e of h.events) {
            const { evidenceRefs, ...body } = e;
            const evidence = evidenceRefs.flatMap(ref => {
                const item = t.activity!.evidence.find(x => x.id === ref);
                return item ? [{ kind: item.kind, reference: item.reference, note: item.note }] : [];
            }).sort((a, b) => canonical(a).localeCompare(canonical(b)));
            const event = { ...body, evidence };
            if (!g.events.has(e.id)) g.events.set(e.id, new Map());
            g.events.get(e.id)!.set(canonical(event), event);
        }
    }
    return [...groups].map(([id, g]) => {
        const events = [...g.events.values()].flatMap(v => [...v.values()]);
        const terminal = events.filter(e => ['completed', 'failed', 'cancelled'].includes(e.kind));
        return { id, headers: [...g.headers.values()], events, conflict: g.conflict || g.headers.size > 1 || [...g.events.values()].some(v => v.size > 1) || terminal.length > 1 };
    });
}
export function handoffsForTask(task: AiTask, handoffs: HandoffView[]) {
    return handoffs.filter(h => h.headers.some(header => [header.from, header.to].some(e => e.project === task.project && (e.taskId === task.id || (e.taskId === null && task.activity?.handoffs?.some(own => own.id === h.id))))));
}
