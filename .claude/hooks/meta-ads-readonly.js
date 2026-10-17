#!/usr/bin/env node
// PreToolUse hook: chặn mọi tool GHI của các MCP server quảng cáo (Meta/Facebook/Instagram/Ads).
// Team chỉ được đọc & góp ý — Leader tự thực hiện mọi thay đổi trên Ads Manager.
// Chỉ cho qua các tool đọc (get/list/search/estimate/insights...). Tool lạ → chặn.

const ADS_SERVER = /(meta|facebook|instagram|ads)/i;
const READ_ONLY = new RegExp(
  "^(" + [
    "get_", "list_", "search", "bulk_get_", "bulk_search_", "estimate_", "check_", "compute_", "resolve_",
    "ads_get_", "ads_insights_", "ads_library_search$", "ads_account_get_",
    "ads_catalog_get_", "ads_catalog_list_", "ads_catalog_event_source_get",
    "ads_experiment_list_", "ads_experiment_check_", "ads_experiment_abtest_get_", "ads_experiment_lift_get_",
    "ads_pixel_event_read$", "ads_pixel_parameter_read$",
  ].join("|") + ")"
);

let raw = "";
process.stdin.on("data", (d) => (raw += d));
process.stdin.on("end", () => {
  let tool = "";
  try { tool = JSON.parse(raw).tool_name || ""; } catch (e) { process.exit(0); }

  const m = /^mcp__(.+)__([^_].*)$/.exec(tool);
  if (!m) process.exit(0);
  const [, server, action] = m;
  if (!ADS_SERVER.test(server)) process.exit(0);
  if (READ_ONLY.test(action)) process.exit(0);

  process.stderr.write(
    `CHẶN: "${action}" là thao tác ghi trên tài khoản quảng cáo. ` +
    "Team Ads chỉ được đọc dữ liệu và góp ý. Hãy chuyển thao tác này thành đề xuất từng bước " +
    "trong báo cáo để Leader tự thực hiện trên Ads Manager.\n"
  );
  process.exit(2);
});
