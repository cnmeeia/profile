let url = "http://ip-api.com/json"
$httpClient.get(url, function(error, response, data){
    let jsonData = JSON.parse(data)
    let as = jsonData.as
    let ip = jsonData.query
  body = {
    title: "代理",
    content: `IP ： ${ip}`,
  }
  $done(body);


});