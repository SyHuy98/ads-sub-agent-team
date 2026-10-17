// Pixel-art vẽ bằng code: mỗi hàm vẽ lên context ở toạ độ "pixel logic" (1 đơn vị = 1 pixel art).
(function () {
  function px(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), w, h);
  }

  // Vẽ từ bản đồ ký tự; mỗi ký tự tra bảng màu, "." là trong suốt.
  function drawMap(ctx, x, y, rows, palette) {
    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      for (let c = 0; c < row.length; c++) {
        const color = palette[row[c]];
        if (color) px(ctx, x + c, y + r, 1, 1, color);
      }
    }
  }

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const clamp = (v) => Math.max(0, Math.min(255, v));
    const r = clamp((n >> 16) + amt), g = clamp(((n >> 8) & 255) + amt), b = clamp((n & 255) + amt);
    return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  }

  // Thân người 10x14, nhìn chính diện.
  const HEAD = [
    "..HHHHHH..",
    ".HHHHHHHH.",
    ".HSSSSSSH.",
    ".SSESSESS.",
    ".SSSSSSSS.",
    "..SSMSSS..",
  ];
  const BODY = [
    ".BBBBBBBB.",
    "BBBBCCBBBB",
    "BBBBBBBBBB",
    "BBBBBBBBBB",
  ];
  const LEGS = {
    stand: [".PPPPPPPP.", ".PP....PP.", ".PP....PP.", ".KK....KK."],
    walkA: [".PPPPPPPP.", ".PP....PP.", "PP.....PP.", "KK......KK"],
    walkB: [".PPPPPPPP.", ".PP....PP.", ".PP.....PP", "KK......KK"],
  };

  function hairOverlay(ctx, x, y, look) {
    const h = look.hair;
    switch (look.hairStyle) {
      case "long":
        px(ctx, x, y + 2, 1, 7, h);
        px(ctx, x + 9, y + 2, 1, 7, h);
        px(ctx, x + 1, y + 2, 1, 2, h);
        px(ctx, x + 8, y + 2, 1, 2, h);
        break;
      case "spiky":
        px(ctx, x + 2, y - 1, 1, 1, h);
        px(ctx, x + 4, y - 1, 1, 1, h);
        px(ctx, x + 6, y - 1, 1, 1, h);
        break;
      case "bun":
        px(ctx, x + 3, y - 3, 4, 3, h);
        px(ctx, x + 4, y - 4, 2, 1, h);
        break;
      case "glasses":
        px(ctx, x + 2, y + 3, 2, 1, "#20202a");
        px(ctx, x + 6, y + 3, 2, 1, "#20202a");
        px(ctx, x + 4, y + 3, 2, 1, "#20202a");
        break;
    }
  }

  function crown(ctx, x, y) {
    drawMap(ctx, x + 2, y - 4, ["Y.Y.Y.", "YYYYYY", "YRYYRY"], { Y: "#f2c230", R: "#d0453a" });
  }

  // pose: "sit" (chỉ nửa trên, bàn che chân) | "stand" | "walkA" | "walkB"
  // anim: { blink, typing (0/1) }
  function person(ctx, x, y, look, pose, anim) {
    anim = anim || {};
    const pal = {
      H: look.hair, S: look.skin, E: anim.blink ? look.skin : "#1a1a22",
      M: shade(look.skin, -40), B: look.shirt, C: shade(look.shirt, 30),
      P: look.pants, K: "#1a1a1f",
    };
    drawMap(ctx, x, y, HEAD, pal);
    drawMap(ctx, x, y + 6, BODY, pal);
    // tay
    // tay: khi đang gõ phím thì hai tay nhấp nhô xen kẽ
    const typing = pose === "sit" && anim.working;
    px(ctx, x - 1, y + 9 - (typing && anim.typing ? 1 : 0), 1, 2, look.skin);
    px(ctx, x + 10, y + 9 - (typing && !anim.typing ? 1 : 0), 1, 2, look.skin);
    if (pose !== "sit") drawMap(ctx, x, y + 10, LEGS[pose] || LEGS.stand, pal);
    hairOverlay(ctx, x, y, look);
    if (look.crown) crown(ctx, x, y);
  }

  // Linh vật Claude Code: khối cam nhỏ có mắt và chân.
  function clawd(ctx, x, y, anim) {
    anim = anim || {};
    const bob = anim.bob ? 1 : 0;
    const O = "#d97757", D = "#b65d3f";
    px(ctx, x + 1, y + bob, 12, 8, O);
    px(ctx, x, y + 2 + bob, 1, 3, O);
    px(ctx, x + 13, y + 2 + bob, 1, 3, O);
    px(ctx, x + 1, y + 7 + bob, 12, 1, D);
    const eye = anim.blink ? D : "#1a1a22";
    px(ctx, x + 4, y + 2 + bob, 1, 2, eye);
    px(ctx, x + 9, y + 2 + bob, 1, 2, eye);
    for (let i = 0; i < 4; i++) px(ctx, x + 2 + i * 3, y + 8 + bob, 1, 2 - bob, O);
  }

  function desk(ctx, x, y, w, color) {
    const top = color || "#b98552";
    px(ctx, x, y, w, 4, shade(top, 18));
    px(ctx, x, y + 4, w, 10, top);
    px(ctx, x, y + 13, w, 1, shade(top, -45));
    px(ctx, x + 2, y + 6, w - 4, 1, shade(top, -20));
    px(ctx, x + 1, y + 14, 2, 3, shade(top, -55));
    px(ctx, x + w - 3, y + 14, 2, 3, shade(top, -55));
  }

  function monitorBack(ctx, x, y, glow) {
    px(ctx, x, y, 16, 11, "#3a3f4b");
    px(ctx, x + 1, y + 1, 14, 9, "#4b5160");
    px(ctx, x + 7, y + 11, 2, 2, "#2c303a");
    px(ctx, x + 4, y + 13, 8, 1, "#2c303a");
    if (glow) {
      px(ctx, x - 1, y, 1, 11, glow);
      px(ctx, x + 16, y, 1, 11, glow);
    }
  }

  function mug(ctx, x, y, t) {
    px(ctx, x, y, 4, 4, "#e8e2d4");
    px(ctx, x + 4, y + 1, 1, 2, "#e8e2d4");
    px(ctx, x + 1, y, 2, 1, "#6b4026");
    const s = Math.floor(t * 2) % 2;
    px(ctx, x + 1 + s, y - 3, 1, 2, "rgba(255,255,255,0.55)");
  }

  function paper(ctx, x, y) {
    px(ctx, x, y, 6, 7, "#f4f1e8");
    px(ctx, x + 1, y + 2, 4, 1, "#9aa3b5");
    px(ctx, x + 1, y + 4, 3, 1, "#9aa3b5");
  }

  // Đồ vật đặc trưng của từng bộ phận, đặt trên mặt bàn.
  const PROPS = {
    target(ctx, x, y) {
      drawMap(ctx, x, y, [".RRRRR.", "RWWWWWR", "RWRRRWR", "RWRYRWR", "RWRRRWR", "RWWWWWR", ".RRRRR."],
        { R: "#d0453a", W: "#f4f1e8", Y: "#f2c230" });
    },
    clapper(ctx, x, y) {
      drawMap(ctx, x, y, ["KWKWKWK", "KKKKKKK", "GGGGGGG", "GGGGGGG", "GGGGGGG"],
        { K: "#22232b", W: "#f4f1e8", G: "#3a3d48" });
    },
    megaphone(ctx, x, y) {
      drawMap(ctx, x, y, ["....OO", "..OOOO", "KOOOOO", "KOOOOO", "..OOOO", "....OO"],
        { O: "#e7883e", K: "#3a3d48" });
    },
    eye(ctx, x, y) {
      drawMap(ctx, x, y, ["..WWW..", ".WBBBW.", "WBBKBBW", ".WBBBW.", "..WWW.."],
        { W: "#f4f1e8", B: "#4a7fc0", K: "#141418" });
    },
    chart(ctx, x, y) {
      drawMap(ctx, x, y, ["......G", "....G.G", "..G.G.G", "G.G.G.G", "KKKKKKK"],
        { G: "#4fb06d", K: "#3a3d48" });
    },
    tv(ctx, x, y) {
      drawMap(ctx, x, y, ["KKKKKKK", "KBBBBGK", "KBBGBGK", "KGBGBGK", "KKKKKKK", "..KKK.."],
        { K: "#2f3340", B: "#16243b", G: "#5fd37f" });
    },
    shield(ctx, x, y) {
      drawMap(ctx, x, y, ["BBBBBB", "BWWWWB", "BWWGWB", "BGWGWB", ".BWWB.", "..BB.."],
        { B: "#3f6fb6", W: "#f4f1e8", G: "#4fb06d" });
    },
  };

  function plant(ctx, x, y) {
    px(ctx, x + 2, y + 8, 6, 6, "#a8603a");
    px(ctx, x + 2, y + 8, 6, 1, "#c0754a");
    drawMap(ctx, x, y, ["..L..L..", ".LLL.LL.", "LLLLLLLL", ".LDLLDLL", "..LLLLL.", "...LDL..", "...LLL.."],
      { L: "#4f9a52", D: "#39773d" });
  }

  // Bong bóng trạng thái 11x9 vẽ ở lớp pixel.
  function bubble(ctx, x, y, kind, t) {
    const bg = { working: "#ffffff", waiting: "#ffe58a", done: "#c9f0c4", reporting: "#d6e6ff", idle: "#eeeeee", alert: "#ff6a5a" }[kind] || "#fff";
    px(ctx, x, y + 1, 11, 6, bg);
    px(ctx, x + 1, y, 9, 8, bg);
    px(ctx, x + 3, y + 8, 2, 1, bg);
    px(ctx, x + 2, y + 9, 1, 1, bg);
    const k = "#22232b";
    if (kind === "working") {
      const n = Math.floor(t * 3) % 4;
      for (let i = 0; i < 3; i++) if (i < n) px(ctx, x + 2 + i * 3, y + 4, 2, 1, k);
    } else if (kind === "alert") {
      const on = Math.floor(t * 4) % 2;
      px(ctx, x + 5, y + 1, 1, 4, on ? "#ffffff" : "#5a0d0d");
      px(ctx, x + 5, y + 6, 1, 1, on ? "#ffffff" : "#5a0d0d");
    } else if (kind === "waiting") {
      px(ctx, x + 5, y + 1, 1, 4, "#c0392b");
      px(ctx, x + 5, y + 6, 1, 1, "#c0392b");
    } else if (kind === "done") {
      drawMap(ctx, x + 2, y + 1, [".....G", "....G.", "G..G..", ".GG...", "..G..."], { G: "#2e8b3e" });
    } else if (kind === "reporting") {
      px(ctx, x + 3, y + 1, 5, 6, "#ffffff");
      px(ctx, x + 4, y + 2, 3, 1, "#7a86a0");
      px(ctx, x + 4, y + 4, 3, 1, "#7a86a0");
    } else {
      const z = Math.floor(t) % 2;
      drawMap(ctx, x + 3, y + 1 + z, ["ZZZ", "..Z", ".Z.", "ZZZ"], { Z: "#7a86a0" });
    }
  }

  window.SPRITES = { px, drawMap, shade, person, clawd, desk, monitorBack, mug, paper, PROPS, plant, bubble };
})();
