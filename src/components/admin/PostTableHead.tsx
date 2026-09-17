import { Skeleton } from "./Admin.styled";

/** 로딩 표와 실제 목록이 같은 열 순서와 폭 규칙을 사용한다. */
export default function PostTableHead({ loading = false }: { loading?: boolean }) {
    return (
        <thead>
            <tr>
                {["제목", "상태", "태그", "발행일", "수정일", "누적 조회", "댓글", ""].map((label, index) => (
                    <th key={index}>{loading && label ? <Skeleton style={{ display: "inline-block", width: `${label.length}em`, maxWidth: "100%", height: ".8em", verticalAlign: "middle", backgroundColor: "var(--bordercolor)" }} /> : label}</th>
                ))}
            </tr>
        </thead>
    );
}
