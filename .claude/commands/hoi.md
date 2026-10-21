---
description: "Leader hỏi một câu — Claude Code chọn bộ phận phù hợp, team research & phân tích rồi trả lời"
argument-hint: "<câu hỏi> [giao: strategy-research,performance-analyst]"
---

Leader hỏi team: $ARGUMENTS

Làm đúng **Quy trình hỏi đáp (`/hoi`)** trong `CLAUDE.md`:

1. **Ngữ cảnh**: đọc `leaderDecisions` trong `data/state.js` (các quyết định Leader đã chốt — phải tôn trọng, không hỏi lại), `reports/bai-hoc.md`, `data/daily.js` (báo cáo ngày mới nhất), `data/config.js` (tài khoản active, KPI). Câu hỏi không nói tài khoản thì dùng tài khoản active đầu tiên.
2. **Chọn bộ phận**: nếu câu hỏi có `[giao: ...]` thì dùng đúng danh sách đó. Nếu không, chọn 2–4 bộ phận theo bảng trong `CLAUDE.md` và ghi một dòng lý do. Câu hỏi đơn giản, tra số là ra, thì 1 bộ phận cũng được.
3. **Mở văn phòng** (`data/state.js`):
   - `activeBrief = { "id": "q-YYYYMMDD-<slug>", "title": <câu hỏi rút gọn ≤ 80 ký tự>, "type": "question", "file": "reports/hoi-dap/YYYY-MM-DD-<slug>.md" }`
   - `assistant.status = "working"`
   - Bộ phận được chọn chuyển `working`, `task` = phần câu hỏi họ lo. Bộ phận **không** được chọn: giữ nguyên nếu đang `waiting` (còn việc chờ Leader chốt), còn lại để `idle`. Không đụng `daily-reporter`.
   - **Không xoá** `awaitingLeader` cũ — các mục chờ Leader chỉ được bỏ khi Leader đã trả lời; câu hỏi mới chỉ **thêm** mục mới.
4. **Gọi song song** các sub-agent đã chọn (Agent tool, `subagent_type` = id). Mỗi prompt gồm: câu hỏi gốc, phần họ cần trả lời, tài khoản + khoảng thời gian cần xem, và phần ngữ cảnh liên quan từ bước 1. Yêu cầu trả lời bằng số liệu thật có nguồn. Có bộ phận cần kết quả của bộ phận khác (VD Compliance soát copy của Creative) thì chạy sau.
5. **Tổng hợp** vào `reports/hoi-dap/YYYY-MM-DD-<slug>.md`:
   ```markdown
   # Hỏi đáp: <câu hỏi>
   - Ngày: YYYY-MM-DD · Tài khoản: <tên/ID> · Bộ phận: <danh sách> (lý do chọn: ...)

   ## Trả lời ngắn
   2–4 câu, trả lời thẳng câu hỏi.

   ## Bằng chứng
   - Số liệu + nguồn (tool, khoảng thời gian).

   ## Phân tích từng bộ phận
   ### 06 Performance Analyst
   ...(rút gọn)

   ## Việc Leader có thể làm
   | # | Ưu tiên | Việc | Ở đâu | Giá trị cụ thể | Từ bộ phận |
   |---|---|---|---|---|---|

   ## Còn chưa chắc / cần thêm dữ liệu
   - ...
   ```
6. **Cập nhật state**:
   - Từng bộ phận được chọn: `done` (hoặc `waiting` nếu có điều cần Leader quyết), điền `summary` và `recommendations`. Nếu bộ phận đó đang có đề xuất chưa xong từ câu hỏi trước, giữ lại đề xuất cũ còn hiệu lực và thêm đề xuất mới lên đầu.
   - Thêm vào **đầu** mảng `questions` (giữ tối đa 20): `{ "id", "date", "question", "shortAnswer", "agents": [...ids], "file" }`.
   - Thêm vào đầu `reports`. Cập nhật `assistant` (`status: "done"`, `message` = trả lời ngắn, `reportFile`), `awaitingLeader` nếu có, `updatedAt` (ISO +07:00).
   - Chạy vòng kiểm tra JSON `data/*.js` trong `CLAUDE.md`.
7. **Trả lời Leader** trong chat: trả lời ngắn, 3 bằng chứng chính, việc nên làm, và đường dẫn file.

Luật cứng: chỉ đọc dữ liệu Meta Ads, không ghi gì lên tài khoản; không bịa số; không chép dữ liệu cá nhân của khách.
