import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fixtures from './fixtures/ai-task-activity.json';
import shared from './fixtures/ai-knowledge-reviews.json';
import { activitySchema } from '../src/lib/ai-activity';
import { canonicalJson, currentSource, knowledgeReviewSchema, reviewHistory, sha256Hex, sourceDigest, type KnowledgeReview } from '../src/lib/ai-knowledge-review';
import { emptyTotals, ingestSchema, publicYear, type UsageYear } from '../src/lib/ai-usage';

// 동기 SHA-256 은 node:crypto 와, canonical JSON 은 Python json.dumps(sort_keys, separators, ensure_ascii=False) 와 같은 바이트여야 한다
for (const s of ['', 'abc', '한글 · 판단', 'x'.repeat(1000), ' "\\\n\t😀']) assert.equal(sha256Hex(s), createHash('sha256').update(s, 'utf8').digest('hex'));
const sample = { z: [3, { b: null, a: '한글"\n' }], a: true, m: { y: [], x: 'ㄱ' } };
assert.equal(canonicalJson(sample), '{"a":true,"m":{"x":"ㄱ","y":[]},"z":[3,{"a":"한글\\"\\n","b":null}]}');
try {
    const py = execFileSync('python3', ['-c', 'import json,sys;print(json.dumps(json.loads(sys.stdin.read()),sort_keys=True,separators=(",",":"),ensure_ascii=False),end="")'], { input: JSON.stringify(sample) }).toString();
    assert.equal(canonicalJson(sample), py);
} catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }

const activity = activitySchema.parse(fixtures.find(f => f.name === 'knowledge_applied')!.activity);
const project = 'muring/mublog', taskId = 'review-task';
const source = currentSource(activity);
const doc = activity.knowledgeDecisions![0];
const base = { schemaVersion: 1 as const, id: 'a'.repeat(32), project, taskId, reviewedAt: '2026-10-02T13:00:00+09:00', source, sourceDigest: sourceDigest(project, taskId, source) };
const row = (state: string, extra: object = {}) => ({ project, task: taskId, document: doc.document, decision: doc.decision, reason: doc.reason, searchLink: 'linked', state, ...extra });
const completed = (rows: object[], recordingRequested = false) => ({ ...base, status: 'completed', result: { schemaVersion: 1, visibility: 'private', rows, recordingRequested, inferredApplications: 0 }, error: null });
const ok = (v: unknown) => knowledgeReviewSchema.safeParse(v).success;

assert.ok(ok(completed([row('matched')])));
assert.ok(ok(completed([row('missing_application_record')])));
assert.ok(ok(completed([row('recorded', { applicationEvent: 'usage/events/x.json' })], true)));
assert.ok(ok({ ...base, status: 'failed', result: null, error: 'KB knowledge-review failed' }));
assert.ok(ok({ ...base, status: 'unavailable', result: null, error: 'KB knowledge-review CLI is unavailable' }));
// 형식이 맞아도 의미가 어긋나면 받지 않는다
assert.equal(ok({ ...completed([row('matched')]), sourceDigest: 'b'.repeat(64) }), false, 'digest');
assert.equal(ok(completed([row('not_applied')])), false, 'applied decision cannot be not_applied');
assert.equal(ok(completed([row('decision_unknown')])), false, 'known decision cannot be decision_unknown');
assert.equal(ok(completed([row('matched', { detail: 'x' })])), false, 'detail only for not_recordable');
assert.equal(ok(completed([row('matched', { applicationEvent: 'p' })])), false, 'event only after recording');
assert.equal(ok(completed([row('recorded')], true)), false, 'recorded needs its event');
assert.equal(ok(completed([row('matched', { reason: 'different' })])), false, 'row decision must equal source');
assert.equal(ok(completed([row('matched'), row('matched')])), false, 'duplicate document');
assert.equal(ok(completed([])), false, 'every decision needs a row');
assert.equal(ok(completed([row('search_unavailable')])), false, 'search state must match link');
assert.equal(ok(completed([row('matched', { task: 'other' })])), false, 'row identity');
assert.equal(ok({ ...base, status: 'failed', result: completed([row('matched')]).result, error: 'x' }), false, 'failed has no result');
assert.equal(ok({ ...completed([row('matched')]), extra: 1 }), false, 'unknown key');
// 판단이 없는 작업은 uncollected 한 줄
const none = currentSource(undefined);
const noneBase = { ...base, source: none, sourceDigest: sourceDigest(project, taskId, none) };
assert.deepEqual(none, { knowledgeDecisionsPresent: false, knowledgeDecisions: null, knowledge: null, evidence: [] });
assert.ok(ok({ ...noneBase, status: 'completed', result: { schemaVersion: 1, visibility: 'private', rows: [{ project, task: taskId, document: null, state: 'uncollected' }], recordingRequested: false, inferredApplications: 0 }, error: null }));
assert.equal(ok({ ...noneBase, status: 'completed', result: { schemaVersion: 1, visibility: 'private', rows: [], recordingRequested: false, inferredApplications: 0 }, error: null }), false, 'absent decisions are uncollected');

// 이력: 최신 순, 모든 시도를 보존. 판단이 바뀌면 이전 원본의 대조로 표시하고 상태는 그대로 둔다
const older = knowledgeReviewSchema.parse(completed([row('matched')]));
const newer = knowledgeReviewSchema.parse({ ...base, id: 'c'.repeat(32), reviewedAt: '2026-10-02T14:00:00+09:00', status: 'failed', result: null, error: 'KB knowledge-review failed' });
const history = reviewHistory([older, newer], activity, project, taskId);
assert.deepEqual(history.map(h => [h.review.status, h.sameSource]), [['failed', true], ['completed', true]]);
const changed = structuredClone(activity); changed.knowledgeDecisions![0].reason = '판단 이유를 고쳤다';
assert.deepEqual(reviewHistory([older], changed, project, taskId).map(h => [h.review.status, h.sameSource, h.review.result!.rows[0].state]), [['completed', false, 'matched']]);

// 수신: private 작업에만 붙고 공개 투영에는 실리지 않는다
const totals = emptyTotals();
const task = { id: taskId, project, type: 'feature', status: 'completed', verification: [], rework: null, conflict: false, totals, activity, knowledgeReviews: [older, newer] };
const year: UsageYear = { year: 2026, weeks: [], devices: [], tasks: [task as UsageYear['tasks'][number]], quality: { problems: [], fallback_identities: 0, task_conflicts: 0, ambiguous_task_responses: 0, comparison: 'withheld' }, fieldObservations: {} };
const envelope = { schema: 1, metrics: 'usage-v1', sequence: 1, sourceRevision: 'a'.repeat(40), generatedAt: '2026-10-02T00:00:00Z', years: [year], improvements: [] };
assert.ok(ingestSchema.safeParse(envelope).success);
assert.equal(ingestSchema.safeParse({ ...envelope, years: [{ ...year, tasks: [{ ...task, knowledgeReviews: [{ ...older, taskId: 'other' }] }] }] }).success, false, 'review identity');
assert.equal(ingestSchema.safeParse({ ...envelope, years: [{ ...year, tasks: [{ ...task, knowledgeReviews: [older, older] }] }] }).success, false, 'duplicate attempt id');
assert.equal(ingestSchema.safeParse({ ...envelope, years: [{ ...year, tasks: [{ ...task, knowledgeReviews: null }] }] }).success, false, 'null is not allowed');
const projected = JSON.stringify(publicYear(year));
for (const leak of ['knowledgeReviews', 'sourceDigest', doc.document, 'review-task']) assert.equal(projected.includes(leak), false, leak);
// dev-bootstrap 공용 전송 fixture(tests/fixtures/knowledge-reviews.json 사본)와 같은 판정이어야 한다
type Case = { name: string; valid: boolean; task: { id: string; project: string; activity?: unknown }; review: KnowledgeReview };
for (const c of shared as unknown as Case[]) {
    const accepted = knowledgeReviewSchema.safeParse(c.review).success && c.review.project === c.task.project && c.review.taskId === c.task.id;
    assert.equal(accepted, c.valid, c.name);
}
const stale = (shared as unknown as Case[]).find(c => c.name === 'stale_source_preserved')!;
const staleActivity = activitySchema.parse(stale.task.activity);
assert.deepEqual(reviewHistory([knowledgeReviewSchema.parse(stale.review)], staleActivity, stale.task.project, stale.task.id).map(h => [h.sameSource, h.review.status]), [[false, stale.review.status]], 'stale review is kept and marked as an earlier source');
// 원본 일치 표시는 '지금 activity 로 만든 source' 와 대조 당시 source 가 같은 바이트일 때만 참이다
for (const c of (shared as unknown as Case[]).filter(c => c.valid && c.task.activity)) {
    const current = activitySchema.parse(c.task.activity);
    assert.equal(reviewHistory([c.review], current, c.task.project, c.task.id)[0].sameSource, canonicalJson(currentSource(current)) === canonicalJson(c.review.source), c.name);
}
console.log(`Shared delivery fixtures: ${shared.length} cases match dev-bootstrap expectations; stale source preserved`);
console.log('Knowledge review delivery: digest/canonical parity, 13 semantic rejections, history order/source match, private-only projection passed');
