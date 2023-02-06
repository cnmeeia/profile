let url = "http://ip-api.com/json"
$httpClient.get(url, function(error, response, data){
    let jsonData = JSON.parse(data)
    let Code = jsonData.countryCode
    let isp = jsonData.isp
    let ip = jsonData.query
  body = {
    title: "代理",
    content: ` ${Code}➟ ${ip}`,
  }
  $done(body);
});