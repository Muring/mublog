import { type UsageYear } from "./ai-usage";

export type AiTask = UsageYear["tasks"][number];
/** 설명이 보완된 기록의 제목. 없으면 null 이고 화면은 작업 ID 를 대신 보여 준다 */
export const describedTitle = (task: AiTask) => task.presentation?.title.trim() || task.activity?.purpose || null;
/** 보완 설명이 없으면 작업 ID 를 띄어 읽게 한다. 날짜 조각은 날짜 열이 따로 보여 주므로 뺀다 */
const idTitle = (id: string) => id.replace(/(?:^|[-_])20\d{2}-?\d{2}-?\d{2}(?=$|[-_])/g, "").replace(/[-_]+/g, " ").trim() || id;
export const taskTitle = (task: AiTask) => describedTitle(task) ?? idTitle(task.id);
/** ID 날짜는 수행일로 확정하지 않고 별도 출처로 표시한다. 여러 날짜는 채택하지 않는다. */
export function taskDate(task: AiTask) {
    if (task.activity) {
        const t = task.activity.timing;
        if (t.precision === "timestamp" && t.occurredAt) return { day: new Date(Date.parse(t.occurredAt) + 9 * 3600_000).toISOString().slice(0, 10), basis: "record" as const };
        if (t.precision === "date" && t.occurredOn) return { day: t.occurredOn, basis: "record" as const };
        return t.labelDate ? { day: t.labelDate.date, basis: "name" as const } : null;
    }
    if (task.presentation?.occurredAt) return { day: new Date(Date.parse(task.presentation.occurredAt) + 9 * 3600_000).toISOString().slice(0, 10), basis: "record" as const };
    const candidates = [...task.id.matchAll(/(?:^|[^0-9])(20[0-9]{2})-?(0[1-9]|1[0-2])-?([0-2][0-9]|3[01])(?=$|[^0-9])/g)].map(m => `${m[1]}-${m[2]}-${m[3]}`);
    const days = [...new Set(candidates)].filter(day => { const at = new Date(`${day}T00:00:00Z`); return Number.isFinite(at.getTime()) && at.toISOString().slice(0, 10) === day; });
    return days.length === 1 ? { day: days[0], basis: "name" as const } : null;
}
export function selectTaskPeriod(tasks: AiTask[], year: UsageYear, period: string, sort: "newest" | "oldest", today: Date) {
    const kstDay = (value: string | Date) => new Date(new Date(value).getTime() + 9 * 3600_000).toISOString().slice(0, 10);
    const nowDay = kstDay(today);
    const knownDays = [...year.weeks.map(w => w.week), ...tasks.flatMap(t => { const d = taskDate(t); return d?.basis === "record" ? [d.day] : []; })].filter(d => d.startsWith(`${year.year}-`)).sort();
    const anchor = nowDay.startsWith(`${year.year}-`) ? nowDay : knownDays.at(-1) ?? `${year.year}-12-31`;
    const monday = new Date(`${anchor}T00:00:00Z`);
    monday.setUTCDate(monday.getUTCDate() - (monday.getUTCDay() + 6) % 7);
    const end = new Date(monday.getTime() + 7 * 86400_000).toISOString().slice(0, 10);
    const n = [4, 8, 12].includes(Number(period)) ? Number(period) : 8;
    const first = new Date(monday.getTime() - (n - 1) * 7 * 86400_000).toISOString().slice(0, 10);
    const dated = tasks.filter(task => {
        const value = taskDate(task);
        if (!value || value.basis !== "record") return false;
        const kstDate = value.day;
        if (!kstDate.startsWith(`${year.year}-`)) return false;
        if (period === "year") return true;
        return kstDate >= first && kstDate < end;
    }).sort((a, b) => (taskDate(a)!.day.localeCompare(taskDate(b)!.day) || (() => {
        const at = a.activity ? a.activity.timing.occurredAt : a.presentation?.occurredAt;
        const bt = b.activity ? b.activity.timing.occurredAt : b.presentation?.occurredAt;
        return at && bt ? Date.parse(at) - Date.parse(bt) : 0;
    })()) * (sort === "oldest" ? 1 : -1) || a.id.localeCompare(b.id));
    const undated = tasks.filter(task => taskDate(task)?.basis !== "record");
    return { dated, undated, total: dated.length + undated.length };
}

/** 원본 프로젝트 연결만 사용한다. KB 소속을 KB 등록/활용의 증거로 해석하지 않는다. */
export function groupTaskProjects(dated: AiTask[], undated: AiTask[]) {
    const groups = new Map<string, { project: string; dated: AiTask[]; undated: AiTask[] }>();
    const knowledge = { dated: [] as AiTask[], undated: [] as AiTask[] };
    const unassigned = { dated: [] as AiTask[], undated: [] as AiTask[] };
    for (const [kind, rows] of [["dated", dated], ["undated", undated]] as const) {
        for (const task of rows) {
            if (task.project === "muring/muring-kb") knowledge[kind].push(task);
            else if (task.project === "unmapped") unassigned[kind].push(task);
            else {
                if (!groups.has(task.project)) groups.set(task.project, { project: task.project, dated: [], undated: [] });
                groups.get(task.project)![kind].push(task);
            }
        }
    }
    return { projects: [...groups.values()], knowledge, unassigned };
}
