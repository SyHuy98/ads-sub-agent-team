---
description: Báo cáo nhanh cho Leader — team đang làm gì, việc nào chờ duyệt
---

Đọc `data/state.js` và báo cáo mới nhất trong `reports/`, rồi báo cáo ngắn cho Leader bằng tiếng Việt:
- Brief hoặc câu hỏi đang xử lý (`activeBrief`, `type` = brief/question) và tiến độ các bộ phận được giao.
- 3 câu hỏi gần nhất trong `questions` kèm trả lời ngắn.
- Từng bộ phận: trạng thái + 1 dòng việc đang làm/kết quả.
- Việc Leader cần tự làm chưa xong (ưu tiên cao trước).
- Câu hỏi đang chờ Leader chốt.

Không gọi sub-agent, không sửa file. $ARGUMENTS
