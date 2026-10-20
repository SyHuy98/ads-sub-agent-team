---
description: "Leader đặt/sửa ngưỡng KPI & cảnh báo cho báo cáo ngày"
argument-hint: "<VD: tin nhắn<60k, lead<150k, ngân sách 5tr/ngày, tần suất<3, CTR>1.5%>"
---

Leader đặt ngưỡng KPI: $ARGUMENTS

Cập nhật khối `kpi` trong `data/config.js` (giữ nguyên các khoá khác, JSON hợp lệ):
- `costPerMessage` (VND) — chi phí/tin nhắn tối đa
- `costPerLead` (VND) — chi phí/lead tối đa
- `dailyBudget` (VND) — chi tiêu dự kiến/ngày (toàn tài khoản)
- `maxFrequency` — tần suất tối đa
- `minCtr` (%) — CTR tối thiểu
- `spendDeviationPct` (%) — chi tiêu lệch TB 7 ngày bao nhiêu % thì cảnh báo

Đổi đơn vị: "60k" = 60000, "5tr" = 5000000. Giá trị Leader không nhắc tới thì giữ nguyên; "bỏ"/"xoá" thì đặt `null`.
Nếu Leader thêm/bớt tài khoản theo dõi, sửa mảng `accounts` (`id` dạng `act_...`, `active`).
Kiểm tra bằng `node -e "global.window={};require('./data/config.js');console.log(window.ADS_CONFIG.kpi)"` rồi xác nhận lại bảng ngưỡng mới cho Leader.
