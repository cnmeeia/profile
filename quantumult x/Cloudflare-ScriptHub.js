// Clean Cloudflare ScriptHub — Quantumult X 纯净定时任务版

function md5cycle(x, k) {
  let a = x[0], b = x[1], c = x[2], d = x[3];
  function cmn(q, a, b, x, s, t) {
    a = (a + q + x + t) | 0;
    return (((a << s) | (a >>> (32 - s))) + b) | 0;
  }
  function ff(a, b, c, d, x, s, t) { return cmn((b & c) | (~b & d), a, b, x, s, t); }
  function gg(a, b, c, d, x, s, t) { return cmn((b & d) | (c & ~d), a, b, x, s, t); }
  function hh(a, b, c, d, x, s, t) { return cmn(b ^ c ^ d, a, b, x, s, t); }
  function ii(a, b, c, d, x, s, t) { return cmn(c ^ (b | ~d), a, b, x, s, t); }

  a = ff(a, b, c, d, k[0], 7, -680876936);
  d = ff(d, a, b, c, k[1], 12, -389564586);
  c = ff(c, d, a, b, k[2], 17, 606105819);
  b = ff(b, c, d, a, k[3], 22, -1044525330);
  a = ff(a, b, c, d, k[4], 7, -176418897);
  d = ff(d, a, b, c, k[5], 12, 1200080426);
  c = ff(c, d, a, b, k[6], 17, -1473231341);
  b = ff(b, c, d, a, k[7], 22, -45705983);
  a = ff(a, b, c, d, k[8], 7, 1770035416);
  d = ff(d, a, b, c, k[9], 12, -1958414417);
  c = ff(c, d, a, b, k[10], 17, -42063);
  b = ff(b, c, d, a, k[11], 22, -1990404162);

  a = gg(a, b, c, d, k[1], 5, -165796510);
  d = gg(d, a, b, c, k[6], 9, -1069501632);
  c = gg(c, d, a, b, k[11], 14, 643717713);

  a = hh(a, b, c, d, k[5], 4, -378558);
  d = hh(d, a, b, c, k[8], 11, -2022574463);
  c = hh(c, d, a, b, k[11], 16, 1839030562);

  a = ii(a, b, c, d, k[0], 6, -198630844);
  d = ii(d, a, b, c, k[7], 10, 1126891415);
  c = ii(c, d, a, b, k[14], 15, -1416354905);
  b = ii(b, c, d, a, k[5], 21, -57434055);

  x[0] = (a + x[0]) | 0;
  x[1] = (b + x[1]) | 0;
  x[2] = (c + x[2]) | 0;
  x[3] = (d + x[3]) | 0;
}

function md5blk(s) {
  const md5blks = [];
  for (let i = 0; i < 64; i += 4)
    md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24);
  return md5blks;
}

function md51(s) {
  const n = s.length;
  const state = [1732584193, -271733879, -1732584194, 271733878];
  let i;
  for (i = 64; i <= n; i += 64) md5cycle(state, md5blk(s.substring(i - 64, i)));
  s = s.substring(i - 64);

  const tail = new Array(16).fill(0);
  for (i = 0; i < s.length; i++) tail[i >> 2] |= s.charCodeAt(i) << (i % 4 << 3);
  tail[i >> 2] |= 0x80 << (i % 4 << 3);
  if (i > 55) {
    md5cycle(state, tail);
    for (i = 0; i < 16; i++) tail[i] = 0;
  }
  tail[14] = n * 8;
  md5cycle(state, tail);
  return state;
}

function rhex(n) {
  const s = "0123456789abcdef";
  let j, str = "";
  for (j = 0; j < 4; j++)
    str += s.charAt((n >> (j * 8 + 4)) & 0x0f) + s.charAt((n >> (j * 8)) & 0x0f);
  return str;
}

function md5(s) {
  return rhex(md51(s).map(rhex).join(""));
}


// ----------------------------
// 主逻辑
// ----------------------------

const time = Date.now().toString();
const key = md5(md5("DdlTxtN0sUOu") + "70cloudflareapikey" + time);
const url = `https://api.uouin.com/api/cloudflareip?key=${key}&time=${time}`;

const myRequest = {
  url,
  method: "GET",
  headers: {
    "User-Agent": "Mozilla/5.0",
    Accept: "application/json",
    Referer: "https://api.uouin.com/cloudflare.html"
  }
};

function getBestIP(data) {
  const ipList = data.filter(i => i.type === "best");
  const scored = ipList.map(v => {
    const ping = parseFloat(v.ping);
    const bw = parseFloat(v.bandwidth.replace("mb", ""));
    return { ip: v.ip, score: (100 - ping) * 0.5 + bw * 0.5 };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.ip || "无可用IP";
}

$task.fetch(myRequest).then(response => {
  try {
    const json = JSON.parse(response.body).data;

    const ct = getBestIP(json.ct.info);
    const cm = getBestIP(json.cmcc.info);
    const cu = getBestIP(json.cucc.info);
    const intl = getBestIP(json.international.info);

    const msg = `电信：${ct}\n移动：${cm}\n联通：${cu}\n国际：${intl}`;
    $notify("Cloudflare IP", "", msg);
    $done();
  } catch (e) {
    $notify("Cloudflare IP", "解析失败", e.message);
    $done();
  }
}, error => {
  $notify("Cloudflare IP", "请求失败", error);
  $done();
});