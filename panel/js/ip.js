let url = "http://ip-api.com/json"
$httpClient.get(url, function(error, response, data){
    let jsonData = JSON.parse(data)
    let Code = jsonData.countryCode
    let CT = jsonData.country
    let isp = jsonData.isp
    let ip = jsonData.query
  body = {
    title: "代理",
    content: `${CT} ➟ ${ip}`,
  }
  $done(body);
});