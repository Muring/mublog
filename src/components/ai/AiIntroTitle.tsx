import styles from "./AiDashboard.module.css";

/** Keep the editor's plain-text title while sharing the portfolio's accent. */
export default function AiIntroTitle({ title }: { title: string }) {
    return title.split(/(AI|개선|기록)/g).map((part, index) =>
        /^(AI|개선|기록)$/.test(part)
            ? <span className={styles.highlight} key={index}>{part}</span>
            : part,
    );
}
