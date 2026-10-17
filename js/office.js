// Văn phòng pixel: vẽ cảnh ở độ phân giải logic 320x256 rồi phóng to (pixelated),
// chữ (biển tên) vẽ thêm ở độ phân giải thật cho sắc nét.
(function () {
  const S = window.SPRITES;
  const W = 320, H = 256;
  const AISLE_X = 155, CORRIDOR_Y = 84, WALK_SPEED = 30;

  const DESK_W = 64;
  const COLS = [40, 216];
  const ROWS = [124, 172, 220];

  // Vị trí cố định của 6 bàn theo thứ tự 02 → 07 (2 cột x 3 hàng như sơ đồ).
  function layoutAgents(agents) {
    return agents.map((a, i) => {
      const deskX = COLS[i % 2], deskY = ROWS[Math.floor(i / 2)];
      return {
        def: a, deskX, deskY,
        seat: { x: deskX + 30, y: deskY - 12 },
        zone: { x: deskX - 6, y: deskY - 28, w: DESK_W + 12, h: 52 },
        walker: { phase: "seat", x: deskX + 30, y: deskY - 12, path: [], timer: 2 + i * 0.7, frame: 0 },
      };
    });
  }

  const LEADER = { deskX: 126, deskY: 62, seat: { x: 155, y: 50 }, zone: { x: 104, y: 30, w: 112, h: 62 } };
  const ASSIST = { deskX: 20, deskY: 62, zone: { x: 6, y: 2, w: 94, h: 90 } };

  function skyColor(hour) {
    if (hour >= 6 && hour < 17) return ["#8fd0f5", "#c8ecff"];
    if (hour >= 17 && hour < 19) return ["#f29a6b", "#f7c98b"];
    return ["#1d2550", "#33407a"];
  }

  function createOffice(canvas, opts) {
    const ctx = canvas.getContext("2d");
    const low = document.createElement("canvas");
    low.width = W; low.height = H;
    const lctx = low.getContext("2d");

    const agents = layoutAgents(window.TEAM.agents);
    let state = window.OFFICE_STATE || { agents: {} };
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
    }

    function drawWall(c, t) {
      const hour = new Date().getHours();
      const [sky1, sky2] = skyColor(hour);
      S.px(c, 0, 0, W, 30, "#5d6b7d");
      S.px(c, 0, 28, W, 2, "#4a5666");
      // cửa sổ ở khu pantry
      for (const wx of [232, 276]) {
        S.px(c, wx, 5, 36, 18, "#3d4756");
        S.px(c, wx + 2, 7, 32, 14, sky1);
        S.px(c, wx + 2, 7, 32, 5, sky2);
        S.px(c, wx + 17, 7, 2, 14, "#3d4756");
        if (hour >= 19 || hour < 6) { S.px(c, wx + 8, 10, 1, 1, "#fff"); S.px(c, wx + 26, 14, 1, 1, "#fff"); }
        else { const cx = wx + 4 + Math.floor((t * 2 + wx) % 26); S.px(c, cx, 12, 6, 2, "#ffffff"); }
      }
      // bảng trắng của Trợ lý
      S.px(c, 12, 5, 70, 22, "#8a96a8");
      S.px(c, 13, 6, 68, 20, "#f7f8fb");
      const done = countDone();
      for (let i = 0; i < 6; i++) {
        const st = statusOf(window.TEAM.agents[i].id);
        const col = { done: "#4fb06d", waiting: "#e2b53a", working: "#4a7fc0", reporting: "#8a6fc9" }[st] || "#c3c8d2";
        S.px(c, 16 + i * 10, 18, 7, 5, col);
      }
      S.px(c, 16, 9, Math.round(58 * done / 6) || 1, 3, "#4fb06d");
      S.px(c, 16 + Math.round(58 * done / 6), 9, 58 - Math.round(58 * done / 6), 3, "#dfe3ea");
    }

    function drawLeaderRoom(c, t) {
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

    function drawPantry(c, t) {
      // máy pha cà phê
      S.px(c, 232, 34, 18, 6, "#8b5e3c");
      S.px(c, 234, 18, 14, 16, "#2f3340");
      S.px(c, 236, 21, 10, 4, "#d97757");
      S.px(c, 239, 28, 4, 4, "#1a1a1f");
      S.mug(c, 239, 30, t);
      // bình nước
      S.px(c, 262, 14, 10, 12, "#9fd3f0");
      S.px(c, 260, 26, 14, 16, "#e9edf2");
      S.px(c, 266, 30, 2, 2, "#3f6fb6");
      // sofa
      S.px(c, 270, 64, 42, 6, "#c26a54");
      S.px(c, 270, 70, 42, 10, "#d77d65");
      S.px(c, 268, 66, 4, 14, "#b05c48");
      S.px(c, 310, 66, 4, 14, "#b05c48");
      S.plant(c, 300, 36);
      S.plant(c, 4, 70);
    }

    // lưng ghế văn phòng (bo góc) phía sau nhân vật
    function drawChair(c, x, y, color) {
      const col = color || "#6b4f8a";
      S.px(c, x - 1, y + 1, 12, 11, col);
      S.px(c, x - 2, y + 2, 14, 9, col);
      S.px(c, x, y + 2, 10, 8, S.shade(col, 22));
    }

    // ---------- Vật thể sắp theo độ sâu ----------
    function updateWalker(a, dt) {
      const w = a.walker;
      const reporting = statusOf(a.def.id) === "reporting";
      const idx = agents.filter((x) => statusOf(x.def.id) === "reporting").indexOf(a);
      const stand = { x: 34 + Math.max(0, idx) * 13, y: CORRIDOR_Y };

      if (w.phase === "seat") {
        w.x = a.seat.x; w.y = a.seat.y;
        if (!reporting) return;
        w.timer -= dt;
        if (w.timer <= 0) {
          w.phase = "go";
          w.path = [{ x: AISLE_X, y: a.seat.y }, { x: AISLE_X, y: CORRIDOR_Y }, stand];
        }
      } else if (w.phase === "stay") {
        w.timer -= dt;
        if (w.timer <= 0 || !reporting) {
          w.phase = "back";
          w.path = [{ x: AISLE_X, y: CORRIDOR_Y }, { x: AISLE_X, y: a.seat.y }, { x: a.seat.x, y: a.seat.y }];
        }
      }
      if (w.phase === "go" || w.phase === "back") {
        if (w.phase === "go" && !reporting) {
          w.phase = "back";
          w.path = [{ x: AISLE_X, y: w.y }, { x: AISLE_X, y: a.seat.y }, { x: a.seat.x, y: a.seat.y }];
        }
        let step = WALK_SPEED * dt;
        while (step > 0 && w.path.length) {
          const p = w.path[0];
          const dx = p.x - w.x, dy = p.y - w.y, d = Math.hypot(dx, dy);
          if (d <= step) { w.x = p.x; w.y = p.y; w.path.shift(); step -= d; }
          else { w.x += (dx / d) * step; w.y += (dy / d) * step; step = 0; }
        }
        w.frame += dt * 6;
        if (!w.path.length) {
          if (w.phase === "go") { w.phase = "stay"; w.timer = 2.5; }
          else { w.phase = "seat"; w.timer = 3; }
        }
      }
    }

    function bubbleKind(id) {
      return statusOf(id);
    }

    function render(t) {
      const c = lctx;
      c.clearRect(0, 0, W, H);
      drawFloor(c);
      drawWall(c, t);
      drawLeaderRoom(c, t);
      drawPantry(c, t);

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

      // 6 sub-agent
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
          if (seated) S.bubble(c, a.seat.x + 12, a.seat.y - 8, bubbleKind(id), t + i * 0.3);
        } });
        if (!seated) {
          items.push({ y: w.y + 14, draw() {
            const pose = w.phase === "stay" ? "stand" : (Math.floor(w.frame) % 2 ? "walkA" : "walkB");
            S.person(c, Math.round(w.x), Math.round(w.y), a.def.look, pose, { blink: blinking(id, t) });
            if (w.phase === "stay") S.paper(c, Math.round(w.x) + 10, Math.round(w.y) + 8);
            S.bubble(c, Math.round(w.x) - 1, Math.round(w.y) - 12, "reporting", t);
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
      const size = Math.max(8, Math.round((opts.size || 4.5) * scale));
      ctx.font = `${size}px ${opts.font || '"Press Start 2P", monospace'}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const tw = ctx.measureText(text).width;
      const pad = Math.round(size * 0.5);
      const bx = Math.round(x * scale - tw / 2 - pad), by = Math.round(y * scale - size / 2 - pad / 1.5);
      ctx.fillStyle = opts.bg || "rgba(28,30,40,0.85)";
      ctx.fillRect(bx, by, Math.round(tw + pad * 2), Math.round(size + pad * 1.3));
      ctx.fillStyle = opts.color || "#f7f3e8";
      ctx.fillText(text, Math.round(x * scale), Math.round(y * scale + 1));
    }

    function drawLabels() {
      label("LEADER · BẠN", 160, 34.5, { bg: "#f2c230", color: "#2a2210", font: '"VT323", monospace', size: 6 });
      label("CLAUDE CODE", 51, 86, { bg: "#d97757", color: "#fff" });
      label("PANTRY", 284, 86, { bg: "rgba(28,30,40,0.55)" });
      agents.forEach((a) => {
        label(`${a.def.no} ${a.def.short}`, a.deskX + DESK_W / 2, a.deskY + 21);
      });
      const n = (state.awaitingLeader || []).length;
      if (n) label(`${n} việc chờ duyệt`, 160, 84.5, { bg: "#c0392b", font: '"VT323", monospace', size: 6 });
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
      select(id) { selected = id; },
      resize,
    };
  }

  window.createOffice = createOffice;
})();
