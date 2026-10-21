#!/usr/bin/env node
// Server cầu nối cho văn phòng Ads Team HQ.
// - Phục vụ web (index.html, js/, css/, data/, reports/) ở http://localhost:8000
// - Nhận việc từ web (POST /api/run) và chạy Claude Code headless (`claude -p`) trong repo này
// - Đẩy tiến độ thời gian thực về web qua Server-Sent Events (GET /api/events)
// Không cần npm install. Chạy: node server.js   (đổi cổng: PORT=8080 node server.js)

const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawn, spawnSync } = require("child_process");

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 8000;
const HOST = "127.0.0.1";
const CLAUDE_BIN = process.env.CLAUDE_BIN || "claude";
// Model của Claude Code điều phối. Sub-agent dùng model ghi trong .claude/agents/*.md (dòng `model:`).
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || "opus";
const IS_WIN = process.platform === "win32";
// Việc chạy quá lâu (treo) sẽ bị dừng để không chặn hàng đợi. Đổi: JOB_TIMEOUT_MIN=60 node server.js
const JOB_TIMEOUT_MS = (Number(process.env.JOB_TIMEOUT_MIN) || 30) * 60 * 1000;
const LOG_DIR = path.join(ROOT, "logs", "jobs");

// Lệnh slash tương ứng với từng loại việc web gửi lên.
const COMMANDS = {
  hoi: (t) => `/hoi ${t}`,
  brief: (t) => `/brief ${t}`,
  "bao-cao": () => "/bao-cao",
  "bao-cao-ngay": (t) => `/bao-cao-ngay ${t}`.trim(),
  kpi: (t) => `/kpi ${t}`,
  "da-lam": (t) => `/da-lam ${t}`,
};

// Headless không hỏi quyền được → liệt kê sẵn tool được phép.
// Tool ghi lên tài khoản quảng cáo vẫn bị hook .claude/hooks/meta-ads-readonly.js chặn.
const ADS_SERVERS = ["ADS_ANALYZS_FOR_NT_BEAUTY_SPA", "META_ADS_CONNECTION"];
const ALLOWED_TOOLS = [
  "Read", "Write", "Edit", "Glob", "Grep", "WebSearch", "WebFetch", "Task", "Agent", "TodoWrite",
  "Bash(node:*)", "Bash(git:*)", "Bash(date:*)", "Bash(mkdir:*)", "Bash(ls:*)", "Bash(TZ=Asia/Ho_Chi_Minh date:*)",
  ...ADS_SERVERS.flatMap((s) => [`mcp__${s}`, `mcp__claude_ai_${s}`]),
];

const AGENT_IDS = ["strategy-research", "creative-specialist", "media-buyer", "tracking-crm",
  "performance-analyst", "compliance-qa", "daily-reporter"];

// ---------- Trạng thái ----------
const clients = new Set();
const recent = [];          // sự kiện gần đây (để mở lại trang vẫn thấy)
const queue = [];
let current = null;         // { job, child, agentByToolUse }
let jobSeq = 0;

const claudeVersion = (() => {
  try {
    const r = spawnSync(CLAUDE_BIN, ["--version"], { encoding: "utf8", shell: IS_WIN, timeout: 15000 });
    return r.status === 0 ? String(r.stdout).trim() : null;
  } catch (e) { return null; }
})();

function emit(ev) {
  ev.at = new Date().toISOString();
  recent.push(ev);
  if (recent.length > 200) recent.shift();
  const line = `data: ${JSON.stringify(ev)}\n\n`;
  for (const res of clients) res.write(line);
  if (ev.jobId) {
    try { fs.appendFileSync(path.join(LOG_DIR, `${ev.jobId}.events.jsonl`), JSON.stringify(ev) + "\n"); } catch (e) { /* bỏ qua */ }
  }
}

function publicJob(j) {
  return j && { id: j.id, kind: j.kind, text: j.text, status: j.status, startedAt: j.startedAt, endedAt: j.endedAt, result: j.result, cost: j.cost };
}

// ---------- Chạy job ----------
function shortTool(name) {
  const m = /^mcp__(.+?)__(.+)$/.exec(name || "");
  return m ? m[2] : name;
}

function winQuote(a) { return `"${String(a).replace(/"/g, '""')}"`; }

// Dừng cả cây tiến trình của Claude Code (gồm MCP server con), không chỉ tiến trình chính.
function killTree(child) {
  try {
    if (IS_WIN) spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"]);
    else process.kill(-child.pid, "SIGTERM");
  } catch (e) {
    try { child.kill("SIGTERM"); } catch (e2) { /* đã thoát */ }
  }
}

function startNext() {
  if (current || !queue.length) return;
  const job = queue.shift();
  job.status = "running";
  job.startedAt = new Date().toISOString();
  fs.mkdirSync(LOG_DIR, { recursive: true });

  const args = [
    "-p",
    "--output-format", "stream-json",
    "--verbose",
    "--model", CLAUDE_MODEL,
    "--permission-mode", "acceptEdits",
    "--append-system-prompt-file", path.join(ROOT, ".claude", "headless-prompt.md"),
    "--allowedTools", ALLOWED_TOOLS.join(","),
  ];
  const child = spawn(CLAUDE_BIN, IS_WIN ? args.map(winQuote) : args, {
    cwd: ROOT, shell: IS_WIN, env: process.env, stdio: ["pipe", "pipe", "pipe"], detached: !IS_WIN,
  });
  const ctx = { job, child, agentByToolUse: new Map(), buf: "", stderr: "" };
  current = ctx;
  ctx.timeout = setTimeout(() => {
    finish(ctx, "error", `Quá ${JOB_TIMEOUT_MS / 60000} phút chưa xong — đã dừng việc này.`);
    killTree(child);
  }, JOB_TIMEOUT_MS);
  emit({ type: "job", phase: "start", jobId: job.id, job: publicJob(job), queued: queue.length });

  // Nội dung lệnh đi qua stdin để không vướng chuyện escape trên Windows.
  child.stdin.write(job.prompt);
  child.stdin.end();

  const raw = fs.createWriteStream(path.join(LOG_DIR, `${job.id}.jsonl`));
  child.stdout.on("data", (chunk) => {
    raw.write(chunk);
    ctx.buf += chunk.toString("utf8");
    let i;
    while ((i = ctx.buf.indexOf("\n")) >= 0) {
      const line = ctx.buf.slice(0, i).trim();
      ctx.buf = ctx.buf.slice(i + 1);
      if (line) handleLine(ctx, line);
    }
  });
  child.stderr.on("data", (c) => { ctx.stderr = (ctx.stderr + c.toString("utf8")).slice(-4000); });
  child.on("error", (err) => finish(ctx, "error", `Không chạy được Claude Code: ${err.message}`));
  child.on("close", (code) => {
    raw.end();
    finish(ctx, code === 0 ? "done" : "error", job.result || ctx.stderr.trim() || `Claude Code thoát với mã ${code}`);
  });
}

function finish(ctx, status, result, cost) {
  const job = ctx.job;
  if (job.status !== "running") return;
  clearTimeout(ctx.timeout);
  job.status = status;
  job.endedAt = new Date().toISOString();
  if (result != null) job.result = result;
  if (cost != null) job.cost = cost;
  emit({ type: "job", phase: status, jobId: job.id, job: publicJob(job), queued: queue.length });
  if (current === ctx) current = null;
  setTimeout(startNext, 300);
}

function handleLine(ctx, line) {
  let d;
  try { d = JSON.parse(line); } catch (e) { return; }
  if (ctx.job.status !== "running") return;
  const job = ctx.job;
  const map = ctx.agentByToolUse;

  if (d.type === "assistant" && d.message && Array.isArray(d.message.content)) {
    const owner = d.parent_tool_use_id ? map.get(d.parent_tool_use_id) : "assistant";
    for (const b of d.message.content) {
      if (b.type === "tool_use") {
        if ((b.name === "Task" || b.name === "Agent") && !d.parent_tool_use_id) {
          const agent = b.input && b.input.subagent_type;
          if (AGENT_IDS.includes(agent)) {
            map.set(b.id, agent);
            emit({ type: "assign", jobId: job.id, agent, text: (b.input.description || "").slice(0, 120) });
            continue;
          }
        }
        if (owner) emit({ type: "tool", jobId: job.id, agent: owner, tool: shortTool(b.name) });
      } else if (b.type === "text" && owner === "assistant" && b.text && b.text.trim()) {
        emit({ type: "text", jobId: job.id, agent: "assistant", text: b.text.trim().slice(0, 240) });
      }
    }
  } else if (d.type === "user" && d.message && Array.isArray(d.message.content) && !d.parent_tool_use_id) {
    for (const b of d.message.content) {
      if (b.type === "tool_result" && map.has(b.tool_use_id)) {
        emit({ type: "agent-done", jobId: job.id, agent: map.get(b.tool_use_id), error: !!b.is_error });
      }
    }
  } else if (d.type === "result") {
    finish(ctx, d.is_error ? "error" : "done", d.result || "", d.total_cost_usd);
  }
}

// ---------- HTTP ----------
const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".md": "text/plain; charset=utf-8", ".png": "image/png",
  ".svg": "image/svg+xml", ".ico": "image/x-icon", ".txt": "text/plain; charset=utf-8",
};

function sendJson(res, code, obj) {
  res.writeHead(code, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(obj));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (c) => { body += c; if (body.length > 100000) { reject(new Error("too large")); req.destroy(); } });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function serveStatic(req, res, pathname) {
  if (pathname === "/") pathname = "/index.html";
  let decoded;
  try { decoded = decodeURIComponent(pathname); } catch (e) { res.writeHead(400); return res.end("Bad request"); }
  const file = path.normalize(path.join(ROOT, decoded));
  const rel = path.relative(ROOT, file);
  // Không cho đọc ra ngoài repo, file ẩn (.git, .claude) hay log.
  if (rel.startsWith("..") || path.isAbsolute(rel) || rel.split(path.sep).some((p) => p.startsWith(".")) || rel.startsWith("logs")) {
    res.writeHead(404); return res.end("Not found");
  }
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404); return res.end("Not found"); }
    res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream", "Cache-Control": "no-store" });
    fs.createReadStream(file).pipe(res);
  });
}

const server = http.createServer((req, res) => {
  handle(req, res).catch((err) => {
    console.error("Lỗi xử lý request:", err);
    if (!res.headersSent) sendJson(res, 500, { error: "Lỗi server" }); else res.end();
  });
});

async function handle(req, res) {
  const url = new URL(req.url, "http://localhost");
  const p = url.pathname;

  // Chặn trang web khác gọi API qua trình duyệt của Leader.
  if (p.startsWith("/api/") && req.method === "POST") {
    const origin = req.headers.origin;
    if (origin && !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return sendJson(res, 403, { error: "forbidden" });
  }

  if (p === "/api/status" && req.method === "GET") {
    return sendJson(res, 200, {
      ok: true, claude: !!claudeVersion, claudeVersion, model: CLAUDE_MODEL,
      current: current ? publicJob(current.job) : null,
      queue: queue.map(publicJob),
      events: recent.slice(-60),
    });
  }

  if (p === "/api/events" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-store", Connection: "keep-alive" });
    res.write(": connected\n\n");
    clients.add(res);
    const ka = setInterval(() => res.write(": ping\n\n"), 20000);
    req.on("close", () => { clearInterval(ka); clients.delete(res); });
    return;
  }

  if (p === "/api/run" && req.method === "POST") {
    if (!claudeVersion) return sendJson(res, 503, { error: "Không tìm thấy lệnh `claude` trên máy. Cài Claude Code rồi chạy lại server." });
    let body;
    try { body = JSON.parse(await readBody(req) || "{}"); } catch (e) { return sendJson(res, 400, { error: "JSON không hợp lệ" }); }
    const kind = String(body.kind || "");
    const text = String(body.text || "").trim();
    if (!COMMANDS[kind]) return sendJson(res, 400, { error: `Loại việc không hỗ trợ: ${kind}` });
    if (!text && !["bao-cao", "bao-cao-ngay"].includes(kind)) return sendJson(res, 400, { error: "Thiếu nội dung" });
    const job = { id: `job-${Date.now()}-${++jobSeq}`, kind, text, prompt: COMMANDS[kind](text), status: "queued" };
    queue.push(job);
    emit({ type: "job", phase: "queued", jobId: job.id, job: publicJob(job), queued: queue.length });
    startNext();
    return sendJson(res, 200, { jobId: job.id, position: current && current.job.id !== job.id ? queue.length : 0 });
  }

  if (p === "/api/stop" && req.method === "POST") {
    // Không gửi jobId (hoặc jobId của việc đang chạy) → dừng việc đang chạy; jobId của việc đang chờ → bỏ khỏi hàng đợi.
    let body = {};
    try { body = JSON.parse(await readBody(req) || "{}"); } catch (e) { /* body rỗng */ }
    const qi = body.jobId ? queue.findIndex((j) => j.id === body.jobId) : -1;
    if (qi >= 0) {
      const [job] = queue.splice(qi, 1);
      job.status = "stopped";
      emit({ type: "job", phase: "removed", jobId: job.id, job: publicJob(job), queued: queue.length });
      return sendJson(res, 200, { stopped: true, removed: true });
    }
    if (!current) return sendJson(res, 200, { stopped: false });
    const ctx = current;
    finish(ctx, "stopped", "Leader đã dừng việc này.");
    killTree(ctx.child);
    return sendJson(res, 200, { stopped: true });
  }

  if (req.method === "GET") return serveStatic(req, res, p);
  res.writeHead(405); res.end();
}

// Tắt server (Ctrl+C) thì dừng luôn việc đang chạy.
for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, () => { if (current) killTree(current.child); process.exit(0); });
}

server.listen(PORT, HOST, () => {
  console.log(`Ads Team HQ: http://localhost:${PORT}`);
  console.log(claudeVersion ? `Claude Code: ${claudeVersion} (điều phối: ${CLAUDE_MODEL}) — có thể giao việc từ web.` : "⚠ Không tìm thấy lệnh `claude` — web chỉ chạy chế độ copy lệnh.");
});
