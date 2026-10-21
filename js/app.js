// Giao diện quanh văn phòng: panel chi tiết, form brief / KPI / nhật ký của Leader,
// báo cáo ngày, và đọc lại các file data/*.js do Claude Code cập nhật.
(function () {
  const TEAM = window.TEAM;
  const panel = document.getElementById("panel");
  const tooltip = document.getElementById("tooltip");
  const statusbar = document.getElementById("statusbar");
  const STORE = "ads-hq:";

  let state = window.OFFICE_STATE || { agents: {} };
  let config = window.ADS_CONFIG || { accounts: [], kpi: {} };
  let daily = window.ADS_DAILY || { accounts: {} };
  let changelog = window.ADS_CHANGELOG || { entries: [] };
  let view = { kind: "overview" };
  // Bộ phận nhận brief (08 chạy theo lịch riêng, không nhận brief).
  const BRIEF_AGENTS = TEAM.agents.filter((a) => !a.daily);

  // localStorage có thể bị chặn (chế độ riêng tư) → luôn bọc try/catch.
  const store = {
    get(k, d) { try { const v = localStorage.getItem(STORE + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(STORE + k, JSON.stringify(v)); } catch (e) { /* bỏ qua */ } },
  };

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const agentDef = (id) => TEAM.agents.find((a) => a.id === id);
  const agentState = (id) => (state.agents && state.agents[id]) || {};
  const statusPill = (st) => `<span class="pill s-${esc(st)}">${esc(window.STATUS_LABEL[st] || st)}</span>`;
  const MODEL_LABEL = { opus: "Opus", sonnet: "Sonnet", haiku: "Haiku", fable: "Fable" };
  const nameOf = (id) => id === "assistant" ? "Claude Code" : id === "leader" ? "Leader" : ((agentDef(id) || {}).name || id);

  function slugify(s) {
    return String(s || "brief").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D")
      .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "brief";
  }
  const today = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  function fmtTime(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    return isNaN(d) ? iso : d.toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });
  }

  const money = (v) => v == null || isNaN(v) ? "—" : Math.round(v).toLocaleString("vi-VN") + "đ";
  const short = (v) => window.shortMoney(v);
  const num = (v, d) => v == null || isNaN(v) ? "—" : Number(v).toLocaleString("vi-VN", { maximumFractionDigits: d || 0 });

  function toast(msg) {
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2200);
  }

  // ---------- Văn phòng ----------
  const office = window.createOffice(document.getElementById("office"), {
    onSelect(id) { if (id) open(id); },
    onHover(id, e) {
      if (!id || !e) { tooltip.hidden = true; return; }
      const box = document.querySelector(".office-wrap").getBoundingClientRect();
      let title, line;
      if (id === "leader") { title = "LEADER · BẠN"; line = `${(state.awaitingLeader || []).length} việc chờ bạn duyệt · bấm để hỏi team / viết brief`; }
      else if (id === "assistant") { title = "CLAUDE CODE"; line = (state.assistant && state.assistant.message) || "Trợ lý điều phối & báo cáo"; }
      else if (id === "daily-reporter") {
        const acc = firstAccount(), d = acc && acc.data.days[acc.data.days.length - 1];
        title = "08 DAILY REPORT";
        line = d ? `${daily.date}: chi ${short(d.spend)} · ${d.messages} tin nhắn · ${d.leads} lead · ${(acc.data.alerts || []).length} cảnh báo` : "Chưa có báo cáo ngày · bấm để xem";
      }
      else { const d = agentDef(id), s = agentState(id); title = `${d.no} ${d.name}`; line = `${window.STATUS_LABEL[s.status || "idle"]}${s.task ? " · " + s.task : ""}`; }
      tooltip.innerHTML = `<b>${esc(title)}</b>${esc(line)}`;
      tooltip.hidden = false;
      const x = Math.min(e.clientX - box.left + 14, box.width - 290);
      tooltip.style.left = Math.max(0, x) + "px";
      tooltip.style.top = (e.clientY - box.top + 16) + "px";
    },
  });

  function open(id) {
    if (id === "leader") view = { kind: "brief" };
    else if (id === "assistant") view = { kind: "assistant" };
    else if (id === "daily-reporter") view = { kind: "daily", account: view.account };
    else view = { kind: "agent", id };
    office.select(id);
    renderPanel();
    if (window.innerWidth <= 1100) panel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ---------- Panel ----------
  function avatarCanvas(def) {
    const c = document.createElement("canvas");
    c.width = 14; c.height = 18;
    c.className = "avatar";
    const ctx = c.getContext("2d");
    if (def === "assistant") window.SPRITES.clawd(ctx, 0, 4, {});
    else window.SPRITES.person(ctx, 2, 3, def.look, "stand", {});
    return c;
  }

  function recKey(agentId, recId) {
    const brief = (state.activeBrief && state.activeBrief.id) || "none";
    return `rec:${brief}:${agentId}:${recId}`;
  }

  function prioClass(p) {
    const s = slugify(p);
    return s.startsWith("cao") ? "prio-cao" : s.startsWith("trung") ? "prio-trung" : "prio-thap";
  }

  function recsHtml(agentId, recs) {
    if (!recs || !recs.length) return `<p class="muted">Chưa có đề xuất.</p>`;
    return `<ul class="recs">${recs.map((r) => {
      const done = store.get(recKey(agentId, r.id), false);
      return `<li class="${done ? "checked" : ""}"><input type="checkbox" data-agent="${esc(agentId)}" data-rec="${esc(r.id)}" ${done ? "checked" : ""} aria-label="Đánh dấu đã tự thực hiện">
        <span>${esc(r.text)}${r.priority ? `<em class="prio ${prioClass(r.priority)}">${esc(r.priority)}</em>` : ""}
        <button type="button" class="btn btn-mini dalam" data-dalam="${esc(r.text)}" title="Ghi vào nhật ký để team đo lại sau 3–7 ngày">${bridge.ok ? "▶" : "⧉"} Ghi nhật ký</button></span></li>`;
    }).join("")}</ul>`;
  }

  function awaitingHtml() {
    const list = state.awaitingLeader || [];
    if (!list.length) return `<p class="muted">Không có việc nào chờ bạn duyệt.</p>`;
    return list.map((w) => `<div class="card"><div class="card-title"><b>${esc(nameOf(w.from))}</b></div>${esc(w.text)}</div>`).join("");
  }

  function reportsHtml() {
    const list = state.reports || [];
    if (!list.length) return `<p class="muted">Chưa có báo cáo.</p>`;
    return list.map((r) => `<div class="card"><div class="card-title"><a href="${esc(r.file)}" target="_blank" rel="noopener">${esc(r.title)}</a><span class="muted">${esc(r.date)}</span></div>${esc(r.summary || "")}</div>`).join("");
  }

  function viewOverview() {
    const n = BRIEF_AGENTS.length;
    const done = BRIEF_AGENTS.filter((a) => agentState(a.id).status === "done").length;
    return `
      <h2>TỔNG QUAN</h2>
      <h3>Báo cáo ngày</h3>${dailyCardHtml()}
      <h3>${isQuestion() ? "Câu hỏi đang xử lý" : "Brief đang chạy"}</h3>
      <p><b>${esc((state.activeBrief && state.activeBrief.title) || "Chưa có câu hỏi / brief nào")}</b></p>
      <div class="progress" title="${done}/${n} bộ phận đã xong"><i style="width:${Math.round(done / n * 100)}%"></i></div>
      <p class="muted">${done}/${n} bộ phận đã xong</p>
      <h3>Chờ bạn duyệt</h3>${awaitingHtml()}
      <h3>Hỏi đáp gần đây</h3>${questionsHtml(2)}
      <h3>Đội hình</h3>
      <ul class="team-list">
        <li data-open="leader"><span class="no">01</span><span>Bạn — Leader</span><span class="muted">hỏi / brief</span></li>
        <li data-open="assistant"><span class="no">CC</span><span>Claude Code — Trợ lý báo cáo</span>${statusPill((state.assistant && state.assistant.status) || "idle")}</li>
        ${TEAM.agents.map((a) => `<li data-open="${a.id}"><span class="no">${a.no}</span><span>${esc(a.name)} <span class="model-tag">${esc(MODEL_LABEL[a.model] || "")}</span></span>${statusPill(agentState(a.id).status || "idle")}</li>`).join("")}
      </ul>
      <h3>Báo cáo gần đây</h3>${reportsHtml()}`;
  }

  // ---------- Báo cáo ngày ----------
  function accountIds() { return Object.keys(daily.accounts || {}).filter((k) => (daily.accounts[k].days || []).length); }
  function firstAccount(pick) {
    const ids = accountIds();
    const id = ids.includes(pick) ? pick : ids[0];
    return id ? { id, data: daily.accounts[id] } : null;
  }

  function dailyCardHtml() {
    const acc = firstAccount();
    if (!acc) return `<div class="card">Chưa có báo cáo ngày. Lịch tự chạy mỗi sáng ~7h52, hoặc gõ <code>/bao-cao-ngay</code>.</div>`;
    const d = acc.data.days[acc.data.days.length - 1];
    const alerts = acc.data.alerts || [];
    const red = alerts.filter((a) => a.level === "đỏ").length;
    return `<div class="card daily-card" data-open="daily-reporter">
      <div class="card-title"><b>${esc(acc.data.name || acc.id)}</b><span class="muted">${esc(daily.date)}</span></div>
      <div class="kpi-mini"><span>Chi <b>${short(d.spend)}</b></span><span>Tin nhắn <b>${num(d.messages)}</b> · ${short(d.costPerMessage)}</span><span>Lead <b>${num(d.leads)}</b> · ${short(d.costPerLead)}</span></div>
      <div>${alerts.length ? `<span class="pill ${red ? "s-alert" : "s-waiting"}">${alerts.length} cảnh báo${red ? ` (${red} đỏ)` : ""}</span>` : `<span class="pill s-done">Không có cảnh báo</span>`} <span class="muted">→ xem chi tiết</span></div>
    </div>`;
  }

  // Đánh giá 1 chỉ số: so với KPI nếu có, không thì so với TB 7 ngày.
  // dir = -1: càng thấp càng tốt (chi phí, tần suất); +1: càng cao càng tốt.
  function judge(v, avg, kpi, dir) {
    if (v == null || isNaN(v)) return "";
    const ref = kpi != null ? kpi : avg;
    if (ref == null || ref === 0) return "";
    const r = dir < 0 ? v / ref : ref / Math.max(v, 1e-9);
    if (kpi != null && r <= 1) return "good";
    if (r > 1.3) return "bad";
    if (r > 1.15 || (kpi != null && r > 1)) return "warn";
    return "good";
  }

  // Số lượng kết quả phụ thuộc chi tiêu nên tối đa chỉ "warn".
  const cap = (j) => j === "bad" ? "warn" : j;

  function dailyChart(days) {
    const w = 360, h = 120, padL = 4, padB = 18, n = days.length;
    const bw = (w - padL * 2) / n;
    const maxR = Math.max(1, ...days.map((d) => (d.messages || 0) + (d.leads || 0)));
    const maxS = Math.max(1, ...days.map((d) => d.spend || 0));
    const bars = days.map((d, i) => {
      const x = padL + i * bw + 2, bwI = bw - 4;
      const hm = (h - padB - 8) * (d.messages || 0) / maxR, hl = (h - padB - 8) * (d.leads || 0) / maxR;
      const base = h - padB;
      return `<rect x="${x}" y="${base - hm}" width="${bwI}" height="${hm}" fill="var(--working)"><title>${esc(d.date)}: ${d.messages} tin nhắn</title></rect>
        <rect x="${x}" y="${base - hm - hl}" width="${bwI}" height="${hl}" fill="var(--done)"><title>${esc(d.date)}: ${d.leads} lead</title></rect>`;
    }).join("");
    const pts = days.map((d, i) => `${(padL + i * bw + bw / 2).toFixed(1)},${(h - padB - (h - padB - 8) * (d.spend || 0) / maxS).toFixed(1)}`).join(" ");
    const lab = (i, anchor) => `<text x="${padL + i * bw + bw / 2}" y="${h - 4}" text-anchor="${anchor}" fill="var(--muted)" font-size="13">${esc(days[i].date.slice(5).split("-").reverse().join("/"))}</text>`;
    return `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="Biểu đồ ${n} ngày: tin nhắn, lead và chi tiêu">
      ${bars}<polyline points="${pts}" fill="none" stroke="var(--accent)" stroke-width="2"/>
      ${lab(0, "start")}${lab(n - 1, "end")}</svg>
      <div class="chart-legend"><span><i class="dot s-working"></i>Tin nhắn</span><span><i class="dot s-done"></i>Lead</span><span><i class="dot" style="background:var(--accent)"></i>Chi tiêu</span></div>`;
  }

  const runDailyBtn = () => bridge.ok ? ` <button type="button" class="btn btn-mini-run" data-run-daily>▶ Chạy báo cáo ngày</button>` : "";

  function viewDaily() {
    const ids = accountIds();
    const acc = firstAccount(view.account);
    const s = agentState("daily-reporter");
    const head = `<div class="who"><span data-avatar></span><div><div class="who-no">08 · <span class="model-tag">${esc(MODEL_LABEL[(agentDef("daily-reporter") || {}).model] || "")}</span></div><h2>BÁO CÁO NGÀY</h2><div class="muted">Daily Reporter · tự chạy mỗi sáng ~7h52</div></div></div>`;
    if (!acc) {
      return `${head}${statusPill(s.status || "idle")}${runDailyBtn()}
        <div class="card">Chưa có số liệu. Sáng mai lịch hẹn giờ sẽ tự chạy, hoặc gõ <code>/bao-cao-ngay</code> trong Claude Code.</div>
        <h3>KPI đang áp dụng</h3>${kpiSummaryHtml()}`;
    }
    const data = acc.data, days = data.days, d = days[days.length - 1], avg = data.avg7 || {}, k = config.kpi || {};
    const rows = [
      ["Chi tiêu", money(d.spend), money(avg.spend), k.dailyBudget != null ? money(k.dailyBudget) : "—",
        avg.spend && Math.abs(d.spend - avg.spend) / avg.spend * 100 > (k.spendDeviationPct || 30) ? "warn" : ""],
      ["Tin nhắn", num(d.messages), num(avg.messages, 1), "—", cap(judge(d.messages, avg.messages, null, 1))],
      ["Chi phí / tin nhắn", money(d.costPerMessage), money(avg.costPerMessage), money(k.costPerMessage), judge(d.costPerMessage, avg.costPerMessage, k.costPerMessage, -1)],
      ["Lead", num(d.leads), num(avg.leads, 1), "—", cap(judge(d.leads, avg.leads, null, 1))],
      ["Chi phí / lead", money(d.costPerLead), money(avg.costPerLead), money(k.costPerLead), judge(d.costPerLead, avg.costPerLead, k.costPerLead, -1)],
      ["CTR", num(d.ctr, 2) + "%", num(avg.ctr, 2) + "%", k.minCtr != null ? "≥ " + num(k.minCtr, 2) + "%" : "—", judge(d.ctr, avg.ctr, k.minCtr, 1)],
      ["CPM", money(d.cpm), money(avg.cpm), "—", judge(d.cpm, avg.cpm, null, -1)],
      ["Tần suất", num(d.frequency, 2), num(avg.frequency, 2), k.maxFrequency != null ? "≤ " + num(k.maxFrequency, 1) : "—", judge(d.frequency, avg.frequency, k.maxFrequency, -1)],
    ];
    const alerts = data.alerts || [];
    return `${head}${statusPill(s.status || "idle")}${runDailyBtn()}
      ${ids.length > 1 ? `<label class="acc-pick">Tài khoản <select id="acc-pick">${ids.map((id) => `<option value="${esc(id)}" ${id === acc.id ? "selected" : ""}>${esc(daily.accounts[id].name || id)}</option>`).join("")}</select></label>` : ""}
      <p><b>${esc(data.name || acc.id)}</b> · ngày <b>${esc(daily.date)}</b> <span class="muted">· cập nhật ${esc(fmtTime(daily.updatedAt))}</span></p>
      <table class="kpi-table"><thead><tr><th>Chỉ số</th><th>Hôm qua</th><th>TB 7 ngày</th><th>KPI</th></tr></thead>
        <tbody>${rows.map((r) => `<tr class="${r[4] ? "j-" + r[4] : ""}"><td>${r[0]}</td><td><b>${r[1]}</b></td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join("")}</tbody></table>
      <h3>${days.length} ngày gần nhất</h3>${dailyChart(days)}
      <h3>Cảnh báo</h3>${alerts.length ? alerts.map((a) => `<div class="card alert-${a.level === "đỏ" ? "red" : "yellow"}"><b>[${esc(a.level)}] ${esc(a.scope || "")}</b><br>${esc(a.text)}</div>`).join("") : `<p class="muted">Không có cảnh báo.</p>`}
      ${(data.topCampaigns || []).length ? `<h3>Campaign chi tiêu nhiều nhất</h3><table class="kpi-table"><thead><tr><th>Campaign</th><th>Chi</th><th>TN</th><th>Lead</th></tr></thead><tbody>${data.topCampaigns.map((c) => `<tr><td>${esc(c.name)}</td><td>${short(c.spend)}</td><td>${num(c.messages)} · ${short(c.costPerMessage)}</td><td>${num(c.leads)} · ${short(c.costPerLead)}</td></tr>`).join("")}</tbody></table>` : ""}
      <h3>Đề xuất — Leader tự thực hiện</h3>${recsHtml("daily-reporter", s.recommendations)}
      ${daily.reportFile ? `<p><a href="${esc(daily.reportFile)}" target="_blank" rel="noopener">Mở báo cáo ngày đầy đủ →</a></p>` : ""}
      <h3>KPI đang áp dụng</h3>${kpiSummaryHtml()}`;
  }

  // ---------- KPI & nhật ký ----------
  const KPI_FIELDS = [
    { k: "costPerMessage", label: "Chi phí / tin nhắn tối đa", unit: "đ", ph: "VD: 60000" },
    { k: "costPerLead", label: "Chi phí / lead tối đa", unit: "đ", ph: "VD: 150000" },
    { k: "dailyBudget", label: "Chi tiêu dự kiến / ngày", unit: "đ", ph: "VD: 5000000" },
    { k: "maxFrequency", label: "Tần suất tối đa", unit: "", ph: "VD: 3" },
    { k: "minCtr", label: "CTR tối thiểu", unit: "%", ph: "VD: 1.5" },
    { k: "spendDeviationPct", label: "Chi tiêu lệch TB 7 ngày", unit: "%", ph: "VD: 30" },
  ];

  function kpiSummaryHtml() {
    const k = config.kpi || {};
    const set = KPI_FIELDS.filter((f) => k[f.k] != null);
    if (!set.length) return `<p class="muted">Chưa đặt ngưỡng nào — báo cáo chỉ so với TB 7 ngày. Đặt ở Bàn Leader.</p>`;
    return `<ul class="kpi-list">${KPI_FIELDS.map((f) => `<li><span>${esc(f.label)}</span><b>${k[f.k] == null ? "chưa đặt" : (f.unit === "đ" ? money(k[f.k]) : num(k[f.k], 2) + f.unit)}</b></li>`).join("")}</ul>`;
  }

  function kpiFormHtml() {
    const k = config.kpi || {};
    return `<form class="form" id="kpi-form" autocomplete="off">
      <div class="row-2">${KPI_FIELDS.map((f) => `<label>${esc(f.label)}${f.unit ? ` (${f.unit})` : ""}<input type="text" inputmode="decimal" name="${f.k}" placeholder="${esc(f.ph)}" value="${k[f.k] == null ? "" : esc(k[f.k])}"></label>`).join("")}</div>
      <div class="form-actions"><button type="button" class="btn btn-claude" data-act="kpi">${sendLabel("⧉ Copy lệnh /kpi")}</button></div>
      <p class="muted">Để trống = không đặt ngưỡng. Dán lệnh vào Claude Code để lưu vào <code>data/config.js</code>.</p>
    </form>`;
  }

  function changelogHtml() {
    const list = changelog.entries || [];
    const items = list.length ? list.slice(0, 8).map((e) => `<div class="card">
        <div class="card-title"><b>${esc(e.change)}</b><span class="pill ${e.status === "đã đo" ? (e.verdict === "tốt" ? "s-done" : e.verdict === "xấu" ? "s-alert" : "s-idle") : "s-waiting"}">${esc(e.status === "đã đo" ? e.verdict || "đã đo" : "đo ngày " + (e.reviewAfter || "?"))}</span></div>
        <span class="muted">${esc(e.date)} · ${esc(e.scope || "")}</span>
        ${e.lesson ? `<br>💡 ${esc(e.lesson)}` : ""}</div>`).join("")
      : `<p class="muted">Chưa có thay đổi nào được ghi.</p>`;
    const draft = store.get("dalam-draft", "");
    return `${items}
      <form class="form" id="dalam-form" autocomplete="off">
        <label>Tôi đã làm…<textarea name="change" placeholder="VD: Tăng ngân sách campaign Tin nhắn T11 từ 500k lên 700k/ngày">${esc(draft)}</textarea></label>
        <div class="form-actions"><button type="button" class="btn btn-claude" data-act="dalam">${sendLabel("⧉ Copy lệnh /da-lam")}</button></div>
        <p class="muted">Team ghi baseline hôm nay và tự đo lại sau 3–7 ngày trong báo cáo ngày.</p>
      </form>`;
  }

  function wireLeaderForms() {
    const kf = document.getElementById("kpi-form");
    kf.addEventListener("click", async (e) => {
      if (!e.target.closest("[data-act=kpi]")) return;
      const fd = new FormData(kf);
      const parts = KPI_FIELDS.map((f) => {
        const v = String(fd.get(f.k) || "").trim().replace(/\s/g, "");
        return `${f.k}=${v === "" ? "null" : v}`;
      });
      await runOrCopy("kpi", parts.join(", "), `/kpi ${parts.join(", ")}`);
    });
    const df = document.getElementById("dalam-form");
    df.addEventListener("input", () => store.set("dalam-draft", df.elements.change.value));
    df.addEventListener("click", async (e) => {
      if (!e.target.closest("[data-act=dalam]")) return;
      const v = df.elements.change.value.trim();
      if (!v) { toast("Ghi việc bạn đã làm trước đã"); return; }
      await runOrCopy("da-lam", v, `/da-lam ${v}`);
    });
  }

  function viewAgent(id) {
    const d = agentDef(id), s = agentState(id);
    return `
      <div class="who"><span data-avatar></span><div><div class="who-no">${d.no}${d.model ? ` · <span class="model-tag">${esc(MODEL_LABEL[d.model] || d.model)}</span>` : ""}</div><h2>${esc(d.name)}</h2><div class="muted">${esc(d.sub)}</div></div></div>
      ${statusPill(s.status || "idle")}
      <h3>Nhiệm vụ hiện tại</h3><p>${esc(s.task || "Chưa được giao việc.")}</p>
      <h3>Tóm tắt kết quả</h3><p>${s.summary ? esc(s.summary) : `<span class="muted">Chưa nộp kết quả.</span>`}</p>
      <h3>Đề xuất — Leader tự thực hiện</h3>${recsHtml(id, s.recommendations)}
      ${s.reportFile ? `<h3>Báo cáo</h3><p><a href="${esc(s.reportFile)}" target="_blank" rel="noopener">${esc(s.reportFile)}</a></p>` : ""}
      <p class="muted" style="margin-top:16px">Agent chỉ đọc dữ liệu & góp ý. Mọi chỉnh sửa trên Ads Manager do bạn tự làm.</p>`;
  }

  function viewAssistant() {
    const a = state.assistant || {};
    return `
      <div class="who"><span data-avatar></span><div><div class="who-no">CC</div><h2>CLAUDE CODE</h2><div class="muted">${esc(TEAM.assistant.title)}</div></div></div>
      ${statusPill(a.status || "idle")}
      <h3>Nhật ký làm việc ${bridge.ok ? "(trực tiếp)" : ""}</h3>
      ${bridge.ok ? `<div id="live-log-panel">${liveLogHtml(30)}</div>` : `<p class="muted">Chạy <code>node server.js</code> rồi mở http://localhost:8000 để giao việc thẳng từ web và xem team làm việc trực tiếp.</p>`}
      <h3>Lời nhắn cho Leader</h3><p>${esc(a.message || "Sẵn sàng nhận brief.")}</p>
      ${a.reportFile ? `<p><a href="${esc(a.reportFile)}" target="_blank" rel="noopener">Mở báo cáo tổng hợp →</a></p>` : ""}
      <h3>Cách giao việc</h3>
      <div class="card">${bridge.ok
        ? "1. Phòng Leader → <b>Hỏi team</b>: gõ câu hỏi → <b>▶ Gửi cho team</b>.<br>2. Leader mang việc ra bàn Claude Code, Claude Code giao cho các bộ phận phù hợp.<br>3. Xem từng người làm việc trên văn phòng; xong thì câu trả lời hiện ở Bàn Leader."
        : "1. Phòng Leader → <b>Hỏi team</b>: gõ câu hỏi → <b>Copy lệnh /hoi</b>.<br>2. Dán vào Claude Code (mở trong thư mục repo này).<br>3. Claude Code chọn bộ phận phù hợp, team research & phân tích, rồi trả lời vào <code>reports/hoi-dap/</code>."}</div>
      <div class="card">Lệnh nhanh: <code>/hoi</code> hỏi team · <code>/brief</code> brief chiến dịch · <code>/bao-cao</code> tình hình team · <code>/bao-cao-ngay</code> báo cáo Ads ngày · <code>/kpi</code> đặt ngưỡng · <code>/da-lam</code> ghi thay đổi đã làm.</div>
      <h3>Báo cáo</h3>${reportsHtml()}`;
  }

  // ---------- Form brief ----------
  const BRIEF_FIELDS = [
    { k: "title", label: "Tên brief / chiến dịch", type: "text", ph: "VD: Ưu đãi trị mụn tháng 11" },
    { k: "goal", label: "Mục tiêu", type: "area", ph: "VD: Tăng tin nhắn đặt lịch, 150 lead trong 2 tuần" },
    { k: "product", label: "Sản phẩm / dịch vụ & ưu đãi", type: "area", ph: "VD: Gói trị mụn 4 buổi, giảm 30%" },
    { k: "audience", label: "Khách hàng mục tiêu", type: "area", ph: "VD: Nữ 22–35, TP.HCM, da mụn" },
    { row: [
      { k: "budget", label: "Ngân sách", type: "text", ph: "VD: 500k/ngày" },
      { k: "kpi", label: "KPI", type: "text", ph: "VD: CPL < 60k" },
    ] },
    { row: [
      { k: "timeline", label: "Thời gian", type: "text", ph: "VD: 01/11 – 15/11" },
      { k: "account", label: "Tài khoản / campaign", type: "text", ph: "Tên hoặc ID (nếu có)" },
    ] },
    { k: "notes", label: "Ghi chú cho team", type: "area", ph: "Tài liệu, link, điều cần tránh…" },
  ];

  function loadDraft() {
    return store.get("brief-draft", { assign: BRIEF_AGENTS.map((a) => a.id) });
  }

  function fieldHtml(f, draft) {
    const v = esc(draft[f.k] || "");
    const input = f.type === "area"
      ? `<textarea name="${f.k}" placeholder="${esc(f.ph)}">${v}</textarea>`
      : `<input type="text" name="${f.k}" placeholder="${esc(f.ph)}" value="${v}">`;
    return `<label>${esc(f.label)}${input}</label>`;
  }

  function viewBrief() {
    const tab = leaderTab();
    return `
      <div class="who"><span data-avatar></span><div><div class="who-no">01</div><h2>BÀN LEADER</h2><div class="muted">Bạn hỏi — team research & góp ý — bạn tự set Ads</div></div></div>
      <h3>Chờ bạn duyệt</h3>${awaitingHtml()}
      <div class="tabs" role="tablist">
        <button type="button" class="tab ${tab === "hoi" ? "active" : ""}" role="tab" aria-selected="${tab === "hoi"}" data-tab="hoi">❓ Hỏi team</button>
        <button type="button" class="tab ${tab === "brief" ? "active" : ""}" role="tab" aria-selected="${tab === "brief"}" data-tab="brief">✎ Brief chiến dịch</button>
      </div>
      ${tab === "hoi" ? questionTabHtml() : briefTabHtml()}
      <h3>KPI & ngưỡng cảnh báo</h3>${kpiFormHtml()}
      <h3>Nhật ký thay đổi</h3>${changelogHtml()}`;
  }

  // ---------- Hỏi team ----------
  const SAMPLE_QUESTIONS = [
    "Vì sao CPM tăng 1 tuần nay?",
    "Nên dồn ngân sách vào campaign nào?",
    "Campaign nào nên tắt?",
    "Đối thủ đang chạy ưu đãi gì?",
  ];
  const leaderTab = () => store.get("leader-tab", "hoi") === "brief" ? "brief" : "hoi";
  const isQuestion = () => !!(state.activeBrief && state.activeBrief.type === "question");

  function questionsHtml(limit) {
    const list = (state.questions || []).slice(0, limit || 20);
    if (!list.length) return `<p class="muted">Chưa có câu hỏi nào. Hỏi team ở Bàn Leader.</p>`;
    return list.map((q) => `<div class="card qa-card">
        <div class="card-title"><b>❓ ${esc(q.question)}</b><span class="muted">${esc(q.date)}</span></div>
        <p>${esc(q.shortAnswer || "Đang xử lý…")}</p>
        <div class="agent-chips">${(q.agents || []).map((id) => `<span class="chip-sm">${esc((agentDef(id) || {}).no || "")} ${esc((agentDef(id) || {}).short || id)}</span>`).join("")}
        ${q.file ? `<a href="${esc(q.file)}" target="_blank" rel="noopener">Xem trả lời đầy đủ →</a>` : ""}</div>
      </div>`).join("");
  }

  function questionCommand(d) {
    const q = (d.q || "").trim().replace(/\s+/g, " ");
    const pick = d.assign || [];
    return `/hoi ${q}${pick.length ? ` [giao: ${pick.join(",")}]` : ""}`;
  }

  function questionTabHtml() {
    const d = store.get("question-draft", { q: "", assign: [] });
    return `
      <form class="form" id="q-form" autocomplete="off">
        <label>Câu hỏi cho team<textarea name="q" class="q-input" placeholder="VD: Vì sao chi phí/tin nhắn tuần này tăng? Nên làm gì?">${esc(d.q)}</textarea></label>
        <div class="chips" aria-label="Câu hỏi mẫu">${SAMPLE_QUESTIONS.map((x) => `<button type="button" class="chip" data-sample="${esc(x)}">${esc(x)}</button>`).join("")}</div>
        <details ${d.assign && d.assign.length ? "open" : ""}><summary>Chọn bộ phận (để trống = Claude Code tự chọn)</summary>
          <div class="checks">${BRIEF_AGENTS.map((a) => `<label><input type="checkbox" name="assign" value="${a.id}" ${(d.assign || []).includes(a.id) ? "checked" : ""}>${a.no} ${esc(a.name)}</label>`).join("")}</div>
        </details>
        <div class="form-actions"><button type="button" class="btn btn-claude" data-act="ask">${sendLabel("⧉ Copy lệnh /hoi")}</button></div>
      </form>
      <pre class="preview" id="q-preview"></pre>
      <h3>Câu trả lời gần đây</h3>${questionsHtml(10)}`;
  }

  function wireQuestionForm() {
    const form = document.getElementById("q-form");
    const preview = document.getElementById("q-preview");
    const read = () => { const fd = new FormData(form); return { q: String(fd.get("q") || ""), assign: fd.getAll("assign") }; };
    const update = () => { const d = read(); store.set("question-draft", d); preview.textContent = d.q.trim() ? questionCommand(d) : "Lệnh /hoi sẽ hiện ở đây."; };
    form.addEventListener("input", update);
    form.addEventListener("change", update);
    update();
    form.addEventListener("click", async (e) => {
      const sample = e.target.closest("[data-sample]");
      if (sample) { form.elements.q.value = sample.dataset.sample; update(); form.elements.q.focus(); return; }
      if (!e.target.closest("[data-act=ask]")) return;
      const d = read();
      if (!d.q.trim()) { toast("Gõ câu hỏi trước đã"); form.elements.q.focus(); return; }
      const cmd = questionCommand(d);
      await runOrCopy("hoi", cmd.replace(/^\/hoi /, ""), cmd);
    });
  }

  function briefTabHtml() {
    const draft = loadDraft();
    const assign = draft.assign || [];
    return `
      <form class="form" id="brief-form" autocomplete="off">
        ${BRIEF_FIELDS.map((f) => f.row ? `<div class="row-2">${f.row.map((x) => fieldHtml(x, draft)).join("")}</div>` : fieldHtml(f, draft)).join("")}
        <div><span class="muted">Giao cho</span>
          <div class="checks">${BRIEF_AGENTS.map((a) => `<label><input type="checkbox" name="assign" value="${a.id}" ${assign.includes(a.id) ? "checked" : ""}>${a.no} ${esc(a.name)}</label>`).join("")}</div>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-claude" data-act="copy">${sendLabel("⧉ Copy lệnh cho Claude Code")}</button>
          <button type="button" class="btn" data-act="download">⭳ Tải brief .md</button>
          <button type="button" class="btn btn-ghost" data-act="clear">Xoá nháp</button>
        </div>
      </form>
      <pre class="preview" id="brief-preview"></pre>`;
  }

  function readForm(form) {
    const fd = new FormData(form);
    const d = {};
    for (const [k, v] of fd.entries()) if (k !== "assign") d[k] = String(v).trim();
    d.assign = fd.getAll("assign");
    return d;
  }

  function briefMarkdown(d) {
    const line = (label, v) => `- **${label}:** ${v || "_(chưa có)_"}`;
    const assigned = d.assign.length ? d.assign : BRIEF_AGENTS.map((a) => a.id);
    return [
      `# Brief: ${d.title || "(chưa đặt tên)"}`,
      "",
      line("Ngày", today()),
      line("Mục tiêu", d.goal),
      line("Sản phẩm / ưu đãi", d.product),
      line("Khách hàng mục tiêu", d.audience),
      line("Ngân sách", d.budget),
      line("KPI", d.kpi),
      line("Thời gian", d.timeline),
      line("Tài khoản / campaign", d.account),
      "",
      "## Giao cho",
      ...assigned.map((id) => `- ${id} (${(agentDef(id) || {}).name || id})`),
      "",
      "## Ghi chú",
      d.notes || "_(không có)_",
      "",
      "> Quy tắc: team chỉ đọc dữ liệu & góp ý. Leader tự thực hiện mọi chỉnh sửa trên Meta Ads.",
    ].join("\n");
  }

  function briefFilename(d) {
    return `${today()}-${slugify(d.title)}.md`;
  }

  function wireBriefForm() {
    const form = document.getElementById("brief-form");
    const preview = document.getElementById("brief-preview");
    const update = () => {
      const d = readForm(form);
      store.set("brief-draft", d);
      preview.textContent = briefMarkdown(d);
    };
    form.addEventListener("input", update);
    form.addEventListener("change", update);
    update();

    form.addEventListener("click", async (e) => {
      const act = e.target.closest("[data-act]") && e.target.closest("[data-act]").dataset.act;
      if (!act) return;
      const d = readForm(form);
      if (act === "copy") {
        if (!d.title && !d.goal) { toast("Điền ít nhất tên brief hoặc mục tiêu"); return; }
        const body = `Lưu brief này vào briefs/${briefFilename(d)} rồi xử lý:\n\n${briefMarkdown(d)}`;
        await runOrCopy("brief", body, `/brief ${body}`);
      } else if (act === "download") {
        const blob = new Blob([briefMarkdown(d) + "\n"], { type: "text/markdown;charset=utf-8" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = briefFilename(d);
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
        toast("Đã tải — bỏ file vào thư mục briefs/");
      } else if (act === "clear") {
        store.set("brief-draft", { assign: BRIEF_AGENTS.map((x) => x.id) });
        renderPanel();
      }
    });
  }

  // ---------- Gửi việc: qua server cầu nối nếu có, không thì copy lệnh ----------
  const bridge = { ok: false, current: null, queue: 0 };
  const sendLabel = (copyLabel) => bridge.ok ? "▶ Gửi cho team" : copyLabel;

  async function runOrCopy(kind, text, cmd) {
    if (!bridge.ok) {
      await copyText(cmd);
      toast(`Đã copy lệnh ${cmd.split(" ")[0]} — dán vào Claude Code`);
      return;
    }
    try {
      const r = await fetch("api/run", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, text }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || r.statusText);
      toast(j.position ? `Đã gửi — xếp hàng thứ ${j.position}` : "Đã gửi cho team — Claude Code đang nhận việc");
    } catch (err) {
      await copyText(cmd);
      toast(`Không gửi được (${err.message}) — đã copy lệnh để dán tay`);
    }
  }

  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return; } catch (e) { /* dùng cách dự phòng */ }
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) { /* bỏ qua */ }
    ta.remove();
  }

  function renderPanel() {
    if (view.kind === "agent") panel.innerHTML = viewAgent(view.id);
    else if (view.kind === "assistant") panel.innerHTML = viewAssistant();
    else if (view.kind === "brief") panel.innerHTML = viewBrief();
    else if (view.kind === "daily") panel.innerHTML = viewDaily();
    else panel.innerHTML = viewOverview();

    const slot = panel.querySelector("[data-avatar]");
    if (slot) {
      const def = view.kind === "agent" ? agentDef(view.id) : view.kind === "assistant" ? "assistant"
        : view.kind === "daily" ? agentDef("daily-reporter") : TEAM.leader;
      slot.replaceWith(avatarCanvas(def));
    }
    if (view.kind === "brief") {
      if (leaderTab() === "hoi") wireQuestionForm(); else wireBriefForm();
      wireLeaderForms();
    }
    const pick = document.getElementById("acc-pick");
    if (pick) pick.addEventListener("change", () => { view.account = pick.value; renderPanel(); });
  }

  panel.addEventListener("change", (e) => {
    const cb = e.target;
    if (cb.matches && cb.matches(".recs input[type=checkbox]")) {
      store.set(recKey(cb.dataset.agent, cb.dataset.rec), cb.checked);
      cb.closest("li").classList.toggle("checked", cb.checked);
    }
  });
  panel.addEventListener("click", async (e) => {
    const dl = e.target.closest("[data-dalam]");
    if (dl) {
      store.set("dalam-draft", dl.dataset.dalam);
      await runOrCopy("da-lam", dl.dataset.dalam, `/da-lam ${dl.dataset.dalam}`);
      return;
    }
    if (e.target.closest("[data-run-daily]")) { await runOrCopy("bao-cao-ngay", "", "/bao-cao-ngay"); return; }
    if (e.target.closest("[data-stop]")) { await stopJob(); return; }
    const tab = e.target.closest("[data-tab]");
    if (tab) { store.set("leader-tab", tab.dataset.tab); renderPanel(); return; }
    const li = e.target.closest("[data-open]");
    if (li) open(li.dataset.open);
  });

  function renderStatusbar() {
    const done = BRIEF_AGENTS.filter((a) => agentState(a.id).status === "done").length;
    const working = TEAM.agents.filter((a) => ["working", "reporting"].includes(agentState(a.id).status)).length;
    const acc = firstAccount();
    const last = acc && acc.data.days[acc.data.days.length - 1];
    const nAlerts = acc ? Object.values(daily.accounts).reduce((n, a) => n + (a.alerts || []).length, 0) : 0;
    statusbar.innerHTML = `
      <span class="conn ${bridge.ok ? "on" : ""}" title="${esc(bridge.version || "")}">● ${bridge.ok ? `Claude Code${bridge.model ? ` (${MODEL_LABEL[bridge.model] || bridge.model})` : ""} ${bridge.current ? "đang làm việc" : "đã kết nối"}` : bridge.server ? "Server chạy nhưng thiếu lệnh claude" : "Chưa kết nối — chạy node server.js"}</span>
      ${state.demo ? `<span class="demo-badge">BRIEF MẪU</span>` : ""}
      ${last ? `<span>Hôm qua: <b>chi ${short(last.spend)} · ${num(last.messages)} TN · ${num(last.leads)} lead</b></span><span>Cảnh báo: <b>${nAlerts}</b></span>` : ""}
      <span>${isQuestion() ? "Câu hỏi" : "Brief"}: <b>${esc((state.activeBrief && state.activeBrief.title) || "—")}</b></span>
      <span>Xong: <b>${done}/${BRIEF_AGENTS.length}</b> · Đang làm: <b>${working}</b></span>
      <span>Chờ duyệt: <b>${(state.awaitingLeader || []).length}</b></span>
      <span>Cập nhật: <b>${esc(fmtTime(state.updatedAt))}</b></span>`;
  }

  function applyState() {
    state = window.OFFICE_STATE || { agents: {} };
    config = window.ADS_CONFIG || { accounts: [], kpi: {} };
    daily = window.ADS_DAILY || { accounts: {} };
    changelog = window.ADS_CHANGELOG || { entries: [] };
    office.setState(state);
    office.setDaily(daily);
    renderStatusbar();
    // không vẽ lại bàn Leader khi đang gõ form
    if (view.kind !== "brief") renderPanel();
  }

  // Đọc lại các file data/*.js bằng thẻ <script> mới (chạy được cả khi mở file:// trực tiếp).
  const DATA_FILES = ["state", "config", "daily", "changelog"];
  function loadScript(name) {
    return new Promise((resolve) => {
      const s = document.createElement("script");
      s.src = `data/${name}.js?t=${Date.now()}`;
      s.onload = () => { s.remove(); resolve(true); };
      s.onerror = () => { s.remove(); resolve(false); };
      document.body.appendChild(s);
    });
  }
  async function reloadState(manual) {
    const ok = await Promise.all(DATA_FILES.map(loadScript));
    applyState();
    if (manual) toast(ok.every(Boolean) ? "Đã tải lại dữ liệu" : "Có file data/*.js không đọc được");
  }

  // ---------- Trực tiếp từ server cầu nối (node server.js) ----------
  const liveLog = [];
  const liveStrip = document.getElementById("livelog");
  const lastTool = {};
  const doneTimers = {};
  const KIND_LABEL = { hoi: "câu hỏi", brief: "brief", "bao-cao": "báo cáo nhanh", "bao-cao-ngay": "báo cáo ngày", kpi: "KPI", "da-lam": "nhật ký thay đổi" };
  const clip = (t, n) => { t = String(t || "").replace(/\s+/g, " ").trim(); return t.length > n ? t.slice(0, n - 1) + "…" : t; };
  const who = (id) => id === "assistant" ? "Claude Code" : (() => { const d = agentDef(id) || {}; return `${d.no || ""} ${d.short || id}`; })();
  const hhmm = (iso) => new Date(iso || Date.now()).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

  function liveLogHtml(n) {
    const rows = liveLog.slice(-n).reverse();
    const head = bridge.current
      ? `<div class="live-head"><span>Đang làm: <b>${esc(clip(bridge.current.text || KIND_LABEL[bridge.current.kind], 60))}</b>${bridge.queue ? ` · ${bridge.queue} việc chờ` : ""}</span><button type="button" class="btn btn-mini-stop" data-stop>■ Dừng</button></div>`
      : "";
    return head + (rows.length ? `<ul class="live-list">${rows.map((r) => `<li class="lv-${r.cls}"><span class="muted">${hhmm(r.at)}</span> ${esc(r.text)}</li>`).join("")}</ul>` : `<p class="muted">Chưa có việc nào. Gửi câu hỏi ở Bàn Leader.</p>`);
  }

  function renderLiveLog() {
    if (liveStrip) {
      liveStrip.hidden = !bridge.ok;
      if (bridge.ok) liveStrip.innerHTML = liveLogHtml(bridge.current ? 4 : 2);
    }
    const p = document.getElementById("live-log-panel");
    if (p) p.innerHTML = liveLogHtml(30);
  }

  function logLine(ev, text, cls) {
    liveLog.push({ at: ev.at, text, cls });
    if (liveLog.length > 80) liveLog.shift();
  }

  function handleEvent(ev, replay) {
    const L = office.live;
    if (ev.type === "job") {
      const j = ev.job || {};
      bridge.queue = ev.queued || 0;
      if (ev.phase === "queued") {
        logLine(ev, `Xếp hàng ${KIND_LABEL[j.kind] || j.kind}: ${clip(j.text, 60)}`, "muted");
      } else if (ev.phase === "start") {
        bridge.current = j;
        logLine(ev, `Claude Code nhận ${KIND_LABEL[j.kind] || j.kind}: ${clip(j.text, 60)}`, "start");
        if (replay) L.setStatus("assistant", "working");
        else L.leaderDeliver(() => { L.setStatus("assistant", "working"); L.say("assistant", "Nhận việc!", 3000); });
      } else {
        bridge.current = null;
        Object.values(doneTimers).forEach(clearTimeout);
        L.clear();
        const ok = ev.phase === "done";
        logLine(ev, ok ? `✓ Xong: ${clip(j.result, 160)}` : ev.phase === "stopped" ? "■ Đã dừng" : `✗ Lỗi: ${clip(j.result, 160)}`, ok ? "ok" : "err");
        if (!replay) {
          L.say("assistant", ok ? "Xong rồi!" : "Có lỗi…", 5000);
          toast(ok ? "Team đã trả lời ✓" : ev.phase === "stopped" ? "Đã dừng việc" : "Việc bị lỗi — xem nhật ký ở bàn Claude Code");
          reloadState(false).then(() => { if (ok && j.kind === "hoi") { store.set("leader-tab", "hoi"); open("leader"); } });
        }
      }
      renderStatusbar();
    } else if (ev.type === "text") {
      if (!replay) L.say("assistant", ev.text.replace(/\/[\w-]+\s*/g, "").trim() || "Đang suy nghĩ…", 4000);
      logLine(ev, `Claude Code: ${clip(ev.text, 120)}`, "muted");
    } else if (ev.type === "assign") {
      logLine(ev, `→ Giao ${who(ev.agent)}: ${clip(ev.text, 80)}`, "assign");
      if (replay) L.setStatus(ev.agent, "working");
      else L.fly("assistant", ev.agent, () => { L.setStatus(ev.agent, "working"); L.say(ev.agent, "Nhận việc!", 2500); });
    } else if (ev.type === "tool") {
      if (!replay) L.say(ev.agent, `${ev.tool}…`, 4000);
      if (lastTool[ev.agent] !== ev.tool) { lastTool[ev.agent] = ev.tool; logLine(ev, `${who(ev.agent)} dùng ${ev.tool}`, "tool"); }
    } else if (ev.type === "agent-done") {
      logLine(ev, `${who(ev.agent)} nộp kết quả${ev.error ? " (có lỗi)" : ""}`, "ok");
      L.setStatus(ev.agent, replay ? "done" : "reporting");
      if (!replay) {
        clearTimeout(doneTimers[ev.agent]);
        doneTimers[ev.agent] = setTimeout(() => L.setStatus(ev.agent, "done"), 8000);
      }
    }
    renderLiveLog();
  }

  async function stopJob() {
    if (!bridge.current) return;
    if (!confirm("Dừng việc team đang làm?")) return;
    try { await fetch("api/stop", { method: "POST" }); } catch (e) { toast("Không dừng được"); }
  }

  async function connectBridge() {
    if (location.protocol === "file:") return;
    try {
      const r = await fetch("api/status", { cache: "no-store" });
      if (!r.ok) return;
      const st = await r.json();
      bridge.server = true;
      bridge.ok = !!st.claude;
      bridge.version = st.claudeVersion;
      bridge.model = st.model;
      (st.events || []).forEach((e) => handleEvent(e, true));
      bridge.current = st.current || null;
      bridge.queue = (st.queue || []).length;
      renderPanel();
      renderStatusbar();
      renderLiveLog();
      if (!bridge.ok) return;
      const es = new EventSource("api/events");
      es.onmessage = (m) => { try { handleEvent(JSON.parse(m.data), false); } catch (e) { /* bỏ qua dòng hỏng */ } };
    } catch (e) { /* không có server cầu nối → chế độ copy lệnh */ }
  }

  if (liveStrip) liveStrip.addEventListener("click", (e) => { if (e.target.closest("[data-stop]")) stopJob(); });
  // Khi team đang làm thì đọc lại data/*.js thường xuyên hơn.
  setInterval(() => { if (bridge.current) reloadState(false); }, 3000);

  let timer = null;
  const auto = document.getElementById("auto-reload");
  function setAuto(on) {
    clearInterval(timer);
    timer = on ? setInterval(() => reloadState(false), 10000) : null;
    store.set("auto-reload", on);
  }
  auto.checked = store.get("auto-reload", true);
  auto.addEventListener("change", () => setAuto(auto.checked));
  setAuto(auto.checked);

  document.getElementById("btn-reload").addEventListener("click", () => reloadState(true));
  document.getElementById("btn-brief").addEventListener("click", () => { store.set("leader-tab", "hoi"); open("leader"); });
  document.getElementById("btn-overview").addEventListener("click", () => { view = { kind: "overview" }; office.select(null); renderPanel(); });

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => office.resize());
  applyState();
  renderPanel();
  connectBridge();
})();
