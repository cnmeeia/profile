let url = "http://ip-api.com/json"
$httpClient.get(url, function(error, response, data){
    let jsonData = JSON.parse(data)
    let countryCode = jsonData.countryCode
    let isp = jsonData.isp
    let ip = jsonData.query
  body = {
    title:"Server"
    content: `${countryCode} ➟ ${ip}`,
  }
  $done(body);
});