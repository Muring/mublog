import RelatedContent from "@/components/RelatedContent/RelatedContent";
import type { ReactNode } from "react";

export default function PostLayout({ children }: { children: ReactNode }) {
    return (
        <div>
            {children}
            <RelatedContent />
        </div>
    );
}
