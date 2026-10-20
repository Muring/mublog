
/** Keep the editor's plain-text title while sharing the portfolio's accent. */
export default function AiIntroTitle({ title }: { title: string }) {
    return title.split(/(AI|개선|기록)/g).map((part, index) =>
        /^(AI|개선|기록)$/.test(part)
            ? <span className="ai-highlight" key={index}>{part}</span>
            : part,
    );
}
