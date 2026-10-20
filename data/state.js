// Trạng thái văn phòng — Claude Code cập nhật file này sau mỗi bước xử lý brief.
// Giữ nguyên dòng "window.OFFICE_STATE =" và để phần sau là JSON hợp lệ.
// status hợp lệ: idle | working | reporting | waiting | done | alert
window.OFFICE_STATE = {
  "demo": false,
  "updatedAt": "2026-10-20T09:45:00+07:00",
  "activeBrief": {
    "id": "q-20261020-vi-sao-cpm-tang",
    "title": "Vì sao CPM tăng từ 09/10 đến nay, nên làm gì?",
    "type": "question",
    "file": "reports/hoi-dap/2026-10-20-vi-sao-cpm-tang.md"
  },
  "assistant": {
    "status": "done",
    "message": "CPM +29% (93k→120k) chủ yếu vì tài khoản tự đấu giá với chính mình: 2 tệp Fashionista/Mommy bị nhân ra 13 ad set ở 8 campaign, ngân sách bị sửa ~30 lần trong 12 ngày, và tiền rút khỏi campaign rẻ nhất (Lách 20Jan). Thiệt hại thật là tin nhắn -30%; chi phí/tin nhắn chỉ +12%. Cách sửa: mỗi tệp giữ 1 ad set tốt nhất + ngừng sửa ngân sách 72 giờ.",
    "reportFile": "reports/hoi-dap/2026-10-20-vi-sao-cpm-tang.md"
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
      "status": "waiting",
      "task": "Xem cấu trúc, ngân sách, tệp & chồng chéo đối tượng có làm CPM tăng không",
      "summary": "2 tệp interest giống hệt (Fashionista, Mommy) chạy ở 13 ad set/8 campaign — 58% chi tiêu tự đấu giá với nhau; 11 ad set chia 6,3tr/ngày nên không ad set nào đủ ~50 tin nhắn/tuần để thoát learning.",
      "recommendations": [
        {
          "id": "m1",
          "text": "Tệp Mommy: giữ Lách Dup13Oct › INTEREST-20KM-MOMMY (82k/TN); tắt NuSauSinh_T9 › Trị thâm MESS, TONGHOP_T10 › NUSAUSINH và campaign NuSauSinh_T10",
          "priority": "cao"
        },
        {
          "id": "m2",
          "text": "Tệp Fashionista: giữ NuVP_T9 › Triệt lông MESS (81k/TN); tắt Lách Dup13Oct › INTEREST-10KM-FASHIONISTA và TONGHOP_T10 › NUVP (rồi tắt campaign TONGHOP_T10)",
          "priority": "cao"
        },
        {
          "id": "m3",
          "text": "23/10: Lách Dup13Oct 1.000.000 → 1.200.000; NuVP_T9 800.000 → 960.000",
          "priority": "trung bình"
        },
        {
          "id": "m4",
          "text": "Sau 23/10: NamLGBT đổi pin 10km Q10 → HCM +20km; ad set khách mới loại trừ engagement_last7days, KH NTSPA, customer_fp (sửa cùng 1 lần)",
          "priority": "trung bình"
        },
        {
          "id": "m5",
          "text": "HIFU: tới 27/10 dưới 5 tin nhắn/7 ngày thì tắt, chuyển ad sang ad set Triệt lông",
          "priority": "thấp"
        }
      ],
      "reportFile": "reports/hoi-dap/2026-10-20-vi-sao-cpm-tang.md"
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
  "awaitingLeader": [
    {
      "from": "media-buyer",
      "text": "Chọn campaign chính: (A) giữ Lách Dup › Mommy + NuVP_T9 › Triệt lông (team khuyên) hay (B) dồn hết vào TONGHOP_T10?"
    },
    {
      "from": "media-buyer",
      "text": "Có bật lại Lách 20Jan bản gốc không? Team khuyên KHÔNG để tránh trùng tệp."
    },
    {
      "from": "performance-analyst",
      "text": "Mục tiêu tuần này: giữ số tin nhắn (về ~6,5tr/ngày) hay giữ chi phí/tin nhắn < 100k (giữ ngân sách hiện tại)?"
    }
  ],
  "reports": [
    {
      "date": "2026-10-20",
      "title": "Hỏi đáp: Vì sao CPM tăng từ 09/10?",
      "file": "reports/hoi-dap/2026-10-20-vi-sao-cpm-tang.md",
      "summary": "Tự đấu giá do trùng tệp + sửa ngân sách liên tục; tin nhắn -30%. Gộp mỗi tệp còn 1 ad set, ngừng sửa ngân sách 72h."
    },
    {
      "date": "2026-10-17",
      "title": "Báo cáo Ads ngày 16/10 — NTSpa's Women",
      "file": "reports/daily/2026-10-16.md",
      "summary": "Hiệu quả tốt hơn TB tuần nhưng chi tiêu giảm 38%, CPM tăng. 3 cảnh báo vàng."
    }
  ],
  "questions": [
    {
      "id": "q-20261020-vi-sao-cpm-tang",
      "date": "2026-10-20",
      "question": "Vì sao CPM tăng từ 09/10 đến nay, nên làm gì?",
      "shortAnswer": "CPM +29% (93k→120k) chủ yếu vì tài khoản tự đấu giá với chính mình: 2 tệp Fashionista/Mommy bị nhân ra 13 ad set ở 8 campaign, ngân sách bị sửa ~30 lần trong 12 ngày, và tiền rút khỏi campaign rẻ nhất (Lách 20Jan). Thiệt hại thật là tin nhắn -30%; chi phí/tin nhắn chỉ +12%. Cách sửa: mỗi tệp giữ 1 ad set tốt nhất + ngừng sửa ngân sách 72 giờ.",
      "agents": [
        "performance-analyst",
        "media-buyer"
      ],
      "file": "reports/hoi-dap/2026-10-20-vi-sao-cpm-tang.md"
    }
  ]
};
