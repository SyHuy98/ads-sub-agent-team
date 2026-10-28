# Ads Team HQ — Văn phòng Meta Ads 2D pixel

Một team Meta Ads chạy trên Claude Code, kèm trang web văn phòng pixel để bạn nhìn thấy từng người đang làm gì.

```
            ┌──────────────────────────┐
            │  01  LEADER — BẠN        │  ra brief · chốt quyết định · TỰ SET ADS
            └────────────┬─────────────┘
                         │ brief            ▲ báo cáo + checklist việc cần làm
            ┌────────────▼─────────────┐
            │  CC  CLAUDE CODE         │  trợ lý điều phối & báo cáo
            └────────────┬─────────────┘
   ┌──────────┬──────────┼──────────┬──────────┬──────────┬──────────┐
   02         03         04         05         06         07         08
 Strategy   Creative   Media      Tracking   Performance Compliance Daily
 & Research Specialist Buyer      & CRM      Analyst     & QA       Reporter
```

02–07 làm việc theo brief của bạn. 08 tự chạy mỗi sáng để báo cáo số liệu hôm qua.

**Nguyên tắc:** các bộ phận chỉ **đọc dữ liệu & góp ý**. Mọi thao tác tạo/sửa/bật/tắt trên Ads Manager do **bạn** tự làm. Hook `.claude/hooks/meta-ads-readonly.js` chặn mọi tool ghi của MCP quảng cáo để đảm bảo điều đó.

## Mở văn phòng (giao việc thẳng trên web)
**Cần có:** Node.js và Claude Code đã đăng nhập trên máy. Trong Claude Code gõ `/mcp` để chắc chắn đã thấy connector Meta Ads.

1. Chạy văn phòng bằng một trong hai cách:
   - **Windows:** bấm đúp `start.bat`.
   - **Mac/Linux:** chạy `./start.sh`, hoặc `node server.js`.
2. Trình duyệt mở http://localhost:8000. Thanh dưới hiện **● Claude Code đã kết nối**.
3. Bấm **❓ Hỏi team** → gõ câu hỏi → **▶ Gửi cho team**. Không cần mở terminal để dán lệnh.
4. Xem team làm việc trực tiếp trên văn phòng:
   - Leader mang việc ra bàn Claude Code.
   - Claude Code ném việc (tờ giấy bay) tới bàn từng bộ phận.
   - Nhân viên gõ phím, trên đầu hiện tool đang dùng (VD `get_insights…`).
   - Xong việc thì nhân viên đi nộp báo cáo.
   - Câu trả lời tự mở ở Bàn Leader.
5. **Nhật ký làm việc** nằm dưới văn phòng (và ở bàn Claude Code). Bấm **■ Dừng** nếu muốn huỷ việc đang chạy. Gửi nhiều việc cùng lúc thì các việc tự xếp hàng.

Các nút khác cũng gửi thẳng: Brief chiến dịch, KPI, Ghi nhật ký, ▶ Chạy báo cáo ngày (ở TV phòng 08).

Server chỉ nhận kết nối từ chính máy bạn (127.0.0.1). Khi chạy, Claude Code dùng tài khoản Claude của bạn. Team vẫn **chỉ đọc** Meta Ads: hook chặn mọi thao tác ghi. Log từng việc lưu ở `logs/jobs/` (không đưa lên git).

Không chạy server mà mở thẳng `index.html` thì web vẫn xem được, nhưng các nút trở về chế độ **Copy lệnh** để dán vào Claude Code.

Bấm vào bàn từng người để xem nhiệm vụ, kết quả và **đề xuất cho Leader** (tích vào ô khi bạn đã tự làm xong). Bấm vào phòng Leader (hoặc nút **❓ Hỏi team**) để hỏi team hoặc viết brief. Bật **Tự cập nhật** để web đọc lại trạng thái mỗi 10 giây (khi team đang làm việc thì 3 giây).

Báo cáo ngày trên TV là số liệu thật. Các bộ phận 02–07 ở trạng thái "Rảnh" cho tới khi bạn giao brief đầu tiên.

## Chờ bạn duyệt
Các câu hỏi cần bạn chốt và cảnh báo đỏ của báo cáo ngày hiện ở Bàn Leader › **Chờ bạn duyệt**:
- **✓ Đã đọc**: bỏ mục khỏi danh sách. **✓ Đã đọc hết**: bỏ tất cả. Khi bạn đã đọc hết cảnh báo, Analyst (06) thôi báo động.
- **↩ Trả lời** (hoặc **Chọn A / Chọn B**): câu trả lời được lưu vào mục **Bạn đã chốt**. Team đọc các quyết định này trước mỗi việc mới và không hỏi lại.
- Khi chạy `node server.js`, thao tác ghi thẳng vào `data/state.js`. Nếu chỉ mở `index.html` thì "Đã đọc" chỉ lưu trên trình duyệt đó, còn "Trả lời" sẽ copy lệnh để bạn dán vào Claude Code.

## Hỏi team (cách giao việc nhanh nhất)
Không cần viết brief dài, chỉ cần hỏi:
1. Bấm **❓ Hỏi team** (hoặc phòng Leader) → tab **Hỏi team** → gõ câu hỏi. Ví dụ:
   - "Vì sao CPM tăng 1 tuần nay?"
   - "Nên dồn ngân sách vào campaign nào?"
   - "Đối thủ đang chạy ưu đãi gì cho triệt lông?"
2. Bấm **▶ Gửi cho team** (khi chạy `node server.js`). Nếu chỉ mở `index.html` thì bấm **Copy lệnh /hoi** rồi dán vào Claude Code, hoặc gõ thẳng `/hoi <câu hỏi>`.
3. Claude Code tự chọn 1–4 bộ phận phù hợp. Muốn tự chọn thì tick ở form, hoặc thêm `[giao: performance-analyst,media-buyer]`. Các bộ phận research và phân tích bằng dữ liệu thật, rồi trả lời gồm: trả lời ngắn, bằng chứng, việc bạn có thể làm.
4. Câu trả lời lưu ở `reports/hoi-dap/` và hiện ở mục **Câu trả lời gần đây** trên Bàn Leader.

## Brief chiến dịch (khi lên campaign mới)
1. Bàn Leader → tab **Brief chiến dịch** → điền form → **Copy lệnh cho Claude Code**.
2. Mở Claude Code trong thư mục repo này, dán lệnh vào (bắt đầu bằng `/brief`).
3. Claude Code lưu brief vào `briefs/`, giao việc song song cho các bộ phận, cập nhật `data/state.js` (web đổi trạng thái theo), rồi viết báo cáo vào `reports/` và báo cáo lại cho bạn:
   - Tóm tắt điều hành
   - **Việc Leader cần tự làm** — từng bước, ở đâu, giá trị cụ thể
   - Câu hỏi cần bạn chốt

Hỏi tình hình bất kỳ lúc nào: `/bao-cao`.

Cũng có thể tự viết file brief vào `briefs/` rồi gõ `/brief briefs/<tên-file>.md`.

## Báo cáo ngày (bộ phận 08)
- **Tự chạy mỗi sáng 7h52** (giờ Việt Nam) trên máy bạn, miễn là `server.js` đang mở. Mở máy trễ thì server chạy bù ngay khi bật (tối đa 2 lần/ngày, cách nhau ít nhất 60 phút). Nó kéo số liệu hôm qua của các tài khoản trong `data/config.js`, so với KPI và trung bình 7 ngày, rồi gắn cờ 🟡/🔴.
- Kết quả được ghi vào `reports/daily/YYYY-MM-DD.md` và `data/daily.js` trên máy bạn (không commit/push), web tự hiện.
- Chạy trên máy vì Claude Code trên máy bạn có sẵn connector Meta Ads. Lịch trên Claude Code cloud không gắn được connector nên báo "không đủ quyền", lịch đó đã tắt.
- Đổi giờ: `DAILY_AT=08:30 node server.js` (Windows: `set DAILY_AT=08:30` trước khi chạy `start.bat`). Tắt: `DAILY_AT=off`.
- **Tự mở khi bật máy (Windows):** bấm `Win + R`, gõ `shell:startup`, Enter, rồi tạo shortcut tới `start.bat` trong thư mục vừa mở. `start.bat` chạy server ở cửa sổ thu nhỏ.
- **TV trong phòng 08** hiện chi tiêu, tin nhắn, lead của hôm qua kèm cột 7 ngày. Đèn TV xanh/vàng/đỏ theo mức cảnh báo. Bấm vào TV để xem bảng chi tiết, biểu đồ 14 ngày và đề xuất.
- Khi có **cảnh báo đỏ**, nhân vật Analyst (06) chạy vào phòng bạn báo động, và cảnh báo xuất hiện trong mục "Chờ bạn duyệt".
- Chạy tay bất kỳ lúc nào: `/bao-cao-ngay` (hoặc `/bao-cao-ngay 2026-10-15` cho một ngày cụ thể).
- Thêm tài khoản: sửa mảng `accounts` trong `data/config.js`, hoặc nói với Claude Code `/kpi thêm tài khoản act_...`.

## KPI & ngưỡng cảnh báo
Vào Bàn Leader › **KPI & ngưỡng cảnh báo**, điền ngưỡng rồi bấm **Copy lệnh /kpi** và dán vào Claude Code. Cũng có thể gõ trực tiếp, ví dụ `/kpi tin nhắn<90k, lead<500k, tần suất<3`. Ô nào để trống thì báo cáo chỉ so với trung bình 7 ngày.

## Nhật ký thay đổi & bài học
1. Làm xong một đề xuất trên Ads Manager → tích vào ô của đề xuất đó → bấm **⧉ Ghi nhật ký** (hoặc gõ `/da-lam <việc đã làm>`).
2. Team ghi số liệu 7 ngày trước thay đổi làm mốc. Sau 3 ngày (đổi ngân sách/giá thầu) hoặc 7 ngày (đổi creative/target), báo cáo ngày tự đo lại trước/sau và kết luận tốt/xấu.
3. Mỗi kết luận được thêm vào `reports/bai-hoc.md`. Team đọc file này trước khi xử lý brief mới, nên càng dùng lâu thì góp ý càng sát với tài khoản của bạn.

## Model của từng bộ phận
| Bộ phận | Model | Vì sao |
|---|---|---|
| Claude Code điều phối (khi chạy qua `server.js`) | Opus | Chọn bộ phận, tổng hợp, viết câu trả lời cuối |
| 06 Performance Analyst | Opus | Phân tích nhân quả trên số liệu, tính toán nhiều |
| 04 Media Buyer | Opus | Đề xuất cấu trúc & ngân sách — quyết định liên quan tiền |
| 02 Strategy & Research | Sonnet | Tìm kiếm, tổng hợp — nhanh, đủ tốt |
| 03 Creative Specialist | Sonnet | Viết hook/copy nhiều biến thể |
| 05 Tracking & CRM | Sonnet | Soát pixel/CAPI/lead theo checklist |
| 07 Compliance & QA | Sonnet | Soát chính sách |
| 08 Daily Reporter | Sonnet | Báo cáo mỗi ngày, có cấu trúc |

Đổi model: sửa dòng `model:` (`opus` / `sonnet` / `haiku`) trong `.claude/agents/<bộ-phận>.md` (và `model` trong `js/team.js` để web hiển thị đúng). Model điều phối khi chạy web: `CLAUDE_MODEL=sonnet node server.js` (mặc định `opus`). Khi gõ lệnh trực tiếp trong Claude Code, phiên điều phối dùng model bạn chọn bằng `/model`, còn sub-agent vẫn dùng model ghi trong file của nó. Dùng gói Claude (đăng ký) thì Opus tốn hạn mức nhanh hơn Sonnet khoảng 2 lần.

## Kết nối Meta Ads
Các bộ phận dùng connector Meta Ads (MCP) bạn đã kết nối trong Claude để **đọc** insights, campaign, ad set, ad, creative, pixel, lead form. Nếu chưa kết nối, team vẫn làm việc dựa trên số liệu bạn đưa trong brief.

Khi khởi động, `server.js` tự dò connector Meta Ads của Claude Code trên máy và cấp quyền đọc cho phiên chạy từ web. Nếu thanh trạng thái hiện **"⚠ Không thấy connector Meta Ads"**, mở Claude Code trong thư mục này, gõ `/mcp` để kiểm tra/kết nối lại, rồi khởi động lại server. Nếu có tool bị chặn quyền khi chạy, nhật ký ở bàn Claude Code hiện dòng **"⚠ Bị chặn quyền: <tên tool>"**.

## Cấu trúc
| Đường dẫn | Nội dung |
|---|---|
| `index.html`, `css/`, `js/` | Web văn phòng pixel (không cần cài gì) |
| `server.js`, `start.bat`, `start.sh` | Server cầu nối: giao việc từ web cho Claude Code, đẩy tiến độ trực tiếp về web |
| `data/state.js` | Trạng thái văn phòng — Claude Code cập nhật |
| `data/config.js` | Tài khoản theo dõi & ngưỡng KPI |
| `data/daily.js` | Số liệu báo cáo ngày (14 ngày) |
| `data/changelog.js` | Nhật ký thay đổi & kết quả đo lại |
| `briefs/` | Brief của Leader |
| `reports/` | Báo cáo brief, `reports/hoi-dap/` câu trả lời, `reports/daily/` báo cáo ngày, `reports/bai-hoc.md` thư viện bài học |
| `CLAUDE.md` | Quy tắc vận hành cho Claude Code |
| `.claude/agents/` | 7 sub-agent |
| `.claude/commands/` | Lệnh `/hoi`, `/brief`, `/bao-cao`, `/bao-cao-ngay`, `/kpi`, `/da-lam` |
| `.claude/hooks/meta-ads-readonly.js` | Chặn thao tác ghi lên tài khoản quảng cáo |
