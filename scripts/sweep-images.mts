/**
 * 어떤 포스트도 참조하지 않는 Storage 이미지를 정리한다.
 *
 *   yarn sweep:images                 무엇이 지워질지만 출력 (기본값, 안전)
 *   yarn sweep:images --apply         실제 삭제
 *   yarn sweep:images --grace 0       유예 시간 없이 (테스트용)
 */
import { loadEnvFile } from "node:process";

try {
    loadEnvFile(".env");
} catch {
    // 플랫폼이 환경변수를 직접 주입하는 경우
}

const { sweepOrphanImages } = await import("../src/lib/storage");
const { prisma } = await import("../src/lib/prisma");

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const graceIndex = args.indexOf("--grace");
const graceHours = graceIndex !== -1 ? Number(args[graceIndex + 1]) : 24;

const kb = (bytes: number) => (bytes / 1024).toFixed(1) + " KB";

try {
    const result = await sweepOrphanImages({ dryRun: !apply, graceHours });

    console.log(`Storage 객체        ${result.total}개`);
    console.log(`포스트가 참조 중    ${result.referenced}개`);
    console.log(`유예 시간 내 제외   ${result.skippedRecent}개 (최근 ${graceHours}시간)`);
    console.log(`고아                ${result.orphans.length}개  ${kb(result.freedBytes)}`);

    if (result.orphans.length > 0) {
        console.log("");
        for (const orphan of result.orphans) {
            console.log(`  ${orphan.path}  ${kb(orphan.size)}  ${orphan.createdAt.toISOString().slice(0, 16)}`);
        }
    }

    console.log("");
    if (apply) {
        console.log(`${result.deleted.length}개 삭제 완료. ${kb(result.freedBytes)} 확보.`);
    } else if (result.orphans.length > 0) {
        console.log("실제로 지우려면 --apply 를 붙이세요.");
    } else {
        console.log("정리할 것이 없습니다.");
    }
} catch (error) {
    console.error(error);
    process.exit(1);
} finally {
    await prisma.$disconnect();
}
