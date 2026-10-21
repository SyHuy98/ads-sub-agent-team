---
description: Báo cáo Ads ngày hôm qua (agent 08) + đo lại các thay đổi đã tới hạn
argument-hint: [YYYY-MM-DD — mặc định hôm qua]
---

Chạy báo cáo ngày cho team Ads. Ngày báo cáo: `$ARGUMENTS` (để trống = hôm qua theo giờ Việt Nam, `TZ=Asia/Ho_Chi_Minh date -d yesterday +%F`).

1. Đọc `data/config.js` (tài khoản `active: true`, ngưỡng `kpi`), `data/state.js`, `data/changelog.js`.
2. Cập nhật `data/state.js`: agent `daily-reporter` → `working`, `task` = "Báo cáo ngày <D>".
3. Gọi sub-agent `daily-reporter` (Agent tool) cho từng tài khoản đang bật, đưa kèm ngày `D` và ngưỡng KPI. Nhiều tài khoản thì gọi song song.
4. Ghi phần JSON vào `data/daily.js` → `window.ADS_DAILY = { "updatedAt": <ISO +07:00>, "date": D, "reportFile": "reports/daily/D.md", "accounts": {...} }`.
5. Ghi `reports/daily/D.md`: tiêu đề "Báo cáo Ads ngày D", phần Markdown của từng tài khoản, rồi mục "Nhật ký thay đổi" (bước 7).
6. Cảnh báo:
   - Luôn **xoá các mục `awaitingLeader` cũ có `from: "daily-reporter"`** trước (báo cáo mới thay báo cáo cũ).
   - Có cảnh báo **đỏ** → `performance-analyst` chuyển `status: "alert"`, `task` = cảnh báo nặng nhất, và thêm **đúng 1 mục** `awaitingLeader` (`from: "daily-reporter"`) gộp tất cả cảnh báo đỏ, dạng: "Báo cáo ngày DD/MM: N cảnh báo đỏ — <2–3 cảnh báo nặng nhất, ngắn>; xem chi tiết ở TV phòng 08". Nếu có quyết định cần Leader chốt thì thêm tối đa 2 mục câu hỏi riêng (dạng "(A) … hay (B) …?" nếu có 2 lựa chọn).
   - Không có cảnh báo đỏ → nếu `performance-analyst` đang `alert` thì trả về `idle`.
   - Không hỏi lại điều Leader đã chốt trong `leaderDecisions` của `data/state.js`.
7. Đo lại thay đổi: với mỗi entry trong `data/changelog.js` có `status: "chờ đo"` và `reviewAfter <= D`, gọi `performance-analyst` để so số liệu của `scope` trong số ngày tương đương **trước** (`baseline`) và **sau** ngày thay đổi. Điền `after`, `verdict` (`tốt|xấu|chưa rõ`), `lesson` (1 câu), `status: "đã đo"`, rồi thêm 1 dòng vào bảng `reports/bai-hoc.md`.
8. Cập nhật `data/state.js`: `daily-reporter` → `done`, `summary` = tóm tắt 1 câu, `recommendations` = đề xuất của báo cáo, `reportFile`; thêm báo cáo vào đầu `reports` (giữ tối đa 20 mục); `updatedAt`.
9. Kiểm tra JSON: `for f in state daily changelog config; do node -e "global.window={};require('./data/$f.js')" || echo LỖI $f; done`.
10. Trả lời Leader: 3–5 dòng tóm tắt + cảnh báo + số thay đổi vừa đo lại.

Chỉ đọc dữ liệu Meta Ads — tuyệt đối không ghi gì lên tài khoản.
