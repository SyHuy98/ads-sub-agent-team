// Trạng thái văn phòng — Claude Code cập nhật file này sau mỗi bước xử lý brief.
// Giữ nguyên dòng "window.OFFICE_STATE =" và để phần sau là JSON hợp lệ.
// status hợp lệ: idle | working | reporting | waiting | done | alert
window.OFFICE_STATE = {
  "demo": false,
  "updatedAt": "2026-10-17T10:45:00+07:00",
  "activeBrief": null,
  "assistant": {
    "status": "idle",
    "message": "Sẵn sàng nhận brief.",
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
      "status": "idle",
      "task": "",
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
      "status": "idle",
      "task": "",
      "summary": "",
      "recommendations": [],
      "reportFile": ""
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
