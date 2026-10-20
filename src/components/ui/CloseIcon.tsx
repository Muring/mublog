import { strokeIcon } from "@/components/ui/icon";

/** 닫기(×) 아이콘. 글자 ×·✕ 는 글꼴마다 굵기·높이가 달라 선 두 개로 그린다. */
export default function CloseIcon({ size = 20, strokeWidth = 1.5 }: { size?: number; strokeWidth?: number }) {
    return (
        <svg {...strokeIcon(size, strokeWidth)} focusable="false">
            <path d="m6 6 12 12M18 6 6 18" />
        </svg>
    );
}
