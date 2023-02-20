
let url = "https://ipinfo.io/json"
$httpClient.get(url, function(error, response, data){
    let jsonData = JSON.parse(data)
    let ip = jsonData.ip
    let city = jsonData.city
  body = {
    title: "运营商",
    content: `${city} ➟ ${ip}`,
  }
  $done(body);
});