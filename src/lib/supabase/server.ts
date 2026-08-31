import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * 서버용 Supabase 클라이언트. 요청마다 새로 만든다 (절대 재사용 금지).
 *
 * Server Component 에서는 쿠키를 쓸 수 없어 setAll 이 throw 하는데,
 * 세션 갱신은 미들웨어가 담당하므로 무시해도 된다.
 */
export async function createClient() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // Server Component 에서 호출된 경우. 미들웨어가 갱신을 처리한다.
                    }
                },
            },
        }
    );
}
