import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * 로그아웃. POST 전용이다.
 * GET 으로 열어두면 <img src="/auth/signout"> 한 줄로 남을 로그아웃시킬 수 있다.
 */
export async function POST(request: NextRequest) {
    const supabase = await createClient();
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
