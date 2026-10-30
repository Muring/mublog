import { createClient } from "@supabase/supabase-js";
import { KST_OFFSET_MS, seoulDateKey } from "./date";

export const ANALYTICS_BACKUP_BUCKET = "analytics-backups";
const DAY_MS = 86_400_000;
const ROW_LIMIT = 100;
const REPORTS = {
    pagesAndReferrers: ["requestPath", "referrerHostname"],
    hourlyPages: ["hour", "requestPath"],
    countriesAndDevices: ["country", "deviceType"],
} as const;

type ReportName = keyof typeof REPORTS;
type Row = Record<string, string | number | null>;
type Report = { since: string; until: string; groupBy: readonly string[]; rows: Row[] };

class BackupError extends Error {}

export function analyticsBackupFailure(error: unknown) {
    return { ok: false as const, error: error instanceof BackupError ? error.message : "analytics_backup_failed" };
}

function required(name: string): string {
    const value = process.env[name];
    if (!value) throw new BackupError(`missing_${name}`);
    return value;
}

export function archivePath(day: string): string {
    return `daily/${day.slice(0, 7)}/${day}.json`;
}

export function dayStart(day: string): number {
    const value = Date.parse(`${day}T00:00:00+09:00`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !Number.isFinite(value) || seoulDateKey(new Date(value)) !== day) {
        throw new BackupError("invalid_start_date");
    }
    return value;
}

/** 최근 3일은 갱신하고, 그보다 오래된 누락은 하루 한 개씩 오래된 것부터 복구한다. */
export function archiveDays(today: string, startDate: string, existing: Set<string>): string[] {
    const start = dayStart(startDate);
    const midnight = dayStart(today);
    const available = Array.from({ length: 28 }, (_, i) => midnight - (i + 1) * DAY_MS)
        .filter(time => time >= start)
        .map(time => new Date(time + KST_OFFSET_MS).toISOString().slice(0, 10));
    const recent = available.slice(0, 3);
    const missing = available.slice(3).reverse().find(day => !existing.has(day));
    return missing ? [...recent, missing] : recent;
}

export function reportQuery(projectId: string, teamId: string, day: string, until: number, name: ReportName): URL {
    const url = new URL("https://api.vercel.com/v1/query/web-analytics/visits/aggregate");
    url.searchParams.set("projectId", projectId);
    url.searchParams.set("teamId", teamId);
    url.searchParams.set("since", new Date(dayStart(day)).toISOString());
    // API는 until을 포함하고 시간 단위로 확장하므로 다음 날 00:00 직전까지 요청한다.
    url.searchParams.set("until", new Date(until - 1).toISOString());
    url.searchParams.set("limit", String(ROW_LIMIT));
    url.searchParams.set("filter", "environment eq 'production'");
    for (const dimension of REPORTS[name]) url.searchParams.append("by", dimension);
    return url;
}

function object(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** 집계 필드만 보관한다. 응답 오류·형식 변경을 빈 통계로 저장하지 않는다. */
export function parseReport(value: unknown, name: ReportName): Report {
    if (!object(value) || !object(value.query) || !Array.isArray(value.data)) throw new BackupError("invalid_api_response");
    const { since, until, groupBy } = value.query;
    const expected = REPORTS[name];
    // 시간 단위는 timestamp에 펼쳐지며 API의 query.groupBy에는 포함되지 않는다.
    const responseGroups = expected.filter(dimension => dimension !== "hour");
    if (typeof since !== "string" || typeof until !== "string" || !Array.isArray(groupBy)
        || JSON.stringify(groupBy) !== JSON.stringify(responseGroups)) throw new BackupError("unexpected_api_grouping");
    const dimensions = expected.map(key => key === "hour" ? "timestamp" : key);
    const rows = value.data.map((item): Row => {
        if (!object(item)) throw new BackupError("invalid_api_row");
        const row: Row = {};
        for (const metric of ["pageviews", "visitors"]) {
            const count = item[metric];
            if (typeof count !== "number" || !Number.isSafeInteger(count) || count < 0) throw new BackupError("invalid_api_count");
            row[metric] = count;
        }
        for (const dimension of dimensions) {
            const field = item[dimension];
            if (typeof field !== "string" && field !== null) throw new BackupError("invalid_api_dimension");
            row[dimension] = field;
        }
        return row;
    });
    return { since, until, groupBy: expected, rows };
}

/** 서버에서만 호출한다. 토큰·원본 오류 응답을 로그나 백업 파일에 포함하지 않는다. */
export async function backupAnalytics(now = new Date()) {
    const token = required("VERCEL_ANALYTICS_TOKEN");
    const projectId = required("ANALYTICS_VERCEL_PROJECT_ID");
    const teamId = required("ANALYTICS_VERCEL_TEAM_ID");
    const startDate = required("ANALYTICS_BACKUP_START_DATE");
    const today = seoulDateKey(now);
    if (dayStart(startDate) > dayStart(today)) throw new BackupError("start_date_in_future");
    const deadline = AbortSignal.timeout(40_000);
    const boundedFetch: typeof fetch = (input, init) => fetch(input, {
        ...init,
        signal: AbortSignal.any([deadline, AbortSignal.timeout(10_000), ...(init?.signal ? [init.signal] : [])]),
    });
    const storage = createClient(required("NEXT_PUBLIC_SUPABASE_URL"), required("SUPABASE_SECRET_KEY"), {
        auth: { persistSession: false, autoRefreshToken: false },
        global: { fetch: boundedFetch },
    }).storage;
    const { data: bucketInfo, error: bucketError } = await storage.getBucket(ANALYTICS_BACKUP_BUCKET);
    if (bucketError || !bucketInfo || bucketInfo.public) throw new BackupError("private_bucket_required");
    const bucket = storage.from(ANALYTICS_BACKUP_BUCKET);
    const oldest = seoulDateKey(new Date(dayStart(today) - 28 * DAY_MS));
    const months = new Set([today.slice(0, 7), oldest.slice(0, 7)]);
    const existing = new Set<string>();
    for (const month of months) {
        const { data, error } = await bucket.list(`daily/${month}`, { limit: 100 });
        if (error || !data) throw new BackupError("archive_listing_failed");
        for (const item of data) {
            if (/^\d{4}-\d{2}-\d{2}\.json$/.test(item.name)) existing.add(item.name.slice(0, 10));
        }
    }

    const saved: string[] = [];
    const failed: { date: string; code: string }[] = [];
    let snapshotSaved = false;
    const days = [...archiveDays(today, startDate, existing), today];
    for (const day of days) {
        try {
            const completeDay = day !== today;
            const until = completeDay ? dayStart(day) + DAY_MS : now.getTime();
            const reports: Partial<Record<ReportName, Report>> = {};
            await Promise.all((Object.keys(REPORTS) as ReportName[]).map(async name => {
                const response = await boundedFetch(reportQuery(projectId, teamId, day, until, name), {
                    headers: { Authorization: `Bearer ${token}` }, cache: "no-store",
                });
                if (!response.ok) throw new BackupError(`analytics_http_${response.status}`);
                const report = parseReport(await response.json(), name);
                if (report.since !== new Date(dayStart(day)).toISOString()
                    || (completeDay && report.until !== new Date(until).toISOString())) {
                    throw new BackupError("unexpected_api_date_range");
                }
                reports[name] = report;
            }));
            const document = {
                version: 1, source: "vercel-web-analytics", date: day, timeZone: "Asia/Seoul",
                completeDay, generatedAt: now.toISOString(), collectionStartDate: startDate,
                rowLimit: ROW_LIMIT,
                notes: ["집계 백업이며 요청 원본이 아닙니다. 제한 밖 항목은 Others로 묶일 수 있습니다.",
                    "visitors는 그룹 간 중복될 수 있으므로 합산해 순 방문자 수로 쓰지 않습니다."],
                reports,
            };
            const { error } = await bucket.upload(completeDay ? archivePath(day) : "latest.json", JSON.stringify(document), {
                contentType: "application/json", cacheControl: "0", upsert: true,
            });
            if (error) throw new BackupError("archive_upload_failed");
            if (completeDay) saved.push(day);
            else snapshotSaved = true;
        } catch (error) {
            failed.push({ date: day, code: error instanceof BackupError ? error.message : "backup_request_failed" });
        }
    }
    return { ok: failed.length === 0, saved, snapshotSaved, failed };
}
