const REQUEST_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36',
    'Accept-Language': 'en',
}

// 即将登陆
const STATUS_COMING = 2
// 支持解锁
const STATUS_AVAILABLE = 1
// 不支持解锁
const STATUS_NOT_AVAILABLE = 0
// 检测超时
const STATUS_TIMEOUT = -1
// 检测异常
const STATUS_ERROR = -2

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36'


;
(async () => {
    let panel_result = {
        title: '流媒体解锁检测',
        content: '',
    }
    let panel = await $.msg(panel_result.title, '检测中...', '请稍候...')
    let result = await check()
    panel_result.content = result
    panel.setContent(panel_result.content)
    panel.title = panel_result.title
    $.done()
})()

async function check() {
    let result = ''
    let status = await checkStatus()
    if (status === STATUS_COMING) {
        result = '即将登陆'
    } else if (status === STATUS_AVAILABLE) {
        result = '支持解锁'
    } else if (status === STATUS_NOT_AVAILABLE) {
        result = '不支持解锁'
    } else if (status === STATUS_TIMEOUT) {
        result = '检测超时'
    } else if (status === STATUS_ERROR) {
        result = '检测异常'
    }
    return result
}

async function check_youtube_premium() {
    let inner_check = () => {
        return new Promise((resolve, reject) => {
            let option = {
                url: 'https://www.youtube.com/premium',
                headers: REQUEST_HEADERS,
            }
            $httpClient.get(option, function (error, response, data) {
                if (error != null || response.status !== 200) {
                    reject('Error')
                    return
                }

                if (data.indexOf('Premium is not available in your country') !== -1) {
                    resolve('Not Available')
                    return
                }

                let region = ''
                let re = new RegExp('"countryCode":"(.*?)"', 'gm')
                let result = re.exec(data)
                if (result != null && result.length === 2) {
                    region = result[1]
                } else if (data.indexOf('www.google.cn') !== -1) {
                    region = 'CN'
                } else {
                    region = 'US'
                }
                resolve(region)
            })
        })
    }

    let youtube_check_result = 'YouTube: '

    await inner_check()
        .then((code) => {
            if (code === 'Not Available') {
                youtube_check_result += '不支持解锁'
            } else {
                youtube_check_result += '已解锁 ➟ ' + code.toUpperCase()
            }
        })
        .catch((error) => {
            youtube_check_result += '检测失败，请刷新面板'
        })

    return youtube_check_result
}
