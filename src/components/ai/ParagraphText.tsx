import { Fragment } from "react";
import styles from "./AiDashboard.module.css";

/** Blank lines start paragraphs. Sentences share a line while they fit and wrap as a unit when they don't. */
export default function ParagraphText({ children }: { children: string }) {
    const segmenter = new Intl.Segmenter("ko", { granularity: "sentence" });
    return children.trim().split(/\n\s*\n/).map((paragraph, index) =>
        <span className={styles.paragraph} key={index}>
            {Array.from(segmenter.segment(paragraph.replace(/\s+/g, " ")), ({ segment }, sentence) =>
                <Fragment key={sentence}>{sentence > 0 && " "}<span className={styles.sentence}>{segment.trim()}</span></Fragment>,
            )}
        </span>,
    );
}
