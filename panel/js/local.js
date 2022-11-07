let url = "https://whois.pconline.com.cn/ipJson.jsp?json=true"
$httpClient.get(url, function(error, response, data){
    let jsonData = JSON.parse(data)
    let addr = jsonData.pro
    let ip = jsonData.ip
  body = {
    title: "本地网络",
    content: `IP ： ${ip}\nAS：${addr}`,
  }
  $done(body);
});