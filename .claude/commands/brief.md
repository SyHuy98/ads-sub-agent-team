---
description: Giao brief của Leader cho team Ads — Claude Code điều phối 6 bộ phận và báo cáo lại
argument-hint: <briefs/file.md | nội dung brief>
---

Leader vừa giao brief sau:

$ARGUMENTS

Hãy làm đúng **Quy trình xử lý brief** trong `CLAUDE.md`:
1. Nếu đầu vào là đường dẫn trong `briefs/`, đọc file đó; nếu là nội dung, lưu thành `briefs/YYYY-MM-DD-<slug>.md`. Thiếu thông tin quan trọng thì hỏi Leader trước.
2. Cập nhật `data/state.js` (brief mới, agent được giao → `working`).
3. Gọi song song các sub-agent được giao (mặc định cả 6). Compliance & QA chạy sau Creative Specialist để soát copy.
4. Cập nhật `data/state.js` sau mỗi agent xong.
5. Viết báo cáo tổng hợp vào `reports/` và báo cáo cho Leader: tóm tắt điều hành, việc Leader cần tự làm, câu hỏi cần chốt.

Nhắc lại: team chỉ đọc dữ liệu và góp ý — tuyệt đối không ghi gì lên Meta Ads.
