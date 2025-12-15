
const url = "https://my.ippure.com/v1/info"

$httpClient.get(url, (err, resp, data) => {
  if (err) {
    $done({ title: "IP 纯净度", content: "请求失败", icon: "network.slash" })
    return
  }

  const j = JSON.parse(data)

  const flag = flagEmoji(j.countryCode)
  const nativeText = j.isResidential ? "✅ 是（原生）" : "🏢 否（机房/商业）"
  const risk = j.fraudScore

  // 根据风险系数判断等级
  let riskText = `风险系数：${risk}`
  let titleColor = "#007AFF" // 默认颜色

  if (risk >= 80) {
    riskText = `🛑 极高风险 (${risk})`
    titleColor = "#FF3B30" // 红色
  } else if (risk >= 70) {
    riskText = `⚠️ 高风险 (${risk})`
    titleColor = "#FF9500" // 橙色
  } else if (risk >= 40) {
    riskText = `🔶 中等风险 (${risk})`
    titleColor = "#FFCC00" // 黄色
  } else {
    riskText = `✅ 低风险 (${risk})`
    titleColor = "#34C759" // 绿色
  }


  $done({
    title: "IP 纯净度",
    content:
`IP：${j.ip}
${riskText}`,
    icon: risk >= 70 ? "exclamationmark.triangle.fill" : "checkmark.seal.fill",
    'title-color': titleColor // 设置标题颜色，突出风险状态
  })
})

function flagEmoji(code) {
  if (code.toUpperCase() === "TW") {
    code = "CN"
  }
  return String.fromCodePoint(
    ...code.toUpperCase().split('').map(c => 127397 + 