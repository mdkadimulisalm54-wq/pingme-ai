/*
 * PingMe AI — Message Actions
 * File: support/MessageActions.js
 */

(function(){
"use strict";

const C={
 rootClass:"pingme-message-actions-root",
 barClass:"pingme-message-actions",
 menuClass:"pingme-message-actions-menu",
 ready:"pingme-message-actions-ready",
 assistants:[
  "[data-role='assistant']","[data-message-role='assistant']",
  ".assistant-message",".ai-message",".message-assistant",
  "[data-author='assistant']","[data-sender='assistant']",".bot-message"
 ],
 texts:[
  "[data-message-content]",".message-content",".assistant-content",
  ".ai-content",".message-text",".response-content"
 ]
};

const I={
 copy:`<svg viewBox="0 0 24 24"><rect x="8" y="8" width="11" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" fill="none" stroke="currentColor" stroke-width="2"/></svg>`,
 like:`<svg viewBox="0 0 24 24"><path d="M7 10v10H4a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h3Z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M7 20h9a3 3 0 0 0 2.9-2.25l1.2-5A2.2 2.2 0 0 0 18.96 10H15l.55-3.15A2.35 2.35 0 0 0 13.24 4L7 10" fill="none" stroke="currentColor" stroke-width="2"/></svg>`,
 dislike:`<svg viewBox="0 0 24 24"><path d="M7 14V4H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h3Z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M7 4h9a3 3 0 0 1 2.9 2.25l1.2 5A2.2 2.2 0 0 1 18.96 14H15l.55 3.15A2.35 2.35 0 0 1 13.24 20L7 14" fill="none" stroke="currentColor" stroke-width="2"/></svg>`,
 volume:`<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5l-5 4H4Z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 9a5 5 0 0 1 0 6M18.5 6.5a9 9 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="2"/></svg>`,
 more:`<svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="12" cy="19" r="1.7" fill="currentColor"/></svg>`,
 branch:`<svg viewBox="0 0 24 24"><path d="M7 17V7a3 3 0 0 1 3-3h7M14 7h3V4M7 17h4a3 3 0 0 0 3-3v-2" fill="none" stroke="currentColor" stroke-width="2"/></svg>`,
 retry:`<svg viewBox="0 0 24 24"><path d="M20 11a8 8 0 0 0-14.9-3M4 4v5h5M4 13a8 8 0 0 0 14.9 3M20 20v-5h-5" fill="none" stroke="currentColor" stroke-width="2"/></svg>`,
 web:`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>`
};

function styles(){
 if(document.getElementById("pingme-message-actions-style"))return;
 const s=document.createElement("style");
 s.id="pingme-message-actions-style";
 s.textContent=`
.${C.rootClass}{position:relative;display:flex;align-items:center;width:100%;margin-top:5px;padding:0 2px;z-index:5}
.${C.barClass}{display:flex;align-items:center;gap:2px;min-height:30px}
.pingme-message-action-button{width:30px;height:30px;padding:0;border:0;background:transparent;color:#8a8a8a;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;transition:.15s}
.pingme-message-action-button:hover{background:rgba(0,0,0,.06);color:#222}
.pingme-message-action-button:active{transform:scale(.91)}
.pingme-message-action-button svg{width:18px;height:18px}
.pingme-message-action-button.pingme-liked{color:#1683ff;background:rgba(22,131,255,.09)}
.pingme-message-action-button.pingme-disliked{color:#d64545;background:rgba(214,69,69,.09)}
.pingme-message-action-button.pingme-speaking{color:#1683ff}

.${C.menuClass}{position:absolute;left:0;bottom:36px;width:min(215px,calc(100vw - 24px));padding:4px;background:#fff;border:1px solid rgba(0,0,0,.07);border-radius:13px;box-shadow:0 7px 22px rgba(0,0,0,.13);display:none;z-index:99999;box-sizing:border-box}
.${C.menuClass}.pingme-open{display:block;animation:pmMenu .13s ease-out}
@keyframes pmMenu{from{opacity:0;transform:translateY(3px) scale(.98)}to{opacity:1;transform:none}}
.pingme-message-menu-row{width:100%;height:40px;border:0;background:transparent;border-radius:9px;padding:4px 8px;display:flex;align-items:center;gap:9px;color:#151515;font-size:14px;text-align:left;cursor:pointer}
.pingme-message-menu-row:hover{background:rgba(0,0,0,.055)}
.pingme-message-menu-row svg{width:19px;height:19px;flex:0 0 19px}
.pingme-message-menu-label{flex:1}
.pingme-message-menu-divider{height:1px;margin:0 7px;background:rgba(0,0,0,.07)}

@media(max-width:600px){
.${C.barClass}{gap:1px}
.pingme-message-action-button{width:29px;height:29px}
.pingme-message-action-button svg{width:18px;height:18px}
.${C.menuClass}{width:min(210px,calc(100vw - 20px));padding:3px;border-radius:12px}
.pingme-message-menu-row{height:38px;padding:3px 7px;gap:8px;font-size:14px}
.pingme-message-menu-row svg{width:18px;height:18px;flex-basis:18px}
}`;
 document.head.appendChild(s);
}

function text(el){
 if(!el)return"";
 for(const q of C.texts){
  const x=el.querySelector(q);
  if(x){
   const t=(x.innerText||x.textContent||"").trim();
   if(t)return t;
  }
 }
 const c=el.cloneNode(true);
 c.querySelectorAll(`.${C.rootClass},script,style`).forEach(x=>x.remove());
 return(c.innerText||c.textContent||"").trim();
}

function messages(){
 const set=new Set();
 C.assistants.forEach(q=>document.querySelectorAll(q).forEach(x=>set.add(x)));
 return[...set];
}

function button(icon,label){
 const b=document.createElement("button");
 b.type="button";
 b.className="pingme-message-action-button";
 b.ariaLabel=label;
 b.title=label;
 b.innerHTML=icon;
 return b;
}

async function copy(el,b){
 const t=text(el);
 if(!t)return;
 try{
  await navigator.clipboard.writeText(t);
  const old=b.title;
  b.title="Copied";
  setTimeout(()=>b.title=old,1000);
 }catch(e){
  const a=document.createElement("textarea");
  a.value=t;a.style.cssText="position:fixed;opacity:0";
  document.body.appendChild(a);a.select();
  try{document.execCommand("copy")}catch(x){console.warn("PingMe Copy failed",x)}
  a.remove();
 }
}

function feedback(b,other,el,type){
 const active=b.classList.contains("pingme-"+type+"d");
 b.classList.toggle("pingme-"+type+"d",!active);
 if(!active)other.classList.remove("pingme-"+(type==="like"?"dislike":"like")+"d");
 el.dispatchEvent(new CustomEvent("pingme:message-feedback",{
  bubbles:true,
  detail:{type:!active?type:"none",message:text(el)}
 }));
}

function read(b,el){
 if(!("speechSynthesis"in window))return;
 if(speechSynthesis.speaking){stop(b);return}
 const t=text(el);if(!t)return;
 const u=new SpeechSynthesisUtterance(t);
 u.lang=document.documentElement.lang||"bn-BD";
 u.rate=1;u.pitch=1;
 b.classList.add("pingme-speaking");b.title="Stop reading";
 u.onend=u.onerror=()=>stop(b);
 speechSynthesis.cancel();speechSynthesis.speak(u);
}

function stop(b){
 if("speechSynthesis"in window)speechSynthesis.cancel();
 b.classList.remove("pingme-speaking");b.title="Read aloud";
}

function closeMenus(){
 document.querySelectorAll("."+C.menuClass)
 .forEach(x=>x.classList.remove("pingme-open"));
}

function menu(el){
 const m=document.createElement("div");
 m.className=C.menuClass;
 m.innerHTML=`
 <button class="pingme-message-menu-row" data-action="branch">${I.branch}<span class="pingme-message-menu-label">Branch in new chat</span></button>
 <div class="pingme-message-menu-divider"></div>
 <button class="pingme-message-menu-row" data-action="retry">${I.retry}<span class="pingme-message-menu-label">Retry</span></button>
 <div class="pingme-message-menu-divider"></div>
 <button class="pingme-message-menu-row" data-action="web">${I.web}<span class="pingme-message-menu-label">Search the web</span></button>`;
 m.onclick=e=>{
  const r=e.target.closest(".pingme-message-menu-row");
  if(!r)return;
  closeMenus();
  if(r.dataset.action==="branch")branch(el);
  if(r.dataset.action==="retry")retry(el);
  if(r.dataset.action==="web")web(el);
 };
 return m;
}

function toggle(m){
 const open=m.classList.contains("pingme-open");
 closeMenus();
 if(!open)m.classList.add("pingme-open");
}

function branch(el){
 const t=text(el);
 document.dispatchEvent(new CustomEvent("pingme:branch-message",{
  bubbles:true,detail:{message:t,sourceElement:el}
 }));
 if(typeof window.branchInNewChat==="function")
  return window.branchInNewChat(t,el);
 if(typeof window.createNewChatFromMessage==="function")
  return window.createNewChatFromMessage(t,el);
 console.info("PingMe AI — Branch requested:",t);
}

function retry(el){
 const t=text(el);
 document.dispatchEvent(new CustomEvent("pingme:retry-message",{
  bubbles:true,detail:{message:t,sourceElement:el}
 }));
 if(typeof window.retryMessage==="function"&&window.retryMessage!==retry)
  return window.retryMessage(el);
 if(typeof window.retryLastMessage==="function")
  return window.retryLastMessage();
 if(typeof window.regenerateResponse==="function")
  return window.regenerateResponse(el);
 console.info("PingMe AI — Retry requested:",t);
}

function web(el){
 const t=text(el);
 if(t)window.open(
  "https://www.google.com/search?q="+encodeURIComponent(t),
  "_blank","noopener,noreferrer"
 );
}

function attach(el){
 if(!el||el.classList.contains(C.ready))return;
 if(el.querySelector("."+C.rootClass)){
  el.classList.add(C.ready);return;
 }
 if(!text(el))return;

 const root=document.createElement("div");
 root.className=C.rootClass;

 const bar=document.createElement("div");
 bar.className=C.barClass;

 const cp=button(I.copy,"Copy");
 const lk=button(I.like,"Like");
 const dl=button(I.dislike,"Dislike");
 const rd=button(I.volume,"Read aloud");
 const mo=button(I.more,"More");

 cp.onclick=()=>copy(el,cp);
 lk.onclick=()=>feedback(lk,dl,el,"like");
 dl.onclick=()=>feedback(dl,lk,el,"dislike");
 rd.onclick=()=>read(rd,el);

 const mn=menu(el);
 mo.onclick=e=>{e.stopPropagation();toggle(mn)};

 [cp,lk,dl,rd,mo].forEach(x=>bar.appendChild(x));
 root.append(bar,mn);
 el.appendChild(root);
 el.classList.add(C.ready);
}

function scan(){messages().forEach(attach)}

document.addEventListener("click",e=>{
 if(!e.target.closest("."+C.rootClass))closeMenus();
});

document.addEventListener("keydown",e=>{
 if(e.key==="Escape")closeMenus();
});

function observer(){
 if(!document.body)return;
 const o=new MutationObserver(scan);
 o.observe(document.body,{childList:true,subtree:true});
 window.PingMeMessageActionsObserver=o;
}

window.PingMeMessageActions={
 scan,attach,closeMenus,copy,readAloud:read,
 like:feedback,dislike:feedback,branch,retry,searchWeb:web
};

function init(){
 styles();
 scan();
 observer();
 console.log("PingMe AI — Message Actions Connected");
}

document.readyState==="loading"
 ?document.addEventListener("DOMContentLoaded",init,{once:true})
 :init();

})();