import { cache } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { jwksOption } from "@/lib/supabase/jwks";
import type { Profile } from "@/generated/prisma";

/**
 * 현재 로그인 사용자. React cache 로 요청당 1회만 조회한다.
 *
 * 서버에서는 항상 getUser() 를 쓴다. getSession() 은 쿠키만 읽고
 * JWT 서명을 검증하지 않아 위조된 세션을 통과시킨다.
 *
 * 여기를 getClaims() 로 바꾸지 않는다. 그쪽은 서명만 로컬로 확인하므로
 * 토큰을 원격 폐기해도 만료(기본 1시간) 전까지 통과한다.
 * 이 함수는 requireAdmin() 이 쓰는 실제 인가 경계라 Auth 서버에 물어봐야 한다.
 * 속도가 필요한 곳은 proxy 이고, 거기는 인가 결정을 하지 않아 이미 getClaims() 를 쓴다.
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

/**
 * 화면에 이름과 아바타를 그리기 위한 로그인 상태. **인가에 쓰지 않는다.**
 *
 * getProfile() 과 달리 Auth 서버에 묻지 않고 JWT 서명만 로컬에서 확인한다.
 * 왕복이 하나 줄어드는 대신 원격 폐기가 토큰 만료까지 늦게 반영된다.
 * 그 지연이 여기서 문제되지 않는 이유는, 이 값으로 할 수 있는 일이
 * "메뉴에 관리 링크가 보인다" 뿐이고 그 링크를 눌러 도달하는 /admin 은
 * requireAdmin() 이 getProfile() 로 다시 확인하기 때문이다.
 *
 * 역할은 반드시 DB 에서 읽는다. JWT 의 user_metadata 는 사용자가 쓸 수 있어
 * 거기서 관리자 여부를 도출하면 누구나 관리자가 된다.
 */
export const getDisplayProfile = cache(async (): Promise<Profile | null> => {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims(undefined, await jwksOption());

    const id = data?.claims?.sub;
    if (!id) return null;

    return prisma.profile.findUnique({ where: { id } });
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
