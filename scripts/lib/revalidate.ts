/**
 * 배포본 캐시 무효화. DB 를 직접 고치는 스크립트들이 끝에 부른다.
 * NEXT_PUBLIC_SITE_URL 과 CRON_SECRET 을 읽는다(.env 는 부르는 쪽이 로드한다). 비밀값은 출력하지 않는다.
 */
export async function revalidateDeployment(): Promise<boolean> {
    const site = process.env.NEXT_PUBLIC_SITE_URL;
    const secret = process.env.CRON_SECRET;
    if (!site || !secret) {
        console.log("캐시 무효화 건너뜀: NEXT_PUBLIC_SITE_URL 또는 CRON_SECRET 이 없습니다.");
        return false;
    }
    try {
        const response = await fetch(`${site}/api/admin/revalidate`, {
            method: "POST",
            headers: { authorization: `Bearer ${secret}` },
        });
        if (!response.ok) {
            console.log(`캐시 무효화 실패: ${response.status}. 최대 1시간 뒤 스스로 갱신됩니다.`);
            return false;
        }
        console.log(`배포본 캐시를 지웠습니다. (${site})`);
        return true;
    } catch (error) {
        console.log(`캐시 무효화 실패: ${error instanceof Error ? error.message : error}`);
        return false;
    }
}

