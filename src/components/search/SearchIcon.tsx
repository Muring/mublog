import { strokeIcon } from "@/components/ui/icon";

export default function SearchIcon({ size = 20 }: { size?: number }) {
    return (
        <svg {...strokeIcon(size)} focusable="false">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
        </svg>
    );
}
