import assert from "node:assert/strict";
import { formatCardDate, formatPostDate } from "../src/lib/date";

const originalTimezone = process.env.TZ;
const cases = [
    ["2026-10-15T14:59:59.999Z", "2026년 10월 15일", "26년 10월 15일"],
    ["2026-10-15T15:00:00.000Z", "2026년 10월 16일", "26년 10월 16일"],
    ["2025-12-31T15:00:00.000Z", "2026년 1월 1일", "26년 01월 01일"],
    ["2024-02-28T15:00:00.000Z", "2024년 2월 29일", "24년 02월 29일"],
    ["2026-10-16T00:00:00+09:00", "2026년 10월 16일", "26년 10월 16일"],
];
try {
    for (const timezone of ["UTC", "Asia/Seoul", "America/Los_Angeles", "Pacific/Kiritimati"]) {
        process.env.TZ = timezone;
        for (const [iso, detail, card] of cases) {
            for (const value of [iso, new Date(iso)]) {
                assert.equal(formatPostDate(value), detail, `${timezone}: ${iso} detail`);
                assert.equal(formatCardDate(value), card, `${timezone}: ${iso} card`);
            }
        }
    }
} finally {
    if (originalTimezone === undefined) delete process.env.TZ;
    else process.env.TZ = originalTimezone;
}
console.log("PASS: post dates across four timezones, KST midnight, year boundary and leap day");
