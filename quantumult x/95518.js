const token = $persistentStore.read("95518");

if (!token) {
  $notification.post("错误", "", "未配置 token，请先写入 my_token 到 persistentStore");
  console.log("token 不存在，请先执行：$persistentStore.write('你的token', 'my_token')");
  $done();
  
}

const url = `https://iot.ecej.com/app/device/model/detail/v1`;
const method = `POST`;
const headers = {
  'Content-Type': 'application/json',
  'Origin': 'https://iot.ecej.com',
  'withCredentials': 'true',
  'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148/ecejApp/6.4.5',
  'Authorization': `Bearer ${token}`,
  'Sec-Fetch-Mode': 'cors',
  'Host': 'iot.ecej.com',
  'Referer': 'https://iot.ecej.com/smart/ecej-gasMeter.html?token=f7189909dfa140298771f5f3fecc61de&cityId=62&appKey=202409280703525E228427D6AA52473811E6498709A092&deviceId=273809&deviceType=3',
  'Accept': 'application/json, text/plain, */*'
};
const body = JSON.stringify({
  deviceId: "273809",
  deviceType: "3"
});

const request = { url, method, headers, body };

$httpClient.post(request, (error, response, data) => {
  if (error) {
    console.log("请求失败：" + error);
    $notification.post("接口请求失败", "", error);
    $done();
    return;
  }

  if (response.status === 401) {
    $notification.post("Token 失效", "", "请重新写入 token 到 my_token");
    $done();
    return;
  }

  try {
    const json = JSON.parse(data);
    const d = json?.data;

    if (!d) {
      console.log("无效响应：data 字段为空");
      $notification.post("数据异常", "", "返回中无 data 字段");
      $done();
      return;
    }

    const date = d.recentReportTime.split(" ")[0];
    const balance = d.balance.toFixed(0);
    const predictUseDays = d.predictUseDays;
    const needCharge = d.needCharge;
    const accumulateTotal = d.accumulateTotal.toFixed(2);
    const yesterdayGasTotal = d.yesterdayGasTotal.toFixed(2);
    const gasPrice = d.gasPrice.toFixed(2);

    const cost = (balance / (yesterdayGasTotal * gasPrice)).toFixed(0);
    const cost2 = (yesterdayGasTotal * gasPrice).toFixed(1);
    const air = (balance / 2.99).toFixed(1); // 这行你留着备用

const content = [
  `昨日用气 ${yesterdayGasTotal} 立方，`+ `昨日费用 ${cost2} 元，`+`剩余余额 ${balance} 元`,
].join("\n");

    $notification.post(`燃气数据 ${date}`, "", content);
    console.log(content);

  } catch (e) {
    console.log("解析响应出错：" + e);
    console.log("原始响应：" + data);
    $notification.post("数据解析失败", "", e.message);
  }

  $done();
});