import { EditorWrapper } from "@/components/admin/PostEditor.styled";
import { Skeleton } from "@/components/admin/Admin.styled";

/**
 * 에디터 로딩 표시.
 *
 * 새 글 / 수정 모두 force-dynamic 이라 태그 목록(과 수정이면 본문)을
 * 받아오기 전까지 화면이 비어 있었다. 실제 배치와 같은 자리를 먼저 그린다.
 */
export default function Loading() {
    return (
        <EditorWrapper>
            <div className="editor-head">
                <Skeleton style={{ width: "7rem", height: "1.6rem" }} />
                <div className="actions">
                    <Skeleton style={{ width: "3.5rem", height: "2.2rem" }} />
                    <Skeleton style={{ width: "5rem", height: "2.2rem" }} />
                    <Skeleton style={{ width: "3.5rem", height: "2.2rem" }} />
                </div>
            </div>

            <div style={{ display: "grid", gap: "1.25rem" }}>
                <Skeleton style={{ height: "15.5rem" }} />
                <Skeleton style={{ height: "22rem" }} />
            </div>
        </EditorWrapper>
    );
}
