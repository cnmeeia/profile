const REQUEST_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36',
  'Accept-Language': 'en',
}

;(async () => {
  let panel_result = {
    title: '延迟测试',
    content: '',
  }

  await Promise.all([test_youtube(), test_github()])
    .then((result) => {
      let content = result.join('')
      panel_result['content'] = content
    })
    .finally(() => {
      $done(panel_result)
    })
})()


//keyyoutube
async function test_youtube() {
  let inner_check = () => {
    return new Promise((resolve) => {
      let option = {
        url: 'https://www.youtube.com',
        headers: REQUEST_HEADERS,
      }
      youtube_startTime = Date.now()
      $httpClient.post(option, function (error, response, data) {
        youtube_endTime = Date.now()
        resolve('1')
      })
    })
  }

  youtube_test_result =  '\xa0\YouTube'+' ➟ '
  await inner_check()
    .then((code) => {
      youtube_Delay = youtube_endTime-youtube_startTime + ""
      if (code === '1') {
        youtube_test_result += youtube_Delay + 'ms'+'\xa0\  '
      }
    })
  
  return youtube_test_result
}

////Github

async function test_github() {
  let inner_check = () => {
    return new Promise((resolve) => {
      let option = {
        url: 'https://www.github.com',
        headers: REQUEST_HEADERS,
      }
      github_startTime = Date.now()
      $httpClient.post(option, function (error, response, data) {
        github_endTime = Date.now()
        resolve('1')
      })
    })
  }

  github_test_result =  '\xa0\GitHub'+' ➟ '
  await inner_check()
    .then((code) => {
      github_Delay = github_endTime-github_startTime + ""
      if (code === '1') {
        github_test_result += github_Delay + 'ms'
      }
    })
  
  return github_test_result
}
