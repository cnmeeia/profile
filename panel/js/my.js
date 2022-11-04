let url = "http://ip-api.com/json"

$httpClient.get(url, function (error, response, data) {
    let jsonData = JSON.parse(data)
    let country = jsonData.country
    let city = jsonData.city
    let as = jsonData.as
    let ip = jsonData.query
    body = {
        title: "节点信息",
        content: `IP信息: ${query}\n运营商: ${as}\n所在地: ${country}`,
        icon: "globe.asia.australia.fill"
    }
    $done(body);
});
