// Generates one standalone HyperFrames composition per solution into scenes/<slug>.html.
// Shared brand shell (palette, window chrome, intro/outro) + a scene-specific UI animation.
// Each piece is 8s at 1280x720 and starts and ends on the empty background, so it loops.
import { mkdirSync, writeFileSync } from "node:fs";

const W = 1280;
const H = 720;
const DUR = 8;

const css = `
:root{--bg:#0e0d0b;--panel:#171512;--panel2:#1f1c18;--paper:#ece5d8;--ink:#ede5d6;--ink2:#cfc6b5;--muted:#918979;--line:rgba(237,229,214,.12);--line2:rgba(237,229,214,.22);--accent:#8e9bff;--accentd:#2b3bff;--mint:#4fe3c9;--signal:#ff7a45}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:var(--bg)}
#root{position:relative;width:100%;height:100%;overflow:hidden;font-family:ui-sans-serif,system-ui,sans-serif;color:var(--ink)}
.bg{position:absolute;inset:0;background:radial-gradient(55% 65% at 12% 8%,rgba(142,155,255,.20),transparent 60%),radial-gradient(50% 60% at 92% 96%,rgba(79,227,201,.15),transparent 60%)}
.grid{position:absolute;inset:0;background-image:linear-gradient(var(--line) 1px,transparent 1px),linear-gradient(90deg,var(--line) 1px,transparent 1px);background-size:40px 40px;opacity:.3;-webkit-mask-image:radial-gradient(70% 70% at 50% 50%,#000,transparent);mask-image:radial-gradient(70% 70% at 50% 50%,#000,transparent)}
.scene{position:absolute;inset:0}
.eyebrow{position:absolute;left:52px;top:40px;display:flex;gap:10px;align-items:center;font:600 13px/1 ui-monospace,Consolas,monospace;letter-spacing:.18em;text-transform:uppercase;color:var(--muted)}
.eyebrow i{display:block;width:8px;height:8px;border-radius:50%;background:var(--mint)}
.stage{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:28px;padding:96px 72px 56px}
.win{position:relative;background:var(--panel);border:1px solid var(--line);border-radius:18px;box-shadow:0 40px 90px -30px rgba(0,0,0,.75);overflow:hidden}
.bar{display:flex;gap:7px;align-items:center;height:40px;padding:0 16px;border-bottom:1px solid var(--line);background:var(--panel2)}
.bar i{display:block;width:11px;height:11px;border-radius:50%;background:#3d392f}
.bar span{margin-left:10px;font:500 12px ui-monospace,Consolas,monospace;color:var(--muted)}
.mono{font-family:ui-monospace,Consolas,monospace}
.label{font:600 11px/1 ui-monospace,Consolas,monospace;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}
.chip{display:inline-flex;align-items:center;gap:8px;padding:9px 14px;border-radius:999px;border:1px solid var(--line2);background:rgba(23,21,18,.92);font:600 13px/1 ui-sans-serif,system-ui,sans-serif;color:var(--ink);white-space:nowrap}
.chip b{display:block;width:8px;height:8px;border-radius:50%;background:var(--mint)}
.chip.accent{border-color:rgba(142,155,255,.5);color:var(--accent)}
.chip.mint{border-color:rgba(79,227,201,.45);color:var(--mint)}
.chip.signal{border-color:rgba(255,122,69,.5);color:var(--signal)}
.card{background:var(--panel2);border:1px solid var(--line);border-radius:12px}
.skel{display:block;height:8px;border-radius:4px;background:rgba(237,229,214,.14)}
.ok{color:var(--mint)}
.toast{position:absolute;display:flex;align-items:center;gap:10px;padding:12px 16px;border-radius:12px;background:#24211c;border:1px solid var(--line2);font:600 14px/1.2 ui-sans-serif,system-ui,sans-serif;box-shadow:0 20px 40px -18px rgba(0,0,0,.8)}
.toast b{display:block;width:10px;height:10px;border-radius:50%;background:var(--mint);flex:none}
`;

const shell = ({ id, eyebrow, html, sceneCss = "", js }) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <title>${eyebrow}</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>${css}${sceneCss}</style>
  </head>
  <body>
    <div id="root" data-composition-id="${id}" data-start="0" data-width="${W}" data-height="${H}" data-duration="${DUR}">
      <div class="bg"></div>
      <div class="grid"></div>
      <section id="scene" class="scene clip" data-start="0" data-duration="${DUR}" data-track-index="0">
        <div id="eyebrow" class="eyebrow"><i></i>${eyebrow}</div>
        <div id="content" class="stage">${html}</div>
      </section>
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      const show = (sel, at, from) => tl.fromTo(sel, Object.assign({ autoAlpha: 0, y: 14 }, from || {}), { autoAlpha: 1, x: 0, y: 0, scale: 1, duration: 0.5, ease: "power3.out" }, at);
      const type = (sel, at, dur) => tl.fromTo(sel, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: dur || 1, ease: "none" }, at);
      const count = (sel, to, at, dur, fmt) => { const o = { v: 0 }; const el = document.querySelector(sel); tl.to(o, { v: to, duration: dur || 1, ease: "power2.out", onUpdate: () => { el.textContent = (fmt || ((v) => Math.round(v)))(o.v); } }, at); };
      tl.fromTo("#eyebrow", { autoAlpha: 0, x: -12 }, { autoAlpha: 1, x: 0, duration: 0.5, ease: "power2.out" }, 0.1);
      tl.fromTo("#content", { autoAlpha: 0, scale: 0.965 }, { autoAlpha: 1, scale: 1, duration: 0.6, ease: "power3.out" }, 0);
${js}
      tl.to(["#content", "#eyebrow"], { autoAlpha: 0, scale: 0.985, duration: 0.55, ease: "power2.in" }, ${DUR - 0.65});
      tl.seek(0);
      window.__timelines = window.__timelines || {};
      window.__timelines["${id}"] = tl;
    </script>
  </body>
</html>
`;

const win = (title, inner, style = "") => `<div class="win" style="${style}"><div class="bar"><i></i><i></i><i></i><span>${title}</span></div>${inner}</div>`;

const scenes = [];
const add = (s) => scenes.push(s);

/* 1 ─ AI chatbot */
add({
  slug: "ai-chatbot",
  eyebrow: "AI Chatbots & Support Agents",
  sceneCss: `.msgs{display:flex;flex-direction:column;gap:14px;padding:24px;height:430px}.b{max-width:72%;padding:13px 16px;border-radius:16px;font-size:16px;line-height:1.45}.u{align-self:flex-end;background:var(--accentd);color:#fff;border-bottom-right-radius:5px}.a{align-self:flex-start;background:var(--panel2);border:1px solid var(--line);border-bottom-left-radius:5px;color:var(--ink2)}.dots{align-self:flex-start;display:flex;gap:6px;padding:16px 18px;border-radius:16px;background:var(--panel2);border:1px solid var(--line)}.dots span{display:block;width:8px;height:8px;border-radius:50%;background:var(--muted)}.trk{margin-top:10px;height:6px;border-radius:3px;background:rgba(237,229,214,.12);overflow:hidden}.trk div{width:100%;height:100%;background:var(--mint);transform-origin:left}.side{display:flex;flex-direction:column;gap:12px}`,
  html: `${win("Support · yourstore.com", `<div class="msgs">
    <div id="m1" class="b u">Do you ship to Canada?</div>
    <div style="position:relative;display:flex"><div id="d1" class="dots" style="position:absolute;left:0;top:0"><span></span><span></span><span></span></div>
    <div id="m2" class="b a">Yes! Canada orders arrive in 5–7 days. Want me to track an order for you?</div></div>
    <div id="m3" class="b u">Track order #4821</div>
    <div id="m4" class="b a"><b style="color:var(--ink)">Order #4821</b> · Out for delivery<div class="trk"><div id="trk"></div></div></div>
  </div>`, "width:620px")}
  <div class="side"><div id="c1" class="chip mint"><b></b>Answered in 2s</div><div id="c2" class="chip accent"><b style="background:var(--accent)"></b>Lead captured</div><div id="c3" class="chip"><b></b>Resolved by AI</div></div>`,
  js: `
      show("#m1", 0.8, { x: 20 });
      tl.fromTo("#d1", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 }, 1.4);
      tl.fromTo("#d1 span", { y: 0 }, { y: -6, duration: 0.25, stagger: 0.12, yoyo: true, repeat: 3, ease: "sine.inOut" }, 1.45);
      tl.to("#d1", { autoAlpha: 0, duration: 0.15 }, 2.4);
      show("#m2", 2.45, { x: -20 });
      show("#m3", 3.6, { x: 20 });
      show("#m4", 4.4, { x: -20 });
      tl.fromTo("#trk", { scaleX: 0 }, { scaleX: 0.78, duration: 1.2, ease: "power2.out" }, 4.8);
      show("#c1", 2.9, { x: 20 }); show("#c2", 5.4, { x: 20 }); show("#c3", 6.0, { x: 20 });`,
});

/* 2 ─ AI CRM */
const crmCols = ["New", "Qualified", "Proposal", "Won"];
const crmCards = [
  ["Priya S.", "Bloom Studio", 92, 3],
  ["Arjun M.", "Northwind", 81, 2],
  ["Elena R.", "Fjord Labs", 74, 1],
  ["Kabir T.", "Urban Nest", 38, 0],
];
add({
  slug: "ai-crm",
  eyebrow: "AI-Powered CRM",
  sceneCss: `.board{position:relative;width:1000px;height:400px;padding:20px}.col{position:absolute;top:20px;width:226px;height:360px;border-radius:12px;background:rgba(237,229,214,.03);border:1px dashed var(--line)}.col h4{padding:14px 14px 0;font:600 12px ui-monospace,Consolas,monospace;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}.lead{position:absolute;width:206px;padding:12px 14px;border-radius:10px;background:var(--panel2);border:1px solid var(--line2)}.lead p{font-size:15px;font-weight:600}.lead small{display:block;margin-top:3px;font-size:12px;color:var(--muted)}.score{position:absolute;right:12px;top:12px;min-width:38px;padding:4px 7px;border-radius:999px;font:700 12px ui-monospace,Consolas,monospace;text-align:center;background:rgba(79,227,201,.15);color:var(--mint)}.score.low{background:rgba(255,122,69,.14);color:var(--signal)}.won{box-shadow:0 0 0 2px var(--mint)}`,
  html: `${win("Pipeline · AI lead scoring", `<div class="board">${crmCols.map((c, i) => `<div class="col" style="left:${20 + i * 244}px"><h4>${c}</h4></div>`).join("")}${crmCards
    .map(([n, co, s], i) => `<div id="l${i}" class="lead" style="left:30px;top:${64 + i * 76}px"><p>${n}</p><small>${co}</small><span id="s${i}" class="score${s < 50 ? " low" : ""}">0</span></div>`)
    .join("")}</div>`, "width:1040px")}
  <div id="t1" class="toast" style="right:110px;bottom:70px"><b></b>Follow-up sent to 3 leads</div>`,
  js: `
      ${crmCards.map((_, i) => `show("#l${i}", ${0.7 + i * 0.15}, { x: -16 });`).join("\n      ")}
      ${crmCards.map(([, , s], i) => `count("#s${i}", ${s}, 1.5, 1.1);`).join("\n      ")}
      ${crmCards
        .map(([, , , col], i) => (col ? `tl.to("#l${i}", { x: ${col * 244}, y: ${-i * 76 + (col === 3 ? 0 : col === 2 ? 0 : 0)}, duration: 0.8, ease: "power3.inOut" }, ${2.8 + (3 - col) * 0.6});` : ""))
        .join("\n      ")}
      tl.fromTo("#l0", { boxShadow: "0 0 0 0px rgba(79,227,201,0)" }, { boxShadow: "0 0 0 2px rgba(79,227,201,1)", duration: 0.4 }, 4.6);
      show("#t1", 5.4, { y: 20 });`,
});

/* 3 ─ ERP */
const erpRows = [
  ["Cotton tees", 0.82, "SKU-1042"],
  ["Denim jackets", 0.64, "SKU-2210"],
  ["Canvas totes", 0.71, "SKU-3307"],
  ["Linen shirts", 0.55, "SKU-4185"],
];
add({
  slug: "erp",
  eyebrow: "ERP & Operations Systems",
  sceneCss: `.inv{padding:22px 24px;display:flex;flex-direction:column;gap:16px;width:560px}.row{display:grid;grid-template-columns:140px 1fr 70px;gap:16px;align-items:center}.row p{font-size:15px;font-weight:600}.row small{display:block;font:500 11px ui-monospace,Consolas,monospace;color:var(--muted);margin-top:3px}.trackb{height:10px;border-radius:5px;background:rgba(237,229,214,.1);overflow:hidden}.fill{width:100%;height:100%;background:var(--accent);transform-origin:left}.qty{font:700 14px ui-monospace,Consolas,monospace;text-align:right}.fc{padding:20px 22px;width:380px}.fc svg{display:block;margin-top:12px}`,
  html: `${win("Inventory · live", `<div class="inv">${erpRows
    .map(([n, v, sku], i) => `<div class="row"><div><p>${n}</p><small>${sku}</small></div><div class="trackb"><div id="f${i}" class="fill"></div></div><div id="q${i}" class="qty">0</div></div>`)
    .join("")}<div style="display:flex;gap:10px"><div id="al" class="chip signal"><b style="background:var(--signal)"></b>Low stock: Cotton tees</div><div id="po" class="chip mint"><b></b>PO #2031 created</div></div></div>`)}
  ${win("Demand forecast", `<div class="fc"><p class="label">Next 6 weeks</p><svg width="336" height="200" viewBox="0 0 336 200"><path d="M0 160 L56 140 L112 150 L168 110 L224 90 L280 60 L336 40" fill="none" stroke="rgba(237,229,214,.25)" stroke-width="2"/><path id="fcl" d="M0 160 L56 140 L112 150 L168 110 L224 90 L280 60 L336 40" fill="none" stroke="var(--mint)" stroke-width="4" stroke-linecap="round" stroke-dasharray="460" stroke-dashoffset="460"/></svg><p class="label" style="margin-top:10px;color:var(--mint)">Demand rising · reorder early</p></div>`)}`,
  js: `
      ${erpRows.map(([, v], i) => `tl.fromTo("#f${i}", { scaleX: 0 }, { scaleX: ${v}, duration: 1, ease: "power3.out" }, ${0.8 + i * 0.12}); count("#q${i}", ${Math.round(v * 500)}, ${0.8 + i * 0.12}, 1);`).join("\n      ")}
      tl.to("#fcl", { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut" }, 1.2);
      tl.to("#f0", { scaleX: 0.1, backgroundColor: "#ff7a45", duration: 0.9, ease: "power2.inOut" }, 2.8);
      { const o = { v: 410 }; tl.to(o, { v: 48, duration: 0.9, ease: "power2.inOut", onUpdate: () => { document.querySelector("#q0").textContent = Math.round(o.v); } }, 2.8); }
      show("#al", 3.5); show("#po", 4.3);
      tl.to("#f0", { scaleX: 0.86, backgroundColor: "#4fe3c9", duration: 1, ease: "power3.out" }, 5.2);
      { const o = { v: 48 }; tl.to(o, { v: 430, duration: 1, ease: "power3.out", onUpdate: () => { document.querySelector("#q0").textContent = Math.round(o.v); } }, 5.2); }`,
});

/* 4 ─ Voice agent */
const waveN = 28;
add({
  slug: "voice-agent",
  eyebrow: "AI Voice Agents",
  sceneCss: `.call{width:400px;padding:28px;display:flex;flex-direction:column;align-items:center;gap:18px}.av{position:relative;width:96px;height:96px;border-radius:50%;background:linear-gradient(135deg,var(--accentd),var(--accent));display:grid;place-items:center;font:700 30px ui-sans-serif,system-ui,sans-serif;color:#fff}.ring{position:absolute;inset:-10px;border-radius:50%;border:2px solid var(--accent)}.wave{display:flex;gap:5px;align-items:center;height:70px}.wave span{display:block;width:6px;height:60px;border-radius:3px;background:var(--mint);transform-origin:center}.tr{width:520px;padding:22px 24px;display:flex;flex-direction:column;gap:14px}.ln{font-size:16px;line-height:1.45;color:var(--ink2)}.ln b{display:inline-block;width:64px;font:700 11px ui-monospace,Consolas,monospace;letter-spacing:.1em;color:var(--muted)}`,
  html: `${win("Call · Bright Smile Dental", `<div class="call"><div class="av"><div id="ring" class="ring"></div>AI</div><p style="font-size:18px;font-weight:600">Incoming call</p><p class="mono" style="color:var(--muted);font-size:13px">+1 (555) 014-2276 · 00:42</p><div class="wave">${Array.from({ length: waveN }, (_, i) => `<span class="w"></span>`).join("")}</div></div>`)}
  ${win("Live transcript", `<div class="tr"><p id="t1" class="ln"><b>CALLER</b>Hi, I'd like to book a cleaning.</p><p id="t2" class="ln"><b>AI</b>Sure! I have Tuesday at 4:00 PM. Does that work?</p><p id="t3" class="ln"><b>CALLER</b>Perfect, book it.</p><div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:6px"><div id="bk" class="chip mint"><b></b>Booked · Tue 4:00 PM</div><div id="sm" class="chip accent"><b style="background:var(--accent)"></b>Summary sent to team</div></div></div>`)}`,
  js: `
      tl.fromTo("#ring", { scale: 1, opacity: 0.8 }, { scale: 1.35, opacity: 0, duration: 1.1, repeat: 5, ease: "sine.out" }, 0.4);
      const bars = gsap.utils.toArray(".w");
      tl.set(bars, { scaleY: 0.15 }, 0);
      for (let k = 0; k < 9; k++) {
        tl.to(bars, { scaleY: (i) => 0.15 + 0.85 * Math.abs(Math.sin(i * 0.55 + k * 1.7)) * (0.45 + 0.55 * Math.abs(Math.cos(i * 0.23 + k))), duration: 0.3, ease: "sine.inOut", stagger: 0.008 }, 1 + k * 0.6);
      }
      tl.to(bars, { scaleY: 0.15, duration: 0.4 }, 6.6);
      show("#t1", 1.2, { x: 16 }); show("#t2", 2.5, { x: 16 }); show("#t3", 3.8, { x: 16 });
      show("#bk", 4.8, { scale: 0.9 }); show("#sm", 5.6, { scale: 0.9 });`,
});

/* 5 ─ WhatsApp */
add({
  slug: "whatsapp-automation",
  eyebrow: "WhatsApp Business Automation",
  sceneCss: `.phone{width:330px;height:560px;border-radius:38px;padding:12px;background:#0a0908;border:1px solid var(--line2);box-shadow:0 40px 90px -30px rgba(0,0,0,.8)}.scr{width:100%;height:100%;border-radius:28px;overflow:hidden;background:#12201c;display:flex;flex-direction:column}.wh{display:flex;align-items:center;gap:10px;padding:16px;background:#1b2e28}.wh i{display:block;width:34px;height:34px;border-radius:50%;background:var(--mint)}.wh p{font-weight:600;font-size:15px}.wh small{display:block;font-size:11px;color:var(--mint)}.wc{flex:1;padding:14px;display:flex;flex-direction:column;gap:10px}.wb{max-width:80%;padding:10px 12px;border-radius:12px;font-size:14px;line-height:1.4}.in{align-self:flex-start;background:#1f2c28}.out{align-self:flex-end;background:#0b6b55}.prod{align-self:flex-start;width:200px;border-radius:12px;overflow:hidden;background:#1f2c28}.img{height:96px;background:linear-gradient(135deg,var(--accentd),var(--mint))}.prod div.t{padding:10px 12px;font-size:14px}.buy{margin:0 12px 12px;padding:8px;border-radius:8px;text-align:center;font-weight:700;font-size:13px;background:rgba(79,227,201,.18);color:var(--mint)}.notes{display:flex;flex-direction:column;gap:14px;width:340px}`,
  html: `<div class="phone"><div class="scr"><div class="wh"><i></i><div><p>Nest &amp; Co.</p><small>Online · replies instantly</small></div></div><div class="wc">
    <div id="w1" class="wb in" style="align-self:flex-end;background:#0b6b55">Hi! Do you have the blue tote?</div>
    <div id="w2" class="prod"><div class="img"></div><div class="t"><b>Blue Canvas Tote</b><br/>₹1,499 · In stock</div><div class="buy">Buy now</div></div>
    <div id="w3" class="wb" style="align-self:flex-end;background:#0b6b55">Yes, 1 please</div>
    <div id="w4" class="wb in">Order #1042 confirmed. Pay securely here and we'll ship today.</div>
  </div></div></div>
  <div class="notes"><div id="n1" class="chip mint"><b></b>Catalogue shared automatically</div><div id="n2" class="chip accent"><b style="background:var(--accent)"></b>Order #1042 synced to CRM</div><div id="n3" class="chip"><b></b>Payment link sent</div><div id="n4" class="chip"><b></b>Delivery reminder scheduled</div></div>`,
  js: `
      show("#w1", 0.8, { x: 16 }); show("#w2", 1.8, { x: -16 }); show("#n1", 2.1, { x: 16 });
      show("#w3", 3.1, { x: 16 }); show("#w4", 4.0, { x: -16 }); show("#n2", 4.4, { x: 16 }); show("#n3", 5.0, { x: 16 }); show("#n4", 5.6, { x: 16 });`,
});

/* 6 ─ Document automation */
const docFields = [
  ["Vendor", "Acme Supplies Ltd."],
  ["Invoice no.", "INV-20931"],
  ["Date", "12 Sep 2026"],
  ["Total", "₹48,250.00"],
];
add({
  slug: "document-automation",
  eyebrow: "Document & Invoice Processing",
  sceneCss: `.paper{position:relative;width:360px;height:470px;border-radius:10px;background:var(--paper);color:#15130f;padding:28px;overflow:hidden;box-shadow:0 40px 80px -30px rgba(0,0,0,.8)}.paper h3{font:800 22px ui-sans-serif,system-ui,sans-serif;letter-spacing:.06em}.pl{display:block;height:7px;border-radius:4px;background:rgba(21,19,15,.15);margin-top:10px}.hl{position:absolute;left:22px;right:22px;height:30px;border-radius:6px;border:2px solid var(--accentd);background:rgba(43,59,255,.08)}.scan{position:absolute;left:0;right:0;top:0;height:3px;background:var(--mint);box-shadow:0 0 18px 4px rgba(79,227,201,.6)}.form{width:470px;padding:22px 24px;display:flex;flex-direction:column;gap:12px}.fld{display:grid;grid-template-columns:110px 1fr 24px;align-items:center;gap:12px;padding:12px 14px;border-radius:10px;background:var(--panel2);border:1px solid var(--line)}.fld span.v{font-size:16px;font-weight:600}.ck{width:22px;height:22px;border-radius:50%;background:var(--mint);color:#0e0d0b;display:grid;place-items:center;font:800 13px ui-sans-serif,system-ui,sans-serif}`,
  html: `<div class="paper"><h3>INVOICE</h3><p class="mono" style="font-size:12px;margin-top:6px;color:#5b554a">Acme Supplies Ltd. · INV-20931</p>${[90, 74, 86, 62].map((w) => `<span class="pl" style="width:${w}%"></span>`).join("")}<div style="margin-top:22px">${Array.from({ length: 6 }, (_, i) => `<span class="pl" style="width:${[92, 80, 88, 70, 84, 76][i]}%"></span>`).join("")}</div><p style="margin-top:26px;font:800 20px ui-sans-serif,system-ui,sans-serif;text-align:right">₹48,250.00</p>
    ${[58, 92, 128, 288].map((t, i) => `<div id="h${i}" class="hl" style="top:${t}px"></div>`).join("")}<div id="scan" class="scan"></div></div>
  ${win("Extracted · AP automation", `<div class="form">${docFields
    .map(([k, v], i) => `<div class="fld"><span class="label">${k}</span><span id="v${i}" class="v">${v}</span><span id="k${i}" class="ck">✓</span></div>`)
    .join("")}<div id="sy" class="chip mint" style="align-self:flex-start;margin-top:4px"><b></b>Synced to accounting</div></div>`)}`,
  js: `
      tl.fromTo("#scan", { y: 0, autoAlpha: 0 }, { y: 466, autoAlpha: 1, duration: 1.8, ease: "sine.inOut" }, 0.7);
      tl.to("#scan", { autoAlpha: 0, duration: 0.2 }, 2.5);
      ${docFields.map((_, i) => `tl.fromTo("#h${i}", { autoAlpha: 0, scale: 0.96 }, { autoAlpha: 1, scale: 1, duration: 0.3 }, ${1.2 + i * 0.35}); type("#v${i}", ${2.6 + i * 0.6}, 0.45); show("#k${i}", ${3.05 + i * 0.6}, { scale: 0.4, y: 0 });`).join("\n      ")}
      show("#sy", 5.6);`,
});

/* 7 ─ Knowledge assistant */
add({
  slug: "knowledge-assistant",
  eyebrow: "Internal Knowledge Assistant",
  sceneCss: `.kb{display:grid;grid-template-columns:220px 1fr;width:1000px;height:440px}.docs{border-right:1px solid var(--line);padding:18px;display:flex;flex-direction:column;gap:10px}.doc{display:flex;gap:10px;align-items:center;padding:10px;border-radius:8px;font-size:13px;color:var(--ink2);border:1px solid transparent}.doc i{display:block;width:16px;height:20px;border-radius:3px;background:rgba(237,229,214,.25);flex:none}.main{padding:26px 30px;display:flex;flex-direction:column;gap:18px}.ask{display:flex;align-items:center;gap:12px;padding:16px 18px;border-radius:12px;border:1px solid var(--line2);background:var(--panel2);font-size:17px}.ans{padding:20px 22px;border-radius:12px;background:rgba(142,155,255,.07);border:1px solid rgba(142,155,255,.3);font-size:16px;line-height:1.55;color:var(--ink2)}.src{display:flex;gap:10px;margin-top:14px}`,
  html: `${win("Team assistant · private", `<div class="kb"><div class="docs"><p class="label" style="margin-bottom:6px">Sources</p>${["Refund-Policy.pdf", "Billing SOP", "Onboarding guide", "Pricing FAQ", "Support macros"]
    .map((d, i) => `<div id="d${i}" class="doc"><i></i>${d}</div>`)
    .join("")}</div><div class="main"><div class="ask"><span class="label" style="color:var(--accent)">Ask</span><span id="q" style="white-space:nowrap">What's our refund policy for annual plans?</span></div><div id="ans" class="ans">Annual plans can be refunded in full within <b style="color:var(--ink)">30 days</b> of purchase. After that, unused months are credited to the account.<div class="src"><span id="s0" class="chip accent"><b style="background:var(--accent)"></b>Refund-Policy.pdf · p.2</span><span id="s1" class="chip"><b></b>Billing SOP</span></div></div></div></div>`, "")}`,
  js: `
      ${[0, 1, 2, 3, 4].map((i) => `show("#d${i}", ${0.6 + i * 0.1}, { x: -10 });`).join(" ")}
      type("#q", 1.0, 1.6);
      tl.to("#d0", { borderColor: "rgba(142,155,255,.6)", backgroundColor: "rgba(142,155,255,.1)", duration: 0.3 }, 2.8);
      tl.to("#d1", { borderColor: "rgba(142,155,255,.6)", backgroundColor: "rgba(142,155,255,.1)", duration: 0.3 }, 3.0);
      show("#ans", 3.3); show("#s0", 4.4, { scale: 0.9 }); show("#s1", 4.7, { scale: 0.9 });`,
});

/* 8 ─ AI insights */
const bars8 = [0.45, 0.6, 0.52, 0.92, 0.7, 0.58, 0.66];
add({
  slug: "ai-insights",
  eyebrow: "AI Business Insights",
  sceneCss: `.dash{width:1040px;padding:22px 24px;display:flex;flex-direction:column;gap:18px}.kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.kpi{padding:16px 18px}.kpi p{font:800 30px ui-sans-serif,system-ui,sans-serif;margin-top:8px}.kpi small{font:600 12px ui-monospace,Consolas,monospace;color:var(--mint)}.lower{display:grid;grid-template-columns:1.3fr 1fr;gap:14px}.chart{position:relative;padding:18px;height:220px;display:flex;align-items:flex-end;gap:16px}.chart div.b{flex:1;height:170px;border-radius:6px 6px 0 0;background:rgba(142,155,255,.45);transform-origin:bottom}.qa{padding:18px;display:flex;flex-direction:column;gap:14px}.qq{padding:12px 14px;border-radius:10px;background:rgba(237,229,214,.05);border:1px solid var(--line2);font-size:15px;white-space:nowrap}.qr{font-size:15px;line-height:1.5;color:var(--ink2)}`,
  html: `${win("Insights · Sales overview", `<div class="dash"><div class="kpis">${[
    ["Revenue", "k1", "+12% vs last month"],
    ["Orders", "k2", "+8% vs last month"],
    ["Avg. order", "k3", "+4% vs last month"],
  ]
    .map(([l, id, d]) => `<div class="card kpi"><span class="label">${l}</span><p id="${id}">0</p><small>${d}</small></div>`)
    .join("")}</div><div class="lower"><div class="card chart">${bars8.map((_, i) => `<div id="b${i}" class="b"></div>`).join("")}</div><div class="card qa"><span class="label">Ask your data</span><div class="qq"><span id="q8">Which products sold best last month?</span></div><p id="r8" class="qr"><b style="color:var(--ink)">Running shoes</b> were the top seller, driven by repeat customers in Mumbai and Pune.</p></div></div></div>`)}`,
  js: `
      count("#k1", 482, 0.8, 1.4, (v) => "₹" + Math.round(v) + "K"); count("#k2", 3146, 0.9, 1.4, (v) => Math.round(v).toLocaleString("en-US")); count("#k3", 1530, 1.0, 1.4, (v) => "₹" + Math.round(v).toLocaleString("en-US"));
      ${bars8.map((v, i) => `tl.fromTo("#b${i}", { scaleY: 0 }, { scaleY: ${v}, duration: 0.8, ease: "power3.out" }, ${1.0 + i * 0.08});`).join(" ")}
      type("#q8", 2.4, 1.4);
      tl.to("#b3", { backgroundColor: "#4fe3c9", duration: 0.4 }, 4.0);
      tl.to(["#b0", "#b1", "#b2", "#b4", "#b5", "#b6"], { opacity: 0.35, duration: 0.4 }, 4.0);
      show("#r8", 4.2);`,
});

/* 9 ─ Marketing engine */
const outs = [
  ["LinkedIn post", 0],
  ["Email campaign", 1],
  ["Instagram carousel", 2],
  ["Ad copy", 3],
];
add({
  slug: "marketing-engine",
  eyebrow: "AI Marketing & Content Engine",
  sceneCss: `.mk{position:relative;width:1080px;height:470px}.src{position:absolute;left:0;top:135px;width:300px;padding:20px}.vid{height:120px;border-radius:8px;background:linear-gradient(135deg,#2b3bff,#8e9bff);display:grid;place-items:center}.vid i{display:block;width:0;height:0;border-left:22px solid #fff;border-top:14px solid transparent;border-bottom:14px solid transparent}.out{position:absolute;left:640px;width:400px;padding:16px 18px;display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center}.out p{font-weight:700;font-size:15px}.st{padding:5px 9px;border-radius:999px;font:700 11px ui-monospace,Consolas,monospace;letter-spacing:.08em;background:rgba(79,227,201,.15);color:var(--mint)}svg.ln{position:absolute;inset:0}`,
  html: `<div class="mk"><svg class="ln" width="1080" height="470">${outs.map(([, i]) => `<path id="p${i}" d="M300 235 C 470 235, 470 ${58 + i * 118}, 640 ${58 + i * 118}" fill="none" stroke="rgba(142,155,255,.55)" stroke-width="2" stroke-dasharray="420" stroke-dashoffset="420"/>`).join("")}</svg>
    <div id="src" class="card src"><span class="label">Source</span><div class="vid" style="margin-top:12px"><i></i></div><p style="margin-top:12px;font-weight:700">Webinar recording · 48 min</p></div>
    ${outs.map(([t, i]) => `<div id="o${i}" class="card out" style="top:${18 + i * 118}px"><p>${t}</p><span id="a${i}" class="st">APPROVED</span><div style="grid-column:1/-1;display:flex;flex-direction:column;gap:7px;margin-top:4px"><span class="skel" style="width:96%"></span><span class="skel" style="width:78%"></span></div></div>`).join("")}
  </div>`,
  js: `
      show("#src", 0.6, { x: -20 });
      ${outs.map(([, i]) => `tl.to("#p${i}", { strokeDashoffset: 0, duration: 0.7, ease: "power2.inOut" }, ${1.3 + i * 0.35}); show("#o${i}", ${1.8 + i * 0.35}, { x: 24 }); show("#a${i}", ${3.9 + i * 0.4}, { scale: 0.6, y: 0 });`).join("\n      ")}`,
});

/* 10 ─ Workflow automation */
const nodes = [
  ["Inbox", "New request"],
  ["AI triage", "Classified · urgent"],
  ["CRM", "Ticket created"],
  ["Team chat", "Owner notified"],
];
add({
  slug: "workflow-automation",
  eyebrow: "Custom Workflow Automation",
  sceneCss: `.flow{position:relative;width:1080px;height:300px}.node{position:absolute;top:80px;width:210px;padding:18px;border-radius:14px;background:var(--panel);border:1px solid var(--line2)}.node p{font-weight:700;font-size:17px}.node small{display:block;margin-top:6px;font:500 12px ui-monospace,Consolas,monospace;color:var(--muted)}.node .dot{position:absolute;right:16px;top:20px;width:10px;height:10px;border-radius:50%;background:rgba(237,229,214,.2)}.wire{position:absolute;top:139px;height:2px;background:var(--line2)}.pulse{position:absolute;top:133px;width:14px;height:14px;border-radius:50%;background:var(--mint);box-shadow:0 0 16px 4px rgba(79,227,201,.6)}.cnt{position:absolute;left:0;right:0;bottom:-10px;display:flex;justify-content:center;gap:14px}`,
  html: `<div class="flow">${nodes.map((_, i) => (i < 3 ? `<div class="wire" style="left:${210 + i * 290}px;width:80px"></div>` : "")).join("")}${nodes
    .map(([t, s], i) => `<div id="n${i}" class="node" style="left:${i * 290}px"><span id="nd${i}" class="dot"></span><p>${t}</p><small>${s}</small></div>`)
    .join("")}${[0, 1, 2].map((i) => `<div id="pu${i}" class="pulse" style="left:${203 + i * 290}px"></div>`).join("")}
    <div class="cnt"><div class="chip mint"><b></b>Tasks automated today: <span id="ct" class="mono">0</span></div><div id="nt" class="chip"><b></b>0 manual steps</div></div></div>`,
  js: `
      ${nodes.map((_, i) => `show("#n${i}", ${0.6 + i * 0.15});`).join(" ")}
      for (let r = 0; r < 2; r++) {
        const base = 1.6 + r * 2.4;
        tl.to("#nd0", { backgroundColor: "#4fe3c9", duration: 0.2 }, base);
        for (let i = 0; i < 3; i++) {
          tl.fromTo("#pu" + i, { x: 0, autoAlpha: 0 }, { x: 80, autoAlpha: 1, duration: 0.5, ease: "power1.inOut" }, base + 0.2 + i * 0.6);
          tl.to("#pu" + i, { autoAlpha: 0, duration: 0.15 }, base + 0.7 + i * 0.6);
          tl.to("#nd" + (i + 1), { backgroundColor: "#4fe3c9", duration: 0.2 }, base + 0.7 + i * 0.6);
        }
        if (r === 0) tl.to(["#nd0", "#nd1", "#nd2", "#nd3"], { backgroundColor: "rgba(237,229,214,.2)", duration: 0.2 }, base + 2.15);
      }
      count("#ct", 128, 1.6, 4.8);
      show("#nt", 4.2, { scale: 0.9 });`,
});

/* 11 ─ AI recruitment */
const cands = [
  ["Ananya K.", 94, true],
  ["Rohan P.", 61, false],
  ["Meera J.", 88, true],
  ["Dev S.", 47, false],
  ["Sara L.", 91, true],
];
add({
  slug: "ai-recruitment",
  eyebrow: "AI Recruitment & HR",
  sceneCss: `.rc{position:relative;width:1060px;height:440px}.list{position:absolute;left:0;top:0;width:520px;display:flex;flex-direction:column;gap:12px}.cv{display:grid;grid-template-columns:44px 1fr 60px;gap:14px;align-items:center;padding:12px 16px;height:74px}.cv i{display:block;width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#3d392f,#5b554a)}.cv p{font-weight:700;font-size:16px}.cv small{display:block;font-size:12px;color:var(--muted);margin-top:3px}.ring{position:relative;width:52px;height:52px}.ring svg{position:absolute;inset:0;transform:rotate(-90deg)}.ring span{position:absolute;inset:0;display:grid;place-items:center;font:800 14px ui-monospace,Consolas,monospace}.sl{position:absolute;right:0;top:0;width:440px;height:420px;padding:18px;border-radius:14px;border:1px dashed rgba(79,227,201,.45);background:rgba(79,227,201,.04)}`,
  html: `<div class="rc"><div class="sl"><p class="label" style="color:var(--mint)">Shortlist · Senior Designer</p></div><div class="list">${cands
    .map(([n, s, ok], i) => `<div id="c${i}" class="card cv"><i></i><div><p>${n}</p><small>${["Product designer · 6 yrs", "Graphic designer · 2 yrs", "UX lead · 8 yrs", "Intern · 1 yr", "Design systems · 5 yrs"][i]}</small></div><div class="ring"><svg width="52" height="52"><circle cx="26" cy="26" r="22" fill="none" stroke="rgba(237,229,214,.12)" stroke-width="5"/><circle id="r${i}" cx="26" cy="26" r="22" fill="none" stroke="${ok ? "#4fe3c9" : "#ff7a45"}" stroke-width="5" stroke-linecap="round" stroke-dasharray="138.2" stroke-dashoffset="138.2"/></svg><span id="sc${i}">0</span></div></div>`)
    .join("")}</div><div id="iv" class="chip accent" style="position:absolute;right:20px;bottom:24px"><b style="background:var(--accent)"></b>Interviews scheduled</div></div>`,
  js: `
      ${cands.map((_, i) => `show("#c${i}", ${0.6 + i * 0.12}, { x: -16 });`).join(" ")}
      ${cands.map(([, s], i) => `tl.to("#r${i}", { strokeDashoffset: ${(138.2 * (1 - s / 100)).toFixed(1)}, duration: 1, ease: "power2.out" }, ${1.4 + i * 0.12}); count("#sc${i}", ${s}, ${1.4 + i * 0.12}, 1);`).join("\n      ")}
      ${(() => {
        let slot = 0;
        return cands
          .map(([, , ok], i) => {
            if (ok) {
              const t = 3.2 + slot * 0.45;
              const dy = 46 + slot * 86 - i * 86;
              slot++;
              return `tl.to("#c${i}", { x: 570, y: ${dy}, scale: 0.84, duration: 0.8, ease: "power3.inOut" }, ${t});`;
            }
            return `tl.to("#c${i}", { opacity: 0.3, duration: 0.4 }, 3.2);`;
          })
          .join("\n      ");
      })()}
      show("#iv", 5.4);`,
});

/* 12 ─ Immersive website */
add({
  slug: "immersive-website",
  eyebrow: "Immersive Websites",
  sceneCss: `.site{position:relative;width:1000px;height:450px;overflow:hidden;background:radial-gradient(60% 80% at 70% 40%,rgba(43,59,255,.35),transparent 70%),#0b0a09}.hero{position:absolute;left:60px;top:90px;width:430px}.hero h2{font:900 86px/0.9 ui-sans-serif,system-ui,sans-serif;letter-spacing:-.04em}.hero p{margin-top:16px;font-size:16px;color:var(--ink2);line-height:1.5}.cta{display:inline-block;margin-top:22px;padding:12px 18px;border-radius:999px;background:var(--ink);color:#0e0d0b;font-weight:800;font-size:13px;letter-spacing:.08em}.persp{position:absolute;right:120px;top:110px;width:230px;height:230px;perspective:900px}.cube{position:relative;width:100%;height:100%;transform-style:preserve-3d}.face{position:absolute;inset:0;border:1px solid rgba(255,255,255,.35);background:linear-gradient(135deg,rgba(142,155,255,.55),rgba(79,227,201,.35))}.orb{position:absolute;border-radius:50%;background:radial-gradient(circle at 30% 30%,#fff,var(--accent) 40%,transparent 70%);opacity:.7}`,
  html: `${win("aura.studio", `<div class="site"><div id="ly1" class="orb" style="width:60px;height:60px;left:560px;top:60px"></div><div id="ly2" class="orb" style="width:26px;height:26px;left:880px;top:330px"></div><div id="ly3" class="orb" style="width:40px;height:40px;left:520px;top:350px"></div><div id="hero" class="hero"><h2>AURA</h2><p>Sound you can see. Explore the speaker in 3D, from every angle.</p><span class="cta">EXPLORE IN 3D</span></div><div class="persp"><div id="cube" class="cube">${[
    "rotateY(0deg) translateZ(115px)",
    "rotateY(90deg) translateZ(115px)",
    "rotateY(180deg) translateZ(115px)",
    "rotateY(-90deg) translateZ(115px)",
    "rotateX(90deg) translateZ(115px)",
    "rotateX(-90deg) translateZ(115px)",
  ]
    .map((t) => `<div class="face" style="transform:${t}"></div>`)
    .join("")}</div></div></div>`)}`,
  js: `
      tl.fromTo("#hero h2", { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: "expo.out" }, 0.6);
      tl.fromTo(["#hero p", "#hero .cta"], { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.15, ease: "power3.out" }, 1.0);
      tl.fromTo("#cube", { rotationX: -18, rotationY: 0 }, { rotationX: 18, rotationY: 300, duration: 6.4, ease: "sine.inOut" }, 0.5);
      tl.fromTo("#ly1", { y: 0 }, { y: -50, duration: 6, ease: "sine.inOut" }, 0.8);
      tl.fromTo("#ly2", { y: 0 }, { y: -110, duration: 6, ease: "sine.inOut" }, 0.8);
      tl.fromTo("#ly3", { y: 0, x: 0 }, { y: -80, x: 30, duration: 6, ease: "sine.inOut" }, 0.8);
      tl.to("#hero", { y: -30, duration: 3, ease: "sine.inOut" }, 4);`,
});

/* 13 ─ SaaS MVP */
const steps = ["Idea", "Design", "Build", "Launch"];
add({
  slug: "saas-mvp",
  eyebrow: "SaaS & Product MVPs",
  sceneCss: `.mv{display:flex;flex-direction:column;align-items:center;gap:26px}.steps{display:flex;align-items:center;gap:0}.st{display:flex;align-items:center;gap:10px;font:700 13px ui-monospace,Consolas,monospace;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}.st i{display:block;width:14px;height:14px;border-radius:50%;border:2px solid var(--line2)}.sg{width:90px;height:2px;margin:0 14px;background:var(--line2);position:relative}.sg div{position:absolute;inset:0;background:var(--mint);transform-origin:left}.app{display:grid;grid-template-columns:170px 1fr;width:900px;height:330px}.sb{border-right:1px solid var(--line);padding:18px;display:flex;flex-direction:column;gap:12px}.mn{padding:20px;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:90px 1fr;gap:14px}.ch{grid-column:1/-1;padding:16px;position:relative}.pay{position:absolute;right:16px;top:16px;padding:9px 14px;border-radius:8px;background:var(--accentd);color:#fff;font-weight:800;font-size:13px}`,
  html: `<div class="mv"><div class="steps">${steps
    .map((s, i) => `<div id="st${i}" class="st"><i id="si${i}"></i>${s}</div>${i < 3 ? `<div class="sg"><div id="sg${i}"></div></div>` : ""}`)
    .join("")}</div>${win("app.yourproduct.com", `<div class="app"><div id="sb" class="sb"><span class="skel" style="width:70%;height:12px;background:var(--accent)"></span><span class="skel" style="width:90%"></span><span class="skel" style="width:60%"></span><span class="skel" style="width:80%"></span></div><div class="mn">${[0, 1, 2]
    .map((i) => `<div id="kc${i}" class="card" style="padding:14px"><span class="label">${["Users", "MRR", "Churn"][i]}</span><p style="font:800 22px ui-sans-serif,system-ui,sans-serif;margin-top:8px">${["1,204", "₹2.4L", "1.8%"][i]}</p></div>`)
    .join("")}<div id="chc" class="card ch"><span class="label">Sign-ups</span><span id="pay" class="pay">Upgrade plan</span><svg width="660" height="120" viewBox="0 0 660 120" style="margin-top:10px"><path id="lc" d="M0 110 C 120 100, 180 80, 260 70 S 420 40, 520 30 S 620 10, 660 6" fill="none" stroke="var(--mint)" stroke-width="3" stroke-dasharray="760" stroke-dashoffset="760"/></svg></div></div></div>`)}<div id="lv" class="chip mint"><b></b>Live · first customers signed up</div></div>`,
  js: `
      ${steps.map((_, i) => `tl.to("#si${i}", { backgroundColor: "#4fe3c9", borderColor: "#4fe3c9", duration: 0.25 }, ${0.7 + i * 1.1}); tl.to("#st${i}", { color: "#ede5d6", duration: 0.25 }, ${0.7 + i * 1.1});${i < 3 ? ` tl.fromTo("#sg${i}", { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: "none" }, ${0.95 + i * 1.1});` : ""}`).join("\n      ")}
      show("#sb", 1.4, { x: -20 });
      ${[0, 1, 2].map((i) => `show("#kc${i}", ${2.2 + i * 0.15}, { scale: 0.92 });`).join(" ")}
      show("#chc", 2.9);
      tl.to("#lc", { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut" }, 3.2);
      show("#pay", 3.8, { scale: 0.8, y: 0 });
      show("#lv", 4.7, { scale: 0.9 });`,
});

/* 14 ─ Booking platform */
const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const booked = [[0, 1], [1, 3], [2, 0], [3, 2], [0, 4], [4, 1], [2, 3], [1, 0], [4, 4], [3, 3]];
add({
  slug: "booking-platform",
  eyebrow: "Booking & Appointment Platforms",
  sceneCss: `.cal{position:relative;width:640px;padding:20px 22px}.cg{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-top:12px}.dh{font:700 12px ui-monospace,Consolas,monospace;letter-spacing:.1em;color:var(--muted);text-transform:uppercase;text-align:center}.slot{height:46px;border-radius:8px;background:rgba(237,229,214,.04);border:1px solid var(--line)}.bkd{position:absolute;height:46px;border-radius:8px;background:rgba(142,155,255,.35);border:1px solid rgba(142,155,255,.7);padding:7px 9px;font:600 11px ui-sans-serif,system-ui,sans-serif;color:var(--ink)}.side{display:flex;flex-direction:column;gap:14px;width:330px}.nb{padding:18px}.nb p{font-weight:800;font-size:17px;margin-top:8px}.nb small{display:block;margin-top:6px;color:var(--ink2);font-size:14px}`,
  html: `${win("Bookings · Glow Salon", `<div class="cal"><div class="cg">${days.map((d) => `<div class="dh">${d}</div>`).join("")}${Array.from({ length: 25 }, () => `<div class="slot"></div>`).join("")}</div>${booked
    .map(([d, s], i) => `<div id="bk${i}" class="bkd" style="left:${22 + d * 121.2}px;top:${50 + s * 56}px;width:111px">${["Haircut", "Facial", "Colour", "Manicure", "Spa"][i % 5]}</div>`)
    .join("")}</div>`)}<div class="side"><div id="nb" class="card nb"><span class="label" style="color:var(--mint)">New booking</span><p>Haircut · Thu 3:00 PM</p><small>Deposit paid online · Riya M.</small></div><div id="rm" class="chip accent"><b style="background:var(--accent)"></b>Reminder sent on WhatsApp</div><div id="ns" class="chip mint"><b></b>Slot confirmed by customer</div></div>`,
  js: `
      ${booked.map((_, i) => `show("#bk${i}", ${0.8 + i * 0.28}, { scale: 0.7, y: 0 });`).join(" ")}
      show("#nb", 2.6, { x: 20 }); show("#rm", 4.2, { x: 20 }); show("#ns", 5.2, { x: 20 });`,
});

/* 15 ─ AI e-commerce */
const prods = [
  ["Trail runner", "₹4,299", 1],
  ["Leather boot", "₹6,999", 0],
  ["Cloud jogger", "₹3,899", 1],
  ["Canvas sneaker", "₹2,499", 0],
  ["Road racer", "₹5,499", 1],
  ["Slip-on", "₹1,999", 0],
];
add({
  slug: "ai-ecommerce",
  eyebrow: "AI-Powered E-commerce",
  sceneCss: `.shop{position:relative;width:1040px;height:450px;padding:20px 24px}.sr{display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:12px;border:1px solid var(--line2);background:var(--panel2);font-size:16px;width:560px}.cart{position:absolute;right:28px;top:26px;display:flex;align-items:center;gap:10px;font-weight:700}.cart span{min-width:26px;height:26px;border-radius:999px;background:var(--accentd);color:#fff;display:grid;place-items:center;font:800 13px ui-monospace,Consolas,monospace}.pg{position:relative;margin-top:22px;height:320px}.pc{position:absolute;width:310px;height:148px;padding:12px;display:grid;grid-template-columns:110px 1fr;gap:12px}.pi{border-radius:8px;background:linear-gradient(135deg,#3d392f,#5b554a)}.pc p{font-weight:700;font-size:15px}.pc small{display:block;margin-top:4px;color:var(--muted)}.bm{display:inline-block;margin-top:10px;padding:4px 8px;border-radius:999px;font:700 10px ui-monospace,Consolas,monospace;letter-spacing:.08em;background:rgba(79,227,201,.15);color:var(--mint)}`,
  html: `${win("store.example.com", `<div class="shop"><div class="sr"><span class="label">Search</span><span id="q15" style="white-space:nowrap">comfy running shoes for daily runs</span></div><div class="cart">Cart <span id="cc">0</span></div><div class="pg">${prods
    .map(([n, p, m], i) => `<div id="pc${i}" class="card pc" style="left:${(i % 3) * 330}px;top:${Math.floor(i / 3) * 164}px"><div class="pi"${m ? ` style="background:linear-gradient(135deg,var(--accentd),var(--mint))"` : ""}></div><div><p>${n}</p><small>${p}</small>${m ? `<span id="bm${i}" class="bm">BEST MATCH</span>` : ""}</div></div>`)
    .join("")}</div></div>`)}`,
  js: `
      ${prods.map((_, i) => `show("#pc${i}", ${0.6 + i * 0.08}, { scale: 0.94 });`).join(" ")}
      type("#q15", 1.3, 1.5);
      ${(() => {
        const order = [0, 2, 4, 1, 3, 5];
        return order
          .map((pi, slot) => {
            const fx = (slot % 3) * 330 - (pi % 3) * 330;
            const fy = Math.floor(slot / 3) * 164 - Math.floor(pi / 3) * 164;
            return `tl.to("#pc${pi}", { x: ${fx}, y: ${fy}, duration: 0.9, ease: "power3.inOut" }, 3.0);`;
          })
          .join("\n      ");
      })()}
      tl.to(["#pc1", "#pc3", "#pc5"], { opacity: 0.4, duration: 0.5 }, 3.2);
      ${[0, 2, 4].map((i, k) => `show("#bm${i}", ${3.9 + k * 0.15}, { scale: 0.7, y: 0 });`).join(" ")}
      tl.fromTo("#cc", { scale: 1 }, { scale: 1.35, duration: 0.2, yoyo: true, repeat: 1 }, 5.0);
      count("#cc", 1, 5.0, 0.1); tl.fromTo("#cc", { scale: 1 }, { scale: 1.35, duration: 0.2, yoyo: true, repeat: 1 }, 5.7);
      { const o = { v: 1 }; tl.to(o, { v: 2, duration: 0.1, onUpdate: () => { document.querySelector("#cc").textContent = Math.round(o.v); } }, 5.7); }`,
});

/* 16 ─ Portal */
const pst = ["Received", "Packed", "Shipped", "Delivered"];
add({
  slug: "admin-dashboard",
  eyebrow: "Custom Portals & Admin Panels",
  sceneCss: `.pt{width:1000px;padding:24px 28px;display:flex;flex-direction:column;gap:22px}.hd{display:flex;justify-content:space-between;align-items:center}.ord{padding:20px 22px}.track{position:relative;display:flex;justify-content:space-between;margin-top:20px}.line{position:absolute;left:12px;right:12px;top:11px;height:3px;background:var(--line2)}.line div{position:absolute;inset:0;background:var(--mint);transform-origin:left}.ps{position:relative;display:flex;flex-direction:column;align-items:center;gap:10px;font:600 13px ui-sans-serif,system-ui,sans-serif;color:var(--muted)}.ps i{display:block;width:24px;height:24px;border-radius:50%;background:var(--panel);border:3px solid var(--line2)}.docs{display:grid;grid-template-columns:1fr 1fr;gap:14px}.dc{padding:16px 18px;display:flex;align-items:center;gap:14px}.dc i{display:block;width:28px;height:34px;border-radius:4px;background:rgba(237,229,214,.2);flex:none}.sig{margin-left:auto}`,
  html: `${win("portal.acmelogistics.com", `<div class="pt"><div class="hd"><div><p class="label">Client portal</p><p style="font:800 22px ui-sans-serif,system-ui,sans-serif;margin-top:6px">Welcome back, Northwind Traders</p></div><div id="nf" class="chip accent"><b style="background:var(--accent)"></b>Shipment update</div></div><div class="card ord"><span class="label">Order #NW-5521 · 240 cartons</span><div class="track"><div class="line"><div id="ln"></div></div>${pst
    .map((s, i) => `<div class="ps"><i id="pi${i}"></i><span id="pl${i}">${s}</span></div>`)
    .join("")}</div></div><div class="docs"><div id="d1" class="card dc"><i></i><div><p style="font-weight:700">Service-Agreement.pdf</p><small style="color:var(--muted)">Awaiting signature</small></div><svg class="sig" width="120" height="40"><path id="sg" d="M4 30 C 20 4, 30 36, 46 18 S 70 10, 80 26 S 104 20, 116 12" fill="none" stroke="var(--mint)" stroke-width="3" stroke-linecap="round" stroke-dasharray="190" stroke-dashoffset="190"/></svg></div><div id="d2" class="card dc"><i></i><div><p style="font-weight:700">Invoice-September.pdf</p><small style="color:var(--muted)">Paid</small></div><span class="chip mint sig" style="padding:6px 10px;font-size:12px"><b></b>Paid</span></div></div></div>`)}`,
  js: `
      ${pst.map((_, i) => `tl.to("#pi${i}", { borderColor: "#4fe3c9", backgroundColor: "#4fe3c9", duration: 0.3 }, ${1.0 + i * 0.9}); tl.to("#pl${i}", { color: "#ede5d6", duration: 0.3 }, ${1.0 + i * 0.9});`).join("\n      ")}
      tl.fromTo("#ln", { scaleX: 0 }, { scaleX: 1, duration: 2.7, ease: "none" }, 1.0);
      show("#nf", 2.0, { scale: 0.9 }); show("#d1", 1.2); show("#d2", 1.4);
      tl.to("#sg", { strokeDashoffset: 0, duration: 1.2, ease: "power1.inOut" }, 4.4);`,
});

/* 17 ─ Computer vision */
const items = 7;
add({
  slug: "vision-ai",
  eyebrow: "Computer Vision for Business",
  sceneCss: `.cam{position:relative;width:820px;height:420px;overflow:hidden;background:repeating-linear-gradient(90deg,#1a1814 0 60px,#161410 60px 120px)}.belt{position:absolute;left:0;right:0;top:170px;height:120px;background:#22201b;border-top:2px solid #2f2c25;border-bottom:2px solid #2f2c25}.it{position:absolute;top:186px;width:88px;height:88px}.it i{position:absolute;inset:10px;border-radius:14px;background:linear-gradient(135deg,#5b554a,#8a8273)}.box{position:absolute;inset:0;border:2px solid var(--mint);border-radius:6px}.box span{position:absolute;left:-2px;top:-24px;padding:3px 6px;border-radius:4px;background:var(--mint);color:#0e0d0b;font:800 11px ui-monospace,Consolas,monospace;white-space:nowrap}.bad .box{border-color:var(--signal)}.bad .box span{background:var(--signal)}.bad i{background:linear-gradient(135deg,#5b554a,#8a8273);box-shadow:inset -18px -12px 0 -8px #3a2a22}.rec{position:absolute;left:16px;top:14px;display:flex;align-items:center;gap:8px;font:700 12px ui-monospace,Consolas,monospace;color:var(--ink)}.rec i{display:block;width:10px;height:10px;border-radius:50%;background:var(--signal)}.stats{display:flex;flex-direction:column;gap:14px;width:240px}.stat{padding:16px 18px}.stat p{font:800 34px ui-sans-serif,system-ui,sans-serif;margin-top:8px}`,
  html: `${win("Line 2 · camera 04", `<div class="cam"><div class="belt"></div><div class="rec"><i></i>LIVE · QUALITY CHECK</div><div id="row" style="position:absolute;inset:0">${Array.from({ length: items }, (_, i) => `<div class="it${i === 3 ? " bad" : ""}" style="left:${-140 - i * 160}px"><i></i><div class="box"><span>${i === 3 ? "DEFECT 0.97" : "OK 0.99"}</span></div></div>`).join("")}</div></div>`)}
  <div class="stats"><div class="card stat"><span class="label">Inspected</span><p id="in">0</p></div><div class="card stat"><span class="label" style="color:var(--signal)">Defects flagged</span><p id="df">0</p></div><div id="al" class="chip signal"><b style="background:var(--signal)"></b>Item removed from line</div></div>`,
  js: `
      tl.fromTo("#row", { x: 0 }, { x: 1150, duration: 6.6, ease: "none" }, 0.4);
      count("#in", 240, 0.6, 6);
      { const o = { v: 0 }; tl.to(o, { v: 1, duration: 0.1, onUpdate: () => { document.querySelector("#df").textContent = Math.round(o.v); } }, 3.6); }
      show("#al", 3.9, { x: 16 });`,
});

/* 18 ─ Video AI */
add({
  slug: "video-ai",
  eyebrow: "AI Video & Media Tools",
  sceneCss: `.va{display:flex;gap:26px;align-items:center}.pl{width:640px}.vp{height:290px;background:linear-gradient(135deg,#1f2a5a,#0b6b55);position:relative}.vp i{position:absolute;left:50%;top:50%;margin:-22px 0 0 -14px;width:0;height:0;border-left:30px solid rgba(255,255,255,.9);border-top:20px solid transparent;border-bottom:20px solid transparent}.ctrl{padding:16px 18px;display:flex;flex-direction:column;gap:12px}.q{padding:12px 14px;border-radius:10px;border:1px solid var(--line2);background:var(--panel2);font-size:15px;white-space:nowrap}.tlb{position:relative;display:grid;grid-template-columns:repeat(14,1fr);gap:4px;height:40px}.tlb span{border-radius:4px;background:rgba(237,229,214,.12)}.hlt{position:absolute;top:-4px;height:48px;border-radius:6px;border:2px solid var(--mint);background:rgba(79,227,201,.15)}.shorts{display:flex;gap:14px}.sh{width:130px;height:232px;border-radius:14px;position:relative;overflow:hidden;border:1px solid var(--line2)}.sh .cap{position:absolute;left:8px;right:8px;bottom:10px;padding:6px;border-radius:6px;background:rgba(14,13,11,.75);font:700 11px ui-sans-serif,system-ui,sans-serif;text-align:center}`,
  html: `${win("match-final.mp4 · 1:32:08", `<div class="pl"><div class="vp"><i></i></div><div class="ctrl"><div class="q"><span class="label" style="color:var(--accent)">Find</span> <span id="q18">goal celebrations</span></div><div class="tlb">${Array.from({ length: 14 }, () => "<span></span>").join("")}${[[2, 2], [7, 1], [11, 2]].map(([s, w], i) => `<div id="hl${i}" class="hlt" style="left:${(s / 14) * 100}%;width:${(w / 14) * 100}%"></div>`).join("")}</div></div></div>`, "")}<div class="shorts">${[
    ["linear-gradient(160deg,#2b3bff,#0b6b55)", "That 89th-minute winner"],
    ["linear-gradient(160deg,#ff7a45,#2b3bff)", "Crowd goes wild"],
    ["linear-gradient(160deg,#0b6b55,#8e9bff)", "Best saves of the night"],
  ]
    .map(([bg, c], i) => `<div id="sh${i}" class="sh" style="background:${bg}"><div class="cap">${c}</div></div>`)
    .join("")}</div>`,
  js: `
      type("#q18", 0.9, 1.2);
      ${[0, 1, 2].map((i) => `show("#hl${i}", ${2.3 + i * 0.3}, { scaleX: 0.3, y: 0 });`).join(" ")}
      ${[0, 1, 2].map((i) => `show("#sh${i}", ${3.4 + i * 0.35}, { y: 40, scale: 0.9 });`).join(" ")}`,
});

mkdirSync("scenes", { recursive: true });
for (const s of scenes) {
  writeFileSync(`scenes/${s.slug}.html`, shell({ id: s.slug.replace(/-/g, "_"), eyebrow: s.eyebrow, html: s.html, sceneCss: s.sceneCss, js: s.js }));
}
console.log(`wrote ${scenes.length} scenes: ${scenes.map((s) => s.slug).join(", ")}`);
