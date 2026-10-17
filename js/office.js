// Văn phòng pixel: vẽ cảnh ở độ phân giải logic 320x256 rồi phóng to (pixelated),
// chữ (biển tên, số trên TV) vẽ thêm ở độ phân giải thật cho sắc nét.
(function () {
  const S = window.SPRITES;
  const W = 320, H = 256;
  const AISLE_X = 155, CORRIDOR_Y = 84, WALK_SPEED = 30;

  const DESK_W = 64;
  const COLS = [40, 216];
  const ROWS = [124, 172, 220];

  // Phòng báo cáo 08 ở góc trên bên phải, TV KPI treo tường.
  const DAILY_DESK = { x: 244, y: 62 };
  const TV = { x: 226, y: 3, w: 62, h: 25 };

  // Chỗ đứng khi chạy vào phòng Leader báo động (cạnh phải bàn Leader).
  const ALERT_ROUTE = [{ x: 162, y: CORRIDOR_Y }, { x: 162, y: 78 }, { x: 199, y: 78 }, { x: 199, y: 58 }];

  // 6 bàn 02 → 07 xếp 2 cột x 3 hàng như sơ đồ; bàn 08 ở phòng báo cáo.
  function layoutAgents(agents) {
    let gridIndex = 0;
    return agents.map((a, i) => {
      let deskX, deskY, zone, exit;
      if (a.daily) {
        deskX = DAILY_DESK.x; deskY = DAILY_DESK.y;
        zone = { x: 220, y: 0, w: 100, h: 92 };
        exit = [{ x: 230, y: deskY - 12 }, { x: 230, y: CORRIDOR_Y }];
      } else {
        deskX = COLS[gridIndex % 2]; deskY = ROWS[Math.floor(gridIndex / 2)];
        gridIndex++;
        zone = { x: deskX - 6, y: deskY - 28, w: DESK_W + 12, h: 52 };
        exit = [{ x: AISLE_X, y: deskY - 12 }, { x: AISLE_X, y: CORRIDOR_Y }];
      }
      const seat = { x: deskX + 30, y: deskY - 12 };
      return {
        def: a, deskX, deskY, seat, zone, exit,
        walker: { phase: "seat", x: seat.x, y: seat.y, path: [], back: [], timer: 2 + i * 0.7, frame: 0, kind: null },
      };
    });
  }

  const LEADER = { deskX: 126, deskY: 62, seat: { x: 155, y: 50 }, zone: { x: 104, y: 30, w: 112, h: 62 } };
  const ASSIST = { deskX: 20, deskY: 62, zone: { x: 6, y: 2, w: 94, h: 90 } };
  const WALKING = { reporting: true, alert: true };

  function skyColor(hour) {
    if (hour >= 6 && hour < 17) return ["#8fd0f5", "#c8ecff"];
    if (hour >= 17 && hour < 19) return ["#f29a6b", "#f7c98b"];
    return ["#1d2550", "#33407a"];
  }

  function shortMoney(v) {
    if (v == null || isNaN(v)) return "—";
    if (v >= 1e6) return (v / 1e6).toLocaleString("vi-VN", { maximumFractionDigits: 1 }) + "tr";
    if (v >= 1e3) return Math.round(v / 1e3) + "k";
    return String(Math.round(v));
  }

  function createOffice(canvas, opts) {
    const ctx = canvas.getContext("2d");
    const low = document.createElement("canvas");
    low.width = W; low.height = H;
    const lctx = low.getContext("2d");

    const agents = layoutAgents(window.TEAM.agents);
    let state = window.OFFICE_STATE || { agents: {} };
    let daily = { accounts: {} };
    let hover = null, selected = null, scale = 1;
    const blinkAt = {};

    function statusOf(id) {
      if (id === "assistant") return (state.assistant && state.assistant.status) || "idle";
      return (state.agents && state.agents[id] && state.agents[id].status) || "idle";
    }

    function blinking(id, t) {
      if (blinkAt[id] === undefined || t > blinkAt[id] + 0.15) blinkAt[id] = t + 2 + Math.random() * 4;
      return t >= blinkAt[id] && t < blinkAt[id] + 0.15;
    }

    // Tài khoản hiển thị trên TV: tài khoản đầu tiên có số liệu.
    function tvAccount() {
      const accs = daily.accounts || {};
      const id = Object.keys(accs).find((k) => (accs[k].days || []).length);
      return id ? accs[id] : null;
    }

    function worstAlert(acc) {
      const levels = (acc && acc.alerts || []).map((a) => a.level);
      return levels.includes("đỏ") ? "đỏ" : levels.includes("vàng") ? "vàng" : acc ? "ok" : null;
    }

    // ---------- Cảnh nền ----------
    function drawFloor(c) {
      for (let y = 0; y < H; y += 16) {
        for (let x = 0; x < W; x += 16) {
          S.px(c, x, y, 16, 16, ((x + y) / 16) % 2 ? "#d9c7a5" : "#d2bf9c");
          S.px(c, x, y + 15, 16, 1, "#c4b08c");
        }
      }
      // hành lang
      S.px(c, 0, 92, W, 14, "#cbb795");
      // thảm khu làm việc
      S.px(c, 22, 108, 276, 140, "#9fb1a8");
      S.px(c, 24, 110, 272, 136, "#a9bbb1");
      for (let x = 30; x < 290; x += 8) S.px(c, x, 110, 4, 1, "#b7c8be");
      // thảm phòng báo cáo
      S.px(c, 222, 34, 96, 54, "#b9a7c9");
      S.px(c, 224, 36, 92, 50, "#c6b6d4");
    }

    function drawWall(c, t) {
      const hour = new Date().getHours();
      const [sky1, sky2] = skyColor(hour);
      S.px(c, 0, 0, W, 30, "#5d6b7d");
      S.px(c, 0, 28, W, 2, "#4a5666");
      // cửa sổ nhỏ góc phải
      const wx = 292;
      S.px(c, wx, 5, 24, 18, "#3d4756");
      S.px(c, wx + 2, 7, 20, 14, sky1);
      S.px(c, wx + 2, 7, 20, 5, sky2);
      S.px(c, wx + 11, 7, 2, 14, "#3d4756");
      if (hour >= 19 || hour < 6) S.px(c, wx + 6, 10, 1, 1, "#fff");
      else S.px(c, wx + 3 + Math.floor((t * 2) % 14), 12, 5, 2, "#ffffff");

      // bảng trắng của Trợ lý: tiến độ + ô trạng thái từng bộ phận
      const n = window.TEAM.agents.length;
      S.px(c, 12, 5, 70, 22, "#8a96a8");
      S.px(c, 13, 6, 68, 20, "#f7f8fb");
      const done = countDone();
      const colors = { done: "#4fb06d", waiting: "#e2b53a", working: "#4a7fc0", reporting: "#8a6fc9", alert: "#e0533d" };
      window.TEAM.agents.forEach((a, i) => S.px(c, 16 + i * 9, 18, 7, 5, colors[statusOf(a.id)] || "#c3c8d2"));
      const fill = Math.round(60 * done / n);
      S.px(c, 16, 9, fill || 1, 3, "#4fb06d");
      S.px(c, 16 + fill, 9, 60 - fill, 3, "#dfe3ea");
    }

    function drawTV(c, t) {
      const acc = tvAccount();
      S.px(c, TV.x, TV.y, TV.w, TV.h, "#1e2230");
      S.px(c, TV.x + 2, TV.y + 2, TV.w - 4, TV.h - 4, "#0f1a2e");
      S.px(c, TV.x + TV.w / 2 - 4, TV.y + TV.h, 8, 2, "#1e2230");
      // đèn trạng thái
      const level = worstAlert(acc);
      const lamp = { "đỏ": "#ff4a3d", "vàng": "#ffc93d", ok: "#47d16c" }[level] || "#5d6577";
      const on = level !== "đỏ" || Math.floor(t * 3) % 2;
      S.px(c, TV.x + TV.w - 6, TV.y + 3, 3, 3, on ? lamp : "#3a2020");
      if (!acc) {
        // chưa có số liệu: thanh quét
        const sx = TV.x + 4 + Math.floor((t * 12) % (TV.w - 12));
        S.px(c, sx, TV.y + 15, 4, 1, "#2f4a6e");
        return;
      }
      // biểu đồ cột 7 ngày: tin nhắn (xanh dương) + lead (xanh lá)
      const days = acc.days.slice(-7);
      const max = Math.max(1, ...days.map((d) => (d.messages || 0) + (d.leads || 0)));
      const bx = TV.x + 37, base = TV.y + TV.h - 4;
      days.forEach((d, i) => {
        const hm = Math.round(12 * (d.messages || 0) / max), hl = Math.round(12 * (d.leads || 0) / max);
        S.px(c, bx + i * 3, base - hm, 2, hm, i === days.length - 1 ? "#7cc4ff" : "#3f78b8");
        S.px(c, bx + i * 3, base - hm - hl, 2, hl, "#5fd37f");
      });
    }

    function drawLeaderRoom(c) {
      S.px(c, 104, 30, 112, 62, "#3d4f7a");
      S.px(c, 112, 38, 96, 46, "#4a5f8f");
      for (let x = 116; x < 204; x += 6) S.px(c, x, 40, 3, 1, "#566c9e");
      // vách kính
      S.px(c, 104, 30, 3, 62, "#9fc3d8");
      S.px(c, 213, 30, 3, 62, "#9fc3d8");
      S.px(c, 104, 89, 44, 3, "#9fc3d8");
      S.px(c, 172, 89, 44, 3, "#9fc3d8");
      S.px(c, 104, 30, 1, 62, "#d8ecf5");
      S.px(c, 215, 30, 1, 62, "#d8ecf5");
      // tủ sách sau lưng Leader
      S.px(c, 128, 14, 64, 15, "#6a4a32");
      for (let i = 0; i < 3; i++) for (let j = 0; j < 9; j++) {
        S.px(c, 131 + j * 7, 16 + i * 4, 5, 3, ["#c0504d", "#4f81bd", "#9bbb59", "#f2c230", "#8064a2"][(i * 3 + j) % 5]);
      }
    }

    function drawDecor(c) {
      S.plant(c, 302, 36);
      S.plant(c, 4, 70);
    }

    // lưng ghế văn phòng (bo góc) phía sau nhân vật
    function drawChair(c, x, y, color) {
      const col = color || "#6b4f8a";
      S.px(c, x - 1, y + 1, 12, 11, col);
      S.px(c, x - 2, y + 2, 14, 9, col);
      S.px(c, x, y + 2, 10, 8, S.shade(col, 22));
    }

    // ---------- Di chuyển: nộp báo cáo / chạy vào báo động ----------
    function goRoute(a, kind) {
      if (kind === "alert") return a.exit.concat(ALERT_ROUTE);
      const idx = Math.max(0, agents.filter((x) => statusOf(x.def.id) === "reporting").indexOf(a));
      return a.exit.concat([{ x: 34 + idx * 13, y: CORRIDOR_Y }]);
    }

    function updateWalker(a, dt) {
      const w = a.walker;
      const st = statusOf(a.def.id);
      const wants = WALKING[st] ? st : null;

      if (w.phase === "seat") {
        w.x = a.seat.x; w.y = a.seat.y;
        if (!wants) return;
        w.timer -= dt;
        if (w.timer <= 0) {
          w.kind = wants;
          w.path = goRoute(a, wants);
          w.back = w.path.slice(0, -1).reverse().concat([{ x: a.seat.x, y: a.seat.y }]);
          w.phase = "go";
        }
      } else if (w.phase === "stay") {
        w.timer -= dt;
        if (w.timer <= 0 || wants !== w.kind) { w.phase = "back"; w.path = w.back; }
      }
      if (w.phase === "go" || w.phase === "back") {
        let step = WALK_SPEED * dt;
        while (step > 0 && w.path.length) {
          const p = w.path[0];
          const dx = p.x - w.x, dy = p.y - w.y, d = Math.hypot(dx, dy);
          if (d <= step) { w.x = p.x; w.y = p.y; w.path = w.path.slice(1); step -= d; }
          else { w.x += (dx / d) * step; w.y += (dy / d) * step; step = 0; }
        }
        w.frame += dt * 6;
        if (!w.path.length) {
          if (w.phase === "go") { w.phase = "stay"; w.timer = w.kind === "alert" ? 4 : 2.5; }
          else { w.phase = "seat"; w.timer = w.kind === "alert" ? 4 : 3; }
        }
      }
    }

    // ---------- Vẽ ----------
    function render(t) {
      const c = lctx;
      c.clearRect(0, 0, W, H);
      drawFloor(c);
      drawWall(c, t);
      drawTV(c, t);
      drawLeaderRoom(c);
      drawDecor(c);

      const items = [];

      // Leader
      items.push({ y: LEADER.deskY - 1, draw() {
        drawChair(c, LEADER.seat.x, LEADER.seat.y + 2, "#5b2f2f");
        S.person(c, LEADER.seat.x, LEADER.seat.y, window.TEAM.leader.look, "sit", { blink: blinking("leader", t) });
      } });
      items.push({ y: LEADER.deskY + 14, draw() {
        S.monitorBack(c, LEADER.deskX + 6, LEADER.deskY - 13);
        S.desk(c, LEADER.deskX, LEADER.deskY, 68, "#8a5a36");
        S.paper(c, LEADER.deskX + 48, LEADER.deskY - 3);
        S.mug(c, LEADER.deskX + 58, LEADER.deskY - 2, t);
        if ((state.awaitingLeader || []).length) S.bubble(c, LEADER.seat.x + 12, LEADER.seat.y - 8, "waiting", t);
      } });
      S.plant(c, 108, 34);
      S.plant(c, 202, 34);

      // Trợ lý Claude Code
      const aSt = statusOf("assistant");
      items.push({ y: ASSIST.deskY - 1, draw() {
        drawChair(c, 47, 51, "#7a4a36");
        S.clawd(c, 44, 52, { bob: aSt === "working" && Math.floor(t * 3) % 2, blink: blinking("assistant", t) });
      } });
      items.push({ y: ASSIST.deskY + 14, draw() {
        S.monitorBack(c, ASSIST.deskX + 4, ASSIST.deskY - 13, aSt === "working" && Math.floor(t * 4) % 2 ? "#ffd2b8" : null);
        S.desk(c, ASSIST.deskX, ASSIST.deskY, 62);
        S.paper(c, ASSIST.deskX + 46, ASSIST.deskY - 3);
        S.paper(c, ASSIST.deskX + 50, ASSIST.deskY - 5);
        S.bubble(c, 46, 38, aSt, t);
      } });

      // Các bộ phận
      agents.forEach((a, i) => {
        const id = a.def.id, st = statusOf(id), w = a.walker;
        const seated = w.phase === "seat";
        items.push({ y: a.deskY - 1, draw() {
          drawChair(c, a.seat.x, a.seat.y + 2, S.shade(a.def.look.shirt, -45));
          if (seated) {
            S.person(c, a.seat.x, a.seat.y, a.def.look, "sit", {
              blink: blinking(id, t), working: st === "working", typing: Math.floor(t * 6 + i) % 2,
            });
          }
        } });
        items.push({ y: a.deskY + 14, draw() {
          const glow = st === "working" && Math.floor(t * 4 + i) % 2 ? "#a8e1ff" : null;
          S.monitorBack(c, a.deskX + 6, a.deskY - 13, glow);
          S.desk(c, a.deskX, a.deskY, DESK_W);
          S.mug(c, a.deskX + 43, a.deskY - 2, t + i);
          S.PROPS[a.def.prop](c, a.deskX + 51, a.deskY - 5);
          if (seated) S.bubble(c, a.seat.x + 12, a.seat.y - 8, st, t + i * 0.3);
        } });
        if (!seated) {
          items.push({ y: w.y + 14, draw() {
            const x = Math.round(w.x), y = Math.round(w.y);
            const pose = w.phase === "stay" ? "stand" : (Math.floor(w.frame) % 2 ? "walkA" : "walkB");
            S.person(c, x, y, a.def.look, pose, { blink: blinking(id, t) });
            if (w.phase === "stay" && w.kind === "reporting") S.paper(c, x + 10, y + 8);
            S.bubble(c, x - 1, y - 12, w.kind === "alert" ? "alert" : "reporting", t);
          } });
        }
      });

      items.sort((p, q) => p.y - q.y).forEach((it) => it.draw());

      // khung chọn / hover
      const outline = (z, color, dashed) => {
        for (let x = z.x; x < z.x + z.w; x++) {
          if (dashed && Math.floor((x + t * 8) / 2) % 2) continue;
          S.px(c, x, z.y, 1, 1, color); S.px(c, x, z.y + z.h - 1, 1, 1, color);
        }
        for (let y = z.y; y < z.y + z.h; y++) {
          if (dashed && Math.floor((y + t * 8) / 2) % 2) continue;
          S.px(c, z.x, y, 1, 1, color); S.px(c, z.x + z.w - 1, y, 1, 1, color);
        }
      };
      const zoneOf = (id) => id === "leader" ? LEADER.zone : id === "assistant" ? ASSIST.zone : (agents.find((a) => a.def.id === id) || {}).zone;
      if (hover && hover !== selected && zoneOf(hover)) outline(zoneOf(hover), "#fff3b0", true);
      if (selected && zoneOf(selected)) outline(zoneOf(selected), "#f2c230", false);

      // phóng to lên canvas hiển thị
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(low, 0, 0, canvas.width, canvas.height);
      drawLabels();
    }

    function label(text, x, y, opts) {
      opts = opts || {};
      const size = Math.max(opts.min || 8, Math.round((opts.size || 4.5) * scale));
      ctx.font = `${size}px ${opts.font || '"Press Start 2P", monospace'}`;
      ctx.textAlign = opts.align || "center";
      ctx.textBaseline = "middle";
      if (opts.bg !== "none") {
        const tw = ctx.measureText(text).width;
        const pad = Math.round(size * 0.5);
        const bx = Math.round(x * scale - tw / 2 - pad), by = Math.round(y * scale - size / 2 - pad / 1.5);
        ctx.fillStyle = opts.bg || "rgba(28,30,40,0.85)";
        ctx.fillRect(bx, by, Math.round(tw + pad * 2), Math.round(size + pad * 1.3));
      }
      ctx.fillStyle = opts.color || "#f7f3e8";
      ctx.fillText(text, Math.round(x * scale), Math.round(y * scale + 1));
    }

    function drawTVText() {
      const acc = tvAccount();
      const vt = { bg: "none", font: '"VT323", monospace', align: "left", size: 5, min: 6 };
      if (!acc) {
        label("CHƯA CÓ SỐ LIỆU", TV.x + 5, TV.y + 9, Object.assign({}, vt, { color: "#7fa6d6" }));
        label("/bao-cao-ngay", TV.x + 5, TV.y + 17, Object.assign({}, vt, { color: "#4f6f99" }));
        return;
      }
      const d = acc.days[acc.days.length - 1];
      label("Chi " + shortMoney(d.spend), TV.x + 4, TV.y + 7, Object.assign({}, vt, { color: "#ffd88a" }));
      label("TN " + (d.messages || 0) + " · " + shortMoney(d.costPerMessage), TV.x + 4, TV.y + 13.5, Object.assign({}, vt, { color: "#9fd2ff" }));
      label("Lead " + (d.leads || 0) + " · " + shortMoney(d.costPerLead), TV.x + 4, TV.y + 20, Object.assign({}, vt, { color: "#9ff0b4" }));
    }

    function drawLabels() {
      label("LEADER · BẠN", 160, 34.5, { bg: "#f2c230", color: "#2a2210", font: '"VT323", monospace', size: 6 });
      label("CLAUDE CODE", 51, 86, { bg: "#d97757", color: "#fff" });
      agents.forEach((a) => {
        if (a.def.daily) label(`${a.def.no} ${a.def.short}`, a.deskX + DESK_W / 2 - 4, 86, { bg: "#6b4f8a" });
        else label(`${a.def.no} ${a.def.short}`, a.deskX + DESK_W / 2, a.deskY + 21);
      });
      const n = (state.awaitingLeader || []).length;
      if (n) label(`${n} việc chờ duyệt`, 160, 84.5, { bg: "#c0392b", font: '"VT323", monospace', size: 6 });
      drawTVText();
    }

    function countDone() {
      return window.TEAM.agents.filter((a) => statusOf(a.id) === "done").length;
    }

    // ---------- Kích thước & tương tác ----------
    function resize() {
      const cssW = canvas.parentElement.clientWidth;
      const cssH = Math.round(cssW * H / W);
      const dpr = window.devicePixelRatio || 1;
      canvas.style.width = cssW + "px";
      canvas.style.height = cssH + "px";
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      scale = canvas.width / W;
    }

    function hitTest(evt) {
      const r = canvas.getBoundingClientRect();
      const x = (evt.clientX - r.left) * W / r.width, y = (evt.clientY - r.top) * H / r.height;
      const inZ = (z) => x >= z.x && x < z.x + z.w && y >= z.y && y < z.y + z.h;
      for (const a of agents) if (inZ(a.zone)) return a.def.id;
      if (inZ(LEADER.zone)) return "leader";
      if (inZ(ASSIST.zone)) return "assistant";
      return null;
    }

    canvas.addEventListener("mousemove", (e) => {
      hover = hitTest(e);
      canvas.style.cursor = hover ? "pointer" : "default";
      opts.onHover && opts.onHover(hover, e);
    });
    canvas.addEventListener("mouseleave", () => { hover = null; opts.onHover && opts.onHover(null); });
    canvas.addEventListener("click", (e) => {
      const id = hitTest(e);
      opts.onSelect && opts.onSelect(id);
    });

    window.addEventListener("resize", resize);
    resize();

    let last = performance.now();
    function loop(now) {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      agents.forEach((a) => updateWalker(a, dt));
      render(now / 1000);
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    return {
      setState(s) { state = s || { agents: {} }; },
      setDaily(d) { daily = d || { accounts: {} }; },
      select(id) { selected = id; },
      resize,
    };
  }

  window.createOffice = createOffice;
  window.shortMoney = shortMoney;
})();
