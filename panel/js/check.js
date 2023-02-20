//由本群重庆佬提供，key和小白脸大佬修改完善。
let $ = {
Baidu:'https://www.baidu.com',
Youtube:'https://www.youtube.com/'
}

!(async () => {
await Promise.all([http('Baidu'),http('Youtube')]).then((x)=>{
	$done({
    title: 'Network Connectivity Test',
    content: x.join(),
  })
})
})();

function http(req) {
    return new Promise((r) => {
			let time = Date.now();
        $httpClient.post($[req], (err, resp, data) => {
            r(req +
						'\xa0\xa0\xa0\xa0\xa0\t: ' +
						(Date.now() - time)+' ms');
        });
    });
}