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
   ┌──────────┬──────────┼──────────┬──────────┬──────────┐
   02         03         04         05         06         07
 Strategy   Creative   Media      Tracking   Performance Compliance
 & Research Specialist Buyer      & CRM      Analyst     & QA
```

**Nguyên tắc:** 6 bộ phận chỉ **đọc dữ liệu & góp ý**. Mọi thao tác tạo/sửa/bật/tắt trên Ads Manager do **bạn** tự làm. Hook `.claude/hooks/meta-ads-readonly.js` chặn mọi tool ghi của MCP quảng cáo để đảm bảo điều đó.

## Mở văn phòng
- Mở thẳng file `index.html` bằng trình duyệt, **hoặc**
- `python3 -m http.server 8000` trong thư mục repo → vào http://localhost:8000

Bấm vào bàn từng người để xem nhiệm vụ, kết quả và **đề xuất cho Leader** (tích vào ô khi bạn đã tự làm xong). Bấm vào phòng Leader (hoặc nút **Viết brief**) để viết brief. Bật **Tự cập nhật** để web đọc lại trạng thái mỗi 10 giây.

Lần đầu mở, văn phòng hiển thị **dữ liệu mẫu** (nhãn "DỮ LIỆU MẪU" ở thanh dưới).

## Giao việc cho team
1. Viết brief trên web → **Copy lệnh cho Claude Code**.
2. Mở Claude Code trong thư mục repo này, dán lệnh vào (bắt đầu bằng `/brief`).
3. Claude Code lưu brief vào `briefs/`, giao việc song song cho các bộ phận, cập nhật `data/state.js` (web đổi trạng thái theo), rồi viết báo cáo vào `reports/` và báo cáo lại cho bạn:
   - Tóm tắt điều hành
   - **Việc Leader cần tự làm** — từng bước, ở đâu, giá trị cụ thể
   - Câu hỏi cần bạn chốt

Hỏi tình hình bất kỳ lúc nào: `/bao-cao`.

Cũng có thể tự viết file brief vào `briefs/` rồi gõ `/brief briefs/<tên-file>.md`.

## Kết nối Meta Ads
Các bộ phận dùng connector Meta Ads (MCP) bạn đã kết nối trong Claude để **đọc** insights, campaign, ad set, ad, creative, pixel, lead form. Nếu chưa kết nối, team vẫn làm việc dựa trên số liệu bạn đưa trong brief.

## Cấu trúc
| Đường dẫn | Nội dung |
|---|---|
| `index.html`, `css/`, `js/` | Web văn phòng pixel (không cần cài gì) |
| `data/state.js` | Trạng thái văn phòng — Claude Code cập nhật |
| `briefs/` | Brief của Leader |
| `reports/` | Báo cáo tổng hợp |
| `CLAUDE.md` | Quy tắc vận hành cho Claude Code |
| `.claude/agents/` | 6 sub-agent |
| `.claude/commands/` | Lệnh `/brief`, `/bao-cao` |
| `.claude/hooks/meta-ads-readonly.js` | Chặn thao tác ghi lên tài khoản quảng cáo |
