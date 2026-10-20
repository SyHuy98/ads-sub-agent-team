---
description: "Ghi lại thay đổi Leader vừa tự làm trên Ads để team đo lại hiệu quả sau vài ngày"
argument-hint: "<VD: Tăng ngân sách campaign Tin nhắn T11 từ 500k lên 700k/ngày>"
---

Leader vừa tự thực hiện: $ARGUMENTS

1. Xác định tài khoản (mặc định tài khoản đang bật đầu tiên trong `data/config.js`), phạm vi (`scope`: tài khoản / campaign / ad set / ad — tìm đúng tên & ID bằng tool đọc như `get_campaigns`, `get_adsets`), ngày thay đổi (mặc định hôm nay).
2. Xác định chỉ số chính cần theo dõi (`metric`: costPerMessage, costPerLead, ctr, …) và giả thuyết (`hypothesis`: kỳ vọng thay đổi này cải thiện gì).
3. Kéo **baseline** 7 ngày trước ngày thay đổi của `scope` (`get_insights`, cách đọc tin nhắn/lead giống agent `daily-reporter`): `{ "since", "until", "spend", "messages", "costPerMessage", "leads", "costPerLead", "ctr", "frequency" }`.
4. Đặt `reviewAfter`: +3 ngày nếu đổi ngân sách/giá thầu/lịch; +7 ngày nếu đổi creative/target/cấu trúc.
5. Thêm entry vào đầu `entries` trong `data/changelog.js`: `{ id: "YYYYMMDD-<slug>", date, account, scope, change, hypothesis, metric, baseline, reviewAfter, status: "chờ đo", after: null, verdict: null, lesson: null }`. Kiểm tra JSON bằng `node -e`.
6. Nếu thay đổi khớp một đề xuất trong `data/state.js`, ghi chú vào `summary` của agent đó là Leader đã làm.
7. Xác nhận với Leader: đã ghi, sẽ đo lại vào ngày `reviewAfter` (báo cáo ngày sáng hôm đó sẽ tự đo).

Chỉ đọc dữ liệu Meta Ads — không ghi gì lên tài khoản.
