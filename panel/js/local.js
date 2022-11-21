let url = "https://whois.pconline.com.cn/ipJson.jsp?json=true"
$httpClient.get(url, function(error, response, data){
    let jsonData = JSON.parse(data)
    let addr = jsonData.addr
    let ip = jsonData.ip
  body = {
    content: `本地 ➟ ${ip}`,
  }
  $done(body);
});