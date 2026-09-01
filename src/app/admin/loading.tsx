import AdminSkeleton from "@/components/admin/AdminSkeleton";

/**
 * 관리 화면 로딩 표시.
 *
 * 이 파일이 없으면 "관리" 를 눌러도 인증 왕복과 DB 조회가 끝날 때까지
 * 아무 반응이 없어서 눌렸는지조차 알 수 없다.
 */
export default function Loading() {
    return <AdminSkeleton />;
}
