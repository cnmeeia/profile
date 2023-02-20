let $ = {
HW:'http://connectivitycheck.platform.hicloud.com/generate_204',
YT:'https://www.youtube.com',
GH:'https://www.github.com'}
!(async () => {
await Promise.all([http('HW'),http('YT'),http('GH')]).then((x)=>{
	$done({
    title: '连通测试',
    content: x.join(''),
    icon: 'touchid',
    'icon-color': '#ECA42D',
  })})})();
function http(req) {
    return new Promise((r) => {
			let time = Date.now();
        $httpClient.post($[req], (err, resp, data) => {
            r(req +':' +(Date.now() - time)+'ms'+' '+' ');
        });});}