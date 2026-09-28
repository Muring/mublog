import AdminSkeleton from "@/components/admin/AdminSkeleton";

/**
 * 관리 화면 로딩 표시.
 *
 * 이 파일이 없으면 "관리" 를 눌러도 인증 왕복과 DB 조회가 끝날 때까지
 * 아무 반응이 없어서 눌렸는지조차 알 수 없다.
 *
 * (posts) 그룹 안에 두는 건 loading 이 같은 폴더의 하위 경로까지 감싸기 때문이다.
 * (management) 에 두면 /admin/comments 를 바로 열 때 포스트 스켈레톤이 먼저 흘러나간다.
 */
export default function Loading() {
    return <AdminSkeleton />;
}
