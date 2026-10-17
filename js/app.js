// Giao diện quanh văn phòng: panel chi tiết, form brief của Leader, đọc lại data/state.js.
(function () {
  const TEAM = window.TEAM;
  const panel = document.getElementById("panel");
  const tooltip = document.getElementById("tooltip");
  const statusbar = document.getElementById("statusbar");
  const STORE = "ads-hq:";

  let state = window.OFFICE_STATE || { agents: {} };
  let view = { kind: "overview" };

  // localStorage có thể bị chặn (chế độ riêng tư) → luôn bọc try/catch.
  const store = {
    get(k, d) { try { const v = localStorage.getItem(STORE + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(STORE + k, JSON.stringify(v)); } catch (e) { /* bỏ qua */ } },
  };

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const agentDef = (id) => TEAM.agents.find((a) => a.id === id);
  const agentState = (id) => (state.agents && state.agents[id]) || {};
  const statusPill = (st) => `<span class="pill s-${esc(st)}">${esc(window.STATUS_LABEL[st] || st)}</span>`;
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
      if (id === "leader") { title = "LEADER · BẠN"; line = `${(state.awaitingLeader || []).length} việc chờ bạn duyệt · bấm để viết brief`; }
      else if (id === "assistant") { title = "CLAUDE CODE"; line = (state.assistant && state.assistant.message) || "Trợ lý điều phối & báo cáo"; }
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
        <span>${esc(r.text)}${r.priority ? `<em class="prio ${prioClass(r.priority)}">${esc(r.priority)}</em>` : ""}</span></li>`;
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
    const done = TEAM.agents.filter((a) => agentState(a.id).status === "done").length;
    return `
      <h2>TỔNG QUAN</h2>
      <p class="muted">Brief đang chạy</p>
      <p><b>${esc((state.activeBrief && state.activeBrief.title) || "Chưa có brief")}</b></p>
      <div class="progress" title="${done}/6 bộ phận đã xong"><i style="width:${Math.round(done / 6 * 100)}%"></i></div>
      <p class="muted">${done}/6 bộ phận đã xong</p>
      <h3>Chờ bạn duyệt</h3>${awaitingHtml()}
      <h3>Đội hình</h3>
      <ul class="team-list">
        <li data-open="leader"><span class="no">01</span><span>Bạn — Leader</span><span class="muted">brief</span></li>
        <li data-open="assistant"><span class="no">CC</span><span>Claude Code — Trợ lý báo cáo</span>${statusPill((state.assistant && state.assistant.status) || "idle")}</li>
        ${TEAM.agents.map((a) => `<li data-open="${a.id}"><span class="no">${a.no}</span><span>${esc(a.name)}</span>${statusPill(agentState(a.id).status || "idle")}</li>`).join("")}
      </ul>
      <h3>Báo cáo gần đây</h3>${reportsHtml()}`;
  }

  function viewAgent(id) {
    const d = agentDef(id), s = agentState(id);
    return `
      <div class="who"><span data-avatar></span><div><div class="who-no">${d.no}</div><h2>${esc(d.name)}</h2><div class="muted">${esc(d.sub)}</div></div></div>
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
      <h3>Lời nhắn cho Leader</h3><p>${esc(a.message || "Sẵn sàng nhận brief.")}</p>
      ${a.reportFile ? `<p><a href="${esc(a.reportFile)}" target="_blank" rel="noopener">Mở báo cáo tổng hợp →</a></p>` : ""}
      <h3>Cách giao việc</h3>
      <div class="card">1. Viết brief ở phòng Leader → <b>Copy lệnh</b>.<br>2. Dán vào Claude Code (mở trong thư mục repo này).<br>3. Claude Code giao việc cho 6 bộ phận, cập nhật văn phòng và viết báo cáo vào <code>reports/</code>.</div>
      <div class="card">Lệnh nhanh: <code>/brief</code> giao brief · <code>/bao-cao</code> hỏi tình hình team.</div>
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
    return store.get("brief-draft", { assign: TEAM.agents.map((a) => a.id) });
  }

  function fieldHtml(f, draft) {
    const v = esc(draft[f.k] || "");
    const input = f.type === "area"
      ? `<textarea name="${f.k}" placeholder="${esc(f.ph)}">${v}</textarea>`
      : `<input type="text" name="${f.k}" placeholder="${esc(f.ph)}" value="${v}">`;
    return `<label>${esc(f.label)}${input}</label>`;
  }

  function viewBrief() {
    const draft = loadDraft();
    const assign = draft.assign || [];
    return `
      <div class="who"><span data-avatar></span><div><div class="who-no">01</div><h2>BÀN LEADER</h2><div class="muted">Bạn ra brief — team góp ý — bạn tự set Ads</div></div></div>
      <h3>Chờ bạn duyệt</h3>${awaitingHtml()}
      <h3>Brief mới</h3>
      <form class="form" id="brief-form" autocomplete="off">
        ${BRIEF_FIELDS.map((f) => f.row ? `<div class="row-2">${f.row.map((x) => fieldHtml(x, draft)).join("")}</div>` : fieldHtml(f, draft)).join("")}
        <div><span class="muted">Giao cho</span>
          <div class="checks">${TEAM.agents.map((a) => `<label><input type="checkbox" name="assign" value="${a.id}" ${assign.includes(a.id) ? "checked" : ""}>${a.no} ${esc(a.name)}</label>`).join("")}</div>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-claude" data-act="copy">⧉ Copy lệnh cho Claude Code</button>
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
    const assigned = d.assign.length ? d.assign : TEAM.agents.map((a) => a.id);
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
        const cmd = `/brief Lưu brief này vào briefs/${briefFilename(d)} rồi xử lý:\n\n${briefMarkdown(d)}`;
        await copyText(cmd);
        toast("Đã copy — dán vào Claude Code");
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
        store.set("brief-draft", { assign: TEAM.agents.map((x) => x.id) });
        renderPanel();
      }
    });
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
    else panel.innerHTML = viewOverview();

    const slot = panel.querySelector("[data-avatar]");
    if (slot) {
      const def = view.kind === "agent" ? agentDef(view.id) : view.kind === "assistant" ? "assistant" : TEAM.leader;
      slot.replaceWith(avatarCanvas(def));
    }
    if (view.kind === "brief") wireBriefForm();
  }

  panel.addEventListener("change", (e) => {
    const cb = e.target;
    if (cb.matches && cb.matches(".recs input[type=checkbox]")) {
      store.set(recKey(cb.dataset.agent, cb.dataset.rec), cb.checked);
      cb.closest("li").classList.toggle("checked", cb.checked);
    }
  });
  panel.addEventListener("click", (e) => {
    const li = e.target.closest("[data-open]");
    if (li) open(li.dataset.open);
  });

  function renderStatusbar() {
    const done = TEAM.agents.filter((a) => agentState(a.id).status === "done").length;
    const working = TEAM.agents.filter((a) => ["working", "reporting"].includes(agentState(a.id).status)).length;
    statusbar.innerHTML = `
      ${state.demo ? `<span class="demo-badge">DỮ LIỆU MẪU</span>` : ""}
      <span>Brief: <b>${esc((state.activeBrief && state.activeBrief.title) || "—")}</b></span>
      <span>Xong: <b>${done}/6</b> · Đang làm: <b>${working}</b></span>
      <span>Chờ duyệt: <b>${(state.awaitingLeader || []).length}</b></span>
      <span>Cập nhật: <b>${esc(fmtTime(state.updatedAt))}</b></span>`;
  }

  function applyState(s) {
    state = s || { agents: {} };
    office.setState(state);
    renderStatusbar();
    // không vẽ lại form brief khi đang gõ
    if (view.kind !== "brief") renderPanel();
  }

  // Đọc lại data/state.js bằng thẻ <script> mới (chạy được cả khi mở file:// trực tiếp).
  function reloadState(manual) {
    const s = document.createElement("script");
    s.src = `data/state.js?t=${Date.now()}`;
    s.onload = () => { applyState(window.OFFICE_STATE); s.remove(); if (manual) toast("Đã tải lại dữ liệu"); };
    s.onerror = () => { s.remove(); if (manual) toast("Không đọc được data/state.js"); };
    document.body.appendChild(s);
  }

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
  document.getElementById("btn-brief").addEventListener("click", () => open("leader"));
  document.getElementById("btn-overview").addEventListener("click", () => { view = { kind: "overview" }; office.select(null); renderPanel(); });

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => office.resize());
  applyState(state);
  renderPanel();
})();
