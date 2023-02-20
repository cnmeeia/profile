let $ = {
YouTube:'https://www.youtube.com',
!(async () => {
await Promise.all([http('YouTube')]).then((x)=>{
	$done({
    title: '连通测试',
    content: x.join(''),
  })})})();
function http(req) {
    return new Promise((r) => {
			let time = Date.now();
        $httpClient.post($[req], (err, resp, data) => {
            r(req +':' +(Date.now() - time)+'ms'+' '+' ');
        });});}