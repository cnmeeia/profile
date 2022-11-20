let url = "http://ip-api.com/json"
$httpClient.get(url, function(error, response, data){
    let jsonData = JSON.parse(data)
    let country = jsonData.country
    let isp = jsonData.isp
    let ip = jsonData.query
  body = {
    title: "Server",
    content: `${country} ➟ ${ip}`,
  }
  $done(body);
});