/* PingMe AI — Message Actions */
(() => {
  "use strict";

  const ROOT = ".message,.chat-message,[data-message]";
  const BAR = "pingme-message-actions";
  const READY = "pingme-actions-ready";

  const svg = {
    copy:`<svg viewBox="0 0 24 24"><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>`,
    like:`<svg viewBox="0 0 24 24"><path d="M7 10v10H4V10h3Zm0 10h9.2a2 2 0 0 0 1.9-1.4l2-6A2 2 0 0 0 18.2 10H14l.6-3.1A2.4 2.4 0 0 0 12.3 4L7 10"/></svg>`,
    dislike:`<svg viewBox="0 0 24 24"><path d="M7 14V4H4v10h3Zm0-10h9.2a2 2 0 0 1 1.9 1.4l2 6A2 2 0 0 1 18.2 14H14l.6 3.1a2.4 2.4 0 0 1-2.3 2.9L7 14"/></svg>`,
    voice:`<svg viewBox="0 0 24 24"><path d="M12 3a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v3M8 21h8"/></svg>`,
    share:`<svg viewBox="0 0 24 24"><path d="M12 15V3m0 0L7 8m5-5 5 5"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg>`,
    more:`<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>`,
    branch:`<svg viewBox="0 0 24 24"><path d="M6 3v10a5 5 0 0 0 5 5h7"/><path d="m15 15 3 3-3 3"/></svg>`,
    retry:`<svg viewBox="0 0 24 24"><path d="M20 11a8 8 0 0 0-14-4L4 9"/><path d="M4 4v5h5M4 13a8 8 0 0 0 14 4l2-2"/></svg>`
  };

  const style = document.createElement("style");
  style.textContent = `
    .${BAR}{
      display:flex;
      align-items:center;
      gap:4px;
      margin-top:7px;
      padding:0;
    }
    .${BAR} button{
      width:29px;
      height:29px;
      padding:5px;
      border:0;
      background:transparent;
      border-radius:8px;
      color:inherit;
      opacity:.72;
      cursor:pointer;
      display:grid;
      place-items:center;
    }
    .${BAR} button:hover{
      background:rgba(127,127,127,.12);
      opacity:1;
    }
    .${BAR} svg{
      width:17px;
      height:17px;
      fill:none;
      stroke:currentColor;
      stroke-width:1.8;
      stroke-linecap:round;
      stroke-linejoin:round;
    }
    .pingme-actions-menu{
      position:fixed;
      z-index:99999;
      min-width:185px;
      padding:6px;
      border:1px solid rgba(127,127,127,.18);
      border-radius:12px;
      background:var(--background-primary,#fff);
      box-shadow:0 8px 28px rgba(0,0,0,.18);
    }
    .pingme-actions-time{
      padding:7px 9px 8px;
      font-size:11px;
      opacity:.55;
      border-bottom:1px solid rgba(127,127,127,.14);
      margin-bottom:4px;
    }
    .pingme-actions-menu button{
      width:100%;
      display:flex;
      align-items:center;
      gap:9px;
      border:0;
      background:transparent;
      padding:8px 9px;
      border-radius:8px;
      color:inherit;
      font-size:13px;
      text-align:left;
      cursor:pointer;
    }
    .pingme-actions-menu button:hover{
      background:rgba(127,127,127,.12);
    }
    .pingme-actions-menu svg{
      width:16px;
      height:16px;
      fill:none;
      stroke:currentColor;
      stroke-width:1.8;
      stroke-linecap:round;
      stroke-linejoin:round;
    }
  `;
  document.head.appendChild(style);

  const textOf = el =>
    el?.querySelector?.(
      ".message-content,.chat-content,.markdown,.prose,[data-message-content]"
    )?.innerText?.trim() ||
    el?.innerText?.trim() ||
    "";

  const assistant = el => {
    if (!el) return false;

    if (
      el.matches?.(
        ".user,.user-message,.human,[data-role='user'],.message.user,.chat-message.user"
      )
    ) return false;

    const role = (
      el.getAttribute?.("data-role") ||
      el.getAttribute?.("data-author") ||
      el.getAttribute?.("role") ||
      ""
    ).toLowerCase();

    if (role === "user" || role === "human") return false;
    if (role === "assistant" || role === "ai" || role === "bot") return true;

    return !!el.querySelector?.(
      ".assistant,.ai-message,[data-role='assistant'],[data-role='ai']"
    ) || el.matches?.(".assistant,.ai-message");
  };

  const button = (icon, title, fn) => {
    const b = document.createElement("button");
    b.type = "button";
    b.title = title;
    b.setAttribute("aria-label", title);
    b.innerHTML = icon;
    b.onclick = e => {
      e.stopPropagation();
      fn(e);
    };
    return b;
  };

  const copy = async el => {
    const text = textOf(el);
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const t = document.createElement("textarea");
      t.value = text;
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      t.remove();
    }
  };

  const feedback = (el, type) => {
    el.dispatchEvent(
      new CustomEvent("pingme:message-feedback", {
        bubbles:true,
        detail:{type,message:el,text:textOf(el)}
      })
    );

    if (type === "like" && typeof window.pingmeLikeMessage === "function")
      window.pingmeLikeMessage(el);

    if (type === "dislike" && typeof window.pingmeDislikeMessage === "function")
      window.pingmeDislikeMessage(el);
  };

  const speak = el => {
    const text = textOf(el);
    if (!text || !("speechSynthesis" in window)) return;

    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = .95;
    speechSynthesis.speak(u);
  };

  const share = async el => {
    const text = textOf(el);
    if (!text) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title:"PingMe AI",
          text
        });
      } else {
        await navigator.clipboard.writeText(text);
      }
    } catch {}
  };

  const timeOf = el => {
    const x = el?.querySelector?.(
      "time,.message-time,.chat-time,[data-time],[datetime]"
    );

    if (x) {
      const value =
        x.getAttribute("datetime") ||
        x.getAttribute("data-time") ||
        x.textContent.trim();

      if (value) {
        const d = new Date(value);
        if (!isNaN(d)) {
          return d.toLocaleTimeString([], {
            hour:"numeric",
            minute:"2-digit"
          });
        }
        return value;
      }
    }

    return "Sent time unavailable";
  };

  let opened = null;

  const closeMenu = () => {
    if (opened) {
      opened.remove();
      opened = null;
    }
  };

  const menuButton = (icon, text, fn) => {
    const b = document.createElement("button");
    b.innerHTML = icon + `<span>${text}</span>`;
    b.onclick = e => {
      e.stopPropagation();
      closeMenu();
      fn();
    };
    return b;
  };

  const openMenu = (el, anchor) => {
    closeMenu();

    const menu = document.createElement("div");
    menu.className = "pingme-actions-menu";

    const time = document.createElement("div");
    time.className = "pingme-actions-time";
    time.textContent = timeOf(el);
    menu.appendChild(time);

    menu.appendChild(
      menuButton(svg.branch,"Branch in new chat",() => {
        el.dispatchEvent(
          new CustomEvent("pingme:branch",{bubbles:true,detail:{message:el,text:textOf(el)}})
        );

        if (typeof window.pingmeBranchMessage === "function")
          window.pingmeBranchMessage(el);
      })
    );

    menu.appendChild(
      menuButton(svg.retry,"Retry",() => {
        el.dispatchEvent(
          new CustomEvent("pingme:retry",{bubbles:true,detail:{message:el,text:textOf(el)}})
        );

        if (typeof window.pingmeRetryMessage === "function")
          window.pingmeRetryMessage(el);
      })
    );

    document.body.appendChild(menu);
    opened = menu;

    const r = anchor.getBoundingClientRect();
    const w = menu.offsetWidth;
    const h = menu.offsetHeight;

    let left = r.right - w;
    let top = r.bottom + 6;

    if (left < 6) left = 6;
    if (left + w > innerWidth - 6) left = innerWidth - w - 6;
    if (top + h > innerHeight - 6) top = r.top - h - 6;

    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
  };

  const attach = el => {
    if (!el || el.dataset[READY] === "1") return;
    if (!assistant(el)) return;

    const text = textOf(el);
    if (!text) return;

    el.dataset[READY] = "1";

    const bar = document.createElement("div");
    bar.className = BAR;

    bar.append(
      button(svg.copy,"Copy",() => copy(el)),
      button(svg.like,"Like",() => feedback(el,"like")),
      button(svg.dislike,"Dislike",() => feedback(el,"dislike")),
      button(svg.voice,"Read aloud",() => speak(el)),
      button(svg.share,"Share",() => share(el)),
      button(svg.more,"More",e => openMenu(el,e.currentTarget))
    );

    el.appendChild(bar);
  };

  const scan = root => {
    if (!root?.querySelectorAll) return;

    if (root.matches?.(ROOT)) attach(root);

    root.querySelectorAll(ROOT).forEach(attach);
  };

  const observer = new MutationObserver(mutations => {
    mutations.forEach(m => {
      m.addedNodes.forEach(n => {
        if (n.nodeType === 1) scan(n);
      });
    });
  });

  const start = () => {
    scan(document);
    observer.observe(document.body,{childList:true,subtree:true});
  };

  document.addEventListener("click",e => {
    if (
      opened &&
      !opened.contains(e.target) &&
      !e.target.closest?.(`.${BAR}`)
    ) closeMenu();
  });

  document.addEventListener("keydown",e => {
    if (e.key === "Escape") closeMenu();
  });

  window.PingMeMessageActions = {
    scan,
    attach,
    closeMenu
  };

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded",start);
  else
    start();

})();
