// Định nghĩa cố định của văn phòng: ai ngồi đâu, trông thế nào.
// `model` chỉ để hiển thị — phải khớp dòng `model:` trong .claude/agents/<id>.md.
// Dữ liệu thay đổi (trạng thái, báo cáo) nằm ở data/state.js do Claude Code cập nhật.

window.TEAM = {
  leader: {
    id: "leader",
    no: "01",
    name: "Leader",
    title: "Bạn — Leader tổng",
    sub: "Ra brief · duyệt đề xuất · tự set Ads",
    look: { hair: "#2b1d16", skin: "#f2c6a0", shirt: "#27304a", pants: "#1b2032", hairStyle: "short", crown: true },
  },
  assistant: {
    id: "assistant",
    no: "CC",
    name: "Claude Code",
    title: "Trợ lý điều phối & báo cáo",
    sub: "Nhận brief · giao việc · tổng hợp báo cáo",
  },
  agents: [
    {
      id: "strategy-research", model: "sonnet", no: "02", name: "Strategy & Research", short: "STRATEGY",
      sub: "Nghiên cứu & chiến lược", prop: "target",
      look: { hair: "#5a3825", skin: "#f0c09a", shirt: "#3f7f6b", pants: "#2c3a4a", hairStyle: "short" },
    },
    {
      id: "creative-specialist", model: "sonnet", no: "03", name: "Creative Specialist", short: "CREATIVE",
      sub: "Content / hình / video", prop: "clapper",
      look: { hair: "#c25b7a", skin: "#f5cfae", shirt: "#e7a33e", pants: "#3b2f4a", hairStyle: "long" },
    },
    {
      id: "media-buyer", model: "opus", no: "04", name: "Media Buyer", short: "MEDIA BUYER",
      sub: "Đề xuất setup & ngân sách", prop: "megaphone",
      look: { hair: "#1d1d24", skin: "#d9a57c", shirt: "#3b6fb6", pants: "#232a3a", hairStyle: "spiky" },
    },
    {
      id: "tracking-crm", model: "sonnet", no: "05", name: "Tracking & CRM", short: "TRACKING",
      sub: "Pixel / CAPI / lead", prop: "eye",
      look: { hair: "#7a4a2a", skin: "#f3c9a4", shirt: "#7b5ea7", pants: "#2a2438", hairStyle: "bun" },
    },
    {
      id: "performance-analyst", model: "opus", no: "06", name: "Performance Analyst", short: "ANALYST",
      sub: "Phân tích & tối ưu", prop: "chart",
      look: { hair: "#3a2a20", skin: "#e8b48c", shirt: "#c9503f", pants: "#2b2b33", hairStyle: "glasses" },
    },
    {
      id: "compliance-qa", model: "sonnet", no: "07", name: "Compliance & QA", short: "COMPLIANCE",
      sub: "Chính sách & kiểm duyệt", prop: "shield",
      look: { hair: "#e0c070", skin: "#f6d3b5", shirt: "#4a8a3c", pants: "#26322a", hairStyle: "long" },
    },
    {
      id: "daily-reporter", model: "sonnet", no: "08", name: "Daily Reporter", short: "DAILY",
      sub: "Báo cáo Ads mỗi sáng", prop: "tv", daily: true,
      look: { hair: "#8a3a2a", skin: "#f1c7a3", shirt: "#6b4f8a", pants: "#2a2438", hairStyle: "glasses" },
    },
  ],
};

window.STATUS_LABEL = {
  idle: "Rảnh",
  working: "Đang làm",
  reporting: "Đang nộp báo cáo",
  waiting: "Chờ Leader duyệt",
  done: "Đã xong",
  alert: "Báo động!",
};
