import { createBrowserClient } from "@supabase/ssr";

/** 브라우저용 Supabase 클라이언트. 로그인 버튼 등 client 컴포넌트에서 쓴다. */
export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );
}
