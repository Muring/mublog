/* Shared account-settings protocol UI. All personal text uses textContent. */
(() => {
  let cleanup = () => {};
  const messages = {
    login_required: "먼저 이 앱에 로그인해 주세요.",
    linking_disabled: "계정 연동을 준비 중이에요.",
    service_unavailable:
      "계정 서비스에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.",
    start_as_admin: "관리자 계정으로 로그인한 뒤 연동을 시작해 주세요.",
    provider_conflict: "같은 종류의 계정은 하나만 연결할 수 있어요.",
    provider_connected: "이미 연결된 로그인 방식이에요.",
    connection_expired:
      "연동 시간이 지났거나 로그인 상태가 바뀌었어요. 다시 시작해 주세요.",
    preview_changed:
      "진행이 바뀌었어요. 새 내용을 확인한 뒤 다시 선택해 주세요.",
    record_schema_requires_upgrade:
      "게임 기록 호환 작업이 필요해요. 기존 계정은 그대로 사용할 수 있어요.",
    save_choice_required: "남길 불멍 저장을 선택해 주세요.",
    too_many_attempts: "연동 시도가 많아요. 10분 뒤 다시 시도해 주세요.",
    oauth_failed: "두 번째 계정을 인증하지 못했어요. 다시 시도해 주세요.",
    save_failed: "게임 진행을 저장하지 못했어요. 연결 상태를 확인한 뒤 다시 시도해 주세요.",
    invalid_origin: "현재 주소에서는 연동을 시작할 수 없어요. 서비스 주소를 확인해 주세요.",
    cancelled: "연동을 취소했어요. 기존 계정은 바뀌지 않았어요.",
  };
  function mount() {
    const root = document.querySelector("[data-account-settings]");
    if (!root || root.dataset.mounted) return;
    root.dataset.mounted = "true";
    cleanup();
    const onlyProviders = root.dataset.layout === "providers";
    root.innerHTML =
      (onlyProviders
        ? ""
        : '<div class="account-inline-head"><span class="account-inline-avatar" data-avatar aria-hidden="true">♙</span><strong data-name>계정</strong><div class="account-providers" data-providers></div></div>') +
      (onlyProviders
        ? '<div class="account-providers" data-providers></div>'
        : '<p class="account-connection" data-connection>연결 상태 · 확인 중</p>') +
      '<section class="account-review" data-review hidden></section>';
    const name = root.querySelector("[data-name]"),
      providers = root.querySelector("[data-providers]"),
      review = root.querySelector("[data-review]");
    const message = document.createElement("div");
    message.className = "account-toast";
    message.setAttribute("role", "status");
    message.setAttribute("aria-live", "polite");
    message.setAttribute("aria-atomic", "true");
    message.hidden = true;
    document.body.append(message);
    let toastTimer;
    const showMessage = (value) => {
      window.clearTimeout(toastTimer);
      message.textContent = value;
      message.hidden = !value;
      if (value) toastTimer = window.setTimeout(() => { message.hidden = true; }, 5000);
    };
    let busy = false,
      preview = null,
      pendingRefresh = false;
    const text = (tag, value, cls) => {
      const el = document.createElement(tag);
      el.textContent = value;
      if (cls) el.className = cls;
      return el;
    };
    const button = (label, fn) => {
      const el = text("button", label);
      el.type = "button";
      el.addEventListener("click", () => run(fn));
      return el;
    };
    const setBusy = (value) => {
      busy = value;
      root.setAttribute("aria-busy", String(value));
      root.querySelectorAll("button").forEach((b) => (b.disabled = value));
    };
    async function request(op, body) {
      const r = await fetch("/api/accounts?op=" + op, {
        method: body === undefined ? "GET" : "POST",
        credentials: "same-origin",
        cache: "no-store",
        ...(body === undefined
          ? {}
          : {
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "service_unavailable");
      return data;
    }
    async function run(fn) {
      if (busy) return;
      setBusy(true);
      showMessage("");
      try {
        await fn();
      } catch (e) {
        showMessage(
          messages[e.message] || "처리하지 못했어요. 다시 시도해 주세요.",
        );
        if (e.message === "preview_changed") {
          await loadPreview().catch(() => {});
          showMessage(messages.preview_changed);
        }
      } finally {
        setBusy(false);
        if (pendingRefresh) {
          pendingRefresh = false;
          void run(refresh);
        }
      }
    }
    async function refresh() {
      // Game session endpoints refresh their existing HttpOnly access cookies.

      const data = await request("status");
      providers.replaceChildren();
      if (name) name.textContent = data.account.name;
      const avatar = root.querySelector("[data-avatar]");
      if (avatar) {
        avatar.innerHTML =
          '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>';
        if (data.account.avatar) {
          const img = document.createElement("img");
          img.alt = "";
          img.src = data.account.avatar;
          img.referrerPolicy = "no-referrer";
          img.addEventListener("error", () => img.remove());
          img.addEventListener("load", () => {
            avatar.querySelector("svg")?.remove();
          });
          avatar.append(img);
        }
      }
      const connection = root.querySelector("[data-connection]");
      if (connection) connection.textContent = "연결 상태 · 정상";
      for (const provider of ["github", "google"].sort(
        (a, b) =>
          Number(data.account.providers.some((p) => p.provider === b)) -
          Number(data.account.providers.some((p) => p.provider === a)),
      )) {
        const connected = data.account.providers.find(
          (p) => p.provider === provider,
        );
        const row = text("div", "", "account-provider-row");
        const label = text(
          "span",
          provider === "github" ? "GitHub" : "Google",
          "account-provider-name",
        );
        if (connected?.email) label.title = connected.email;
        row.append(
          label,
          text(
            "span",
            connected ? "연동 완료" : "미연동",
            connected ? "account-connected" : "account-unlinked",
          ),
        );
        if (!connected) {
          const connect = button("연동하기", async () => {
            if (!data.enabled) {
              showMessage(messages.linking_disabled);
              return;
            }
            const waits = [];
            window.dispatchEvent(
              new CustomEvent("accounts:before-connect", {
                detail: { waitUntil: (p) => waits.push(p) },
              }),
            );
            await Promise.all(waits);
            const authorization = await request("start", { provider });
            location.assign(authorization.url);
          });
          row.append(connect);
        }
        providers.append(row);
      }
    }
    async function loadPreview() {
      preview = await request("preview");
      if (preview.complete) {
        review.hidden = true;
        await refresh();
        showMessage("이미 연결된 계정이에요.");
        return;
      }
      review.replaceChildren();
      review.hidden = false;
      review.append(
        text("h2", "계정 연동 확인"),
        text(
          "p",
          `${preview.secondary.name} 계정을 ${preview.primary.name} 계정에 연결해요. 이름과 기본 이메일은 현재 계정을 유지해요.`,
        ),
      );
      const counts = preview.counts;
      review.append(
        text(
          "p",
          `함께 사용할 기록: 글 ${counts.posts}개 · 댓글 ${counts.comments}개 · 좋아요 ${counts.likes}개 · 모험 ${counts.runs}개 · 업적 ${counts.achievements}개`,
        ),
      );
      const both = preview.saves.primary && preview.saves.secondary;
      if (both) {
        const fieldset = document.createElement("fieldset");
        fieldset.append(text("legend", "남길 불멍 저장을 선택해 주세요"));
        for (const side of ["primary", "secondary"]) {
          const save = preview.saves[side],
            label = document.createElement("label"),
            input = document.createElement("input");
          input.type = "radio";
          input.name = "account-save-choice";
          input.value = side;
          label.append(
            input,
            text(
              "span",
              `${side === "primary" ? "현재 계정" : "연결할 계정"} · 쉼터 ${save.shelter}단계 · 숯 ${save.charcoal} · 플레이 ${Math.floor((save.playSeconds || 0) / 60)}분`,
            ),
          );
          fieldset.append(label);
        }
        review.append(
          fieldset,
          text(
            "p",
            "선택한 저장의 물품과 기록을 그대로 남겨요. 두 저장을 더하지 않아요.",
          ),
        );
      }
      review.append(
        text(
          "p",
          "연동하면 두 로그인으로 같은 기록에 접근해요. 연동 해제와 기록 분리는 아직 지원하지 않아요.",
          "account-notice",
        ),
      );
      const actions = text("div", "", "account-actions");
      actions.append(
        button("연동 완료하기", async () => {
          const saveChoice = root.querySelector(
            'input[name="account-save-choice"]:checked',
          )?.value;
          if (both && !saveChoice) throw new Error("save_choice_required");
          await request("confirm", {
            fingerprint: preview.fingerprint,
            saveChoice,
          });
          review.hidden = true;
          history.replaceState(null, "", location.pathname);
          await refresh();
          showMessage(
            "연동이 완료됐어요. 두 로그인으로 같은 계정을 사용할 수 있어요.",
          );
          window.dispatchEvent(new Event("accounts:merged"));
        }),
        button("취소", async () => {
          await request("cancel", {});
          review.hidden = true;
          history.replaceState(null, "", location.pathname);
          showMessage(messages.cancelled);
        }),
      );
      review.append(actions);
    }

    const onVisible = () => {
      if (document.contains(root) && !document.hidden && !busy && review.hidden)
        void run(refresh);
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    const onRefresh = () => {
      if (!document.contains(root)) return;
      if (busy) {
        pendingRefresh = true;
        return;
      }
      void run(async () => {
        await refresh();
        if (
          !preview &&
          new URLSearchParams(location.search).get("link") === "review"
        )
          await loadPreview();
      });
    };
    window.addEventListener("accounts:refresh", onRefresh);
    cleanup = () => {
      window.clearTimeout(toastTimer);
      message.remove();
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
      window.removeEventListener("accounts:refresh", onRefresh);
    };
    void run(async () => {
      await refresh();
      const result = new URLSearchParams(location.search).get("link");
      if (result === "review") await loadPreview();
      else if (result)
        showMessage(
          messages[result] || "연동을 완료하지 못했어요. 다시 시작해 주세요.",
        );
    });
  }
  window.addEventListener("accounts:mount", mount);
  mount();
})();
