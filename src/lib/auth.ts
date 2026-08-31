import { cache } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { Profile } from "@/generated/prisma";

/**
 * 현재 로그인 사용자. React cache 로 요청당 1회만 조회한다.
 *
 * 서버에서는 항상 getUser() 를 쓴다. getSession() 은 쿠키만 읽고
 * JWT 서명을 검증하지 않아 위조된 세션을 통과시킨다.
 */
export const getUser = cache(async () => {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    return user;
});

/** 현재 사용자의 profiles 행 (역할 포함) */
export const getProfile = cache(async (): Promise<Profile | null> => {
    const user = await getUser();
    if (!user) return null;
    return prisma.profile.findUnique({ where: { id: user.id } });
});

export async function isAdmin(): Promise<boolean> {
    const profile = await getProfile();
    return profile?.role === "ADMIN";
}

/**
 * 관리자 전용 페이지 가드.
 *
 * 403 이 아니라 404 를 반환한다. 저장소가 public 이므로
 * /admin 이 존재한다는 사실 자체를 알려주지 않는다.
 */
export async function requireAdmin(): Promise<Profile> {
    const profile = await getProfile();
    if (profile?.role !== "ADMIN") notFound();
    return profile;
}

/** API 라우트용. 인가 실패를 404 로 응답하기 위한 에러 */
export class HttpError extends Error {
    constructor(
        readonly status: number,
        message: string
    ) {
        super(message);
        this.name = "HttpError";
    }
}

export async function requireAdminApi(): Promise<Profile> {
    const profile = await getProfile();
    if (profile?.role !== "ADMIN") throw new HttpError(404, "Not Found");
    return profile;
}

/** 로그인만 요구 (댓글 작성 등) */
export async function requireUserApi(): Promise<Profile> {
    const profile = await getProfile();
    if (!profile) throw new HttpError(401, "로그인이 필요합니다.");
    return profile;
}
