/* tools.js — small hands-on tools used on reading pages and slides.
 * Each mount function takes (element, ui strings, lang). */
window.Tools = (function () {
  const { rb, esc, fill } = window.AI;

  function binary(el, u) {
    const vals = [128, 64, 32, 16, 8, 4, 2, 1];
    let on = new Array(8).fill(false);
    let target = 13;
    el.innerHTML = `<h3>${rb(u.binTitle)}</h3><p class="help">${rb(u.binHelp)}</p>
      <div class="bits">${vals.map((v, i) => `<button type="button" class="bit" aria-pressed="false" data-i="${i}"><span class="v">${v}</span><span class="b">0</span></button>`).join("")}</div>
      <div class="readout"><span>${rb(u.binBin)}: <b class="o-bin">00000000</b></span><span>${rb(u.binDec)}: <b class="o-dec">0</b></span></div>
      <div class="challenge"><span class="o-ch"></span><span class="okmsg" hidden>${rb(u.binOk)}</span><button type="button" class="btn o-new">${rb(u.binNew)}</button></div>`;
    const btns = [...el.querySelectorAll(".bit")];
    const draw = () => {
      btns.forEach((b, i) => { b.setAttribute("aria-pressed", on[i]); b.querySelector(".b").textContent = on[i] ? "1" : "0"; });
      const dec = on.reduce((a, x, i) => a + (x ? vals[i] : 0), 0);
      el.querySelector(".o-bin").textContent = on.map(x => (x ? "1" : "0")).join("");
      el.querySelector(".o-dec").textContent = dec;
      el.querySelector(".o-ch").innerHTML = rb(fill(u.binChallenge, { n: target }));
      el.querySelector(".okmsg").hidden = dec !== target;
    };
    btns.forEach((b, i) => b.addEventListener("click", () => { on[i] = !on[i]; draw(); }));
    el.querySelector(".o-new").addEventListener("click", () => {
      let n; do { n = 1 + Math.floor(Math.random() * 63); } while (n === target);
      target = n; on = new Array(8).fill(false); draw();
    });
    draw();
  }

  function text(el, u) {
    el.innerHTML = `<h3>${rb(u.txtTitle)}</h3><p class="help">${rb(u.txtHelp)}</p>
      <input type="text" class="o-in" value="AI あ" aria-label="text" style="width:100%">
      <div style="overflow-x:auto"><table class="chars"><thead><tr><th>${rb(u.txtChar)}</th><th>${rb(u.txtCode)}</th><th>${rb(u.txtBytes)}</th></tr></thead><tbody></tbody></table></div>`;
    const inp = el.querySelector(".o-in"), tb = el.querySelector("tbody");
    const enc = new TextEncoder();
    const draw = () => {
      const chars = Array.from(inp.value).slice(0, 12);
      tb.innerHTML = chars.map(ch => {
        const cp = ch.codePointAt(0);
        const bytes = [...enc.encode(ch)].map(b => b.toString(2).padStart(8, "0"));
        const shown = ch === " " ? "␣" : ch;
        return `<tr><td class="c">${esc(shown)}</td><td>${cp}<br><code>U+${cp.toString(16).toUpperCase().padStart(4, "0")}</code></td><td><code>${bytes.join(" ")}</code><br><span class="note">${esc(fill(u.txtN, { n: bytes.length }))}</span></td></tr>`;
      }).join("");
    };
    inp.addEventListener("input", draw);
    draw();
  }

  function pixel(el, u) {
    const start = ["00111100", "01000010", "10100101", "10000001", "10100101", "10011001", "01000010", "00111100"];
    let g = start.map(r => r.split("").map(c => c === "1"));
    el.innerHTML = `<h3>${rb(u.pxTitle)}</h3><p class="help">${rb(u.pxHelp)}</p>
      <div class="pxwrap"><div class="px" role="grid" aria-label="pixels">${g.flat().map((x, i) => `<button type="button" aria-pressed="${x}" data-i="${i}" aria-label="${i % 8 + 1},${Math.floor(i / 8) + 1}"></button>`).join("")}</div>
      <pre class="pxcode"></pre></div>
      <div style="margin-top:10px"><button type="button" class="btn o-clr">${rb(u.pxClear)}</button></div>`;
    const cells = [...el.querySelectorAll(".px button")], code = el.querySelector(".pxcode");
    const draw = () => {
      cells.forEach((b, i) => b.setAttribute("aria-pressed", g[Math.floor(i / 8)][i % 8]));
      code.textContent = g.map(r => r.map(x => (x ? "1" : "0")).join("")).join("\n");
    };
    let painting = null;
    cells.forEach((b, i) => {
      b.addEventListener("pointerdown", e => { e.preventDefault(); const r = Math.floor(i / 8), c = i % 8; painting = !g[r][c]; g[r][c] = painting; draw(); });
      b.addEventListener("pointerenter", () => { if (painting === null) return; g[Math.floor(i / 8)][i % 8] = painting; draw(); });
      b.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); const r = Math.floor(i / 8), c = i % 8; g[r][c] = !g[r][c]; draw(); } });
    });
    window.addEventListener("pointerup", () => { painting = null; });
    el.querySelector(".o-clr").addEventListener("click", () => { g = g.map(r => r.map(() => false)); draw(); });
    draw();
  }

  function color(el, u) {
    const v = { r: 255, g: 79, b: 0 };
    el.innerHTML = `<h3>${rb(u.colTitle)}</h3><p class="help">${rb(u.colHelp)}</p>
      <div class="colwrap"><div class="swatch"></div><div class="sliders">
      ${["r", "g", "b"].map(k => `<label><span>${rb(u["col" + k.toUpperCase()])}</span><input type="range" min="0" max="255" value="${v[k]}" data-k="${k}"><output>${v[k]}</output></label>`).join("")}
      <p class="note o-code" style="margin:4px 0 0"></p></div></div>`;
    const sw = el.querySelector(".swatch"), out = el.querySelector(".o-code");
    const draw = () => {
      sw.style.background = `rgb(${v.r},${v.g},${v.b})`;
      out.textContent = `(R, G, B) = (${v.r}, ${v.g}, ${v.b})  →  ${[v.r, v.g, v.b].map(n => n.toString(2).padStart(8, "0")).join(" ")}`;
    };
    el.querySelectorAll("input").forEach(inp => inp.addEventListener("input", () => { v[inp.dataset.k] = +inp.value; inp.nextElementSibling.textContent = inp.value; draw(); }));
    draw();
  }

  function wave(el, u) {
    let n = 8;
    el.innerHTML = `<h3>${rb(u.waveTitle)}</h3><p class="help">${rb(u.waveHelp)}</p>
      <svg viewBox="0 0 600 220" role="img" aria-label="wave"></svg>
      <label class="sliders" style="margin-top:10px;display:block"><span>${rb(u.waveN)}: <b class="o-n">8</b></span><input type="range" min="2" max="40" value="8"></label>`;
    const svg = el.querySelector("svg"), inp = el.querySelector("input"), on = el.querySelector(".o-n");
    const f = x => 0.6 * Math.sin(x * 2 * Math.PI) + 0.3 * Math.sin(x * 6 * Math.PI + 1);
    const W = 600, H = 220, P = 20, Y = y => H / 2 - y * (H / 2 - P);
    const draw = () => {
      const cycles = 2, total = n * cycles;
      let true_ = "";
      for (let i = 0; i <= 300; i++) { const x = i / 300; true_ += (i ? "L" : "M") + (P + x * (W - 2 * P)).toFixed(1) + " " + Y(f(x * cycles)).toFixed(1); }
      let steps = "", dots = "";
      for (let k = 0; k <= total; k++) {
        const x = k / total, px = P + x * (W - 2 * P), py = Y(f(x * cycles));
        const nx = P + Math.min(1, (k + 1) / total) * (W - 2 * P);
        steps += (k ? "L" : "M") + px.toFixed(1) + " " + py.toFixed(1) + "L" + nx.toFixed(1) + " " + py.toFixed(1);
        dots += `<line x1="${px.toFixed(1)}" y1="${(H / 2).toFixed(1)}" x2="${px.toFixed(1)}" y2="${py.toFixed(1)}" stroke="#ff4f00" stroke-width="2"/><circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="4" fill="#ff4f00"/>`;
      }
      svg.innerHTML = `<line x1="${P}" y1="${H / 2}" x2="${W - P}" y2="${H / 2}" stroke="currentColor" stroke-opacity=".25"/>
        <path d="${true_}" fill="none" stroke="currentColor" stroke-opacity=".35" stroke-width="3"/>
        <path d="${steps}" fill="none" stroke="#ff4f00" stroke-opacity=".55" stroke-width="2"/>${dots}`;
      on.textContent = n;
    };
    inp.addEventListener("input", () => { n = +inp.value; draw(); });
    draw();
  }

  const all = { binary, text, pixel, color, wave };
  function mount(root, u) { root.querySelectorAll("[data-tool]").forEach(el => { const t = all[el.dataset.tool]; if (t) { el.classList.add("tool"); t(el, u); } }); }
  return { mount };
})();
