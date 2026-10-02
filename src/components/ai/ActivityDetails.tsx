import type { Activity } from '@/lib/ai-activity';
import type { KnowledgeReview } from '@/lib/ai-knowledge-review';
import { AiBadge } from './AiControls';
import KnowledgeDecisions from './KnowledgeDecisions';
import { Checks, Fact, Lines, TagList } from './RecordFacts';
import manage from './AiManagement.module.css';

const FOLLOW_UPS = { pending: '대기', delegated: '위임', done: '완료', unknown: '미상' } as const;

/** activity 의 이름·값 줄들. 목적은 상세 맨 위 한 줄로, 근거 목록은 맨 끝 '원본 기록과 근거'로 옮겨 여기서는 다루지 않는다 */
export default function ActivityDetails({ activity: a, showPurpose, skipFirstOutcome = false, reviews, project, taskId }: { activity: Activity; showPurpose: boolean; skipFirstOutcome?: boolean; reviews?: KnowledgeReview[]; project: string; taskId: string }) {
    // 첫 결과가 상세 맨 위 요약으로 올라갔으면 '결과' 줄에는 나머지만 둔다. 나머지가 없으면 줄을 두지 않는다
    const outcomes = skipFirstOutcome ? a.outcomes?.slice(1) : a.outcomes;
    return <>
        {showPurpose && a.purpose && <Fact label="목적">{a.purpose}</Fact>}
        {a.actions !== null && <Fact label="한 일"><Lines items={a.actions} /></Fact>}
        {a.aiRole !== null && <Fact label="AI 역할">{a.aiRole ? <>{!!a.aiRole.tools?.length && <span className={manage.factTags}>{a.aiRole.tools.map(t => <AiBadge key={t} data-tone="neutral">{t}</AiBadge>)}</span>}<Lines items={a.aiRole.contributions} /></> : <span className={manage.factEmpty}>미수집</span>}</Fact>}
        {a.humanRole !== null && <Fact label="사람의 판단">{a.humanRole ? <>
            <Lines items={a.humanRole.decisions} empty="기록된 판단 없음" />
            {a.humanRole.corrections.length > 0 && <><small className={manage.factSub}>수정</small><Lines items={a.humanRole.corrections} /></>}
        </> : <span className={manage.factEmpty}>미수집</span>}</Fact>}
        {a.outcomes !== null && !(skipFirstOutcome && !outcomes?.length) && <Fact label="결과"><Lines items={outcomes?.map(o => <>{o.summary}{o.artifact && <small><code className={manage.factCode}>{o.artifact}</code></small>}</>)} /></Fact>}
        {a.verification !== null && <Fact label="검증">{a.verification ? <>
            <Checks checks={a.verification.checks.map(c => ({ name: c.name, result: c.result, detail: [c.method, c.limitation] }))} />
            {!!a.verification.unverified?.length && <small className={manage.factSub}>확인하지 못한 범위 · {a.verification.unverified.join(' · ')}</small>}
        </> : <span className={manage.factEmpty}>미수집</span>}</Fact>}
        {a.followUps !== null && <Fact label="남은 일"><TagList items={a.followUps?.map(f => ({ badge: <AiBadge data-tone="neutral">{FOLLOW_UPS[f.status]}</AiBadge>, body: f.summary }))} /></Fact>}
        {!!a.knowledge?.length && <Fact label="연결된 지식"><TagList items={a.knowledge.map(k => ({ badge: <AiBadge data-tone={k.usage === 'applied' ? 'ok' : 'neutral'}>{k.usage === 'applied' ? '적용' : '참고'}</AiBadge>, body: <><code className={manage.factCode}>{k.document}</code>{k.note && <small>{k.note}</small>}</> }))} /></Fact>}
        <KnowledgeDecisions activity={a} reviews={reviews} project={project} taskId={taskId} />
        {!!a.effects?.length && <Fact label="효과"><TagList items={a.effects.map(e => ({ badge: <AiBadge data-tone="neutral">{e.kind === 'measured' ? '측정' : '사용자 확인'}</AiBadge>, body: <><strong>{e.metric}</strong>{e.before !== null && ` ${e.before} → ${e.after}${e.unit ? ` ${e.unit}` : ''}`}<small>{e.method}</small></> }))} /></Fact>}
    </>;
}
