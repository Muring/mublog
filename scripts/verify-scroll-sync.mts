import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
const frames: Array<() => void> = [];
let cleanup: (() => void) | undefined;
type Anchor = { src: number; pv: number };
type HookExports = {
 useScrollSync: (source: { current: Pane }, preview: { current: Pane }, content: { current: { querySelectorAll: () => never[] } }, html: string) => void;
 buildAnchors: (source: number[], preview: number[], sourceMax: number, previewMax: number) => Anchor[];
 project: (anchors: Anchor[], value: number, from: keyof Anchor) => number;
};
const moduleObject = { exports: {} as HookExports };
const code = ts.transpileModule(fs.readFileSync(process.env.SCROLL_SOURCE || 'src/components/admin/useScrollSync.ts', 'utf8') + '\nexport { buildAnchors, project };', { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
vm.runInNewContext(code, {
 exports: moduleObject.exports,
 require: () => ({ useEffect: (fn: () => () => void) => { cleanup = fn(); } }),
 requestAnimationFrame: (fn: () => void) => frames.push(fn),
 ResizeObserver: class { observe() {} disconnect() {} },
});
// 브라우저의 좌표 반올림과 scroll 이벤트의 지연 전달을 분리해서 재현한다.
class Pane {
 scrollHeight: number;
 clientHeight = 100;
 value = "";
 writes = 0;
 top = 0;
 events = new Map<string, () => void>();
 constructor(max: number) { this.scrollHeight = max + 100; this.clientHeight = 100; this.scrollTop = 0; this.value = ''; this.writes = 0; this.events = new Map(); }
 addEventListener(name: string, fn: () => void) { this.events.set(name, fn); }
 removeEventListener(name: string) { this.events.delete(name); }
 getBoundingClientRect() { return { top: 0 }; }
 get scrollTop() { return this.top || 0; }
 set scrollTop(top: number) { this.writes++; this.top = Math.round(top); }
 scrollTo({ top }: { top: number }) { this.scrollTop = top; }
 emit() { this.events.get('scroll')?.(); }
}
const { useScrollSync: mountSync, buildAnchors, project } = moduleObject.exports;
const src = new Pane(1000), pv = new Pane(1700);
mountSync({current:src}, {current:pv}, {current:{ querySelectorAll: () => [] }}, '');
pv.scrollTop = 111; pv.emit();
assert.equal(src.scrollTop, 65);
frames.splice(0).forEach(fn => fn());
pv.writes = 0;
src.emit();
assert.equal(pv.writes, 0, 'Delayed follower event must not move the driving pane');
assert.equal(pv.scrollTop, 111, 'Rounded inverse projection must not cause jitter');
pv.scrollTop = 222; pv.emit();
pv.scrollTop = 333; pv.emit();
assert.equal(src.scrollTop, 196, 'Consecutive driver events must not be dropped');
src.scrollTop = 400; src.emit();
assert.equal(pv.scrollTop, 680, 'User can immediately switch driving panes');
pv.emit();
assert.equal(src.scrollTop, 400);
pv.scrollTop = 1700; pv.emit();
assert.equal(src.scrollTop, 1000);
const anchors = buildAnchors([200, 1100], [300, 1000], 1000, 1700);
assert.equal(project(anchors, 1700, 'pv'), 1000);
assert.equal(project(anchors, 1000, 'src'), 1700, 'Headings below a scroll endpoint must not truncate mapping');
cleanup?.();
assert.equal(src.events.size + pv.events.size, 0);
console.log('PASS: delayed feedback, rounding, consecutive input, direction switch, endpoints, cleanup');
