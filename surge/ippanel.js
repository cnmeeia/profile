const URL = "https://my.ippure.com/v1/info";
const TIMEOUT = 8; // 秒

$httpClient.get({ url: URL, timeout: TIMEOUT }, (err, resp, body) => {
  if (err) return doneFail("请求失败", "network.slash");

  const j = safeJSON(body);
  if (!j) return doneFail("JSON 解析失败", "exclamationmark.triangle.fill");

  const ip = toText(j.ip, "N/A");
  const risk = toNumber(j.fraudScore, NaN);

  const level = riskLevel(risk);

  $done({
    title: "IP 纯净度",
    content: `🟢 IP：${ip}\n${level.text}`,
    icon: level.icon,
    "icon-color": level.color,     // icon + icon-color 官方支持 [web:1]
    "title-color": level.color
  });
});

function doneFail(msg, icon) {
  $done({ title: "IP 纯净度", content: msg, icon });
}

function safeJSON(s) {
  try { return JSON.parse(s); } catch (_) { return null; }
}

function toText(v, fallback) {
  return (v === undefined || v === null || v === "") ? fallback : String(v);
}

function toNumber(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function riskLevel(risk) {
  if (!Number.isFinite(risk)) {
    return { text: "风险系数：N/A", icon: "questionmark.circle.fill", color: "#8E8E93" };
  }
  if (risk >= 80) return { text: `🛑 极高风险 (${risk})`, icon: "xmark.shield.fill", color: "#FF3B30" };
  if (risk >= 70) return { text: `⚠️ 高风险 (${risk})`,   icon: "exclamationmark.triangle.fill", color: "#FF9500" };
  if (risk >= 40) return { text: `🔶 中等风险 (${risk})`, icon: "shield.lefthalf.filled", color: "#FFCC00" };
  return { text: `✅ 低风险 (${risk})`, icon: "checkmark.seal.fill", color: "#34C759" };
}
