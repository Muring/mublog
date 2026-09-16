/**
 * 배포본의 캐시를 지운다.
 *
 *   yarn revalidate
 *
 * DB 를 스크립트로 직접 고친 뒤에 부른다. draft:post 와 migrate:posts 는 끝에 스스로 부른다.
 */
import { loadEnvFile } from "node:process";
import { revalidateDeployment } from "./lib/revalidate";

try {
    loadEnvFile(".env");
} catch {
    // 플랫폼이 환경변수를 직접 주입하는 경우
}

await revalidateDeployment();
