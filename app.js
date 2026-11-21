/* ============================================================
   보안 가드 · app.js
   화면 조립과 이벤트. 검사 로직은 core.js에만 있습니다.
   사용자 입력은 전부 textContent로만 넣습니다(innerHTML 사용 안 함).
   ============================================================ */
(function () {
  'use strict';

  var C = window.GuardCore;
  var D = window.GuardData;

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  /* ── 토스트 ─────────────────────────────────────── */
  var toastRoot = $('#toastRoot');
  function toast(message, kind) {
    var t = el('div', 'toast' + (kind ? ' ' + kind : ''), message);
    toastRoot.appendChild(t);
    setTimeout(function () {
      t.style.opacity = '0';
      t.style.transition = 'opacity .25s';
      setTimeout(function () { t.remove(); }, 260);
    }, 2200);
  }

  /* ── 복사 ───────────────────────────────────────── */
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(function () { return legacyCopy(text); });
    }
    return Promise.resolve(legacyCopy(text));
  }
  function legacyCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    ta.remove();
    if (!ok) toast('복사하지 못했습니다. 직접 선택해 복사해 주세요.', 'warn');
    return ok;
  }

  /* ── 테마 ───────────────────────────────────────── */
  var THEME_KEY = 'guard.theme.v1';
  function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) { saved = null; }
    var theme = saved;
    if (theme !== 'light' && theme !== 'dark') {
      theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', theme);
    syncThemeButton();
  }
  function syncThemeButton() {
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    var btn = $('[data-action="toggle-theme"]');
    if (btn) {
      btn.setAttribute('aria-label', dark ? '라이트 모드로 전환' : '다크 모드로 전환');
      btn.setAttribute('title', dark ? '라이트 모드' : '다크 모드');
    }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? '#080b12' : '#ffffff');
  }
  function toggleTheme() {
    var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* 저장 못 해도 동작 */ }
    syncThemeButton();
  }

  /* ── 탭 ─────────────────────────────────────────── */
  var VIEWS = ['pii', 'url', 'file', 'pw'];
  function switchTab(name) {
    if (VIEWS.indexOf(name) < 0) return;
    VIEWS.forEach(function (v) {
      var section = $('#view-' + v);
      var tab = $('.tab[data-tab="' + v + '"]');
      var on = v === name;
      if (section) section.hidden = !on;
      if (tab) {
        tab.classList.toggle('is-active', on);
        tab.setAttribute('aria-selected', on ? 'true' : 'false');
      }
    });
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  /* ── 작동 원리 모달 ─────────────────────────────── */
  var modalRoot = $('#modalRoot');
  var lastFocus = null;
  function openHow() {
    lastFocus = document.activeElement;
    var steps = [
      ['브라우저 안에서만', '붙여넣은 글·파일·비밀번호는 이 탭의 메모리에서만 읽습니다. 서버도, 분석 도구도, 광고 스크립트도 없습니다.'],
      ['번호는 계산으로 검증', '주민등록번호와 사업자등록번호는 자체 체크섬, 카드번호는 Luhn 규칙으로 확인해 숫자만 우연히 맞은 경우를 걸러냅니다.'],
      ['도메인을 해부', '퓨니코드(xn--) 주소를 실제 글자로 풀고, 브랜드 이름과 편집 거리를 비교해 한두 글자만 다른 사칭을 찾습니다. @ 앞부분, IP 직접 접속, 단축 URL도 같이 봅니다.'],
      ['파일은 바이트로', '확장자를 믿지 않고 매직 바이트(파일 머리글)를 읽습니다. 사진은 EXIF에서 GPS·기기·촬영시각을 꺼내 보여 주고, 캔버스에 다시 그려 메타데이터가 없는 파일을 만들어 줍니다.'],
      ['난수는 crypto로', '비밀번호 생성은 Math.random이 아니라 crypto.getRandomValues를 씁니다. 예측 가능한 난수는 비밀번호에 쓰면 안 됩니다.']
    ];
    var wrap = el('div', 'modal-root');
    var backdrop = el('div', 'modal-backdrop');
    backdrop.setAttribute('data-close', '1');
    var modal = el('div', 'modal');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'howTitle');

    var head = el('div', 'modal-head');
    var h2 = el('h2', null, '어떻게 검사하나요');
    h2.id = 'howTitle';
    var close = el('button', 'modal-close', '✕');
    close.setAttribute('aria-label', '닫기');
    close.setAttribute('data-close', '1');
    head.appendChild(h2);
    head.appendChild(close);

    var body = el('div', 'modal-body');
    var list = el('div', 'how-list');
    steps.forEach(function (s, i) {
      var item = el('div', 'how-item');
      item.appendChild(el('span', 'how-num', String(i + 1)));
      var copy = el('div');
      copy.appendChild(el('h3', null, s[0]));
      copy.appendChild(el('p', null, s[1]));
      item.appendChild(copy);
      list.appendChild(item);
    });
    body.appendChild(list);

    var foot = el('div', 'how-foot');
    foot.appendChild(el('b', null, '한계도 분명합니다. '));
    foot.appendChild(document.createTextNode(
      '100% 완벽한 탐지는 없습니다. 처음 보는 형식의 계좌번호는 놓칠 수 있고, 링크 진단은 서버 평판 데이터 없이 주소 구조만 봅니다. ' +
      '돈이 걸린 일은 이 화면의 결과와 별개로 공식 앱·대표번호에서 한 번 더 확인하세요.'
    ));
    body.appendChild(foot);

    modal.appendChild(head);
    modal.appendChild(body);
    wrap.appendChild(backdrop);
    wrap.appendChild(modal);
    modalRoot.textContent = '';
    modalRoot.appendChild(wrap);
    modalRoot.hidden = false;
    close.focus();
  }
  function closeModal() {
    modalRoot.hidden = true;
    modalRoot.textContent = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  modalRoot.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('[data-close]')) closeModal();
  });

  /* ══════════════════════════════════════════════════
     1. 개인정보 마스킹
     ══════════════════════════════════════════════════ */
  var piiInput = $('#piiInput');
  var piiFindings = $('#piiFindings');
  var piiHighlight = $('#piiHighlight');
  var piiMasked = $('#piiMasked');
  var piiEmpty = $('#piiEmpty');
  var piiCount = $('#piiCount');
  var piiRisk = $('#piiRisk');
  var piiChars = $('#piiChars');
  var piiState = $('#piiState');
  var piiSummary = $('#piiSummary');
  var piiSeg = $('#piiSeg');
  var piiNote = $('#piiNote');

  var pii = { result: null, mode: 'raw', applied: false, maskedText: '' };

  function setPiiMode(mode) {
    pii.mode = mode;
    $$('#piiSeg button').forEach(function (b) {
      var on = b.getAttribute('data-view') === mode;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    piiHighlight.hidden = mode !== 'raw';
    piiMasked.hidden = mode !== 'masked';
    piiNote.textContent = mode === 'raw'
      ? '탐지된 항목을 종류별 색으로 표시했습니다. 안전 마스킹 적용을 누르면 붙여넣어도 되는 형태로 바뀝니다.'
      : '이 상태로 복사하면 개인정보가 가려진 채 전달됩니다. 원문은 화면에만 있고 저장되지 않습니다.';
  }

  function renderPii() {
    var text = piiInput.value;
    var res = C.detectPII(text);
    pii.result = res;
    piiChars.textContent = text.length.toLocaleString('ko-KR') + '자';
    piiState.textContent = text.trim() ? '검사 완료' : '대기 중';
    piiCount.textContent = res.total + '건';

    /* 요약 */
    piiSummary.textContent = '';
    var critical = res.findings.filter(function (f) { return f.tone === 'critical'; }).length;
    piiSummary.appendChild(statEl(String(res.total), '탐지 항목', res.total ? '' : ''));
    piiSummary.appendChild(statEl(String(critical), '즉시 위험', critical ? 'danger' : ''));
    piiSummary.appendChild(statEl(text.length.toLocaleString('ko-KR'), '글자 수'));

    /* 위험 안내 */
    piiRisk.hidden = res.total === 0;
    if (res.total) {
      var msg = res.risk === 'critical'
        ? '주민등록번호·카드번호·계좌번호가 들어 있습니다. 그대로 올리면 안 됩니다.'
        : res.risk === 'high'
          ? '연락처나 사업자번호가 들어 있습니다. 필요한 부분만 가려서 보내세요.'
          : '이메일·IP가 들어 있습니다. 상대에 따라 가리는 게 안전합니다.';
      piiRisk.setAttribute('data-risk', res.risk);
      piiRisk.textContent = msg;
    }

    /* 목록 */
    var scrollTop = piiFindings.scrollTop;
    piiFindings.textContent = '';
    piiEmpty.hidden = res.total > 0;
    piiFindings.hidden = res.total === 0;
    res.findings.slice(0, 60).forEach(function (f) {
      var row = el('div', 'finding');
      var badge = el('span', 'ftype', f.label);
      badge.setAttribute('data-tone', f.tone);
      row.appendChild(badge);
      var code = el('code', null, f.masked);
      code.title = '원문 ' + f.value + ' → 마스킹 ' + f.masked;
      row.appendChild(code);
      if (f.note) {
        var note = el('span', 'fnote' + (f.confidence === 'low' ? ' low' : ''), f.note);
        row.appendChild(note);
      }
      piiFindings.appendChild(row);
    });
    if (res.total > 60) {
      piiFindings.appendChild(el('div', 'findings-more', '외 ' + (res.total - 60) + '건'));
    }
    piiFindings.scrollTop = scrollTop;

    /* 하이라이트 */
    piiHighlight.textContent = '';
    if (!text) {
      piiHighlight.appendChild(el('span', 'placeholder', '검사할 글을 붙여넣으면 여기에 탐지 결과가 표시됩니다.'));
    } else if (!res.findings.length) {
      piiHighlight.appendChild(document.createTextNode(text));
    } else {
      var cursor = 0;
      res.findings.forEach(function (f) {
        if (f.start > cursor) piiHighlight.appendChild(document.createTextNode(text.slice(cursor, f.start)));
        var mark = el('mark', 'hl', text.slice(f.start, f.end));
        mark.setAttribute('data-tone', f.tone);
        mark.title = f.label + ' · ' + (f.note || '탐지');
        piiHighlight.appendChild(mark);
        cursor = f.end;
      });
      if (cursor < text.length) piiHighlight.appendChild(document.createTextNode(text.slice(cursor)));
    }

    /* 마스킹 결과 */
    pii.maskedText = C.maskText(text, res.findings);
    piiMasked.textContent = pii.maskedText || '(빈 글)';
    if (pii.mode === 'masked') {
      piiMasked.hidden = false;
      piiHighlight.hidden = true;
    }
  }

  function statEl(value, label, cls) {
    var s = el('div', 'stat' + (cls ? ' ' + cls : ''));
    s.appendChild(el('b', null, value));
    s.appendChild(el('span', null, label));
    return s;
  }

  function applyMask() {
    if (!piiInput.value.trim()) {
      toast('먼저 검사할 글을 붙여넣어 주세요.', 'warn');
      return;
    }
    renderPii();
    setPiiMode('masked');
    var n = pii.result.total;
    if (!n) {
      toast('가릴 개인정보가 없습니다. 그대로 써도 됩니다.');
      return;
    }
    pii.applied = true;
    toast(n + '건을 가렸습니다. 복사해서 쓰세요.');
  }

  function copyMasked() {
    var text = piiInput.value;
    if (!text.trim()) { toast('복사할 글이 없습니다.', 'warn'); return; }
    var res = C.detectPII(text);
    var masked = C.maskText(text, res.findings);
    copyText(masked).then(function () {
      if (res.total) toast(res.total + '건을 가린 글을 복사했습니다.');
      else toast('가릴 개인정보가 없어 원문을 복사했습니다.');
    });
  }

  piiInput.addEventListener('input', renderPii);
  piiSeg.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-view]');
    if (b) setPiiMode(b.getAttribute('data-view'));
  });
  setPiiMode('raw');

  /* ══════════════════════════════════════════════════
     2. 링크 진단
     ══════════════════════════════════════════════════ */
  var urlForm = $('#urlForm');
  var urlInput = $('#urlInput');
  var urlResult = $('#urlResult');
  var urlError = $('#urlError');
  var urlSamples = $('#urlSamples');
  var urlRecentWrap = $('#urlRecentWrap');
  var urlRecent = $('#urlRecent');
  var urlSummary = $('#urlSummary');
  var urlHistory = [];
  var CIRC = 2 * Math.PI * 52;

  (function initGauge() {
    var fill = $('#gaugeFill');
    if (fill) {
      fill.setAttribute('stroke-dasharray', CIRC.toFixed(2));
      fill.setAttribute('stroke-dashoffset', CIRC.toFixed(2));
    }
  })();

  (function renderSamples() {
    D.SAMPLE_URLS.forEach(function (s) {
      var chip = el('button', 'sample-chip');
      chip.type = 'button';
      chip.appendChild(el('span', 'sc-label', s.label));
      chip.appendChild(el('span', 'sc-hint', s.hint));
      chip.addEventListener('click', function () {
        urlInput.value = s.url;
        toggleUrlClear();
        analyzeFromInput();
      });
      urlSamples.appendChild(chip);
    });
  })();

  function toggleUrlClear() {
    var btn = $('[data-action="url-clear"]');
    if (btn) btn.hidden = !urlInput.value;
  }
  urlInput.addEventListener('input', toggleUrlClear);

  function analyzeFromInput() {
    var res = C.analyzeUrl(urlInput.value);
    urlError.hidden = true;
    if (!res.ok) {
      urlResult.hidden = true;
      urlError.textContent = res.error;
      urlError.hidden = false;
      return;
    }
    renderUrlResult(res);
    pushHistory(res);
  }

  function renderUrlResult(res) {
    urlResult.hidden = false;
    var card = $('#scoreCard');
    card.setAttribute('data-grade', res.grade.key);
    $('#urlScore').textContent = String(res.score);
    var fill = $('#gaugeFill');
    fill.style.strokeDashoffset = (CIRC * (1 - res.score / 100)).toFixed(2);
    $('#urlGrade').textContent = res.grade.label;
    $('#urlVerdict').textContent = res.verdict;
    $('#urlAdvice').textContent = res.advice;

    var meta = $('#urlMeta');
    meta.textContent = '';
    addMeta(meta, '표시 주소', res.readableHost + (res.port ? ':' + res.port : ''));
    addMeta(meta, '등록 도메인', res.registrable);
    addMeta(meta, '경로', (res.path || '/') + (res.query || ''));
    addMeta(meta, '프로토콜', res.protocol + (res.brand ? ' · ' + res.brand + ' 공식' : ''));

    var list = $('#urlReasons');
    list.textContent = '';
    $('#urlReasonCount').textContent = res.reasons.length ? res.reasons.length + '개 항목' : '';
    if (!res.reasons.length) {
      var clean = el('div', 'reason-clean');
      clean.appendChild(el('b', null, '걸리는 위험 신호가 없습니다'));
      clean.appendChild(document.createTextNode('주소 구조만 본 결과입니다. 결제·로그인 화면이면 도메인을 한 번 더 확인하세요.'));
      list.appendChild(clean);
    } else {
      res.reasons.forEach(function (r) {
        var row = el('div', 'reason');
        row.setAttribute('data-sev', r.severity);
        row.appendChild(el('span', 'r-points', '+' + r.points));
        var body = el('div', 'r-body');
        body.appendChild(el('div', 'r-title', r.title));
        body.appendChild(el('div', 'r-detail', r.detail));
        row.appendChild(body);
        list.appendChild(row);
      });
    }

    var pos = $('#urlPositives');
    pos.textContent = '';
    if (!res.positives.length) {
      pos.appendChild(el('div', 'positive-empty', '확인된 안전 신호가 없습니다.'));
    } else {
      res.positives.forEach(function (p) { pos.appendChild(el('div', 'positive', p)); });
    }

    var how = $('#urlHowto');
    how.textContent = '';
    how.appendChild(el('b', null, '링크를 판단하는 요령'));
    var ul = el('ul');
    D.URL_TIPS.forEach(function (t) { ul.appendChild(el('li', null, t)); });
    how.appendChild(ul);

    renderUrlSummary();
  }

  function addMeta(root, label, value) {
    var row = el('div', 'meta-row');
    row.appendChild(el('span', null, label));
    row.appendChild(el('b', null, value));
    root.appendChild(row);
  }

  function pushHistory(res) {
    var same = urlHistory.filter(function (h) { return h.url === res.input; })[0];
    if (same) urlHistory.splice(urlHistory.indexOf(same), 1);
    urlHistory.unshift({ url: res.input, score: res.score, grade: res.grade.key, label: res.grade.label });
    urlHistory = urlHistory.slice(0, 8);
    renderHistory();
    renderUrlSummary();
  }

  function renderHistory() {
    urlRecentWrap.hidden = urlHistory.length === 0;
    urlRecent.textContent = '';
    urlHistory.forEach(function (h) {
      var item = el('button', 'recent-item');
      item.type = 'button';
      var sc = el('span', 'ri-score', String(h.score));
      sc.setAttribute('data-key', h.grade);
      item.appendChild(sc);
      item.appendChild(el('span', 'ri-url', h.url));
      item.addEventListener('click', function () {
        urlInput.value = h.url;
        toggleUrlClear();
        analyzeFromInput();
      });
      urlRecent.appendChild(item);
    });
  }

  function renderUrlSummary() {
    urlSummary.textContent = '';
    if (!urlHistory.length) return;
    var risky = urlHistory.filter(function (h) { return h.score >= 40; }).length;
    urlSummary.appendChild(statEl(String(urlHistory.length), '이번 세션 검사'));
    urlSummary.appendChild(statEl(String(risky), '위험 판정', risky ? 'danger' : 'ok'));
  }

  urlForm.addEventListener('submit', function (e) {
    e.preventDefault();
    analyzeFromInput();
  });

  /* ══════════════════════════════════════════════════
     3. 파일 점검
     ══════════════════════════════════════════════════ */
  var fileDrop = $('#fileDrop');
  var fileInput = $('#fileInput');
  var fileList = $('#fileList');
  var fileEmpty = $('#fileEmpty');
  var fileSummary = $('#fileSummary');
  var hashInput = $('#hashInput');
  var hashState = $('#hashState');
  var files = [];
  var fileSeq = 0;

  function refreshFileSummary() {
    fileSummary.textContent = '';
    if (!files.length) return;
    var total = files.reduce(function (a, f) { return a + f.size; }, 0);
    var withMeta = files.filter(function (f) { return f.result && f.result.exif && f.result.exif.count > 0; }).length;
    fileSummary.appendChild(statEl(String(files.length), '검사한 파일'));
    fileSummary.appendChild(statEl(C.formatBytes(total), '전체 용량'));
    fileSummary.appendChild(statEl(String(withMeta), '메타데이터 포함', withMeta ? 'danger' : ''));
  }

  async function addFiles(fileObjs) {
    var list = Array.prototype.slice.call(fileObjs);
    if (!list.length) return;
    for (var i = 0; i < list.length; i++) {
      var f = list[i];
      var entry = { id: ++fileSeq, file: f, name: f.name, size: f.size, type: f.type, result: null, cleaned: null, busy: false };
      files.unshift(entry);
      renderFiles();
      try {
        var buffer = await f.arrayBuffer();
        entry.result = await C.inspectFile({ name: f.name, size: f.size, type: f.type, buffer: buffer });
      } catch (err) {
        entry.result = {
          name: f.name, size: f.size, mime: f.type || '', ext: '', hash: { error: '읽기 실패' },
          sniff: { kind: 'bin', label: '읽을 수 없음', hex: '' },
          verdict: { level: 'danger', title: '파일을 읽지 못했습니다', detail: String(err && err.message || err) },
          nameHits: [], exif: null, magicHex: ''
        };
      }
      renderFiles();
    }
    refreshFileSummary();
  }

  function renderFiles() {
    fileList.textContent = '';
    fileEmpty.hidden = files.length > 0;
    files.forEach(function (entry) { fileList.appendChild(buildFileCard(entry)); });
    refreshFileSummary();
    applyHashCompare();
  }

  function buildFileCard(entry) {
    var r = entry.result;
    var card = el('article', 'file-card');
    card.setAttribute('data-file-id', String(entry.id));

    var head = el('div', 'file-head');
    var ext = (entry.name.split('.').pop() || '?').slice(0, 4).toUpperCase();
    head.appendChild(el('span', 'file-icon', r ? (r.sniff.kind === 'bin' ? '?' : ext) : '…'));
    var nameWrap = el('div');
    nameWrap.style.minWidth = '0';
    nameWrap.appendChild(el('div', 'file-name', entry.name));
    var meta = r
      ? C.formatBytes(entry.size) + ' · ' + (r.sniff.label) + (r.mime ? ' · ' + r.mime : '')
      : C.formatBytes(entry.size) + ' · 분석 중…';
    nameWrap.appendChild(el('div', 'file-meta', meta));
    head.appendChild(nameWrap);
    var rm = el('button', 'file-remove', '✕');
    rm.type = 'button';
    rm.setAttribute('aria-label', entry.name + ' 목록에서 빼기');
    rm.addEventListener('click', function () {
      var i = files.indexOf(entry);
      if (i >= 0) files.splice(i, 1);
      if (entry.cleaned && entry.cleaned.url) URL.revokeObjectURL(entry.cleaned.url);
      renderFiles();
    });
    head.appendChild(rm);
    card.appendChild(head);

    if (!r) {
      var loading = el('div', 'file-body');
      loading.appendChild(el('div', 'verdict', '해시를 계산하는 중…'));
      card.appendChild(loading);
      return card;
    }

    var body = el('div', 'file-body');

    /* 판정 */
    var v = el('div', 'verdict');
    v.setAttribute('data-level', r.verdict.level);
    v.appendChild(el('span', 'v-ico', r.verdict.level === 'danger' ? '!' : r.verdict.level === 'ok' ? '✓' : 'i'));
    var vc = el('div');
    vc.appendChild(el('b', null, r.verdict.title));
    if (r.verdict.detail) vc.appendChild(document.createTextNode(r.verdict.detail));
    v.appendChild(vc);
    body.appendChild(v);

    /* 해시 */
    var rows = el('div', 'hash-rows');
    if (r.hash.sha256) {
      rows.appendChild(hashRow('SHA-256', r.hash.sha256, 'sha256'));
      rows.appendChild(hashRow('SHA-1', r.hash.sha1, 'sha1'));
    } else {
      rows.appendChild(el('div', 'hash-row', r.hash.error || '해시를 계산하지 못했습니다.'));
    }
    body.appendChild(rows);

    /* 실제 형식 */
    var magic = el('div', 'magic-line');
    magic.appendChild(el('span', null, '실제 형식 '));
    magic.appendChild(el('b', null, r.sniff.label));
    magic.appendChild(el('span', null, '확장자 '));
    magic.appendChild(el('b', null, r.ext ? '.' + r.ext : '없음'));
    if (r.magicHex) {
      magic.appendChild(el('span', null, '머리글 '));
      var bytes = el('span', 'bytes', r.magicHex);
      magic.appendChild(bytes);
    }
    body.appendChild(magic);

    /* 추가 이름 경고(판정에 쓰인 것 제외) */
    var others = r.nameHits.filter(function (h) { return h.title !== r.verdict.title; });
    if (others.length) {
      var extra = el('div', 'warnings');
      others.forEach(function (h) {
        var item = el('div', 'warn-item', h.title + ' — ' + h.detail);
        extra.appendChild(item);
      });
      body.appendChild(extra);
    }

    /* EXIF */
    if (r.exif) body.appendChild(buildExif(entry));

    /* 정리 결과 */
    if (entry.cleaned) {
      var done = el('div', 'clean-done');
      var before = r.exif ? r.exif.count : 0;
      var after = entry.cleaned.result.exif ? entry.cleaned.result.exif.count : 0;
      done.appendChild(el('b', null, '메타데이터 제거 완료 · '));
      done.appendChild(document.createTextNode(
        before + '개 → ' + after + '개 · ' + entry.name + ' ' + C.formatBytes(entry.size) +
        ' → ' + C.formatBytes(entry.cleaned.blob.size)
      ));
      done.appendChild(document.createElement('br'));
      done.appendChild(document.createTextNode('새 SHA-256 '));
      var code = el('code', null, entry.cleaned.result.hash.sha256 || '—');
      done.appendChild(code);
      done.appendChild(document.createElement('br'));
      var link = el('a', null, '정리된 ' + entry.cleaned.name + ' 내려받기');
      link.href = entry.cleaned.url;
      link.setAttribute('download', entry.cleaned.name);
      done.appendChild(link);
      body.appendChild(done);
    }

    card.appendChild(body);
    return card;
  }

  function hashRow(algo, value, key) {
    var row = el('div', 'hash-row');
    row.setAttribute('data-hash-key', key);
    row.appendChild(el('span', 'h-algo', algo));
    row.appendChild(el('code', null, value));
    var btn = el('button', 'h-copy', '복사');
    btn.type = 'button';
    btn.setAttribute('aria-label', algo + ' 복사');
    btn.addEventListener('click', function () {
      copyText(value).then(function () { toast(algo + ' 해시를 복사했습니다.'); });
    });
    row.appendChild(btn);
    return row;
  }

  function buildExif(entry) {
    var r = entry.result;
    var exif = r.exif;
    var box = el('div', 'exif-box');

    var head = el('div', 'exif-head');
    head.appendChild(el('h3', null, '사진 메타데이터'));
    var pill = el('span', 'exif-count' + (exif.count ? '' : ' exif-clean'),
      exif.count ? exif.count + '개 항목' : '메타데이터 없음');
    head.appendChild(pill);
    box.appendChild(head);

    if (exif.gps) {
      var gps = el('div', 'exif-gps');
      gps.appendChild(el('span', null, 'GPS 좌표 포함'));
      gps.appendChild(el('b', null, C.formatGps(exif.gps)));
      box.appendChild(gps);
    }

    if (exif.count) {
      var grid = el('div', 'exif-tags');
      exif.tags.slice(0, 14).forEach(function (t) {
        var row = el('div', 'exif-tag');
        row.appendChild(el('span', 't-name', t.name));
        var val = Array.isArray(t.value) ? t.value.slice(0, 3).map(function (v) {
          return typeof v === 'number' ? (Math.round(v * 1000) / 1000) : v;
        }).join(', ') : String(t.value);
        row.appendChild(el('span', 't-val', val));
        grid.appendChild(row);
      });
      box.appendChild(grid);
      if (exif.tags.length > 14) {
        box.appendChild(el('div', 'clean-note', '외 ' + (exif.tags.length - 14) + '개 항목이 더 있습니다.'));
      }
    } else {
      box.appendChild(el('div', 'clean-note', '이 파일에는 GPS·촬영기기 정보가 남아 있지 않습니다.'));
    }

    var isImage = exif.format === 'jpeg' || exif.format === 'png' || exif.format === 'webp';
    if (isImage) {
      var acts = el('div', 'clean-actions');
      var bj = el('button', 'btn btn-sm', 'JPG로 정리해 내려받기');
      bj.type = 'button';
      bj.setAttribute('data-action', 'clean-jpg');
      bj.addEventListener('click', function () { cleanImage(entry, 'image/jpeg', bj); });
      var bp = el('button', 'btn btn-sm', 'PNG로 정리해 내려받기');
      bp.type = 'button';
      bp.setAttribute('data-action', 'clean-png');
      bp.addEventListener('click', function () { cleanImage(entry, 'image/png', bp); });
      acts.appendChild(bj);
      acts.appendChild(bp);
      box.appendChild(acts);
      box.appendChild(el('div', 'clean-note',
        '사진을 캔버스에 다시 그려 저장합니다. EXIF·GPS·썸네일·제조사 정보가 모두 빠지고, 화면에 보이던 방향 그대로 저장됩니다.'));
    } else {
      box.appendChild(el('div', 'clean-note', '이 형식은 여기서 메타데이터를 제거할 수 없습니다.'));
    }
    return box;
  }

  async function cleanImage(entry, mime, btn) {
    if (!entry.file) return;
    var oldText = btn.textContent;
    btn.disabled = true;
    btn.textContent = '정리하는 중…';
    try {
      var url = URL.createObjectURL(entry.file);
      var img = new Image();
      await new Promise(function (resolve, reject) {
        img.onload = resolve;
        img.onerror = function () { reject(new Error('이미지를 열 수 없습니다.')); };
        img.src = url;
      });
      var w = img.naturalWidth, h = img.naturalHeight;
      var canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      var ctx = canvas.getContext('2d');
      if (mime === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
      }
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);

      var blob = await new Promise(function (resolve) { canvas.toBlob(resolve, mime, 0.92); });
      if (!blob) throw new Error('이미지를 저장하지 못했습니다.');
      var ext = mime === 'image/png' ? 'png' : 'jpg';
      var name = entry.name.replace(/\.[^.]+$/, '') + '-clean.' + ext;
      var result = await C.inspectFile({ name: name, size: blob.size, type: mime, buffer: await blob.arrayBuffer() });
      if (entry.cleaned && entry.cleaned.url) URL.revokeObjectURL(entry.cleaned.url);
      entry.cleaned = { blob: blob, name: name, url: URL.createObjectURL(blob), result: result };
      triggerDownload(entry.cleaned);
      renderFiles();
      toast('메타데이터를 지운 사진을 내려받았습니다.');
    } catch (err) {
      toast('정리 실패: ' + (err.message || err), 'warn');
      btn.disabled = false;
      btn.textContent = oldText;
    }
  }

  function triggerDownload(cleaned) {
    var a = document.createElement('a');
    a.href = cleaned.url;
    a.setAttribute('download', cleaned.name);
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function applyHashCompare() {
    var raw = (hashInput.value || '').trim().replace(/\s+/g, '').toLowerCase();
    $$('.hash-row').forEach(function (row) { row.classList.remove('is-match'); });
    hashState.textContent = '';
    hashState.removeAttribute('data-state');
    if (!raw) return;
    var algo = raw.length === 64 ? 'sha256' : raw.length === 40 ? 'sha1' : null;
    if (!algo) {
      hashState.textContent = '64자(SHA-256) 또는 40자(SHA-1)';
      hashState.setAttribute('data-state', 'bad');
      return;
    }
    if (!/^[0-9a-f]+$/.test(raw)) {
      hashState.textContent = '16진수만 입력하세요';
      hashState.setAttribute('data-state', 'bad');
      return;
    }
    var match = 0, diff = 0;
    files.forEach(function (e) {
      if (!e.result || !e.result.hash) return;
      var val = e.result.hash[algo];
      if (!val) return;
      if (val === raw) match++; else diff++;
    });
    if (match) {
      hashState.textContent = '일치 · ' + match + '개 파일';
      hashState.setAttribute('data-state', 'match');
      $$('.hash-row[data-hash-key="' + algo + '"]').forEach(function (row) {
        var code = row.querySelector('code');
        if (code && code.textContent.toLowerCase() === raw) row.classList.add('is-match');
      });
    } else if (diff) {
      hashState.textContent = '불일치 (' + algo.toUpperCase() + ')';
      hashState.setAttribute('data-state', 'diff');
    }
  }

  hashInput.addEventListener('input', applyHashCompare);

  fileDrop.addEventListener('click', function () { fileInput.click(); });
  fileDrop.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); }
  });
  fileInput.addEventListener('change', function () {
    if (fileInput.files && fileInput.files.length) addFiles(fileInput.files);
    fileInput.value = '';
  });
  ['dragenter', 'dragover'].forEach(function (ev) {
    fileDrop.addEventListener(ev, function (e) {
      e.preventDefault();
      e.stopPropagation();
      fileDrop.classList.add('is-over');
    });
  });
  ['dragleave', 'drop'].forEach(function (ev) {
    fileDrop.addEventListener(ev, function (e) {
      e.preventDefault();
      e.stopPropagation();
      fileDrop.classList.remove('is-over');
    });
  });
  fileDrop.addEventListener('drop', function (e) {
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  });
  window.addEventListener('dragover', function (e) { e.preventDefault(); });
  window.addEventListener('drop', function (e) { e.preventDefault(); });

  async function loadSamplePhoto(btn) {
    if (btn) btn.disabled = true;
    try {
      var resp = await fetch('sample-photo.jpg');
      if (!resp.ok) throw new Error('샘플 파일을 찾지 못했습니다.');
      var blob = await resp.blob();
      var file = new File([blob], 'seoul-sample.jpg', { type: 'image/jpeg' });
      await addFiles([file]);
      fileList.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      toast('샘플을 불러오지 못했습니다: ' + (err.message || err), 'warn');
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  /* ══════════════════════════════════════════════════
     4. 비밀번호
     ══════════════════════════════════════════════════ */
  var pwInput = $('#pwInput');
  var pwBar = $('#pwBar');
  var pwLevel = $('#pwLevel');
  var pwBits = $('#pwBits');
  var pwOnline = $('#pwOnline');
  var pwOffline = $('#pwOffline');
  var pwPool = $('#pwPool');
  var pwWarnings = $('#pwWarnings');
  var pwClasses = $('#pwClasses');
  var pwSummary = $('#pwSummary');
  var genOut = $('#genOut');
  var genMeta = $('#genMeta');
  var genLen = $('#genLen');
  var genLenVal = $('#genLenVal');

  var CLASS_LABELS = [
    ['lower', '소문자'], ['upper', '대문자'], ['digit', '숫자'], ['symbol', '기호'], ['hangul', '한글']
  ];

  function renderPassword() {
    var value = pwInput.value;
    var res = C.analyzePassword(value);
    pwBar.setAttribute('data-score', value ? String(res.score) : '');
    pwBar.style.width = '';
    pwLevel.textContent = value ? res.level.label : '—';
    pwLevel.style.color = value
      ? (res.score <= 1 ? 'var(--danger)' : res.score === 2 ? 'var(--warn)' : 'var(--ok)')
      : '';
    pwBits.textContent = value ? Math.round(res.entropy) + '비트' : '0비트';
    pwOnline.textContent = value ? res.crackText.online : '—';
    pwOffline.textContent = value ? res.crackText.offline : '—';
    pwPool.textContent = value
      ? res.pool + '가지 · ' + res.length + '자'
      : '—';

    pwWarnings.textContent = '';
    (value ? res.warnings : []).forEach(function (w) {
      pwWarnings.appendChild(el('div', 'warn-item', w.label));
    });

    pwClasses.textContent = '';
    CLASS_LABELS.forEach(function (pair) {
      var chip = el('span', 'class-chip' + (res.classes[pair[0]] ? ' is-on' : ''), pair[1]);
      pwClasses.appendChild(chip);
    });

    pwSummary.textContent = '';
    if (value) {
      pwSummary.appendChild(statEl(Math.round(res.entropy) + 'bit', '실효 엔트로피'));
      pwSummary.appendChild(statEl(res.level.label, '등급',
        res.score <= 1 ? 'danger' : res.score >= 3 ? 'ok' : ''));
      pwSummary.appendChild(statEl(res.crackText.offline, '오프라인 크래킹'));
    }
  }

  function generate() {
    var opts = {
      length: Number(genLen.value) || 20,
      lower: $('#genLower').checked,
      upper: $('#genUpper').checked,
      digit: $('#genDigit').checked,
      symbol: $('#genSymbol').checked,
      excludeAmbiguous: $('#genNoAmbiguous').checked,
      requireEach: true
    };
    if (!opts.lower && !opts.upper && !opts.digit && !opts.symbol) {
      opts.lower = true;
      $('#genLower').checked = true;
    }
    var pw = C.generatePassword(opts);
    genOut.textContent = pw;
    var info = C.analyzePassword(pw);
    genMeta.textContent = pw.length + '자 · ' + info.pool + '가지 글자 · 약 ' +
      Math.round(info.entropy) + '비트 · 오프라인 기준 ' + info.crackText.offline;
    return pw;
  }

  genLen.addEventListener('input', function () {
    genLenVal.textContent = genLen.value;
    generate();
  });
  ['#genLower', '#genUpper', '#genDigit', '#genSymbol', '#genNoAmbiguous'].forEach(function (sel) {
    var node = $(sel);
    if (node) node.addEventListener('change', generate);
  });

  pwInput.addEventListener('input', renderPassword);

  /* ══════════════════════════════════════════════════
     전역 액션
     ══════════════════════════════════════════════════ */
  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('[data-action]');
    if (!trigger) return;
    var action = trigger.getAttribute('data-action');

    switch (action) {
      case 'toggle-theme': toggleTheme(); break;
      case 'open-how': openHow(); break;
      case 'go-pii': e.preventDefault(); switchTab('pii'); break;
      case 'pii-sample':
        piiInput.value = D.SAMPLE_TEXT;
        renderPii();
        setPiiMode('raw');
        piiInput.scrollTop = 0;
        piiInput.focus();
        piiInput.setSelectionRange(0, 0);
        piiInput.scrollTop = 0;
        break;
      case 'pii-clear':
        piiInput.value = '';
        pii.applied = false;
        renderPii();
        setPiiMode('raw');
        piiInput.focus();
        break;
      case 'pii-apply': applyMask(); break;
      case 'pii-copy': copyMasked(); break;
      case 'url-clear':
        urlInput.value = '';
        toggleUrlClear();
        urlResult.hidden = true;
        urlError.hidden = true;
        urlInput.focus();
        break;
      case 'url-clear-history':
        urlHistory = [];
        renderHistory();
        renderUrlSummary();
        break;
      case 'load-sample-photo': loadSamplePhoto(trigger); break;
      case 'generate': generate(); break;
      case 'gen-copy':
        if (!genOut.textContent || genOut.textContent === '—') { generate(); }
        copyText(genOut.textContent).then(function () { toast('생성한 비밀번호를 복사했습니다.'); });
        break;
      case 'toggle-pw': {
        var isPw = pwInput.type === 'password';
        pwInput.type = isPw ? 'text' : 'password';
        trigger.classList.toggle('is-on', isPw);
        trigger.setAttribute('aria-label', isPw ? '비밀번호 가리기' : '비밀번호 보기');
        break;
      }
      default: break;
    }
  });

  $$('.tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      switchTab(tab.getAttribute('data-tab'));
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modalRoot.hidden) closeModal();
    if (e.key === 'Escape' && document.activeElement === urlInput && urlInput.value) {
      urlInput.value = '';
      toggleUrlClear();
      urlResult.hidden = true;
      urlError.hidden = true;
    }
  });

  /* ── 시작 ───────────────────────────────────────── */
  initTheme();
  renderPii();
  renderFiles();
  renderPassword();
  generate();

  /* 새로고침해도 붙여넣은 내용이 남지 않도록 입력값을 비웁니다 */
  window.addEventListener('pageshow', function () {
    if (piiInput.value) { piiInput.value = ''; renderPii(); }
  });
})();
