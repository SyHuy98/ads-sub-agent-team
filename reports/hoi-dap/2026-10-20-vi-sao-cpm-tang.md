# Hỏi đáp: Vì sao CPM tăng từ 09/10 đến nay, nên làm gì?
- Ngày: 2026-10-20 · Tài khoản: NTSpa's Women (`act_826563696751473`) · Bộ phận: 06 Performance Analyst + 04 Media Buyer (lý do chọn: câu hỏi về chi phí → cần phân tích số liệu và soát cấu trúc/ngân sách)
- Nguồn: connector ADS_ANALYZS_FOR_NT_BEAUTY_SPA, chỉ đọc. Tool: `get_insights` (cấp tài khoản, campaign, ad set; breakdown `platform_position`), `bulk_get_insights`, `get_campaigns`, `get_adsets`, `get_adset_details`, `get_account_activities` (09–20/10), `estimate_audience_size`.

## Trả lời ngắn
CPM tăng **29%**, từ 93,3k (02–08/10) lên 120,3k (13–19/10). Nguyên nhân chính là **tài khoản tự đấu giá với chính mình**. Từ 13/10, 2 tệp quảng cáo giống hệt nhau là "Fashionista" và "Mommy" bị nhân ra 13 ad set nằm trong 8 campaign. Ngân sách bị sửa khoảng 30 lần trong 12 ngày. Ngân sách cũng bị rút khỏi campaign rẻ nhất (Lách 20Jan, CPM 67–84k).

Thiệt hại thật **không phải CPM** mà là **số tin nhắn giảm 30%** (492 còn 346/tuần). Chi phí/tin nhắn chỉ tăng 12% (93k lên 105k), còn chi phí/lead giảm 10%.

Cách sửa: mỗi tệp chỉ giữ 1 ad set tốt nhất, và ngừng sửa ngân sách 72 giờ.

## Bằng chứng
| Giai đoạn | Chi tiêu | CPM | CTR | Tin nhắn | Chi phí/tin nhắn | Lead | Chi phí/lead |
|---|---|---|---|---|---|---|---|
| 02–08/10 | 45,86tr | 93.309đ | 1,52% | 492 | 93,2k | 64 | 717k |
| 13–19/10 | 36,23tr | 120.297đ | 1,98% | 346 | 104,7k | 56 | 647k |

- **Trùng tệp** (dữ liệu ad set, 13–19/10). Trong cùng một tệp, ad set gốc rẻ hơn hẳn các bản sao:
  - Tệp Fashionista có 7 ad set: bản gốc CPM **78,6k**, các bản sao trung bình **140k**.
  - Tệp Mommy có 6 ad set: bản gốc CPM **84k**, các bản sao trung bình **127k**.
  - Có **58% chi tiêu** (21,0/36,2tr) rơi vào 2 tệp này. Hiện vẫn còn 4 ad set Mommy và 3 ad set Fashionista đang chạy.
- **Ngân sách đổi liên tục**: 30 lần sửa ngân sách campaign trong 09–20/10. Ví dụ NuVP_T9 bị sửa 4 lần chỉ trong ngày 13/10. Cũng trong giai đoạn này có 14 ad set mới, 36 ad mới và 133 lần bật/tắt ad.
- **Không đủ dữ liệu để thoát learning**: 6,3tr/ngày ÷ khoảng 100k/tin nhắn ≈ 63 tin nhắn/ngày, chia cho 11 ad set thì mỗi ad set được khoảng 40 tin nhắn/tuần. Mức cần là khoảng 50, chỉ Nách 12Jun (50) và NamLGBT (59) đạt.
- **Rút ngân sách khỏi campaign rẻ**: Lách 20Jan (CPM 67k) giảm từ 36,4% xuống 12,7% tổng chi tiêu. Tối 13/10 ngân sách bị hạ 3tr → 500k trong vòng 1 giờ.
  - Ước tính: thay đổi cơ cấu chi tiêu giải thích khoảng 40% mức tăng CPM, giá từng campaign tăng giải thích khoảng 60%.
- **Tệp hẹp bão hoà**:
  - NuVP_T9: reach giảm từ 21,6k xuống 14,2k dù chi tiêu tăng 39%; chi phí/tin nhắn từ 52k lên 104k.
  - NamLGBT: reach 14k, tần suất 7 ngày 2,44, CPM 172k.
- **Vị trí hiển thị** (yếu tố phụ, khoảng +7k CPM): các vị trí rẻ giảm từ 66% xuống 53% lượt hiển thị. Phần lớn các lượt rẻ bị mất vốn kém chất lượng, ví dụ IG Reels CTR 0,38%, 165k/tin nhắn. Vì vậy CTR toàn tài khoản tăng.
- **Ngừng phân phối vì thanh toán**: 19/10 từ 04:32 đến 09:17, khoảng 4h45.
- Xu hướng gần nhất: CPM đạt đỉnh 141k ngày 17/10, đã giảm còn 114,5k (18/10) và 104,6k (19/10).

## Phân tích từng bộ phận
### 06 Performance Analyst
- CPM tăng do 2 phần: khoảng 40% vì ngân sách dịch sang các campaign đắt (CPM 140–170k), khoảng 60% vì giá từng campaign tăng.
- Giá từng campaign tăng vì: NuVP_T9 bão hoà, các bản Dup13Oct đang học lại, và campaign liên tục bị sửa ngân sách.
- Tần suất toàn tài khoản vẫn ổn (1,26–1,50), nghĩa là tài khoản chưa bão hoà; chỉ một vài tệp hẹp bị bão hoà.
- Giữ vị trí Advantage+.

### 04 Media Buyer
- Mọi campaign đều dùng chung một kiểu: mục tiêu Sales, tối ưu Conversations, đặt ngân sách cấp campaign (CBO), bật Advantage+ audience và Advantage+ placements. Vị trí hiển thị **không phải** nguyên nhân chính.
- Nguyên nhân về cấu trúc là trùng interest giữa các campaign (đã so ID interest: giống nhau 100%), cộng với việc các ad set tìm khách mới chưa loại trừ khách cũ.
- Tệp Fashionista khoảng 4,4–5,1 triệu người, không hẹp. CPM cao vì tệp bị chia cho nhiều ad set.
- Chi phí/tin nhắn theo ad set (13–19/10), từ tốt đến kém:
  - Lách Dup › Mommy **82k** · NuVP_T9 › Triệt lông **81k** · TONGHOP 85k (mới có 7 tin nhắn)
  - Nách gốc 91k · Lách gốc khoảng 100k · NamLGBT 100k
  - NuSauSinh_T10 112k · NuSauSinh_T9 › Trị thâm 131k · Lách Dup › Fashionista 131k
  - HIFU 148k · ABO 171k

## Việc Leader có thể làm
| # | Ưu tiên | Việc | Ở đâu | Giá trị cụ thể | Từ bộ phận |
|---|---|---|---|---|---|
| 1 | cao | Ngừng sửa ngân sách | Ads Manager › Campaigns | Giữ nguyên tới sáng 23/10. Sau đó mỗi lần tối đa ±20%, cách nhau ≥ 48h | 04 + 06 |
| 2 | cao | Tệp Mommy chỉ giữ 1 ad set | Ads Manager › Ad sets | Giữ **Lách Dup13Oct › INTEREST-20KM-MOMMY** (82k). Tắt **NuSauSinh_T9 › Trị thâm MESS** và **TONGHOP_T10 › NUSAUSINH**. Tắt campaign **NuSauSinh_T10** | 04 |
| 3 | cao | Tệp Fashionista chỉ giữ 1 ad set | Ads Manager › Ad sets | Giữ **NuVP_T9 › Triệt lông MESS** (81k). Tắt **Lách Dup13Oct › INTEREST-10KM-FASHIONISTA** và **TONGHOP_T10 › NUVP**. Khi TONGHOP_T10 không còn ad set chạy thì tắt luôn campaign | 04 |
| 4 | cao | Không để tài khoản ngừng vì thanh toán | Billing & payments | Nạp trước hoặc thêm thẻ dự phòng, bật thanh toán tự động | 04 + 06 |
| 5 | trung bình | Dồn ngân sách vừa giải phóng, tăng dần | Ads Manager › Campaigns | Ngày 23/10: Lách Dup13Oct 1.000.000 → 1.200.000; NuVP_T9 800.000 → 960.000 | 04 |
| 6 | trung bình | Làm mới creative cho các tệp đã bão hoà | Ads Manager › Ads | NuVP_T9: thêm 2–3 creative mới (giao 03 Creative). NamLGBT: thêm creative, không tăng ngân sách | 06 |
| 7 | trung bình | Sau 23/10: nới tệp NamLGBT và loại trừ khách cũ | Ad set › Audience | NamLGBT: đổi pin 10km Q10 thành HCM + 20km. Các ad set tìm khách mới: Exclude `engagement_last7days`, `KH NTSPA`, `customer_fp`. Làm cả hai trong cùng một lần sửa | 04 |
| 8 | thấp | HIFU | NuVP_T9 › HIFU | Đến 27/10 mà dưới 5 tin nhắn/7 ngày thì tắt, chuyển ad sang ad set Triệt lông | 04 |
| 9 | thấp | Đặt KPI theo chi phí/tin nhắn thay vì CPM | Bàn Leader › KPI (`/kpi`) | Gợi ý: chi phí/tin nhắn tối đa 120.000; CPM chỉ đáng lo khi trên 150k **và** CTR dưới 1,5% | 06 |

Tiêu chí đo lại vào 23/10 và 27/10, so với 13–19/10:
- Mục tiêu: CPM dưới 110k, chi phí/tin nhắn ≤ 100k.
- Tắt ad set khi đã chi ≥ 300k mà chi phí/tin nhắn trên 150k.
- Tăng 20% ngân sách khi chi phí/tin nhắn ≤ 85k và đạt ≥ 7 tin nhắn/ngày trong 3 ngày liền.

## Cần Leader quyết
1. **Campaign chính là campaign nào?**
   - (A) Giữ các ad set cũ có chi phí/tin nhắn tốt: Lách Dup › Mommy và NuVP_T9 › Triệt lông. Team khuyên chọn hướng này.
   - (B) Dồn hết vào TONGHOP_T10, campaign bạn vừa tăng lên 1tr sáng nay. Hướng này phải học lại từ đầu.
   - Chọn hướng nào cũng được, miễn mỗi tệp chỉ còn 1 ad set.
2. **Có bật lại Lách 20Jan bản gốc không?** Bạn đã tắt bản này lúc 10:00 ngày 20/10. Bản gốc có CPM thấp nhất, nhưng chi phí/tin nhắn tương đương bản Dup. Team khuyên **không** bật lại để tránh trùng tệp.
3. **Mục tiêu tuần này:**
   - Giữ **số lượng tin nhắn**: tổng ngân sách quay về khoảng 6,5tr/ngày.
   - Hay giữ **chi phí/tin nhắn dưới 100k**: giữ mức ngân sách hiện tại.

## Còn chưa chắc / cần thêm dữ liệu
- Tỷ lệ 40/60 giữa "thay đổi cơ cấu chi tiêu" và "giá từng campaign tăng" là ước tính chéo, không phải con số tuyệt đối.
- Chưa có nhãn Learning chính xác và kích thước tệp Mommy/NamLGBT, vì connector ADS_ANALYZS báo **hết lượt dùng thử trong tuần (gói Free Pipeboard)**. Cần xem cột "Delivery" và ước tính tệp ngay trong Ads Manager.
- Số tin nhắn 18–19/10 còn có thể tăng thêm, vì action được tính trong cửa sổ 7 ngày.
- Yếu tố thị trường (mùa vụ, đối thủ) chưa được kiểm tra. Có thể hỏi tiếp: `/hoi Đối thủ đang chạy gì tuần này? [giao: strategy-research]`.
- Lưu ý: bạn đã tự tăng Lách Dup13Oct lên 1tr vào sáng 20/10, nên các đề xuất ở trên đã tính từ mức 1tr.
