// Cấu hình team Ads — tài khoản theo dõi & ngưỡng KPI do Leader đặt (lệnh /kpi).
// Giữ dòng "window.ADS_CONFIG =" và để phần sau là JSON hợp lệ.
// Ngưỡng = null nghĩa là chưa đặt: báo cáo chỉ so với trung bình 7 ngày.
window.ADS_CONFIG = {
  "timezone": "Asia/Ho_Chi_Minh",
  "currency": "VND",
  "accounts": [
    { "id": "act_826563696751473", "name": "NTSpa's Women", "bm": "NT Spa Women", "active": true }
  ],
  "kpi": {
    "costPerMessage": null,
    "costPerLead": null,
    "dailyBudget": null,
    "maxFrequency": null,
    "minCtr": null,
    "spendDeviationPct": 30
  }
};
