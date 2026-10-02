"use client";
import type { AiTask } from '@/lib/ai-task-records';
import { handoffsForTask, type HandoffView } from '@/lib/ai-handoffs';
import { taskTitle } from '@/lib/ai-task-records';
import type { Handoff } from '@/lib/ai-activity';
import { AiBadge } from './AiControls';
import { Fact } from './RecordFacts';
import manage from './AiManagement.module.css';
const labels = { requested: '인계 요청', dispatch_accepted: '전송 도구 입력 수락', sent: '전달 확인', received: '수신 확인', started: '처리 시작', blocked: '보류', completed: '처리 완료', failed: '처리 실패', cancelled: '취소' };
const reporters = { sender: '발신 측', recipient: '수신 측', transport: '전송 도구', user: '사용자' };
export default function HandoffTimeline({ task, handoffs, allTasks, onTask }: { task: AiTask; handoffs: HandoffView[]; allTasks: AiTask[]; onTask: (task: AiTask) => void }) {
    const records = handoffsForTask(task, handoffs);
    // 인계가 없으면 줄을 두지 않는다. 기록마다 같은 '없음·미수집' 안내가 반복되지 않게 한다
    if (!records.length) return null;
    function endpoint(e: Handoff['from'], handoffId: string) {
        const matches = allTasks.filter(t => t.project === e.project && (e.taskId !== null ? t.id === e.taskId : t.activity?.handoffs?.some(h => h.id === handoffId))); 
        const target = matches.length > 0 && !matches.some(t => t.conflict) && new Set(matches.map(t => JSON.stringify(t))).size === 1 ? matches[0] : null;
        return <span className={manage.handoffEnd}>{e.project}{target ? <button type="button" className={manage.handoffLink} onClick={() => onTask(target)}>{e.taskId === null ? "연결된 기록 · " : ""}{taskTitle(target)}</button> : <span className={manage.dateBasis}>{e.taskId ? '연결 작업을 확인할 수 없음' : '연결 작업 미상'}</span>}</span>;
    }
    const kst = (at: string) => new Date(Date.parse(at) + 9 * 3600_000).toISOString().slice(5, 16).replace('T', ' ');
    return <Fact label="프로젝트 간 인계">{records.map(h => {
        const received = h.events.some(e => e.kind === 'received');
        const terminal = h.events.some(e => ['completed', 'failed', 'cancelled'].includes(e.kind));
        // Date-only events and unknown times cannot establish an exact occurrence order.
        const timed = h.events.filter(e => e.precision === 'timestamp').sort((a, b) => Date.parse(a.at!) - Date.parse(b.at!));
        const other = h.events.filter(e => e.precision !== 'timestamp');
        const evidence = h.events.flatMap(e => e.evidence.map(v => ({ ...v, event: labels[e.kind] })));
        // 이벤트 한 건 = 한 줄(무엇 · 언제 · 누가 · 요약). 결과가 있으면 그 아래 작게. 근거는 인계 끝에 한 번만 모은다
        return <article key={h.id} className={manage.handoff}>
            <div className={manage.handoffState}><strong>{h.headers.some(x => x.from.project === task.project && (x.from.taskId === null || x.from.taskId === task.id)) ? '보낸 인계' : '받은 인계'}</strong><AiBadge data-tone={h.conflict ? 'danger' : 'neutral'}>{h.conflict ? '기록 충돌 · 상태 확정 불가' : !received ? '수신 미확인' : !terminal ? '결과 대기' : '결과 기록 있음'}</AiBadge></div>
            {h.headers.map((header, i) => <div key={i} className={manage.handoffHeader}><div className={manage.handoffRoute}>{endpoint(header.from, h.id)}<span className={manage.handoffTo}><span aria-label="전달 방향" className={manage.handoffArrow}>→</span>{endpoint(header.to, h.id)}</span></div><small>{header.request}</small></div>)}
            {h.conflict && <small className={manage.factSub}>서로 다른 기록을 모두 표시합니다. 최신 기록을 임의로 정답으로 선택하지 않았습니다.</small>}
            {[{ title: null, events: timed }, { title: '날짜만 확인되거나 시각 미상 · 발생 순서 미확정', events: other }].filter(g => g.events.length).map((g, gi) => <div key={gi}>{g.title && <small className={manage.factSub}>{g.title}</small>}<ol className={manage.handoffEvents}>{g.events.map((e, i) => <li key={`${e.id}-${i}`}>
                <span className={manage.eventHead}><strong>{labels[e.kind]}</strong><span>{e.at ? kst(e.at) : e.occurredOn?.slice(5) ?? '시각 미상'} · {reporters[e.reportedBy]}</span></span>
                <span>{e.summary}</span>
                {e.kind === 'dispatch_accepted' && <small>입력 수락만 확인됐으며 상대의 수신·착수는 별도 확인이 필요합니다.</small>}
                {e.result && <small>결과 · {e.result.summary}{e.result.verification && ` / 검증 · ${e.result.verification}`}{e.result.artifacts.length > 0 && ` / 산출물 · ${e.result.artifacts.join(', ')}`}</small>}
            </li>)}</ol></div>)}
            <details><summary>근거 {evidence.length}개 · 인계 식별자</summary><ul className={manage.factList}>{evidence.map((v, n) => <li key={n}><small>{v.event}</small> {v.reference}{v.note && <small>{v.note}</small>}</li>)}</ul><small className={manage.factSub}>인계 식별자 · {h.id}</small></details>
        </article>;
    })}</Fact>;
}
