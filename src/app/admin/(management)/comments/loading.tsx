import { Skeleton } from "@/components/admin/Admin.styled";

/** 댓글 관리 로딩 표시. 머리와 항목 여섯 줄 자리를 먼저 그린다. */
export default function Loading() {
    return (
        <div aria-hidden>
            <Skeleton style={{ width: "9rem", height: "0.9rem", marginBottom: "1.25rem" }} />
            <div style={{ display: "grid", gap: "1.25rem" }}>
                {Array.from({ length: 6 }, (_, i) => (
                    <div key={i} style={{ display: "flex", gap: "0.75rem" }}>
                        <Skeleton style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                            <Skeleton style={{ width: "30%", height: "0.85rem" }} />
                            <Skeleton style={{ width: "80%", height: "0.85rem", marginTop: "0.5rem" }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
