let url = "http://ip-api.com/json"

$httpClient.get(url, function (error, response, data) {
    let jsonData = JSON.parse(data)
    let country = jsonData.country
    let emoji = getFlagEmoji(jsonData.countryCode)
    let city = jsonData.city
    let isp = jsonData.isp
    let ip = jsonData.query
    body = {
        title: "节点信息",
        content: `IP信息：${query}\n运营商：${timezone}\n所在地：${country}`,
        icon: "globe.asia.australia.fill"
    }
    $done(body);
});

function getFlagEmoji(countryCode) {
    if (countryCode.toUpperCase() == 'TW') {
        countryCode = 'CN'
    }
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt())
    return String.fromCodePoint(...codePoints)

}
