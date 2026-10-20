// Trạng thái văn phòng — Claude Code cập nhật file này sau mỗi bước xử lý brief.
// Giữ nguyên dòng "window.OFFICE_STATE =" và để phần sau là JSON hợp lệ.
// status hợp lệ: idle | working | reporting | waiting | done | alert
window.OFFICE_STATE = {
  "demo": false,
  "updatedAt": "2026-10-20T09:20:00+07:00",
  "activeBrief": {
    "id": "q-20261020-vi-sao-cpm-tang",
    "title": "Vì sao CPM tăng từ 09/10 đến nay, nên làm gì?",
    "type": "question",
    "file": "reports/hoi-dap/2026-10-20-vi-sao-cpm-tang.md"
  },
  "assistant": {
    "status": "working",
    "message": "Analyst đã nộp phân tích CPM; đang chờ Media Buyer.",
    "reportFile": ""
  },
  "agents": {
    "strategy-research": {
      "status": "idle",
      "task": "",
      "summary": "",
      "recommendations": [],
      "reportFile": ""
    },
    "creative-specialist": {
      "status": "idle",
      "task": "",
      "summary": "",
      "recommendations": [],
      "reportFile": ""
    },
    "media-buyer": {
      "status": "working",
      "task": "Xem cấu trúc, ngân sách, tệp & chồng chéo đối tượng có làm CPM tăng không",
      "summary": "",
      "recommendations": [],
      "reportFile": ""
    },
    "tracking-crm": {
      "status": "idle",
      "task": "",
      "summary": "",
      "recommendations": [],
      "reportFile": ""
    },
    "performance-analyst": {
      "status": "waiting",
      "task": "Phân tích CPM theo ngày/campaign/placement từ 09/10, tìm nguyên nhân",
      "summary": "CPM +29% (93k→120k): ~40% do ngân sách rời Lách 20Jan (CPM 67–81k) sang campaign CPM 140–170k, ~60% do giá từng campaign tăng (NuVP_T9 bão hoà, Dup13Oct đang học) và >30 lần sửa ngân sách. Thiệt hại thật: tin nhắn -30%, chi phí/tin nhắn chỉ +12%.",
      "recommendations": [
        {
          "id": "a1",
          "text": "Giữ nguyên ngân sách mọi campaign tới ~23/10; sau đó mỗi lần chỉnh tối đa ±20%, cách nhau ≥48h",
          "priority": "cao"
        },
        {
          "id": "a2",
          "text": "Tăng 'Lách – Dup13Oct' 800k → ~960k/ngày (21/10); 48h sau nếu chi phí/tin nhắn <100k thì +20% tiếp",
          "priority": "cao"
        },
        {
          "id": "a3",
          "text": "NuVP_T9: giảm 800k → ~600k/ngày, thay 2–3 creative mới, nới tệp (reach 21,6k→14,2k, chi phí/tin nhắn 52k→104k)",
          "priority": "trung bình"
        },
        {
          "id": "a4",
          "text": "NamLGBT_T9: giữ 1tr/ngày, thêm creative; tần suất 7 ngày >3 thì giảm 20%",
          "priority": "trung bình"
        },
        {
          "id": "a5",
          "text": "Thêm thẻ dự phòng/nạp trước ở Billing — 19/10 tài khoản bị ngừng ~4,7 giờ chờ thanh toán",
          "priority": "thấp"
        }
      ],
      "reportFile": "reports/hoi-dap/2026-10-20-vi-sao-cpm-tang.md"
    },
    "compliance-qa": {
      "status": "idle",
      "task": "",
      "summary": "",
      "recommendations": [],
      "reportFile": ""
    },
    "daily-reporter": {
      "status": "done",
      "task": "Báo cáo ngày 16/10 — NTSpa's Women",
      "summary": "Chi phí/tin nhắn 84k (-18% so TB7), chi phí/lead 527k (-35%), CTR 2,36%. Chi tiêu giảm 38% và CPM tăng — 3 cảnh báo vàng.",
      "recommendations": [
        {
          "id": "d1",
          "text": "Kiểm tra vì sao chi tiêu giảm 38% (campaign tắt / hết ngân sách / giới hạn phân phối?) — Ads Manager › Campaigns, so 12/10–16/10",
          "priority": "trung bình"
        },
        {
          "id": "d2",
          "text": "Bản Lách – Dup13Oct rẻ hơn bản gốc gần một nửa (63,5k vs 119,8k/tin nhắn) — cân nhắc dồn ngân sách sang bản Dup sau 1–2 ngày",
          "priority": "trung bình"
        },
        {
          "id": "d3",
          "text": "NuVP_T10_Sang/Chieu: nếu mỗi campaign tiêu >100k mà vẫn 0 tin nhắn thì cân nhắc tắt",
          "priority": "thấp"
        },
        {
          "id": "d4",
          "text": "Đặt ngưỡng KPI ở Bàn Leader (lệnh /kpi) để báo cáo đánh giá theo mục tiêu",
          "priority": "thấp"
        }
      ],
      "reportFile": "reports/daily/2026-10-16.md"
    }
  },
  "awaitingLeader": [],
  "reports": [
    {
      "date": "2026-10-17",
      "title": "Báo cáo Ads ngày 16/10 — NTSpa's Women",
      "file": "reports/daily/2026-10-16.md",
      "summary": "Hiệu quả tốt hơn TB tuần nhưng chi tiêu giảm 38%, CPM tăng. 3 cảnh báo vàng."
    }
  ],
  "questions": []
};
