/* PingMe AI — Message Actions */
(() => {
  "use strict";

  const ROOT = ".message,.chat-message,[data-message]";
  const BAR = "pingme-message-actions";
  const DONE = "pingme-actions-ready";

  const icons = {
    copy:`<svg viewBox="0 0 24 24"><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>`,
    like:`<svg viewBox="0 0 24 24"><path d="M7 10v10H4a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h3Zm0 10h9.2a2 2 0 0 0 1.9-1.4l2-6A2 2 0 0 0 18.2 10H14l.7-4.1A2.4 2.4 0 0 0 12.3 3L7 10"/></svg>`,
    dislike:`<svg viewBox="0 0 24 24"><path d="M7 14V4H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h3Zm0-10h9.2a2 2 0 0 1 1.9 1.4l2 6A2 2 0 0 1 18.2 14H14l.7 4.1a2.4 2.4 0 0 1-2.4 2.9L7 14"/></svg>`,
    voice:`<svg viewBox="0 0 24 24"><path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3Z"/><path d="M19 11a7 7 0 0 1-14 0M12 18v3M8 21h8"/></svg>`,
    share:`<svg viewBox="0 0 24 24"><path d="M12 16V3m0 0L7 8m5-5 5 5"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg>`,
    more:`<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>`,
    branch:`<svg viewBox="0 0 24 24"><path d="M6 3v13a4 4 0 0 0 4 4h8"/><path d="m15 17 3 3-3 3"/><path d="M6 8h8a4 4 0 0 1 4 4v1"/></svg>`,
    retry:`<svg viewBox="0 0 24 24"><path d="M20 11a8 8 0 0 0-14-4L4 9"/><path d="M4 4v5h5"/><path d="M4 13a8 8 0 0 0 14 4l2-2"/><path d="M20 20v-5h-5"/></svg>`
  };

  const css = `
  .${BAR}{display:flex;align-items:center;gap:5px;margin-top:7px}
  .${BAR} button{width:31px;height:31px;border:0;background:transparent;
    border-radius:8px;display:grid;place-items:center;cursor:pointer;
    color:inherit;padding:6px}
  .${BAR} button:hover{background:rgba(128,128,128,.12)}
  .${BAR} svg{width:17px;height:17px;fill:none;stroke:currentColor;
    stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
  .pingme-action-menu{position:absolute;z-index:9999;min-width:175px;
    padding:7px;background:var(--background-primary,#fff);
    color:inherit;border:1px solid rgba(128,128,128,.18);
    border-radius:12px;box-shadow:0 8px 28px rgba(0,0,0,.16)}
  .pingme-menu-time{font-size:11px;opacity:.55;padding:3px 9px 6px}
  .pingme-menu-item{display:flex;align-items:center;gap:9px;width:100%;
    min-height:34px;padding:7px 9px;border:0;background:transparent;
    color:inherit;border-radius:8px;text-align:left;cursor:pointer}
  .pingme-menu-item+.pingme-menu-item{margin-top:3px}
  .pingme-menu-item:hover{background:rgba(128,128,128,.12)}
  .pingme-menu-item svg{width:16px;height:16px;fill:none;stroke:currentColor;
    stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
  `;

  if (!document.getElementById("pingme-message-actions-css")) {
    const s = document.createElement("style");
    s.id = "pingme-message-actions-css";
    s.textContent = css;
    document.head.appendChild(s);
  }

  const textOf = el =>
    el?.querySelector?.(".message-text,.content,.text,[data-message-text]")?.innerText ||
    el?.innerText || "";

  const make = (icon, label, fn) => {
    const b = document.createElement("button");
    b.innerHTML = icon;
    b.setAttribute("aria-label", label);
    b.title = label;
    b.onclick = e => { e.stopPropagation(); fn(e); };
    return b;
  };

  const copy = el => {
    const t = textOf(el);
    navigator.clipboard?.writeText(t).catch(() => {
      const x = document.createElement("textarea");
      x.value = t;
      document.body.appendChild(x);
      x.select();
      document.execCommand("copy");
      x.remove();
    });
  };

  const feedback = (el, type) => {
    el.dispatchEvent(new CustomEvent("pingme:message-feedback", {
      bubbles:true, detail:{message:el,text:textOf(el),type}
    }));
  };

  const speak = el => {
    if (!("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    speechSynthesis.speak(new SpeechSynthesisUtterance(textOf(el)));
  };

  const share = async el => {
    const t = textOf(el);
    if (navigator.share) {
      try { await navigator.share({text:t}); } catch (_) {}
    } else {
      copy(el);
    }
  };

  const getTime = el => {
    const t = el?.querySelector?.(
      "time,[data-message-time],[data-time],.message-time,.timestamp,.time"
    );
    let v = t?.getAttribute("datetime") || t?.getAttribute("data-message-time") ||
            t?.getAttribute("data-time") || t?.textContent?.trim();

    if (!v) return "Time unavailable";

    const d = new Date(v);
    if (!isNaN(d.getTime()) && /[-/:T]/.test(v))
      return new Intl.DateTimeFormat([], {
        hour:"numeric", minute:"2-digit"
      }).format(d);

    return v;
  };

  const closeMenus = () =>
    document.querySelectorAll(".pingme-action-menu").forEach(x => x.remove());

  const openMenu = (el, button) => {
    closeMenus();

    const menu = document.createElement("div");
    menu.className = "pingme-action-menu";

    const time = document.createElement("div");
    time.className = "pingme-menu-time";
    time.textContent = getTime(el);
    menu.appendChild(time);

    const branch = document.createElement("button");
    branch.className = "pingme-menu-item";
    branch.innerHTML = icons.branch + "<span>Branch in new chat</span>";
    branch.onclick = () => {
      el.dispatchEvent(new CustomEvent("pingme:branch-message", {
        bubbles:true, detail:{message:el,text:textOf(el)}
      }));
      if (typeof window.branchInNewChat === "function")
        window.branchInNewChat(el);
      else if (typeof window.createNewChatFromMessage === "function")
        window.createNewChatFromMessage(el);
      closeMenus();
    };

    const retry = document.createElement("button");
    retry.className = "pingme-menu-item";
    retry.innerHTML = icons.retry + "<span>Retry</span>";
    retry.onclick = () => {
      el.dispatchEvent(new CustomEvent("pingme:retry-message", {
        bubbles:true, detail:{message:el,text:textOf(el)}
      }));
      if (typeof window.retryMessage === "function")
        window.retryMessage(el);
      else if (typeof window.retryLastMessage === "function")
        window.retryLastMessage(el);
      else if (typeof window.regenerateResponse === "function")
        window.regenerateResponse(el);
      closeMenus();
    };

    menu.append(branch, retry);
    document.body.appendChild(menu);

    const r = button.getBoundingClientRect();
    const mw = menu.offsetWidth;
    menu.style.left = Math.max(8, r.right - mw) + "px";
    menu.style.top = (r.bottom + 6) + "px";
  };

  const attach = el => {
    if (!el || el.dataset.pingmeActions === "1") return;

    const isAssistant =
      el.matches?.(".assistant,.ai-message,[data-role='assistant']") ||
      el.querySelector?.(".assistant,.ai-message,[data-role='assistant']");

    if (!isAssistant) return;

    el.dataset.pingmeActions = "1";

    const bar = document.createElement("div");
    bar.className = BAR;

    bar.append(
      make(icons.copy,"Copy",() => copy(el)),
      make(icons.like,"Like",() => feedback(el,"like")),
      make(icons.dislike,"Dislike",() => feedback(el,"dislike")),
      make(icons.voice,"Read aloud",() => speak(el)),
      make(icons.share,"Share",() => share(el))
    );

    const more = make(icons.more,"More",e => openMenu(el,e.currentTarget));
    bar.appendChild(more);

    el.appendChild(bar);
  };

  const scan = () =>
    document.querySelectorAll(ROOT).forEach(attach);

  const observer = new MutationObserver(scan);
  const start = () => {
    scan();
    observer.observe(document.body,{childList:true,subtree:true});
  };

  document.addEventListener("click",e => {
    if (!e.target.closest(".pingme-action-menu") &&
        !e.target.closest(`.${BAR} button:last-child`)) closeMenus();
  });

  document.addEventListener("keydown",e => {
    if (e.key === "Escape") closeMenus();
  });

  window.PingMeMessageActions = {
    scan,
    attach,
    closeMenus
  };

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded",start,{once:true});
  else start();
})();
