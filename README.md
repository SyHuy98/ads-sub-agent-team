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

## Mở văn phòng
- Mở thẳng file `index.html` bằng trình duyệt, **hoặc**
- `python3 -m http.server 8000` trong thư mục repo → vào http://localhost:8000

Bấm vào bàn từng người để xem nhiệm vụ, kết quả và **đề xuất cho Leader** (tích vào ô khi bạn đã tự làm xong). Bấm vào phòng Leader (hoặc nút **Viết brief**) để viết brief. Bật **Tự cập nhật** để web đọc lại trạng thái mỗi 10 giây.

Báo cáo ngày trên TV là số liệu thật. Các bộ phận 02–07 ở trạng thái "Rảnh" cho tới khi bạn giao brief đầu tiên.

## Giao việc cho team
1. Viết brief trên web → **Copy lệnh cho Claude Code**.
2. Mở Claude Code trong thư mục repo này, dán lệnh vào (bắt đầu bằng `/brief`).
3. Claude Code lưu brief vào `briefs/`, giao việc song song cho các bộ phận, cập nhật `data/state.js` (web đổi trạng thái theo), rồi viết báo cáo vào `reports/` và báo cáo lại cho bạn:
   - Tóm tắt điều hành
   - **Việc Leader cần tự làm** — từng bước, ở đâu, giá trị cụ thể
   - Câu hỏi cần bạn chốt

Hỏi tình hình bất kỳ lúc nào: `/bao-cao`.

Cũng có thể tự viết file brief vào `briefs/` rồi gõ `/brief briefs/<tên-file>.md`.

## Báo cáo ngày (bộ phận 08)
- **Tự chạy mỗi sáng ~7h52** (giờ Việt Nam) bằng lịch hẹn giờ trên Claude Code cloud. Nó kéo số liệu hôm qua của các tài khoản trong `data/config.js`, so với KPI và trung bình 7 ngày, rồi gắn cờ 🟡/🔴.
- Kết quả được ghi vào `reports/daily/YYYY-MM-DD.md` và `data/daily.js`, sau đó commit lên GitHub. Muốn xem trên web ở máy bạn thì chạy `git pull`.
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

## Kết nối Meta Ads
Các bộ phận dùng connector Meta Ads (MCP) bạn đã kết nối trong Claude để **đọc** insights, campaign, ad set, ad, creative, pixel, lead form. Nếu chưa kết nối, team vẫn làm việc dựa trên số liệu bạn đưa trong brief.

## Cấu trúc
| Đường dẫn | Nội dung |
|---|---|
| `index.html`, `css/`, `js/` | Web văn phòng pixel (không cần cài gì) |
| `data/state.js` | Trạng thái văn phòng — Claude Code cập nhật |
| `data/config.js` | Tài khoản theo dõi & ngưỡng KPI |
| `data/daily.js` | Số liệu báo cáo ngày (14 ngày) |
| `data/changelog.js` | Nhật ký thay đổi & kết quả đo lại |
| `briefs/` | Brief của Leader |
| `reports/` | Báo cáo tổng hợp, `reports/daily/` báo cáo ngày, `reports/bai-hoc.md` thư viện bài học |
| `CLAUDE.md` | Quy tắc vận hành cho Claude Code |
| `.claude/agents/` | 7 sub-agent |
| `.claude/commands/` | Lệnh `/brief`, `/bao-cao`, `/bao-cao-ngay`, `/kpi`, `/da-lam` |
| `.claude/hooks/meta-ads-readonly.js` | Chặn thao tác ghi lên tài khoản quảng cáo |
