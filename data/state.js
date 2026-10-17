// Trạng thái văn phòng — Claude Code cập nhật file này sau mỗi bước xử lý brief.
// Giữ nguyên dòng "window.OFFICE_STATE =" và để phần sau là JSON hợp lệ.
// status hợp lệ: idle | working | reporting | waiting | done | alert
window.OFFICE_STATE = {
  "demo": true,
  "updatedAt": "2026-10-17T10:45:00+07:00",
  "activeBrief": {
    "id": "2026-10-17-demo-goi-cham-soc-da-thang-11",
    "title": "DEMO — Ra mắt gói chăm sóc da tháng 11",
    "file": "briefs/2026-10-17-demo-goi-cham-soc-da-thang-11.md"
  },
  "assistant": {
    "status": "working",
    "message": "Đã nhận brief, đang chờ Creative và Analyst nộp phần còn lại.",
    "reportFile": "reports/2026-10-17-demo-goi-cham-soc-da-thang-11.md"
  },
  "agents": {
    "strategy-research": {
      "status": "done",
      "task": "Phân tích đối thủ & chân dung khách hàng cho gói chăm sóc da",
      "summary": "Nhóm 25–34 tuổi, nữ, quan tâm trị mụn/thâm là tệp chính. Đối thủ đang đẩy mạnh ưu đãi 'trải nghiệm 99k'.",
      "recommendations": [
        {
          "id": "s1",
          "text": "Chọn góc tiếp cận 'Da sạch mụn sau 4 buổi' làm thông điệp chính",
          "priority": "cao"
        },
        {
          "id": "s2",
          "text": "Thử thêm tệp lookalike 1% từ khách đã đặt lịch",
          "priority": "trung bình"
        }
      ],
      "reportFile": "reports/2026-10-17-demo-goi-cham-soc-da-thang-11.md"
    },
    "creative-specialist": {
      "status": "working",
      "task": "Viết 3 hook video 15s + 2 mẫu copy cho ưu đãi tháng 11",
      "summary": "",
      "recommendations": [],
      "reportFile": ""
    },
    "media-buyer": {
      "status": "waiting",
      "task": "Đề xuất cấu trúc campaign Lead / Tin nhắn",
      "summary": "Đề xuất 1 campaign Messages (CBO), 3 ad set test góc tiếp cận, ngân sách 500k/ngày.",
      "recommendations": [
        {
          "id": "m1",
          "text": "Tạo campaign mục tiêu Tương tác → Tin nhắn, bật CBO 500k/ngày",
          "priority": "cao"
        },
        {
          "id": "m2",
          "text": "Tạo 3 ad set: Broad nữ 22–40 / Interest chăm sóc da / LAL 1% khách cũ",
          "priority": "cao"
        },
        {
          "id": "m3",
          "text": "Tắt Advantage+ placements cho Audience Network",
          "priority": "thấp"
        }
      ],
      "reportFile": "reports/2026-10-17-demo-goi-cham-soc-da-thang-11.md"
    },
    "tracking-crm": {
      "status": "reporting",
      "task": "Kiểm tra Pixel/CAPI và form lead",
      "summary": "Pixel nhận sự kiện Lead ổn định, chưa có CAPI cho sự kiện Schedule.",
      "recommendations": [
        {
          "id": "t1",
          "text": "Bật CAPI cho sự kiện Schedule trong Events Manager",
          "priority": "trung bình"
        }
      ],
      "reportFile": "reports/2026-10-17-demo-goi-cham-soc-da-thang-11.md"
    },
    "performance-analyst": {
      "status": "working",
      "task": "So sánh CPL 30 ngày qua theo từng ad set",
      "summary": "",
      "recommendations": [],
      "reportFile": ""
    },
    "compliance-qa": {
      "status": "idle",
      "task": "Chờ Creative nộp bản nháp để soát chính sách",
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
  "awaitingLeader": [
    {
      "from": "media-buyer",
      "text": "Duyệt ngân sách 500k/ngày cho campaign Tin nhắn?"
    },
    {
      "from": "strategy-research",
      "text": "Chốt thông điệp chính: 'Da sạch mụn sau 4 buổi'?"
    }
  ],
  "reports": [
    {
      "date": "2026-10-17",
      "title": "Báo cáo Ads ngày 16/10 — NTSpa's Women",
      "file": "reports/daily/2026-10-16.md",
      "summary": "Hiệu quả tốt hơn TB tuần nhưng chi tiêu giảm 38%, CPM tăng. 3 cảnh báo vàng."
    },
    {
      "date": "2026-10-17",
      "title": "DEMO — Ra mắt gói chăm sóc da tháng 11",
      "file": "reports/2026-10-17-demo-goi-cham-soc-da-thang-11.md",
      "summary": "Báo cáo mẫu. Gửi brief đầu tiên để thay bằng báo cáo thật."
    }
  ]
};
