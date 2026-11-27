/* ============================================================
   보안 가드 · data.js
   화면에 보여 줄 예시 데이터. 전부 가상의 테스트 값입니다.
   (실제 번호·계좌·사람 정보 0건 — 체크섬만 통과하도록 만든 합성 번호)
   ============================================================ */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.GuardData = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var SAMPLE_TEXT = [
    '[문의] 안녕하세요, 홍길동입니다.',
    '연락처는 010-1234-5678, 사무실 전화는 02-345-6789 입니다.',
    '주민등록번호 900101-1234568, 사업자등록번호 123-45-67891 로 등록되어 있습니다.',
    '환불 계좌는 110-123-456789 이고, 결제 카드는 4111-1111-1111-1111 입니다.',
    '회신은 hong.gildong@example.com 으로 주세요.',
    '서버 주소는 203.0.113.45 이고, 접속 기록은 3일 보관합니다.'
  ].join('\n');

  var SAMPLE_TEXT_MIXED = [
    '안녕하세요! 아래 내용 확인 부탁드립니다.',
    '',
    '· 신청자: 김서연 (010-9876-5432)',
    '· 주민번호: 950303-2345678 (오타 포함 — 체크섬 불일치 예시)',
    '· 입금 계좌: 국민은행 123456-01-234567',
    '· 카드: 5555 5555 5555 4444',
    '· 메일: seoyeon.kim@example.org / 보조 kim.sy@example.net',
    '· 접속 IP: 198.51.100.7, 2001:db8:85a3::8a2e:370:7334',
    '',
    '확인 후 회신 주세요. 감사합니다.'
  ].join('\n');


  var SAMPLE_TEXT_EN = [
    '[Enquiry] Hello, this is Hong Gil-dong.',
    'My mobile is 010-1234-5678 and my office phone is 02-345-6789.',
    'It is registered under resident number 900101-1234568 and business number 123-45-67891.',
    'The refund account is 110-123-456789 and the card is 4111-1111-1111-1111.',
    'Please reply to hong.gildong@example.com.',
    'The server address is 203.0.113.45 and access logs are kept for three days.'
  ].join('\n');

  var SAMPLE_TEXT_MIXED_EN = [
    'Hello! Please check the details below.',
    '',
    '· Applicant: Kim Seo-yeon (010-9876-5432)',
    '· Resident number: 950303-2345678 (with a typo — checksum mismatch example)',
    '· Deposit account: KB Kookmin Bank 123456-01-234567',
    '· Card: 5555 5555 5555 4444',
    '· Email: seoyeon.kim@example.org / alt kim.sy@example.net',
    '· IP: 198.51.100.7, 2001:db8:85a3::8a2e:370:7334',
    '',
    'Please reply once you have checked. Thank you.'
  ].join('\n');

  function isEn() {
    var w = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null);
    return !!(w && w.ONETAP_I18N && w.ONETAP_I18N.lang && w.ONETAP_I18N.lang() === 'en');
  }

  var SAMPLE_URLS = [
    {
      label: '네이버 사칭',
      url: 'https://naver-login-security.com/account/verify?user=kim',
      hint: '브랜드 이름 + 계정 확인 유도'
    },
    {
      label: '단축 URL',
      url: 'http://bit.ly/3xK9pQz',
      hint: '최종 목적지를 알 수 없음'
    },
    {
      label: '퓨니코드 위장',
      url: 'https://xn--nver-53d.com/login',
      hint: '화면에는 navear 처럼 보이는 주소'
    },
    {
      label: '홈택스 환급 사칭',
      url: 'https://hometax-refund.go.kr/refund/apply',
      hint: '세금 환급·계좌 입력 유도'
    },
    {
      label: 'IP + apk',
      url: 'http://203.0.113.9/update.apk',
      hint: 'IP 직접 접속 + 실행 파일'
    },
    {
      label: '정상 주소',
      url: 'https://www.coupang.com/vp/products/123456',
      hint: '공식 도메인 대조용'
    }
  ];

  var URL_TIPS = [
    '주소의 @ 앞부분은 무시됩니다. 실제 접속지는 @ 뒤입니다.',
    '한글·키릴 글자로 만든 비슷한 도메인은 눈으로 구별되지 않습니다.',
    '문자로 온 링크는 공식 앱·즐겨찾기에서 직접 들어가 확인하세요.'
  ];

  var PII_NOTES = {
    rrn: '주민등록번호는 뒤 6자리만 가려도 대부분의 유출 피해를 막습니다.',
    card: '카드번호는 앞 4자리와 끝 4자리만 남겨도 결제에 쓸 수 없습니다.',
    account: '계좌번호는 끝 4자리만 남기면 입금 확인용으로는 충분합니다.',
    email: '이메일은 아이디 일부를 가려도 도메인은 유지됩니다.',
    ip: 'IP 주소는 앞 두 자리만 남겨도 통신사·지역 추정이 어려워집니다.'
  };

  return {
    get SAMPLE_TEXT() { return isEn() ? SAMPLE_TEXT_EN : SAMPLE_TEXT; },
    get SAMPLE_TEXT_MIXED() { return isEn() ? SAMPLE_TEXT_MIXED_EN : SAMPLE_TEXT_MIXED; },
    SAMPLE_URLS: SAMPLE_URLS,
    URL_TIPS: URL_TIPS,
    PII_NOTES: PII_NOTES
  };
});
