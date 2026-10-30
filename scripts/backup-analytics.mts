/** cron의 이미지 정리를 실행하지 않고 분석 백업만 수동으로 보완한다. 비밀값은 출력하지 않는다. */
import { loadEnvFile } from "node:process";
import { analyticsBackupFailure, backupAnalytics } from "../src/lib/analytics-backup";

for (const file of [".env.local", ".env"]) {
    try { loadEnvFile(file); } catch { /* 플랫폼 환경변수만 있는 경우에도 실행한다. */ }
}

try {
    const result = await backupAnalytics();
    console.log(JSON.stringify(result));
    if (!result.ok) process.exitCode = 1;
} catch (error) {
    console.error(JSON.stringify(analyticsBackupFailure(error)));
    process.exitCode = 1;
}
