import styles from "./AiDashboard.module.css";

/** Prefer sentence boundaries; narrow screens may still wrap within a sentence. */
export default function SentenceText({ children }: { children: string }) {
    const segmenter = new Intl.Segmenter("ko", { granularity: "sentence" });
    return children.trim().split(/\n\s*\n/).map((paragraph, index) =>
        <span className={styles.sentences} key={index}>
            {Array.from(segmenter.segment(paragraph.replace(/\s+/g, " ")), ({ segment }, sentence) =>
                <span className={styles.sentence} key={sentence}>{segment.trim()}</span>,
            )}
        </span>,
    );
}
