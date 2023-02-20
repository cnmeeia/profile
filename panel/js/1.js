

!(async () => {
await Promise.all([http('Youtube')]).then((x)=>{
	$done({
    title: '网络延迟',
    content: x.join(),
  })
})
})();

function http(req) {
    return new Promise((r) => {
			let time = Date.now();
        $httpClient.post($[req], (err, resp, data) => {
            r(req +'\t:'+	(Date.now() - time)+'ms');
        });
    });
}