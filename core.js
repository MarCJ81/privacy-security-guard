/* ============================================================
   보안 가드 · core.js
   모든 검사 로직. DOM·네트워크와 완전히 분리되어 있고
   Node(테스트)와 브라우저(앱)에서 같은 코드가 돕니다.
   서버 전송 0% — 이 파일에는 fetch/XHR 호출이 한 줄도 없습니다.
   ============================================================ */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.GuardCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  /* ──────────────────────────────────────────────────────────
     1. 개인정보(PII) 탐지 · 마스킹
     ────────────────────────────────────────────────────────── */

  var PII_TYPES = {
    rrn:     { label: '주민등록번호', tone: 'critical', order: 100 },
    card:    { label: '카드번호',     tone: 'critical', order: 90 },
    account: { label: '계좌번호',     tone: 'critical', order: 80 },
    brn:     { label: '사업자번호',   tone: 'high',     order: 86 },
    mobile:  { label: '휴대폰',       tone: 'high',     order: 60 },
    tel:     { label: '전화번호',     tone: 'mid',      order: 50 },
    email:   { label: '이메일',       tone: 'mid',      order: 40 },
    ip:      { label: 'IP 주소',      tone: 'low',      order: 30 }
  };

  function onlyDigits(s) { return String(s).replace(/\D/g, ''); }

  function luhn(value) {
    var d = onlyDigits(value);
    if (d.length < 13 || d.length > 19) return false;
    var sum = 0, alt = false;
    for (var i = d.length - 1; i >= 0; i--) {
      var n = Number(d[i]);
      if (alt) { n *= 2; if (n > 9) n -= 9; }
      sum += n;
      alt = !alt;
    }
    return sum % 10 === 0;
  }

  function rrnValid(value) {
    var d = onlyDigits(value);
    if (d.length !== 13) return false;
    var w = [2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4, 5], s = 0;
    for (var i = 0; i < 12; i++) s += Number(d[i]) * w[i];
    return (11 - (s % 11)) % 10 === Number(d[12]);
  }

  function brnValid(value) {
    var d = onlyDigits(value);
    if (d.length !== 10) return false;
    var w = [1, 3, 7, 1, 3, 7, 1, 3, 5], s = 0;
    for (var i = 0; i < 9; i++) s += Number(d[i]) * w[i];
    s += Math.floor(Number(d[8]) * 5 / 10);
    return (10 - (s % 10)) % 10 === Number(d[9]);
  }

  /** 값 안의 숫자 중 keep 집합에 든 자리만 남기고 나머지 숫자를 * 로 바꿉니다. */
  function maskWith(input, keepIdx) {
    var chars = String(input).split('');
    return chars.map(function (c, i) {
      return keepIdx.indexOf(i) >= 0 ? c : (/[0-9]/.test(c) ? '*' : c);
    }).join('');
  }

  function maskPII(type, value) {
    var v = String(value);
    var dpos = [];
    for (var i = 0; i < v.length; i++) if (/[0-9]/.test(v[i])) dpos.push(i);
    var n = dpos.length;
    var keep = [];
    var head = function (k) { keep = keep.concat(dpos.slice(0, Math.min(k, n))); };
    var tail = function (k) { keep = keep.concat(dpos.slice(Math.max(0, n - k))); };
    var sep = v.search(/[-\s./]/);

    switch (type) {
      case 'rrn':
        head(7);                                   /* 900101-1****** */
        break;
      case 'card':
        head(4); tail(4);                          /* 1234-****-****-5678 */
        break;
      case 'brn':
        head(3);                                   /* 123-**-***** */
        break;
      case 'mobile':
        head(3); tail(4);                          /* 010-****-5678 */
        break;
      case 'tel': {
        var area = sep > 0 ? onlyDigits(v.slice(0, sep)).length : 3;
        var areaKeep = (area + 4 < n) ? area : 0;   /* 1588-1234 처럼 짧으면 지역번호도 가림 */
        head(areaKeep); tail(4);
        break;
      }
      case 'account':
        tail(4);                                   /* ***-***-**6789 */
        break;
      case 'ip': {
        if (v.indexOf(':') >= 0) {
          var seg = v.split(':');
          return seg.map(function (p, idx) {
            return idx < 2 ? p : p.replace(/[0-9a-f]/gi, '*');
          }).join(':');
        }
        var parts = v.split('.');
        return parts.map(function (p, idx) {
          return idx < 2 ? p : p.replace(/[0-9a-f]/gi, '*');
        }).join('.');
      }
      case 'email': {
        var at = v.lastIndexOf('@');
        if (at < 0) return v;
        var local = v.slice(0, at), domain = v.slice(at + 1);
        var keepN = local.length >= 3 ? 2 : 1;
        return local.slice(0, keepN) + '***@' + domain;
      }
      default:
        break;
    }
    return maskWith(v, keep);
  }

  /* 탐지기: 우선순위 높은 것부터. 이미 잡힌 구간과 겹치면 건너뜁니다. */
  var DETECTORS = [
    {
      type: 'rrn', order: 100,
      find: function (text) {
        var out = [], re = /(?<!\d)\d{6}[-\s]?[1-8]\d{6}(?!\d)/g, m;
        while ((m = re.exec(text))) {
          var ok = rrnValid(m[0]);
          out.push({
            start: m.index, end: m.index + m[0].length, value: m[0],
            note: ok ? '체크섬 통과' : '형식 일치 · 체크섬 불일치',
            confidence: ok ? 'high' : 'low'
          });
        }
        return out;
      }
    },
    {
      type: 'brn', order: 86,
      find: function (text) {
        var out = [], m;
        var reDash = /(?<!\d)\d{3}-\d{2}-\d{5}(?!\d)/g;
        while ((m = reDash.exec(text))) {
          var ok = brnValid(m[0]);
          out.push({
            start: m.index, end: m.index + m[0].length, value: m[0],
            note: ok ? '체크섬 통과' : '형식 일치 · 체크섬 불일치',
            confidence: ok ? 'high' : 'low'
          });
        }
        var reFlat = /(?<!\d)\d{10}(?!\d)/g;
        while ((m = reFlat.exec(text))) {
          if (m[0][0] === '0') continue;
          if (!brnValid(m[0])) continue;
          out.push({
            start: m.index, end: m.index + m[0].length, value: m[0],
            note: '체크섬 통과 · 구분자 없음', confidence: 'mid', flat: true
          });
        }
        return out;
      }
    },
    {
      type: 'card', order: 90,
      find: function (text) {
        var out = [], m;
        var res = [
          /(?<!\d)\d{4}([ -])\d{4}\1\d{4}\1\d{4}(?!\d)/g,
          /(?<!\d)\d{4}[ -]\d{4}[ -]\d{4}[ -]\d{4}(?!\d)/g,
          /(?<!\d)\d{15}(?!\d)/g,
          /(?<!\d)\d{16}(?!\d)/g
        ];
        res.forEach(function (re) {
          while ((m = re.exec(text))) {
            var d = onlyDigits(m[0]);
            if (d.length < 13 || d.length > 19) continue;
            if (d[0] === '0') continue;
            if (!luhn(d)) continue;
            out.push({
              start: m.index, end: m.index + m[0].length, value: m[0],
              note: 'Luhn 검증 통과', confidence: 'high'
            });
          }
        });
        return out;
      }
    },
    {
      type: 'mobile', order: 60,
      find: function (text) {
        var out = [], m;
        var res = [
          /(?<!\d)01[016789][-\s]?\d{3,4}[-\s]?\d{4}(?!\d)/g,
          /(?<!\d)\(?01[016789]\)?[-\s]?\d{3,4}[-\s]?\d{4}(?!\d)/g
        ];
        res.forEach(function (re) {
          while ((m = re.exec(text))) {
            out.push({ start: m.index, end: m.index + m[0].length, value: m[0], confidence: 'high' });
          }
        });
        return out;
      }
    },
    {
      type: 'tel', order: 50,
      find: function (text) {
        var out = [], m;
        var res = [
          /(?<!\d)0(?:2|[3-6][1-5]?)[-\s]\d{3,4}[-\s]\d{4}(?!\d)/g,
          /(?<!\d)\(?0(?:2|[3-6][1-5]?)\)?[-\s]\d{3,4}[-\s]\d{4}(?!\d)/g,
          /(?<!\d)1[5-9]\d{2}-\d{4}(?!\d)/g
        ];
        res.forEach(function (re) {
          while ((m = re.exec(text))) {
            out.push({ start: m.index, end: m.index + m[0].length, value: m[0], confidence: 'high' });
          }
        });
        return out;
      }
    },
    {
      type: 'account', order: 80,
      find: function (text) {
        var out = [], m;
        var re = /(?<!\d)\d{2,6}[-\s]\d{2,6}[-\s]\d{2,8}(?!\d)/g;
        while ((m = re.exec(text))) {
          var d = onlyDigits(m[0]);
          if (d.length < 10 || d.length > 16) continue;
          if (d[0] === '0') continue;
          out.push({
            start: m.index, end: m.index + m[0].length, value: m[0],
            note: '계좌번호 형식으로 추정', confidence: 'mid'
          });
        }
        /* "국민은행 123456-01-234567" 처럼 은행명이 붙은 경우 */
        var reBank = /(?:국민|신한|우리|하나|농협|기업|카카오뱅크|토스뱅크|케이뱅크|부산|대구|경남|광주|전북|제주|수협|새마을|우체국|SC제일|씨티)\s*(?:은행|뱅크)?\s*(\d[\d\-\s]{7,18}\d)/g;
        while ((m = reBank.exec(text))) {
          var raw = m[0].slice(m[0].length - m[1].length);
          var digits = onlyDigits(raw);
          if (digits.length < 9 || digits.length > 16) continue;
          var start = m.index + m[0].length - m[1].length;
          out.push({
            start: start, end: start + m[1].length, value: m[1],
            note: '은행명과 함께 표기됨', confidence: 'high'
          });
        }
        return out;
      }
    },
    {
      type: 'email', order: 40,
      find: function (text) {
        var out = [], re = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g, m;
        while ((m = re.exec(text))) {
          out.push({ start: m.index, end: m.index + m[0].length, value: m[0], confidence: 'high' });
        }
        return out;
      }
    },
    {
      type: 'ip', order: 30,
      find: function (text) {
        var out = [], m;
        var octet = '(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)';
        var re4 = new RegExp('(?<![\\d.])' + octet + '(?:\\.' + octet + '){3}(?![\\d.])', 'g');
        while ((m = re4.exec(text))) {
          out.push({ start: m.index, end: m.index + m[0].length, value: m[0], note: 'IPv4', confidence: 'high' });
        }
        var re6 = /(?<![\w:])([0-9a-fA-F]{1,4}(?::[0-9a-fA-F]{0,4}){2,7})(?![\w:])/g;
        while ((m = re6.exec(text))) {
          var v6 = m[0];
          var colons = (v6.match(/:/g) || []).length;
          var okForm = v6.indexOf('::') >= 0 ? colons >= 2 : colons === 7;
          if (!okForm) continue;
          out.push({ start: m.index, end: m.index + m[0].length, value: v6, note: 'IPv6', confidence: 'mid' });
        }
        return out;
      }
    }
  ];

  function detectPII(text) {
    var src = String(text == null ? '' : text);
    var taken = [];
    var findings = [];
    var ordered = DETECTORS.slice().sort(function (a, b) { return b.order - a.order; });

    ordered.forEach(function (det) {
      det.find(src).forEach(function (hit) {
        var clash = taken.some(function (r) { return hit.start < r.end && hit.end > r.start; });
        if (clash) return;
        taken.push({ start: hit.start, end: hit.end });
        findings.push({
          type: det.type,
          label: PII_TYPES[det.type].label,
          tone: PII_TYPES[det.type].tone,
          start: hit.start,
          end: hit.end,
          value: hit.value,
          masked: maskPII(det.type, hit.value),
          note: hit.note || '',
          confidence: hit.confidence || 'mid'
        });
      });
    });

    findings.sort(function (a, b) { return a.start - b.start; });

    var summary = {}, counts = {}, total = findings.length;
    Object.keys(PII_TYPES).forEach(function (k) { summary[k] = 0; counts[k] = 0; });
    findings.forEach(function (f) { summary[f.type] += 1; counts[f.label] = (counts[f.label] || 0) + 1; });

    var risk = 'none';
    if (findings.some(function (f) { return f.tone === 'critical'; })) risk = 'critical';
    else if (findings.some(function (f) { return f.tone === 'high'; })) risk = 'high';
    else if (total > 0) risk = 'mid';

    return { findings: findings, summary: summary, counts: counts, total: total, risk: risk };
  }

  function maskText(text, findings) {
    var src = String(text == null ? '' : text);
    var list = (findings || detectPII(src).findings).slice().sort(function (a, b) { return b.start - a.start; });
    var out = src;
    list.forEach(function (f) {
      out = out.slice(0, f.start) + f.masked + out.slice(f.end);
    });
    return out;
  }

  /* ──────────────────────────────────────────────────────────
     2. 피싱 · 스미싱 URL 진단
     ────────────────────────────────────────────────────────── */

  var BRANDS = [
    { name: '네이버', token: 'naver', domains: ['naver.com', 'naver.me'] },
    { name: '카카오', token: 'kakao', domains: ['kakao.com', 'kakaocorp.com'] },
    { name: '다음', token: 'daum', domains: ['daum.net'] },
    { name: '쿠팡', token: 'coupang', domains: ['coupang.com'] },
    { name: '구글', token: 'google', domains: ['google.com', 'google.co.kr', 'goo.gl'] },
    { name: '유튜브', token: 'youtube', domains: ['youtube.com', 'youtu.be'] },
    { name: '애플', token: 'apple', domains: ['apple.com', 'icloud.com'] },
    { name: '마이크로소프트', token: 'microsoft', domains: ['microsoft.com', 'live.com', 'office.com'] },
    { name: '삼성', token: 'samsung', domains: ['samsung.com', 'samsungcard.com'] },
    { name: '국민은행', token: 'kbstar', domains: ['kbstar.com', 'kbbank.co.kr', 'kbcard.com'] },
    { name: '신한은행', token: 'shinhan', domains: ['shinhan.com', 'shinhancard.com'] },
    { name: '우리은행', token: 'wooribank', domains: ['wooribank.com', 'wooricard.com'] },
    { name: '하나은행', token: 'hanabank', domains: ['hanabank.com', 'hanacard.co.kr'] },
    { name: '농협', token: 'nhbank', domains: ['nhbank.com', 'nonghyup.com'] },
    { name: '기업은행', token: 'ibk', domains: ['ibk.co.kr'] },
    { name: '토스', token: 'toss', domains: ['toss.im', 'tossbank.com'] },
    { name: '업비트', token: 'upbit', domains: ['upbit.com'] },
    { name: '빗썸', token: 'bithumb', domains: ['bithumb.com'] },
    { name: '페이팔', token: 'paypal', domains: ['paypal.com'] },
    { name: '아마존', token: 'amazon', domains: ['amazon.com', 'amazon.co.kr'] },
    { name: '넷플릭스', token: 'netflix', domains: ['netflix.com'] },
    { name: '인스타그램', token: 'instagram', domains: ['instagram.com'] },
    { name: '페이스북', token: 'facebook', domains: ['facebook.com', 'fb.com'] },
    { name: '텔레그램', token: 'telegram', domains: ['telegram.org', 't.me'] },
    { name: '깃허브', token: 'github', domains: ['github.com'] },
    { name: '홈택스', token: 'hometax', domains: ['hometax.go.kr'] },
    { name: '정부24', token: 'gov24', domains: ['gov.kr', 'gov24.go.kr'] },
    { name: 'CJ대한통운', token: 'cjlogistics', domains: ['cjlogistics.com'] },
    { name: '당근', token: 'daangn', domains: ['daangn.com', 'karrotmarket.com'] },
    { name: '배달의민족', token: 'baemin', domains: ['baemin.com', 'woowahan.com'] }
  ];

  var SHORTENERS = ['bit.ly', 't.co', 'goo.gl', 'vo.la', 'me2.do', 'han.gl', 'url.kr', 'tinyurl.com',
    'cutt.ly', 'is.gd', 'ow.ly', 'buly.kr', 'kko.to', 'naver.me', 'rebrand.ly', 't.ly', 'shorturl.at',
    'tiny.cc', 'rb.gy', 'linktr.ee', 'abidjan.net', 'han.gl'];

  var SUSPICIOUS_TLDS = ['tk', 'ml', 'ga', 'cf', 'gq', 'xyz', 'top', 'cyou', 'bond', 'icu', 'rest',
    'shop', 'store', 'online', 'site', 'live', 'link', 'click', 'zip', 'mov', 'kim', 'work', 'loan'];

  var DANGEROUS_EXT = ['apk', 'exe', 'scr', 'msi', 'bat', 'cmd', 'pif', 'vbs', 'vbe', 'js',
    'jse', 'wsf', 'wsh', 'hta', 'ps1', 'jar', 'lnk', 'reg', 'dll'];

  var URGENT_WORDS = ['긴급', '정지', '차단', '위험', '해지', '소멸', '미납', '연체', '압류', '환급',
    '지원금', '부고', '청첩장', '초대장', '택배', '배송', '주소변경', '본인인증', '인증', '재설정',
    '비밀번호', '계좌', '카드', '대출', '세금', '과태료', '범칙금', '로또', '당첨', '무료', '이벤트',
    'login', 'signin', 'verify', 'secure', 'account', 'update', 'confirm', 'unlock', 'password',
    'billing', 'invoice', 'refund', 'wallet', 'connect', 'support'];

  var SECOND_LEVEL = ['co.kr', 'or.kr', 'ne.kr', 're.kr', 'go.kr', 'ac.kr', 'pe.kr', 'hs.kr', 'ms.kr',
    'es.kr', 'sc.kr', 'kg.kr', 'co.jp', 'ne.jp', 'or.jp', 'go.jp', 'ac.jp', 'co.uk', 'org.uk',
    'gov.uk', 'ac.uk', 'com.cn', 'com.au', 'com.br', 'co.in', 'com.tw', 'com.hk', 'com.vn',
    'co.id', 'co.th', 'com.sg', 'com.mx', 'com.tr', 'com.ar', 'com.ua', 'co.za', 'com.es', 'co.nz'];

  function registrableDomain(host) {
    var labels = String(host || '').toLowerCase().replace(/\.$/, '').split('.').filter(Boolean);
    if (labels.length <= 1) return labels.join('.');
    var two = labels.slice(-2).join('.');
    if (SECOND_LEVEL.indexOf(two) >= 0) {
      return labels.length >= 3 ? labels.slice(-3).join('.') : two;
    }
    return two;
  }

  function levenshtein(a, b) {
    a = String(a); b = String(b);
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    var prev = new Array(b.length + 1);
    for (var j = 0; j <= b.length; j++) prev[j] = j;
    for (var i = 1; i <= a.length; i++) {
      var cur = [i];
      for (var k = 1; k <= b.length; k++) {
        var cost = a[i - 1] === b[k - 1] ? 0 : 1;
        cur[k] = Math.min(prev[k] + 1, cur[k - 1] + 1, prev[k - 1] + cost);
      }
      prev = cur;
    }
    return prev[b.length];
  }

  /* RFC 3492 퓨니코드 디코더 — xn-- 라벨이 실제로 어떤 글자인지 보여주기 위해 */
  function punycodeDecode(input) {
    var base = 36, tMin = 1, tMax = 26, skew = 38, damp = 700, initialBias = 72, initialN = 128;
    var output = [], n = initialN, i = 0, bias = initialBias, idx = 0;
    var basic = input.lastIndexOf('-');
    if (basic > 0) {
      for (var j = 0; j < basic; j++) output.push(input.charCodeAt(j));
      idx = basic + 1;
    } else {
      idx = 0;
    }
    function digit(c) {
      if (c >= 48 && c <= 57) return c - 22;
      if (c >= 65 && c <= 90) return c - 65;
      if (c >= 97 && c <= 122) return c - 97;
      return base;
    }
    function adapt(delta, numPoints, firstTime) {
      var k = 0;
      delta = firstTime ? Math.floor(delta / damp) : Math.floor(delta / 2);
      delta += Math.floor(delta / numPoints);
      while (delta > 455) { delta = Math.floor(delta / 35); k += base; }
      return Math.floor(k + 36 * delta / (delta + skew));
    }
    while (idx < input.length) {
      var oldi = i, w = 1, k;
      for (k = base; ; k += base) {
        if (idx >= input.length) throw new Error('punycode: truncated');
        var d = digit(input.charCodeAt(idx++));
        if (d >= base) throw new Error('punycode: bad digit');
        i += d * w;
        var t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
        if (d < t) break;
        w *= base - t;
      }
      var outLen = output.length + 1;
      bias = adapt(i - oldi, outLen, oldi === 0);
      n += Math.floor(i / outLen);
      i %= outLen;
      output.splice(i, 0, n);
      i++;
    }
    return String.fromCodePoint.apply(null, output);
  }

  var CONFUSABLES = {
    'а': 'a', 'е': 'e', 'о': 'o', 'р': 'p', 'с': 'c', 'у': 'y', 'х': 'x', 'і': 'i', 'ј': 'j',
    'ѕ': 's', 'ԁ': 'd', 'һ': 'h', 'ӏ': 'l', 'ԛ': 'q', 'ԝ': 'w', 'ɡ': 'g', 'ь': 'b', 'п': 'n',
    'о': 'o', 'α': 'a', 'ο': 'o', 'ρ': 'p', 'ν': 'v', 'ι': 'i', 'κ': 'k', 'τ': 't', 'υ': 'u',
    'χ': 'x', 'ε': 'e', 'а': 'a', 'ӓ': 'a', 'ё': 'e', '0': 'o', '1': 'l', '3': 'e', '5': 's'
  };

  function confusableNormalize(str) {
    var out = '';
    for (var i = 0; i < str.length; i++) {
      var ch = str[i], low = ch.toLowerCase();
      out += CONFUSABLES[low] || low;
    }
    return out;
  }

  function isNonAscii(str) { return /[^\x00-\x7F]/.test(str); }

  function analyzeUrl(input) {
    var raw = String(input == null ? '' : input).trim();
    if (!raw) return { ok: false, error: '링크를 입력해 주세요.' };

    var notes = [];
    var target = raw;
    if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(target)) {
      if (/^[a-z][a-z0-9+.-]*:/i.test(target) && !/^\d/.test(target)) {
        target = target.replace(/^([a-z][a-z0-9+.-]*):/i, '$1://');
        notes.push('스킴 형식을 보정해 해석했습니다.');
      } else {
        target = 'https://' + target;
        notes.push('스킴이 없어 https로 해석했습니다.');
      }
    }

    var u;
    try { u = new URL(target); }
    catch (e) { return { ok: false, error: 'URL 형식이 올바르지 않습니다. 주소를 다시 확인해 주세요.' }; }
    if (!/^https?:$/.test(u.protocol)) {
      return { ok: false, error: 'http·https 링크만 진단할 수 있습니다. (' + u.protocol + ')' };
    }

    var host = u.hostname.toLowerCase();
    var reg = registrableDomain(host);
    var labels = host.split('.').filter(Boolean);
    var regLabels = reg.split('.').filter(Boolean);
    var core = regLabels[0] || host;
    var suffix = regLabels.slice(1).join('.');
    var subLabels = labels.slice(0, Math.max(0, labels.length - regLabels.length));

    var decodedCore = core, decodeError = false;
    try {
      decodedCore = core.split('-').length && /^xn--/i.test(core) ? punycodeDecode(core.slice(4)) : core;
    } catch (e) { decodeError = true; }
    var decodedHost = labels.map(function (l) {
      if (!/^xn--/i.test(l)) return l;
      try { return punycodeDecode(l.slice(4)); } catch (e) { return l; }
    }).join('.');

    var reasons = [], positives = [];
    function add(id, title, detail, points, severity) {
      reasons.push({ id: id, title: title, detail: detail, points: points, severity: severity || 'warn' });
    }

    /* ── 1. 브랜드 사칭 ── */
    var exactBrand = null, brandHit = null;
    BRANDS.forEach(function (b) {
      if (b.domains.indexOf(reg) >= 0 || b.domains.some(function (d) { return host === d; })) exactBrand = b;
    });
    if (exactBrand) {
      positives.push(exactBrand.name + ' 공식 도메인(' + reg + ')입니다');
    } else {
      BRANDS.forEach(function (b) {
        if (brandHit && brandHit.points >= 62) return;
        var token = b.token;
        var normCore = confusableNormalize(decodedCore);
        var dist = levenshtein(decodedCore, token);
        var hit = null;

        if (decodedCore === token && b.domains.indexOf(reg) < 0) {
          hit = { points: 62, title: '브랜드 이름을 다른 도메인에 사용',
            detail: '“' + token + '”는 ' + b.name + '의 이름이지만 등록 도메인은 ' + reg + '입니다.' };
        } else if (normCore === token && decodedCore !== token) {
          hit = { points: 68, title: '글자 모양을 바꾼 브랜드 사칭 (호모그래프)',
            detail: '화면에는 “' + b.name + '”와 거의 같게 보이지만 실제 글자는 ' + JSON.stringify(decodedCore) + '입니다.' };
        } else if (decodedCore.indexOf(token) >= 0 && decodedCore !== token) {
          hit = { points: 60, title: '브랜드 이름이 섞인 유사 도메인',
            detail: core + ' 안에 ' + b.name + '의 이름(' + token + ')이 들어 있습니다. 공식 도메인은 ' + b.domains[0] + '입니다.' };
        } else if (token.length >= 5 && dist > 0 && dist <= (token.length >= 8 ? 2 : 1)) {
          hit = { points: 55, title: '한두 글자만 다른 유사 도메인',
            detail: core + ' → ' + token + ' (편집 거리 ' + dist + '). ' + b.name + ' 공식 도메인은 ' + b.domains[0] + '입니다.' };
        }
        if (hit && (!brandHit || hit.points > brandHit.points)) {
          brandHit = { points: hit.points, brand: b, title: hit.title, detail: hit.detail };
        }
      });

      if (brandHit) add('typosquat-brand', brandHit.title, brandHit.detail, brandHit.points, 'danger');

      var subHit = null;
      subLabels.forEach(function (l) {
        BRANDS.forEach(function (b) {
          var norm = confusableNormalize(l);
          if (b.domains.indexOf(reg) >= 0) return;
          if (l === b.token || norm === b.token || l.indexOf(b.token) >= 0) {
            if (!subHit || l.length < subHit.label.length) subHit = { label: l, brand: b };
          }
        });
      });
      if (subHit && (!brandHit || brandHit.points < 55)) {
        add('typosquat-subdomain', '브랜드 이름을 서브도메인에 넣은 위장',
          '실제 등록 도메인은 ' + reg + ' 인데, 앞부분에 “' + subHit.label + '”(' + subHit.brand.name +
          ')를 넣어 공식 사이트처럼 보이게 했습니다.', 52, 'danger');
      }
    }

    /* ── 2. 퓨니코드 · 호모그래프 ── */
    var hasPuny = labels.some(function (l) { return /^xn--/i.test(l); });
    if (hasPuny && !decodeError) {
      add('punycode', '퓨니코드(xn--) 도메인',
        '화면에는 ' + decodedHost + ' 로 보이지만 실제 주소는 ' + host + ' 입니다.', 24, 'warn');
      var brandHomograph = brandHit && brandHit.points >= 65;
      var confusableScript = /[\u0370-\u03FF\u0400-\u04FF]/.test(decodedHost);
      if (isNonAscii(decodedHost) && confusableScript && !brandHomograph) {
        add('homograph', '키릴·그리스 문자를 섞은 호모그래프 의심',
          '라틴 알파벳과 모양이 같은 다른 문자권 글자가 섞여 있습니다: ' + decodedHost, 40, 'danger');
      }
    } else if (isNonAscii(host) && /[\u0370-\u03FF\u0400-\u04FF]/.test(host)) {
      add('homograph', '영문이 아닌 문자(호모그래프) 도메인',
        '라틴 알파벳이 아닌 글자로 만든 주소입니다: ' + decodedHost, 38, 'danger');
    }

    /* ── 3. IP 직접 접속 ── */
    var ipLiteral = /^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.indexOf(':') >= 0 || /^\[/.test(u.hostname);
    if (ipLiteral) {
      add('ip-literal', 'IP 주소로 직접 접속',
        '정상 서비스는 도메인을 쓰는 경우가 대부분입니다. 서버 주소 ' + host + ' 로 바로 연결합니다.', 34, 'danger');
    }

    /* ── 4. @ 인증 우회 ── */
    var authority = raw.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '').split(/[\/?#]/)[0];
    if (u.username || u.password || authority.indexOf('@') >= 0) {
      add('userinfo-trick', '@ 앞부분을 이용한 위장',
        '브라우저는 @ 뒤의 주소로 접속합니다. 실제 접속지는 ' + host + ' 입니다.', 42, 'danger');
    }

    /* ── 5. 단축 URL ── */
    if (SHORTENERS.indexOf(reg) >= 0 || SHORTENERS.indexOf(host) >= 0) {
      add('shortener', '단축 URL',
        '최종 목적지를 알 수 없습니다. ' + reg + ' 는 주소를 줄여 주는 서비스입니다.', 20, 'warn');
    }

    /* ── 6. HTTPS ── */
    if (u.protocol === 'http:') {
      add('no-https', '암호화되지 않은 http',
        '입력한 정보가 그대로 전송될 수 있습니다. 주소창에 자물쇠가 없습니다.', 16, 'warn');
    }

    /* ── 7. 서브도메인 깊이 ── */
    if (labels.length >= 4 && !ipLiteral) {
      var brandInSub = subHit || subLabels.some(function (l) {
        return BRANDS.some(function (b) { return l.indexOf(b.token) >= 0; });
      });
      if (!brandInSub) {
        add('subdomain-depth', '서브도메인이 많은 주소',
          '도메인 단계가 ' + labels.length + '개입니다. 실제 등록 도메인은 ' + reg + ' 입니다.', 12, 'warn');
      }
    }

    /* ── 8. 위험 확장자 ── */
    var path = decodeURIComponentSafe(u.pathname);
    var extMatch = path.match(/\.([a-z0-9]{2,5})$/i);
    var dangerousExt = null;
    DANGEROUS_EXT.forEach(function (e) {
      if (extMatch && extMatch[1].toLowerCase() === e) dangerousExt = e;
    });
    if (dangerousExt) {
      add('dangerous-extension', '실행 파일 다운로드 링크',
        '링크 끝이 .' + dangerousExt + ' 실행 파일입니다. 설치를 유도하는 문자 링크는 대부분 사칭입니다.', 32, 'danger');
    }
    if (/\.(pdf|docx?|xlsx?|hwp|jpg|jpeg|png|txt)\.(exe|scr|bat|cmd|js|vbs|apk)$/i.test(path)) {
      add('double-extension', '이중 확장자 파일',
        '문서처럼 보이지만 실제로는 실행 파일입니다: ' + path.split('/').pop(), 26, 'danger');
    }

    /* ── 9. 긴급·계정 유도 키워드 ── */
    var hay = (host + ' ' + decodeURIComponentSafe(u.pathname) + ' ' + decodeURIComponentSafe(u.search)).toLowerCase();
    var foundWords = [];
    URGENT_WORDS.forEach(function (w) {
      if (hay.indexOf(w.toLowerCase()) >= 0 && foundWords.indexOf(w) < 0) foundWords.push(w);
    });
    if (foundWords.length && !exactBrand) {
      add('urgency-keywords', '계정·결제·긴급 유도 키워드 ' + foundWords.length + '개',
        '사용한 단어: ' + foundWords.slice(0, 6).join(', ') + (foundWords.length > 6 ? ' …' : '') +
        '. 공식 앱·즐겨찾기에서 직접 들어가 확인하세요.', Math.min(24, foundWords.length * 8), 'warn');
    }

    /* ── 10. 기타 구조 신호 ── */
    if (((decodedCore.match(/-/g) || []).length) >= 2) {
      add('hyphen-heavy', '하이픈이 많은 도메인',
        '사칭 사이트는 ' + decodedCore + ' 처럼 낱말을 붙여 자연스럽게 만들곤 합니다.', 8, 'info');
    }
    if (host.length > 40) {
      add('long-host', '지나치게 긴 도메인', '도메인 길이 ' + host.length + '자.', 6, 'info');
    }
    if (u.port && u.port !== '80' && u.port !== '443') {
      add('odd-port', '일반적이지 않은 포트',
        host + ':' + u.port + ' — 웹 서비스는 보통 443을 씁니다.', 8, 'warn');
    }
    var tld = labels[labels.length - 1] || '';
    if (SUSPICIOUS_TLDS.indexOf(tld) >= 0 && !exactBrand) {
      add('suspicious-tld', '사칭에 자주 쓰이는 최상위 도메인',
        '.' + tld + ' 은 값싸게 대량 등록되어 피싱에 자주 쓰입니다.', 9, 'info');
    }
    if (raw.indexOf('%') >= 0 && /%2[0-9a-f]|%40|%2f/i.test(authority)) {
      add('encoded-authority', '주소에 인코딩된 문자',
        '눈에 보이지 않는 문자로 도메인을 감추려는 시도일 수 있습니다.', 10, 'warn');
    }
    if (/[?&](url|redirect|return|next|goto)=(https?%3a|https?:)/i.test(u.search)) {
      add('open-redirect', '다른 주소로 넘기는 파라미터',
        '이 링크는 다른 사이트로 이동시키는 데 쓰일 수 있습니다.', 10, 'warn');
    }

    /* ── 안전 신호 ── */
    if (u.protocol === 'https:') positives.push('https 암호화 연결');
    if (!ipLiteral) positives.push('IP 주소가 아닌 도메인 사용');
    if (!hasPuny && !isNonAscii(host)) positives.push('영문 도메인');
    if (SHORTENERS.indexOf(reg) < 0) positives.push('단축 URL 아님');
    if (!dangerousExt && !/\.(exe|scr|apk|bat|cmd)$/i.test(path)) positives.push('실행 파일 링크 아님');
    if (exactBrand) positives.push('공식 도메인과 정확히 일치');
    if (labels.length <= 3) positives.push('단순한 도메인 구조');

    var score = 0;
    reasons.forEach(function (r) { score += r.points; });
    score = Math.max(0, Math.min(100, score));
    reasons.sort(function (a, b) { return b.points - a.points; });

    var grade, verdict, advice;
    if (score >= 65) {
      grade = { key: 'critical', label: '매우 위험' };
      verdict = '접속하지 마세요';
      advice = '링크를 열지 말고 삭제하세요. 이미 열었다면 비밀번호를 바꾸고, 돈이 오갔다면 카드사·은행에 즉시 알리세요.';
    } else if (score >= 40) {
      grade = { key: 'danger', label: '위험' };
      verdict = '위험 신호가 뚜렷합니다';
      advice = '주소를 직접 입력하거나 공식 앱에서 들어가 확인하세요. 이 링크에서는 로그인·결제를 하지 마세요.';
    } else if (score >= 20) {
      grade = { key: 'warn', label: '주의' };
      verdict = '한 번 더 확인하세요';
      advice = '아는 사람이 보냈는지, 공식 도메인과 똑같은지 확인하세요. 개인정보를 입력하기 전에 멈추는 게 안전합니다.';
    } else {
      grade = { key: 'safe', label: '안전' };
      verdict = '큰 위험 신호는 없습니다';
      advice = '그래도 로그인·결제 화면에서는 주소창의 도메인을 한 번 더 확인하세요.';
    }

    return {
      ok: true, input: raw, url: u.href, host: host, registrable: reg,
      readableHost: decodedHost, protocol: u.protocol.replace(':', ''),
      path: u.pathname, query: u.search, port: u.port || '',
      score: score, grade: grade, verdict: verdict, advice: advice,
      reasons: reasons, positives: positives, notes: notes,
      brand: exactBrand ? exactBrand.name : null,
      checkedAt: Date.now()
    };
  }

  function decodeURIComponentSafe(s) {
    try { return decodeURIComponent(s || ''); } catch (e) { return String(s || ''); }
  }

  /* ──────────────────────────────────────────────────────────
     3. 파일 해시 · 매직바이트 · EXIF
     ────────────────────────────────────────────────────────── */

  function toBytes(buffer) {
    if (buffer == null) return new Uint8Array(0);
    if (buffer instanceof Uint8Array) return buffer;
    if (typeof ArrayBuffer !== 'undefined' && buffer instanceof ArrayBuffer) return new Uint8Array(buffer);
    if (ArrayBuffer.isView(buffer)) return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    if (typeof buffer === 'string') {
      var s = new TextEncoder().encode(buffer);
      return s;
    }
    return new Uint8Array(0);
  }

  function toArrayBuffer(buffer) {
    var b = toBytes(buffer);
    return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
  }

  async function digestHex(buffer, algo) {
    var subtle = (typeof crypto !== 'undefined' && crypto.subtle) ? crypto.subtle : null;
    if (!subtle) throw new Error('이 브라우저에서는 Web Crypto를 쓸 수 없습니다.');
    var buf = toArrayBuffer(buffer);
    var d = await subtle.digest(algo || 'SHA-256', buf);
    var arr = new Uint8Array(d), out = '';
    for (var i = 0; i < arr.length; i++) out += arr[i].toString(16).padStart(2, '0');
    return out;
  }

  function sha256Hex(buffer) { return digestHex(buffer, 'SHA-256'); }
  function sha1Hex(buffer) { return digestHex(buffer, 'SHA-1'); }

  var MAGIC = [
    { kind: 'jpeg', label: 'JPEG 이미지', at: 0, bytes: [0xFF, 0xD8, 0xFF] },
    { kind: 'png', label: 'PNG 이미지', at: 0, bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A] },
    { kind: 'gif', label: 'GIF 이미지', at: 0, bytes: [0x47, 0x49, 0x46, 0x38] },
    { kind: 'pdf', label: 'PDF 문서', at: 0, bytes: [0x25, 0x50, 0x44, 0x46] },
    { kind: 'zip', label: 'ZIP 압축 파일', at: 0, bytes: [0x50, 0x4B, 0x03, 0x04] },
    { kind: 'zip', label: 'ZIP 압축 파일(빈)', at: 0, bytes: [0x50, 0x4B, 0x05, 0x06] },
    { kind: 'zip', label: 'ZIP 압축 파일(분할)', at: 0, bytes: [0x50, 0x4B, 0x07, 0x08] },
    { kind: 'rar', label: 'RAR 압축 파일', at: 0, bytes: [0x52, 0x61, 0x72, 0x21, 0x1A, 0x07] },
    { kind: '7z', label: '7-Zip 압축 파일', at: 0, bytes: [0x37, 0x7A, 0xBC, 0xAF, 0x27, 0x1C] },
    { kind: 'exe', label: '윈도우 실행 파일 (MZ/PE)', at: 0, bytes: [0x4D, 0x5A] },
    { kind: 'elf', label: '리눅스 실행 파일 (ELF)', at: 0, bytes: [0x7F, 0x45, 0x4C, 0x46] },
    { kind: 'macho', label: '맥 실행 파일 (Mach-O)', at: 0, bytes: [0xFE, 0xED, 0xFA, 0xCE] },
    { kind: 'macho', label: '맥 실행 파일 (Mach-O)', at: 0, bytes: [0xCF, 0xFA, 0xED, 0xFE] },
    { kind: 'ole2', label: 'MS 오피스 구형 문서 (doc/xls/ppt)', at: 0, bytes: [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1] },
    { kind: 'hwp', label: '한글 문서 (HWP)', at: 0, bytes: [0x48, 0x57, 0x50, 0x20, 0x44, 0x6F, 0x63, 0x75, 0x6D, 0x65, 0x6E, 0x74] },
    { kind: 'mp3', label: 'MP3 오디오', at: 0, bytes: [0x49, 0x44, 0x33] },
    { kind: 'mp3', label: 'MP3 오디오', at: 0, bytes: [0xFF, 0xFB] },
    { kind: 'mp4', label: 'MP4 영상', at: 4, bytes: [0x66, 0x74, 0x79, 0x70] },
    { kind: 'bmp', label: 'BMP 이미지', at: 0, bytes: [0x42, 0x4D] },
    { kind: 'ico', label: 'ICO 아이콘', at: 0, bytes: [0x00, 0x00, 0x01, 0x00] },
    { kind: 'rtf', label: 'RTF 문서', at: 0, bytes: [0x7B, 0x5C, 0x72, 0x74, 0x66] },
    { kind: 'gzip', label: 'GZIP 압축', at: 0, bytes: [0x1F, 0x8B] },
    { kind: 'tar', label: 'TAR 아카이브', at: 257, bytes: [0x75, 0x73, 0x74, 0x61, 0x72] },
    { kind: 'iso', label: 'ISO 디스크 이미지', at: 0x8001, bytes: [0x43, 0x44, 0x30, 0x30, 0x31] }
  ];

  var KIND_LABEL = {
    jpeg: 'JPEG 이미지', png: 'PNG 이미지', gif: 'GIF 이미지', webp: 'WebP 이미지',
    bmp: 'BMP 이미지', tiff: 'TIFF 이미지', pdf: 'PDF 문서', zip: 'ZIP 압축 파일',
    rar: 'RAR 압축 파일', '7z': '7-Zip 압축 파일', exe: '윈도우 실행 파일',
    elf: '리눅스 실행 파일', macho: '맥 실행 파일', ole2: 'MS 오피스 구형 문서',
    hwp: '한글 문서', mp3: 'MP3 오디오', mp4: 'MP4 영상', wav: 'WAV 오디오',
    avi: 'AVI 영상', ico: 'ICO 아이콘', rtf: 'RTF 문서', gzip: 'GZIP 압축',
    tar: 'TAR 아카이브', iso: 'ISO 이미지', text: '텍스트', empty: '빈 파일', bin: '알 수 없는 형식'
  };

  var EXT_KINDS = {
    jpg: ['jpeg'], jpeg: ['jpeg'], jpe: ['jpeg'], png: ['png'], gif: ['gif'], bmp: ['bmp'],
    webp: ['webp'], ico: ['ico'], tif: ['tiff'], tiff: ['tiff'], svg: ['text', 'svg'],
    pdf: ['pdf'], zip: ['zip'], docx: ['zip'], xlsx: ['zip'], pptx: ['zip'], hwpx: ['zip'],
    epub: ['zip'], apk: ['zip'], jar: ['zip'], odt: ['zip'], ods: ['zip'],
    doc: ['ole2'], xls: ['ole2'], ppt: ['ole2'], msg: ['ole2'],
    hwp: ['hwp'],
    exe: ['exe'], dll: ['exe'], scr: ['exe'], sys: ['exe'], msi: ['ole2', 'exe'],
    txt: ['text'], csv: ['text'], json: ['text'], md: ['text'], html: ['text'], htm: ['text'],
    js: ['text'], css: ['text'], xml: ['text'], log: ['text'], ini: ['text'], yml: ['text'], yaml: ['text'],
    mp3: ['mp3'], mp4: ['mp4'], m4v: ['mp4'], mov: ['mp4'], m4a: ['mp4'], wav: ['wav'], avi: ['avi'],
    tar: ['tar'], gz: ['gzip'], tgz: ['gzip'], rar: ['rar'], '7z': ['7z'], iso: ['iso'], rtf: ['rtf'],
    bat: ['text'], cmd: ['text'], ps1: ['text'], vbs: ['text'], sh: ['text']
  };

  var DOC_EXT = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'hwp', 'hwpx', 'txt', 'csv',
    'jpg', 'jpeg', 'png', 'gif', 'mp4', 'zip', 'rtf'];
  var EXEC_EXT = ['exe', 'scr', 'bat', 'cmd', 'com', 'pif', 'vbs', 'vbe', 'js', 'jse', 'wsf', 'hta',
    'msi', 'jar', 'apk', 'ps1', 'lnk', 'reg'];

  function bytesHex(bytes, n) {
    var out = [];
    for (var i = 0; i < Math.min(n || 16, bytes.length); i++) {
      out.push(bytes[i].toString(16).toUpperCase().padStart(2, '0'));
    }
    return out.join(' ');
  }

  function sniffMagic(buffer) {
    var bytes = toBytes(buffer);
    if (!bytes.length) return { kind: 'empty', label: '빈 파일', hex: '', matches: [] };
    for (var i = 0; i < MAGIC.length; i++) {
      var sig = MAGIC[i], ok = sig.at + sig.bytes.length <= bytes.length;
      if (!ok) continue;
      for (var j = 0; j < sig.bytes.length; j++) {
        if (bytes[sig.at + j] !== sig.bytes[j]) { ok = false; break; }
      }
      if (ok) return { kind: sig.kind, label: sig.label, hex: bytesHex(bytes, 16), matches: [sig.label] };
    }
    /* RIFF 계열 */
    if (bytes.length > 12 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
      var tag = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
      if (tag === 'WEBP') return { kind: 'webp', label: 'WebP 이미지', hex: bytesHex(bytes, 16), matches: [] };
      if (tag === 'WAVE') return { kind: 'wav', label: 'WAV 오디오', hex: bytesHex(bytes, 16), matches: [] };
      if (tag === 'AVI ') return { kind: 'avi', label: 'AVI 영상', hex: bytesHex(bytes, 16), matches: [] };
    }
    /* TIFF */
    if ((bytes[0] === 0x49 && bytes[1] === 0x49 && bytes[2] === 0x2A && bytes[3] === 0x00) ||
        (bytes[0] === 0x4D && bytes[1] === 0x4D && bytes[2] === 0x00 && bytes[3] === 0x2A)) {
      return { kind: 'tiff', label: 'TIFF 이미지', hex: bytesHex(bytes, 16), matches: [] };
    }
    /* 텍스트 판정 */
    var printable = 0, span = Math.min(bytes.length, 4096);
    for (var k = 0; k < span; k++) {
      var b = bytes[k];
      if (b === 9 || b === 10 || b === 13 || (b >= 32 && b !== 127) || b >= 0xC0) printable++;
    }
    if (span > 0 && printable / span > 0.95) {
      return { kind: 'text', label: '텍스트', hex: bytesHex(bytes, 16), matches: [] };
    }
    return { kind: 'bin', label: '알 수 없는 형식', hex: bytesHex(bytes, 16), matches: [] };
  }

  function fileExt(name) {
    var m = String(name || '').toLowerCase().match(/\.([a-z0-9]{1,8})\s*$/);
    return m ? m[1] : '';
  }

  function allExts(name) {
    var parts = String(name || '').toLowerCase().split('.');
    parts.shift();
    return parts.map(function (p) { return p.trim(); }).filter(Boolean);
  }

  /* ── EXIF ──────────────────────────────────────────────── */

  var EXIF_TAGS = {
    0x010E: '이미지 설명', 0x010F: '제조사(Make)', 0x0110: '기종(Model)', 0x0112: '방향(Orientation)',
    0x011A: '가로 해상도', 0x011B: '세로 해상도', 0x0128: '해상도 단위', 0x0131: '소프트웨어',
    0x0132: '촬영 시각', 0x013B: '작성자(Artist)', 0x8298: '저작권', 0x829A: '노출 시간',
    0x829D: '조리개 값', 0x8822: '노출 모드', 0x8827: 'ISO', 0x9003: '원본 촬영 시각',
    0x9004: '디지털화 시각', 0x9201: '셔터 속도', 0x9202: '조리개', 0x920A: '초점 거리',
    0x9286: '사용자 주석', 0xA002: '픽셀 폭', 0xA003: '픽셀 높이', 0xA430: '촬영자',
    0xA431: '바디 시리얼', 0xA432: '렌즈', 0xA434: '렌즈 모델', 0x0100: '이미지 폭',
    0x0101: '이미지 높이'
  };

  var GPS_TAGS = {
    0x0000: 'GPS 버전', 0x0001: '위도 방향', 0x0002: '위도', 0x0003: '경도 방향', 0x0004: '경도',
    0x0005: '고도 기준', 0x0006: '고도', 0x0007: '시각(UTC)', 0x0008: '위성', 0x0009: '상태',
    0x001D: '촬영 날짜'
  };

  function parseTiff(bytes, base) {
    var tags = [], gps = null;
    var le = bytes[base] === 0x49;
    function u16(o) { return le ? bytes[o] | (bytes[o + 1] << 8) : (bytes[o] << 8) | bytes[o + 1]; }
    function u32(o) {
      return le
        ? (bytes[o] | (bytes[o + 1] << 8) | (bytes[o + 2] << 16) | (bytes[o + 3] << 24)) >>> 0
        : ((bytes[o] << 24) | (bytes[o + 1] << 16) | (bytes[o + 2] << 8) | bytes[o + 3]) >>> 0;
    }
    function typeSize(t) {
      return { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1, 9: 4, 10: 8, 11: 4, 12: 8 }[t] || 0;
    }
    function readValue(type, count, off) {
      var size = typeSize(type) * count;
      var at = size <= 4 ? off : base + u32(off);
      if (at < 0 || at + size > bytes.length) return null;
      if (type === 2) {
        var s = '';
        for (var i = 0; i < count; i++) {
          var c = bytes[at + i];
          if (c === 0) break;
          s += String.fromCharCode(c);
        }
        return s;
      }
      if (type === 1 || type === 7) {
        var arr = [];
        for (var j = 0; j < count; j++) arr.push(bytes[at + j]);
        return arr;
      }
      if (type === 3) {
        var a3 = [];
        for (var k = 0; k < count; k++) a3.push(u16(at + k * 2));
        return count === 1 ? a3[0] : a3;
      }
      if (type === 4 || type === 9) {
        var a4 = [];
        for (var m = 0; m < count; m++) a4.push(u32(at + m * 4));
        return count === 1 ? a4[0] : a4;
      }
      if (type === 5 || type === 10) {
        var rat = [];
        for (var n = 0; n < count; n++) {
          var num = type === 5 ? u32(at + n * 8) : (u32(at + n * 8) | 0);
          var den = u32(at + n * 8 + 4) || 1;
          rat.push(num / den);
        }
        return count === 1 ? rat[0] : rat;
      }
      return null;
    }
    function readIFD(offset, group, tagNames, pointers) {
      if (offset <= 0 || base + offset + 2 > bytes.length) return;
      var count = u16(base + offset);
      if (count > 512) return;
      for (var i = 0; i < count; i++) {
        var e = base + offset + 2 + i * 12;
        if (e + 12 > bytes.length) break;
        var tag = u16(e), type = u16(e + 2), cnt = u32(e + 4);
        if (pointers && (tag === 0x8769 || tag === 0x8825)) {
          pointers[tag] = type === 4 || type === 9 ? readValue(4, 1, e + 8) : u32(e + 8);
          continue;
        }
        var val = readValue(type, cnt, e + 8);
        if (val === null) continue;
        if (typeof val === 'string' && !val.trim()) continue;
        if (Array.isArray(val) && !val.length) continue;
        var name = tagNames[tag] || ('0x' + tag.toString(16).padStart(4, '0'));
        tags.push({ group: group, tag: tag, name: name, value: val });
      }
    }

    var ifd0 = u32(base + 4);
    var pointers = {};
    readIFD(ifd0, 'IFD0', EXIF_TAGS, pointers);
    var exifOff = pointers[0x8769] || 0;
    if (exifOff) readIFD(exifOff, 'EXIF', EXIF_TAGS, null);

    /* GPS IFD */
    var gpsOff = pointers[0x8825] || 0;
    if (gpsOff) {
      readIFD(gpsOff, 'GPS', GPS_TAGS, null);
      var get = function (t) {
        var f = tags.filter(function (x) { return x.group === 'GPS' && x.tag === t; })[0];
        return f ? f.value : null;
      };
      function dms(v, ref) {
        if (!Array.isArray(v) || v.length < 3) return null;
        var deg = v[0] + v[1] / 60 + v[2] / 3600;
        if (ref === 'S' || ref === 'W') deg = -deg;
        return deg;
      }
      var lat = dms(get(0x0002), get(0x0001));
      var lng = dms(get(0x0004), get(0x0003));
      if (lat !== null && lng !== null) {
        gps = { lat: lat, lng: lng, alt: get(0x0006) };
      }
    }
    return { tags: tags, gps: gps };
  }

  function parseExif(buffer) {
    var bytes = toBytes(buffer);
    var format = null, tiffBase = -1, extra = [];

    if (bytes.length > 4 && bytes[0] === 0xFF && bytes[1] === 0xD8) {
      format = 'jpeg';
      var p = 2;
      while (p + 4 < bytes.length) {
        if (bytes[p] !== 0xFF) { p++; continue; }
        var marker = bytes[p + 1];
        if (marker === 0xD8 || marker === 0x01 || (marker >= 0xD0 && marker <= 0xD7)) { p += 2; continue; }
        if (marker === 0xDA || marker === 0xD9) break;
        var len = (bytes[p + 2] << 8) | bytes[p + 3];
        if (len < 2) break;
        if (marker === 0xE1) {
          var s = p + 4;
          if (bytes[s] === 0x45 && bytes[s + 1] === 0x78 && bytes[s + 2] === 0x69 && bytes[s + 3] === 0x66 &&
              bytes[s + 4] === 0 && bytes[s + 5] === 0) {
            tiffBase = s + 6;
            break;
          }
        }
        p += 2 + len;
      }
    } else if (bytes.length > 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
      format = 'png';
      var q = 8;
      while (q + 12 <= bytes.length) {
        var clen = (bytes[q] << 24 | bytes[q + 1] << 16 | bytes[q + 2] << 8 | bytes[q + 3]) >>> 0;
        var ctype = String.fromCharCode(bytes[q + 4], bytes[q + 5], bytes[q + 6], bytes[q + 7]);
        if (ctype === 'eXIf') { tiffBase = q + 8; break; }
        if (ctype === 'tEXt' || ctype === 'iTXt' || ctype === 'zTXt') {
          var txt = '';
          for (var i = 0; i < Math.min(clen, 400); i++) {
            var b = bytes[q + 8 + i];
            txt += (b >= 32 && b < 127) ? String.fromCharCode(b) : ' ';
          }
          extra.push({ group: 'PNG', tag: ctype, name: ctype + ' 텍스트', value: txt.replace(/\s+/g, ' ').trim() });
        }
        if (ctype === 'IEND') break;
        q += 12 + clen;
      }
    } else if (bytes.length > 12 && bytes[0] === 0x52 && bytes[8] === 0x57 && bytes[9] === 0x45) {
      format = 'webp';
      var w = 12;
      while (w + 8 <= bytes.length) {
        var wtype = String.fromCharCode(bytes[w], bytes[w + 1], bytes[w + 2], bytes[w + 3]);
        var wlen = (bytes[w + 4] | bytes[w + 5] << 8 | bytes[w + 6] << 16 | bytes[w + 7] << 24) >>> 0;
        if (wtype === 'EXIF') {
          tiffBase = w + 8;
          if (bytes[tiffBase] === 0x45 && bytes[tiffBase + 1] === 0x78) tiffBase += 6;
          break;
        }
        w += 8 + wlen + (wlen % 2);
      }
    }

    if (tiffBase < 0) {
      return { format: format || 'other', hasExif: false, count: extra.length, tags: extra, gps: null };
    }

    var parsed;
    try { parsed = parseTiff(bytes, tiffBase); }
    catch (e) { return { format: format, hasExif: false, count: extra.length, tags: extra, gps: null, error: '메타데이터를 읽지 못했습니다.' }; }

    var tags = parsed.tags.concat(extra);
    return {
      format: format, hasExif: parsed.tags.length > 0, count: tags.length,
      tags: tags, gps: parsed.gps
    };
  }

  function formatGps(gps) {
    if (!gps) return '';
    return gps.lat.toFixed(6) + ', ' + gps.lng.toFixed(6);
  }

  function formatBytes(n) {
    if (!isFinite(n)) return '—';
    if (n < 1024) return n + ' B';
    if (n < 1024 * 1024) return (n / 1024).toFixed(n < 10240 ? 1 : 0) + ' KB';
    if (n < 1024 * 1024 * 1024) return (n / 1048576).toFixed(1) + ' MB';
    return (n / 1073741824).toFixed(2) + ' GB';
  }

  function checkFileName(name) {
    var list = [];
    var n = String(name || '');
    var lower = n.toLowerCase();
    var exts = allExts(n);
    var last = exts[exts.length - 1] || '';

    if (DOC_EXT.indexOf(exts[0]) >= 0 && EXEC_EXT.indexOf(last) >= 0 && exts.length >= 2) {
      list.push({
        id: 'double-extension', level: 'danger',
        title: '이중 확장자',
        detail: '“.' + exts[0] + '”로 시작해 문서처럼 보이지만 실제 확장자는 “.' + last + '” 실행 파일입니다.'
      });
    }
    if (/[\u202A-\u202E\u2066-\u2069\u200B-\u200F\uFEFF]/.test(n)) {
      list.push({
        id: 'invisible-char', level: 'danger',
        title: '보이지 않는 문자 포함',
        detail: '파일명에 방향 전환·제로폭 문자(RTL override 등)가 들어 있습니다. 실제 확장자가 반대로 보일 수 있습니다.'
      });
    }
    if (/[. ]$/.test(n)) {
      list.push({
        id: 'trailing-dot', level: 'warn',
        title: '끝에 점·공백',
        detail: '윈도우가 확장자를 잘라 해석할 수 있는 이름입니다.'
      });
    }
    if (/^\./.test(n)) {
      list.push({ id: 'leading-dot', level: 'info', title: '숨김 파일 이름', detail: '점으로 시작해 탐색기에서 숨겨질 수 있습니다.' });
    }
    if (EXEC_EXT.indexOf(last) >= 0) {
      list.push({
        id: 'executable', level: 'warn',
        title: '실행 파일 (. ' + last + ')',
        detail: '받은 파일이면 출처를 확인하기 전에는 열지 마세요.'
      });
    }
    if (lower.length > 120) {
      list.push({ id: 'long-name', level: 'info', title: '매우 긴 파일명', detail: '길이 ' + n.length + '자 — 확장자를 가리려는 시도일 수 있습니다.' });
    }
    return list;
  }

  async function inspectFile(file) {
    var name = file.name || '';
    var buffer = file.buffer || file.data || new ArrayBuffer(0);
    var bytes = toBytes(buffer);
    var ext = fileExt(name);
    var sniff = sniffMagic(bytes);
    var nameHits = checkFileName(name);
    var expected = EXT_KINDS[ext] || null;
    var mismatch = false;
    if (expected && sniff.kind !== 'empty') {
      mismatch = expected.indexOf(sniff.kind) < 0;
    }

    var verdict = { level: 'ok', title: '확장자와 실제 내용이 일치합니다', detail: '' };
    var danger = nameHits.filter(function (h) { return h.level === 'danger'; })[0];
    if (danger) {
      verdict = { level: 'danger', title: danger.title, detail: danger.detail };
    } else if (mismatch) {
      var expLabel = expected.map(function (k) { return KIND_LABEL[k] || k; }).join(' / ');
      verdict = {
        level: 'danger', title: '위장 파일: 확장자와 실제 내용이 다릅니다',
        detail: '확장자는 “.' + ext + '”(' + expLabel + ')인데 실제 내용은 ' + sniff.label + '입니다.'
      };
    } else if (!expected) {
      verdict = {
        level: 'info', title: ext ? '확인할 수 없는 확장자' : '확장자 없는 파일',
        detail: (ext ? '“.' + ext + '” 형식은 대조표에 없습니다. ' : '확장자가 없습니다. ') +
          '실제 내용은 ' + sniff.label + '입니다.'
      };
    } else if (nameHits.some(function (h) { return h.level === 'warn'; })) {
      var warn = nameHits.filter(function (h) { return h.level === 'warn'; })[0];
      verdict = { level: 'warn', title: warn.title, detail: warn.detail };
    } else if (sniff.kind === 'empty') {
      verdict = { level: 'info', title: '빈 파일', detail: '내용이 0바이트입니다.' };
    }

    var hashes = { sha256: null, sha1: null, error: null };
    try {
      hashes.sha256 = await sha256Hex(buffer);
      hashes.sha1 = await sha1Hex(buffer);
    } catch (e) {
      hashes.error = e.message || String(e);
    }

    var exif = null;
    if (sniff.kind === 'jpeg' || sniff.kind === 'png' || sniff.kind === 'webp' || sniff.kind === 'tiff') {
      try { exif = parseExif(bytes); } catch (e) { exif = { error: 'EXIF 파싱 실패', count: 0, tags: [] }; }
    }

    return {
      name: name, size: file.size != null ? file.size : bytes.length,
      mime: file.type || '', ext: ext, exts: allExts(name),
      hash: hashes, sniff: sniff, mismatch: mismatch, expectedKinds: expected || [],
      nameHits: nameHits, verdict: verdict, exif: exif,
      magicHex: bytesHex(bytes, 16)
    };
  }

  /* ──────────────────────────────────────────────────────────
     4. 비밀번호 강도 · 생성기
     ────────────────────────────────────────────────────────── */

  var COMMON_WORDS = ['password', 'passwd', 'pass', '123456', '123456789', '12345678', '12345',
    'qwerty', 'qwerty123', '111111', '000000', 'abc123', 'admin', 'administrator', 'welcome',
    'iloveyou', 'monkey', 'dragon', 'football', 'baseball', 'letmein', 'sunshine', 'princess',
    'master', 'shadow', 'superman', 'batman', 'starwars', 'michael', 'jennifer', 'trustno1',
    'qwer1234', 'asdf1234', '1q2w3e4r', '1qaz2wsx', 'zxcvbnm', 'asdfgh', 'qwe123', 'test',
    'guest', 'login', 'samsung', 'naver', 'kakao', 'google', 'apple', 'tistory', 'daum',
    'korea', 'seoul', 'busan', 'love', 'happy', 'money', 'company', 'office',
    '사랑', '대한민국', '서울', '부산', '행복', '돈', '회사', '비밀번호', '전화번호', '엄마',
    '아빠', '우리집', '생일', '홍길동', '피클', '테스트', '관리자', '카카오', '네이버'];

  var KEYBOARD_ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm', '1234567890', '1qaz2wsx3edc',
    '!@#$%^&*()', 'abcdefghijklmnopqrstuvwxyz'];

  function sequenceRuns(pw) {
    var low = pw.toLowerCase();
    var runs = 0;
    KEYBOARD_ROWS.forEach(function (row) {
      for (var i = 0; i < low.length - 2; i++) {
        var a = row.indexOf(low[i]);
        if (a < 0) continue;
        var k = 1;
        while (i + k < low.length) {
          var b = row.indexOf(low[i + k]);
          if (b === a + k || b === a - k) k++; else break;
        }
        if (k >= 3) { runs++; i += k - 1; }
      }
    });
    return runs;
  }

  function charClasses(pw) {
    return {
      lower: /[a-z]/.test(pw),
      upper: /[A-Z]/.test(pw),
      digit: /[0-9]/.test(pw),
      symbol: /[^A-Za-z0-9]/.test(pw),
      hangul: /[가-힣]/.test(pw)
    };
  }

  function poolSize(c) {
    var n = 0;
    if (c.lower) n += 26;
    if (c.upper) n += 26;
    if (c.digit) n += 10;
    if (c.symbol) n += 33;
    if (c.hangul) n += 11172;
    return n || 1;
  }

  function humanDuration(sec) {
    if (!isFinite(sec) || sec <= 0) return '즉시';
    if (sec < 1) return '1초 미만';
    if (sec < 60) return Math.round(sec) + '초';
    if (sec < 3600) return Math.round(sec / 60) + '분';
    if (sec < 86400) return Math.round(sec / 3600) + '시간';
    if (sec < 2592000) return Math.round(sec / 86400) + '일';
    if (sec < 31536000) return Math.round(sec / 2592000) + '개월';
    var years = sec / 31536000;
    if (years < 1000) return Math.round(years) + '년';
    if (years < 1e6) return Math.round(years / 100) / 10 + '천 년';
    var exp = Math.floor(Math.log10(years));
    return '10^' + exp + '년 이상';
  }

  function analyzePassword(pw) {
    var value = String(pw == null ? '' : pw);
    var chars = Array.from(value);
    var len = chars.length;
    var c = charClasses(value);
    var pool = poolSize(c);
    var warnings = [];
    var rawBits = len > 0 ? len * Math.log2(pool) : 0;
    var bits = rawBits;

    var lower = value.toLowerCase();
    var commonHit = COMMON_WORDS.filter(function (w) {
      return lower === w || (w.length >= 4 && lower.indexOf(w) >= 0);
    });
    if (commonHit.length) {
      warnings.push({ id: 'common', label: '자주 쓰이는 비밀번호·단어가 포함됨: ' + commonHit.slice(0, 3).join(', ') });
      bits = Math.min(bits, 12 + Math.max(0, len - commonHit[0].length) * 1.2);
    }

    var rep = value.match(/(.)\1{2,}/g);
    if (rep) {
      warnings.push({ id: 'repeat', label: '같은 글자를 3번 이상 반복 (' + rep.length + '곳)' });
      bits -= 2.2 * rep.length;
    }
    if (/(..+)\1+/.test(value)) {
      warnings.push({ id: 'repeat-block', label: '같은 덩어리를 반복 (abcabcabc 등)' });
      bits -= 4;
    }

    var runs = sequenceRuns(value);
    if (runs) {
      warnings.push({ id: 'sequence', label: '키보드·알파벳 연속 배열 (' + runs + '곳)' });
      bits -= 2.6 * runs;
    }

    if (/(19|20)\d{2}/.test(value) || /(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])/.test(value)) {
      warnings.push({ id: 'date', label: '연도·생일로 보이는 숫자' });
      bits -= 4;
    }

    if (len > 0 && len < 8) {
      warnings.push({ id: 'short', label: '8자 미만 — 너무 짧습니다' });
    }
    var classCount = [c.lower, c.upper, c.digit, c.symbol, c.hangul].filter(Boolean).length;
    if (len >= 8 && classCount === 1) {
      warnings.push({ id: 'single-class', label: '한 종류의 글자만 사용' });
      bits -= 4;
    }
    var distinct = {};
    chars.forEach(function (ch) { distinct[ch] = 1; });
    if (len >= 6 && Object.keys(distinct).length / len < 0.5) {
      warnings.push({ id: 'low-variety', label: '쓰인 글자의 종류가 적습니다' });
      bits -= 3;
    }

    bits = Math.max(0, Math.min(bits, 400));
    var score, level;
    if (len === 0) { score = -1; level = { key: 'none', label: '입력 대기' }; }
    else if (bits < 28) { score = 0; level = { key: 'very-weak', label: '매우 약함' }; }
    else if (bits < 40) { score = 1; level = { key: 'weak', label: '약함' }; }
    else if (bits < 58) { score = 2; level = { key: 'fair', label: '보통' }; }
    else if (bits < 76) { score = 3; level = { key: 'strong', label: '강함' }; }
    else { score = 4; level = { key: 'very-strong', label: '매우 강함' }; }

    var offline = Math.pow(2, Math.max(0, bits - 1)) / 1e10;
    var online = Math.pow(2, Math.max(0, bits - 1)) / 100;

    return {
      length: len, classes: c, pool: pool, entropyRaw: rawBits, entropy: bits,
      score: score, level: level,
      crack: { online: online, offline: offline },
      crackText: { online: humanDuration(online), offline: humanDuration(offline) },
      warnings: warnings, common: commonHit.length > 0
    };
  }

  function secureRandomInt(n) {
    if (n <= 0) return 0;
    var c = (typeof crypto !== 'undefined') ? crypto : null;
    if (!c || !c.getRandomValues) throw new Error('보안 난수 생성기를 사용할 수 없습니다.');
    var limit = Math.floor(4294967296 / n) * n;
    var buf = new Uint32Array(1);
    for (var i = 0; i < 1000; i++) {
      c.getRandomValues(buf);
      if (buf[0] < limit) return buf[0] % n;
    }
    return buf[0] % n;
  }

  var SETS = {
    lower: 'abcdefghijklmnopqrstuvwxyz',
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    digit: '0123456789',
    symbol: '!@#$%^&*()-_=+[]{};:,.?/'
  };
  var AMBIGUOUS = 'Il1O0o';

  function generatePassword(opts) {
    opts = opts || {};
    var length = Math.max(4, Math.min(128, Number(opts.length) || 20));
    var allow = {
      lower: opts.lower !== false, upper: opts.upper !== false,
      digit: opts.digit !== false, symbol: opts.symbol !== false
    };
    if (!Object.keys(allow).some(function (k) { return allow[k]; })) allow.lower = true;

    var pools = {};
    Object.keys(allow).forEach(function (k) {
      if (!allow[k]) return;
      var chars = SETS[k].split('').filter(function (ch) {
        return !(opts.excludeAmbiguous && AMBIGUOUS.indexOf(ch) >= 0);
      });
      if (chars.length) pools[k] = chars;
    });
    var kinds = Object.keys(pools);
    if (!kinds.length) { pools.lower = SETS.lower.split(''); kinds = ['lower']; }

    var all = [];
    kinds.forEach(function (k) { all = all.concat(pools[k]); });

    for (var attempt = 0; attempt < 40; attempt++) {
      var out = [];
      for (var i = 0; i < length; i++) out.push(all[secureRandomInt(all.length)]);
      if (opts.requireEach !== false && length >= kinds.length) {
        var missing = kinds.filter(function (k) { return !out.some(function (ch) { return pools[k].indexOf(ch) >= 0; }); });
        missing.forEach(function (k) {
          out[secureRandomInt(out.length)] = pools[k][secureRandomInt(pools[k].length)];
        });
      }
      var hasAll = kinds.every(function (k) { return out.some(function (ch) { return pools[k].indexOf(ch) >= 0; }); });
      if (!hasAll && opts.requireEach !== false) continue;
      /* Fisher-Yates */
      for (var j = out.length - 1; j > 0; j--) {
        var r = secureRandomInt(j + 1);
        var t = out[j]; out[j] = out[r]; out[r] = t;
      }
      return out.join('');
    }
    return all.slice(0, length).join('');
  }

  /* ────────────────────────────────────────────────────────── */

  return {
    PII_TYPES: PII_TYPES,
    detectPII: detectPII,
    maskPII: maskPII,
    maskText: maskText,
    luhn: luhn,
    rrnValid: rrnValid,
    brnValid: brnValid,
    analyzeUrl: analyzeUrl,
    registrableDomain: registrableDomain,
    levenshtein: levenshtein,
    punycodeDecode: punycodeDecode,
    confusableNormalize: confusableNormalize,
    BRANDS: BRANDS,
    SHORTENERS: SHORTENERS,
    sha256Hex: sha256Hex,
    sha1Hex: sha1Hex,
    sniffMagic: sniffMagic,
    parseExif: parseExif,
    inspectFile: inspectFile,
    checkFileName: checkFileName,
    formatGps: formatGps,
    formatBytes: formatBytes,
    analyzePassword: analyzePassword,
    generatePassword: generatePassword,
    humanDuration: humanDuration,
    secureRandomInt: secureRandomInt
  };
});
