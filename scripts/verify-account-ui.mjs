import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

// Execute the shipped browser script, including its real click handlers.
class Element extends EventTarget {
  children = [];
  dataset = {};
  hidden = false;
  textContent = '';
  attrs = {};
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; }
  setAttribute(key, value) { this.attrs[key] = value; }
  remove() { this.removed = true; }
  querySelectorAll(tag) {
    return this.children.flatMap(child => [
      ...(child.tagName === tag ? [child] : []), ...child.querySelectorAll(tag),
    ]);
  }
}
class CustomEvent extends Event {
  constructor(type, options = {}) { super(type, options); this.detail = options.detail; }
}
const source = readFileSync(new URL('../public/account-settings.js', import.meta.url), 'utf8');
async function fixture({ enabled = true, failed = false, saveFailed = false } = {}) {
  const root = new Element(), providers = new Element(), review = new Element();
  root.dataset.layout = 'providers';
  review.hidden = true;
  root.append(providers, review);
  root.querySelector = selector => ({ '[data-providers]': providers, '[data-review]': review })[selector] ?? null;
  const document = new EventTarget();
  document.body = new Element();
  document.querySelector = () => root;
  document.contains = () => true;
  document.createElement = tag => Object.assign(new Element(), { tagName: tag });
  const window = new EventTarget(), timers = new Map();
  let timerId = 0;
  window.setTimeout = fn => { timers.set(++timerId, fn); return timerId; };
  window.clearTimeout = id => timers.delete(id);
  if (saveFailed) window.addEventListener('accounts:before-connect', event => {
    event.detail.waitUntil(Promise.reject(new Error('save_failed')));
  });
  const calls = [], redirects = [];
  runInNewContext(source, {
    document, window, Event, CustomEvent, URLSearchParams,
    location: { search: '', assign: url => redirects.push(url) },
    fetch: async (url, init) => {
      calls.push({ url, init });
      if (url.endsWith('status')) return Response.json({ enabled, account: { providers: [{ provider: 'google' }] } });
      assert.equal(url, '/api/accounts?op=start');
      return failed ? Response.json({ error: 'service_unavailable' }, { status: 503 }) : Response.json({ url: 'https://auth.example/authorize' });
    },
  });
  const settle = () => new Promise(resolve => setImmediate(resolve));
  await settle();
  const connect = providers.querySelectorAll('button')[0];
  assert.equal(connect.textContent, '연동하기');
  connect.dispatchEvent(new Event('click'));
  await settle();
  const toast = document.body.children[0];
  assert.equal(toast.className, 'account-toast');
  assert.equal(root.children.includes(toast), false, 'toast must be outside account panel');
  assert.equal(root.innerHTML.includes('data-message'), false, 'no inline message slot');
  assert.equal(connect.disabled, false);
  return { calls, redirects, toast, timers };
}
const success = await fixture();
assert.deepEqual(success.redirects, ['https://auth.example/authorize']);
assert.deepEqual(JSON.parse(success.calls[1].init.body), { provider: 'github' });
assert.equal(success.calls[1].init.method, 'POST');
assert.equal(success.toast.hidden, true);
const disabled = await fixture({ enabled: false });
assert.equal(disabled.calls.length, 1);
assert.match(disabled.toast.textContent, /준비 중/);
const failed = await fixture({ failed: true });
assert.equal(failed.redirects.length, 0);
assert.equal(failed.toast.hidden, false);
assert.match(failed.toast.textContent, /계정 서비스에 연결하지 못했어요/);
assert.equal(failed.toast.attrs.role, 'status');
for (const timeout of failed.timers.values()) timeout();
assert.equal(failed.toast.hidden, true, 'toast dismisses automatically');
const saveFailed = await fixture({ saveFailed: true });
assert.equal(saveFailed.calls.length, 1, 'failed game save prevents OAuth start');
assert.match(saveFailed.toast.textContent, /게임 진행을 저장하지 못했어요/);
console.log('PASS account UI: connect click reaches OAuth, disabled gate, save failure, service-error toast and dismissal');
