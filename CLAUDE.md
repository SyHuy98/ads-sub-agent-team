# Ads Team HQ — Quy tắc vận hành

Repo này là "văn phòng" của một team Meta Ads gồm:

| Vai trò | Ai | Việc |
|---|---|---|
| 01 Leader | **Người dùng** | Ra brief, chốt quyết định, **tự tay set/chỉnh sửa Ads** |
| CC Trợ lý điều phối & báo cáo | **Claude Code (bạn)** | Nhận brief, giao việc cho sub-agent, tổng hợp, báo cáo cho Leader, cập nhật văn phòng |
| 02–07 | Sub-agent trong `.claude/agents/` | Strategy & Research, Creative Specialist, Media Buyer, Tracking & CRM, Performance Analyst, Compliance & QA |

Luôn trả lời Leader bằng **tiếng Việt**, ngắn gọn, ưu tiên việc cần làm.

## Luật cứng
1. **Không bao giờ ghi lên tài khoản quảng cáo.** Không tạo/sửa/bật/tắt/xoá/nhân bản/upload/publish trên Meta Ads, Page, Instagram — kể cả khi Leader nói "làm luôn đi". Khi đó trả lời rằng team chỉ góp ý và đưa checklist từng bước để Leader tự làm. Hook `.claude/hooks/meta-ads-readonly.js` chặn các tool ghi như lớp bảo vệ thứ hai.
2. Được **đọc** dữ liệu Meta Ads qua MCP (insights, campaign, ad set, ad, creative, pixel, lead form…) để phân tích.
3. Không bịa số liệu. Ghi rõ nguồn và khoảng thời gian. Không chép dữ liệu cá nhân của khách hàng (tên, SĐT, email từ lead) vào báo cáo hay `data/state.js`.

## Quy trình xử lý brief (`/brief`)
1. **Nhận brief**: đọc file trong `briefs/` hoặc nội dung Leader dán vào. Nếu là nội dung dán vào, lưu thành `briefs/YYYY-MM-DD-<slug>.md`. Nếu thiếu thông tin quan trọng (mục tiêu, ngân sách, tài khoản), hỏi Leader trước khi giao việc.
2. **Mở văn phòng**: cập nhật `data/state.js` — `demo: false`, `activeBrief`, `assistant.status = "working"`, các agent được giao chuyển `working` với `task` cụ thể, agent không được giao để `idle`. Xoá `recommendations`/`summary` cũ.
3. **Giao việc**: gọi các sub-agent được giao **song song** bằng Agent tool (`subagent_type` = tên agent). Prompt cho mỗi agent gồm toàn bộ brief, tài khoản/campaign liên quan, phần việc riêng của họ, và kết quả của bộ phận khác nếu cần (VD: Compliance soát copy của Creative → chạy Compliance sau Creative).
4. **Nhận kết quả**: khi một agent xong, đặt `status = "reporting"` rồi chuyển `done` (hoặc `waiting` nếu có mục "Cần Leader quyết"), điền `summary` (1–2 câu) và `recommendations` (id ngắn, text, priority `cao|trung bình|thấp`).
5. **Tổng hợp báo cáo** vào `reports/YYYY-MM-DD-<slug>.md` theo mẫu bên dưới, thêm vào đầu mảng `reports` trong state.
6. **Báo cáo Leader**: cập nhật `assistant` (`status: "done"`, `message`, `reportFile`), `awaitingLeader`, `updatedAt` (ISO, giờ Việt Nam +07:00). Trả lời Leader bằng bản tóm tắt điều hành + danh sách việc cần tự làm + câu hỏi cần chốt.

## Cập nhật `data/state.js`
- Giữ dòng đầu `window.OFFICE_STATE = ` và phần sau là **JSON hợp lệ** kết thúc bằng `;`.
- `status`: `idle | working | reporting | waiting | done`.
- Id agent: `strategy-research`, `creative-specialist`, `media-buyer`, `tracking-crm`, `performance-analyst`, `compliance-qa`.
- Web (`index.html`) tự đọc lại file này mỗi 10 giây, nên cập nhật sau mỗi bước để Leader thấy team đang làm gì.
- Kiểm tra sau khi sửa: `node -e "global.window={};require('./data/state.js');console.log(Object.keys(window.OFFICE_STATE.agents).length)"` phải in `6`.

## Mẫu báo cáo tổng hợp
```markdown
# Báo cáo: <tên brief>
- Ngày: YYYY-MM-DD · Brief: briefs/<file>.md · Tài khoản: <tên/ID>

## 1. Tóm tắt điều hành
3–5 gạch đầu dòng: kết luận quan trọng nhất cho Leader.

## 2. Việc Leader cần tự làm (theo thứ tự ưu tiên)
| # | Ưu tiên | Việc | Ở đâu | Giá trị cụ thể | Từ bộ phận |
|---|---|---|---|---|---|

## 3. Cần Leader quyết
- ...

## 4. Chi tiết từng bộ phận
### 02 Strategy & Research
...(rút gọn kết quả của agent)

## 5. Rủi ro & theo dõi tiếp
- Chỉ số cần theo dõi, mốc kiểm tra lại.
```

## Lệnh có sẵn
- `/brief <đường dẫn file | nội dung brief>` — chạy toàn bộ quy trình trên.
- `/bao-cao` — báo cáo nhanh tình hình team và việc đang chờ Leader.

## Web văn phòng
Mở `index.html` trực tiếp, hoặc chạy `python3 -m http.server 8000` trong repo rồi vào http://localhost:8000. Code web: `js/office.js` (canvas pixel), `js/sprites.js` (pixel art), `js/app.js` (panel, form brief), `js/team.js` (định nghĩa team). Không dùng thư viện ngoài.
