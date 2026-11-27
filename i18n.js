/* ============================================================
   OneTap i18n · KO/EN runtime translation (v1)
   - ?lang=en|ko  >  localStorage 'onetap_lang'  >  navigator.language
   - DOM text and attributes are translated in place and restored on switch.
   - Elements added later by app.js are translated by a MutationObserver.
   - Missing keys are reported to console as "I18N_MISS: <korean>".
   ============================================================ */
(function (root, doc) {
  'use strict';

  var LANG_KEY = 'onetap_lang';
  var COMMON = /*__COMMON__*/ {"닫기":"Close","취소":"Cancel","저장":"Save","저장됨":"Saved","삭제":"Delete","복사":"Copy","복사됨":"Copied","다운로드":"Download","내려받기":"Download","공유":"Share","인쇄":"Print","초기화":"Reset","다시 시도":"Try again","불러오기":"Load","내보내기":"Export","적용":"Apply","추가":"Add","편집":"Edit","수정":"Edit","보기":"View","미리보기":"Preview","설정":"Settings","도움말":"Help","사용법":"Guide","예시":"Example","샘플":"Sample","무료":"Free","유료":"Paid","개인정보":"Privacy","개인정보 처리방침":"Privacy policy","개인정보 처리 안내":"Privacy notice","이용약관":"Terms","홈":"Home","뒤로":"Back","다음":"Next","이전":"Previous","확인":"OK","검색":"Search","필터":"Filter","전체":"All","없음":"None","준비 중":"Coming soon","준비 중입니다":"Coming soon","로딩 중":"Loading","불러오는 중":"Loading","처리 중":"Working","빈칸":"Blank","필수":"Required","선택":"Optional","이름":"Name","제목":"Title","날짜":"Date","시간":"Time","메모":"Note","상태":"Status","결과":"Result","요약":"Summary","상세":"Details","언어":"Language","한국어":"Korean","영어":"English","복사하기":"Copy","링크 복사":"Copy link","전체 복사":"Copy all","다크 모드로 전환":"Switch to dark mode","라이트 모드로 전환":"Switch to light mode","테마 전환":"Toggle theme","라이트/다크":"Light / dark","다크/라이트":"Dark / light","새 탭에서 보기":"Open in new tab","새 창":"New window","본문으로 건너뛰기":"Skip to content","본문으로 바로가기":"Skip to content","맨 위로":"Back to top","더 보기":"Show more","접기":"Collapse","펼치기":"Expand","자주 묻는 질문":"Frequently asked questions","이 브라우저에만 저장됩니다":"Saved only in this browser","이 브라우저에만 저장됩니다 · 서버 전송 0":"Saved only in this browser · zero uploads","서버 전송 없음":"No upload","서버 업로드 없음":"No server upload","100% 브라우저 처리":"100% in-browser","브라우저에서 처리":"Processed in your browser","파일은 서버로 전송되지 않습니다":"Files never leave your device","파일이 서버로 전송되지 않습니다":"Files never leave your device","붙여넣은 코드는 서버로 전송되지 않습니다":"Pasted code never leaves your device"};
  var APP = /*__DICT__*/ {"보안 가드 — 개인정보·피싱링크·파일 점검기":"Security Guard — personal data, phishing links and file checker","AI에 붙여넣기 전 개인정보 마스킹, 피싱 링크 위험 진단, 파일 SHA-256·위장 확장자·사진 GPS 제거까지. 서버 전송 없이 브라우저 안에서만 동작합니다.":"Mask personal data before pasting it into AI, diagnose risky phishing links, and check files for SHA-256, disguised extensions and photo GPS — all inside your browser with nothing sent to a server.","보안 가드":"Security Guard","AI에 붙여넣기 전 개인정보 마스킹, 피싱 링크 진단, 파일 해시·위장 확장자·사진 GPS 제거. 서버 전송 없이 브라우저 안에서만.":"Mask personal data before pasting into AI, diagnose phishing links, and check file hashes, disguised extensions and photo GPS. Nothing leaves the browser.","보안 가드 홈":"Security Guard home","주요 화면":"Main screens","입력한 내용은 어디로도 전송되지 않습니다":"What you enter is never sent anywhere","개인정보 마스킹":"Personal data masking","여기에 붙여넣으면 바로 검사합니다.\n예: 010-1234-5678, 900101-1234568, hong@example.com":"Paste here and it checks at once.\nExample: 010-1234-5678, 900101-1234568, hong@example.com","미리보기 모드":"Preview mode","피싱 링크 진단":"Phishing link check","확인할 링크 — https://… 또는 bit.ly/…":"Link to check — https://… or bit.ly/…","검사할 링크":"Link to check","입력 지우기":"Clear input","예시 링크":"Example links","파일 점검":"File check","파일 선택 또는 끌어다 놓기":"Choose or drop files","SHA-256 64자 · SHA-1 40자":"SHA-256 64 chars · SHA-1 40 chars","비밀번호 강도 진단":"Password strength check","확인할 비밀번호":"Password to check","비밀번호 보기":"Show password","본문으로 바로가기":"Skip to content","링크 진단":"Link check","비밀번호":"Password","서버 전송 0":"Nothing sent to a server","작동 원리":"How it works","개인정보 마스킹 · 체크섬 검증":"Personal data masking · checksum validation","붙여넣기 전에,":"Before you paste,","가릴 것은 가립니다":"hide what should be hidden","AI 챗봇·SNS·게시판에 올리기 전에 주민등록번호·카드·계좌를 찾아 가립니다. 입력한 글은 서버로 가지 않고 이 브라우저 안에서만 검사됩니다.":"Before posting to an AI chatbot, social media or a forum, it finds and hides resident registration numbers, cards and bank accounts. Your text is never sent to a server — it is checked only in this browser.","주민등록번호":"Resident registration no.","카드 · Luhn":"Card · Luhn","계좌":"bank account","사업자번호":"Business no.","연락처":"Phone","이메일 · IP":"Email · IP","검사할 글":"Text to check","예시":"Example","지우기":"Clear","0자":"0 chars","대기 중":"Waiting","브라우저에서만 처리":"Processed only in your browser","탐지된 개인정보":"Personal data found","0건":"0 found","아직 탐지된 항목이 없습니다.":"Nothing detected yet.","주민등록번호 · 카드번호 · 계좌번호 · 휴대폰 · 전화 · 이메일 · 사업자번호 · IP를 찾습니다.":"Looks for resident registration numbers, card numbers, bank accounts, mobile and landline numbers, email addresses, business numbers and IP addresses.","결과 미리보기":"Result preview","탐지 표시":"Show detections","마스킹 결과":"Masked result","안전 마스킹 적용":"Apply safe masking","복사":" copy","탐지된 항목을 종류별 색으로 표시했습니다.":"Detected items are colour-coded by type.","을 누르면 붙여넣어도 되는 형태로 바뀝니다.":" turns it into a form that is safe to paste.","피싱 링크 진단 · 문자·메일":"Phishing link check · SMS and email","누르기 전에,":"Before you tap,","주소를 해부합니다":"dissect the address","문자·메일로 온 링크를 누르기 전에 확인하세요. 브랜드 사칭 유사 도메인, 퓨니코드, IP 직접 접속, @ 우회, 단축 URL을 한 번에 봅니다.":"Check a link from a text or email before tapping it. Brand look-alike domains, punycode, direct IP access, @ tricks and short URLs are all inspected at once.","유사 도메인":"Look-alike domain","퓨니코드":"Punycode","@ 우회":"@ trick","IP 접속":"IP access","단축 URL":"Short URL","위험 확장자":"Dangerous extension","진단":"Check","안전":"Safe","위험 근거":"Risk evidence","확인된 안전 신호":"Safety signals found","이번 세션 검사 기록":"Checks in this session","기록 지우기":"Clear history","파일 점검 · 해시 · EXIF":"File check · hash · EXIF","보내기 전에,":"Before you send,","속을 열어봅니다":"look inside","SHA-256 해시 계산, 확장자 위장 탐지, 사진에 박힌 GPS·촬영기기 정보 제거까지. 파일은 업로드되지 않고 브라우저 메모리에서만 읽습니다.":"SHA-256 hashes, disguised extensions and the GPS and camera details buried in photos. Files are never uploaded — they are read only in your browser's memory.","매직 바이트":"Magic bytes","이중 확장자":"Double extension","RTL 문자":"RTL characters","GPS · 촬영기기":"GPS · camera","파일을 끌어다 놓거나":"Drag files here or","클릭":"click","하세요":"to choose","이미지 · 문서 · 설치 파일 · 여러 개 한 번에 (HEIC·AVIF 포함)":"Images, documents, installers — several at once (HEIC and AVIF included)","파일은 어디로도 전송되지 않습니다":"Files never leave this device","GPS 들어간 샘플 사진으로 체험":"Try a sample photo with GPS","아이폰 HEIC 샘플로 체험":"Try the iPhone HEIC sample","대조할 해시":"Hash to compare","아직 검사한 파일이 없습니다.":"No files checked yet.","위에 파일을 놓으면 해시·실제 형식·메타데이터를 바로 분석합니다.":"Drop a file above and its hash, real format and metadata are analysed at once.","비밀번호 진단 · 생성":"Password check · generate","얼마나 빨리 뚫리는지,":"How fast it gets cracked,","숫자로":"in numbers","실효 엔트로피로 크래킹 시간을 계산하고, 브라우저 보안 난수(crypto.getRandomValues)로 새 비밀번호를 만듭니다. 입력한 비밀번호는 저장하지 않습니다.":"Effective entropy gives the cracking time, and new passwords come from the browser's secure random source (crypto.getRandomValues). The password you type is never stored.","실효 엔트로피":"Effective entropy","GPU 추정":"GPU estimate","패턴 감점":"Pattern penalty","crypto 난수":"crypto random","특수문자 포함":"Symbols included","강도 진단":"Strength check","입력 즉시 계산":"calculated as you type","0비트":"0 bits","온라인 공격 (초당 100회)":"Online attack (100 guesses a second)","오프라인 GPU (초당 100억 회)":"Offline GPU (10 billion a second)","글자 종류":"Character types","사전·패턴 기반 진단":"Dictionary and pattern check","사전 공격 엔진을 불러오는 중…":"Loading the dictionary attack engine…","흔한 단어·반복·연속 배열을 감점한 뒤의 실효 엔트로피로 계산합니다. 사전 엔진이 준비되면 실제 추측 횟수(사전·키보드 패턴 인식)로 등급을 다시 매깁니다. 사이트마다 해시 방식이 달라 실제 시간은 달라질 수 있습니다.":"Entropy is reduced for common words, repetition and sequences. Once the dictionary engine is ready, the grade is re-scored on real guess counts (dictionary and keyboard pattern recognition). Actual times vary with each site's hashing.","안전한 비밀번호 생성":"Generate a safe password","길이":"Length ","영문 소문자":"Lowercase letters","영문 대문자":"Uppercase letters","숫자":"Digits","기호":"Symbols","헷갈리는 글자 제외 (I l 1 O 0 o)":"Exclude look-alikes (I l 1 O 0 o)","새로 생성":"Generate","한 글자도 예측할 수 없는 난수를 씁니다. 생성 기록은 저장하지 않으니, 마음에 들면 바로 비밀번호 관리자에 넣으세요.":"It uses randomness no one can predict. Generated passwords are not stored, so put one you like straight into your password manager.","붙여넣기 전에 가리고, 누르기 전에 확인합니다.":"Hide before you paste, check before you tap.","처리 방식":"How it works","서버 없음 · 외부 전송 0건":"No server · nothing sent out","입력한 내용은 저장하지 않습니다":"What you enter is never stored","남는 것":"What stays","화면을 닫으면 붙여넣은 글·파일·비밀번호는 사라지고, 테마 설정만 이 기기에 남습니다.":"Close the screen and the pasted text, files and password are gone; only the theme setting stays on this device.","문서":"Documents","모든 검사는 이 브라우저 안에서 실행됩니다.":"Every check runs inside this browser.","개인정보 처리방침":"Privacy policy","개인정보 처리 방침 — 보안 가드":"Privacy policy — Security Guard","앱으로 돌아가기 →":"Back to the app →","개인정보 처리 방침":"Privacy policy","보안 가드 · 최종 갱신 2026-11-21":"Security Guard · last updated 2026-11-21","1. 수집하는 개인정보":"1. Personal data we collect","없습니다. 검사하려고 붙여넣은 글·파일·비밀번호는 메모리에서만 처리되고 저장되지 않습니다.":"None. Text, files and passwords you paste in for checking are processed in memory only and never stored.","2. 저장 위치와 항목":"2. What is stored, and where","테마 설정만 브라우저 localStorage에 남습니다. 검사 기록·입력 내용은 저장하지 않으며, 화면을 닫으면 사라집니다.":"Only the theme setting stays in the browser's localStorage. Check history and inputs are not stored and disappear when you close the screen.","3. 외부 전송":"3. External requests","외부 전송이 0건입니다. 링크·문구 점검은 브라우저 안의 규칙으로만 판정하며, 어떤 주소로도 접속하지 않습니다.":"Nothing is sent out. Links and text are judged by rules inside the browser, and no address is ever contacted.","4. 쿠키·추적":"4. Cookies and tracking","쿠키를 쓰지 않습니다. 분석 도구·광고 픽셀·외부 트래커를 넣지 않으며, 이용 기록을 수집하지 않습니다.":"No cookies. There are no analytics tools, ad pixels or external trackers, and no usage history is collected.","5. 보관과 삭제":"5. Retention and deletion","브라우저 사이트 데이터를 지우면 테마 설정까지 삭제됩니다. 저장하는 검사 기록이 없어 따로 지울 항목은 없습니다.":"Clearing site data in the browser removes the theme setting too. No check history is stored, so there is nothing else to delete.","6. 제3자 제공":"6. Third-party sharing","제3자에게 제공하는 데이터가 없습니다. 운영자는 이용자의 데이터를 받지 않으므로 별도 제공·위탁이 없습니다.":"No data is shared with third parties. The operator receives nothing, so nothing is shared or outsourced.","7. 문의":"7. Contact","이 앱은 정적 파일로 배포되며 운영자에게 개인정보가 전달되지 않습니다. 문의·오류 제보는 배포 페이지에 안내된 연락처나 배포 저장소의 이슈로 남겨 주세요.":"This app is served as static files, so no personal data reaches the operator. For questions or bug reports, use the contact on the deployed page or open an issue in the deployment repository.","← 앱으로 돌아가기":"← Back to the app","보안 가드는 서버 없이 브라우저에서만 동작하는 정적 앱으로, 수집하는 개인정보가 없습니다.":"Security Guard is a static app that runs only in the browser with no server and collects no personal data.","라이트 모드로 전환":"Switch to light mode","다크 모드로 전환":"Switch to dark mode","라이트 모드":"Light mode","다크 모드":"Dark mode","라이트/다크":"Light / dark","브라우저 안에서만":"Only in your browser","붙여넣은 글·파일·비밀번호는 이 탭의 메모리에서만 읽습니다. 서버도, 분석 도구도, 광고 스크립트도 없습니다.":"Pasted text, files and passwords are read only in this tab's memory. There is no server, no analytics and no ad script.","번호는 계산으로 검증":"Numbers are verified by arithmetic","주민등록번호와 사업자등록번호는 자체 체크섬, 카드번호는 Luhn 규칙으로 확인해 숫자만 우연히 맞은 경우를 걸러냅니다.":"Resident registration and business numbers go through their own checksums and card numbers through the Luhn rule, so numbers that merely look right are filtered out.","도메인을 해부":"Dissect the domain","퓨니코드(xn--) 주소를 실제 글자로 풀고, 브랜드 이름과 편집 거리를 비교해 한두 글자만 다른 사칭을 찾습니다. @ 앞부분, IP 직접 접속, 단축 URL도 같이 봅니다.":"Punycode (xn--) addresses are decoded into real characters, and brand names are compared by edit distance to catch look-alikes one or two letters off. The part before @, direct IP access and short URLs are checked too.","파일은 바이트로":"Files by their bytes","확장자를 믿지 않고 매직 바이트(파일 머리글)를 읽습니다. 사진은 EXIF에서 GPS·기기·촬영시각을 꺼내 보여 주고, 캔버스에 다시 그려 메타데이터가 없는 파일을 만들어 줍니다.":"Instead of trusting the extension, it reads the magic bytes (the file header). For photos it pulls GPS, device and capture time from EXIF, then redraws them on a canvas to produce a file with no metadata.","난수는 crypto로":"Randomness from crypto","비밀번호 생성은 Math.random이 아니라 crypto.getRandomValues를 씁니다. 예측 가능한 난수는 비밀번호에 쓰면 안 됩니다.":"Passwords are generated with crypto.getRandomValues, not Math.random. Predictable randomness must never be used for a password.","어떻게 검사하나요":"How does it check?","닫기":"Close","한계도 분명합니다.":"The limits are clear too. ","100% 완벽한 탐지는 없습니다. 처음 보는 형식의 계좌번호는 놓칠 수 있고, 링크 진단은 서버 평판 데이터 없이 주소 구조만 봅니다.":"No detection is 100%. An unfamiliar bank-account format can be missed, and link checks look only at the address structure without server reputation data. ","돈이 걸린 일은 이 화면의 결과와 별개로 공식 앱·대표번호에서 한 번 더 확인하세요.":"For anything involving money, confirm once more in the official app or on the official phone number, whatever this screen says.","탐지된 항목을 종류별 색으로 표시했습니다. 안전 마스킹 적용을 누르면 붙여넣어도 되는 형태로 바뀝니다.":"Detected items are colour-coded by type. Press Apply safe masking to turn them into a form you can paste.","이 상태로 복사하면 개인정보가 가려진 채 전달됩니다. 원문은 화면에만 있고 저장되지 않습니다.":"Copied in this state, the personal data goes out masked. The original exists only on screen and is never stored.","자":"chars","검사 완료":"Checked","건":"found","탐지 항목":"Detected items","즉시 위험":"Immediate risk","글자 수":"Characters","주민등록번호·카드번호·계좌번호가 들어 있습니다. 그대로 올리면 안 됩니다.":"It contains resident registration, card or bank-account numbers. Do not post it as is.","연락처나 사업자번호가 들어 있습니다. 필요한 부분만 가려서 보내세요.":"It contains phone numbers or a business number. Hide the parts that are not needed.","이메일·IP가 들어 있습니다. 상대에 따라 가리는 게 안전합니다.":"It contains email addresses or IPs. Depending on the recipient, masking is safer.","원문":"Original ","→ 마스킹":" → masked ","외":" and ","검사할 글을 붙여넣으면 여기에 탐지 결과가 표시됩니다.":"Paste text to check and the results appear here.","탐지":"Detected","(빈 글)":"(empty)","먼저 검사할 글을 붙여넣어 주세요.":"Paste some text to check first.","가릴 개인정보가 없습니다. 그대로 써도 됩니다.":"No personal data to hide. You can use it as is.","건을 가렸습니다. 복사해서 쓰세요.":" items masked. Copy and use it.","복사할 글이 없습니다.":"There is nothing to copy.","건을 가린 글을 복사했습니다.":"Copied the text with items masked.","가릴 개인정보가 없어 원문을 복사했습니다.":"Nothing needed hiding, so the original was copied.","복사하지 못했습니다. 직접 선택해 복사해 주세요.":"Could not copy. Select the text and copy it yourself.","표시 주소":"Shown address","등록 도메인":"Registrable domain","공인 접미사":"Public suffix","(민간)":" (private)","경로":"Path","프로토콜":"Protocol","공식":" official","이 주소는":"This address was created in ","아래 누구나 등록할 수 있는 공간에 만들어졌습니다.":", where anyone can register. ","등록 도메인은":"The registrable domain is ","이고, 실제 운영 주체는 이 주소만으로 알 수 없습니다.":", and the operator cannot be known from the address alone.","개 항목":" items","걸리는 위험 신호가 없습니다":"no risk signals found","주소 구조만 본 결과입니다. 결제·로그인 화면이면 도메인을 한 번 더 확인하세요.":"This looks only at the address structure. On a payment or login screen, check the domain once more.","확인된 안전 신호가 없습니다.":"No safety signals found.","링크를 판단하는 요령":"How to judge a link","이번 세션 검사":"Checks this session","위험 판정":"Verdict","검사한 파일":"Files checked","전체 용량":"Total size","메타데이터 포함":"with metadata","읽기 실패":"read failed","읽을 수 없음":"unreadable","파일을 읽지 못했습니다":"Could not read the file","· 분석 중…":" · analysing…","목록에서 빼기":" Remove from the list","해시를 계산하는 중…":"Computing the hash…","해시를 계산하지 못했습니다.":"Could not compute the hash.","실제 형식":"Real format ","확장자":"Extension ","없음":"None","머리글":"Header ","메타데이터 제거 완료 ·":"Metadata removed · ","개 →":" → ","개 ·":" · ","새 SHA-256":"New SHA-256 ","정리된":"Cleaned ","내려받기":" download","해시를 복사했습니다.":" hash copied.","사진 메타데이터":"Photo metadata","메타데이터 없음":"no metadata","GPS 좌표 포함":"GPS coordinates present","정밀 촬영 정보":"detailed capture data","exifr · 표준 태그":"exifr · standard tags","내장 파서":"built-in parser","촬영 기기":"Camera","렌즈":"Lens","촬영 시각":"Captured","좌표":"Coordinates","· 고도":" · altitude ","일련번호":"Serial number","소프트웨어":"Software","해상도":"Resolution","개 항목이 더 있습니다.":" more items.","이 파일에는 GPS·촬영기기 정보가 남아 있지 않습니다.":"This file carries no GPS or camera details.","JPG로 정리해 내려받기":"Clean and download as JPG","PNG로 정리해 내려받기":"Clean and download as PNG","사진을 캔버스에 다시 그려 저장합니다. EXIF·GPS·썸네일이 모두 빠집니다. 이 브라우저가 HEIC를 열지 못하면 저장이 되지 않으니, 그때는 아이폰 사진 앱에서 JPG로 내보낸 뒤 다시 확인하세요.":"The photo is redrawn on a canvas and saved, dropping EXIF, GPS and thumbnails. If this browser cannot open HEIC, saving fails — export the photo as JPG from the iPhone Photos app and try again.","사진을 캔버스에 다시 그려 저장합니다. EXIF·GPS·썸네일·제조사 정보가 모두 빠지고, 화면에 보이던 방향 그대로 저장됩니다.":"The photo is redrawn on a canvas and saved without EXIF, GPS, thumbnails or maker details, in the orientation you see on screen.","이 형식은 여기서 메타데이터를 제거할 수 없습니다.":"Metadata cannot be removed from this format here.","정리하는 중…":"Cleaning…","이미지를 열 수 없습니다.":"Could not open the image.","이미지를 저장하지 못했습니다.":"Could not save the image.","메타데이터를 지운 사진을 내려받았습니다.":"Downloaded the photo with metadata removed.","정리 실패:":"Clean-up failed: ","64자(SHA-256) 또는 40자(SHA-1)":"64 chars (SHA-256) or 40 (SHA-1)","16진수만 입력하세요":"Enter hexadecimal only","일치 ·":"Match · ","개 파일":" files","불일치 (":"Mismatch (","샘플 파일을 찾지 못했습니다.":"Could not find the sample file.","샘플을 불러오지 못했습니다:":"Could not load the sample: ","소문자":"lowercase","대문자":"uppercase","한글":"Hangul","회":"×","약":"about ","추측 저항":"guess resistance ","추측에 필요한 횟수":"guesses needed","온라인 시도 (초당 10회)":"Online attempt (10 a second)","해시 유출 · 느린 해시 (초당 1만 회)":"Hash leaked · slow hash (10,000/s)","해시 유출 · 빠른 해시 (초당 100억 회)":"Hash leaked · fast hash (10 billion/s)","사전·패턴에 걸린 조각":"Pieces caught by the dictionary and patterns","개":"","· 사전":" · dictionary ","사전 단어·키보드 배열·날짜 패턴이 발견되지 않았습니다.":"No dictionary words, keyboard runs or date patterns found.","패턴 인식 엔진: zxcvbn (MIT) · 브라우저 안에서만 계산":"Pattern engine: zxcvbn (MIT) · calculated only in the browser","비트":"bits","가지 ·":" possibilities · ","등급":"Grade","오프라인 크래킹":"Offline cracking","자 ·":" chars · ","가지 글자 · 약":" character set · about ","비트 · 오프라인 기준":" bits · offline basis ","생성한 비밀번호를 복사했습니다.":"Copied the generated password.","비밀번호 가리기":"Hide password","카드번호":"Card number","계좌번호":"Bank account number","휴대폰":"Mobile","전화번호":"Phone number","이메일":"Email","IP 주소":"IP address","체크섬 통과":"checksum passed","형식 일치 · 체크섬 불일치":"format matched · checksum failed","체크섬 통과 · 구분자 없음":"checksum passed · no separators","Luhn 검증 통과":"passed the Luhn check","계좌번호 형식으로 추정":"looks like a bank-account number","국민은행 123456-01-234567":"KB Kookmin Bank 123456-01-234567","은행명과 함께 표기됨":"shown with a bank name","네이버":"Naver","카카오":"Kakao","다음":"Daum","쿠팡":"Coupang","구글":"Google","유튜브":"YouTube","애플":"Apple","마이크로소프트":"Microsoft","삼성":"Samsung","국민은행":"KB Kookmin","신한은행":"Shinhan","우리은행":"Woori","하나은행":"Hana","농협":"NongHyup","기업은행":"IBK","토스":"Toss","업비트":"Upbit","빗썸":"Bithumb","페이팔":"PayPal","아마존":"Amazon","넷플릭스":"Netflix","인스타그램":"Instagram","페이스북":"Facebook","텔레그램":"Telegram","깃허브":"GitHub","홈택스":"HomeTax","정부24":"Government24","CJ대한통운":"CJ Logistics","당근":"Karrot","배달의민족":"Baemin","긴급":"urgent","정지":"suspended","차단":"blocked","위험":"risk","해지":"termination","소멸":"expired","미납":"unpaid","연체":"overdue","압류":"seizure","환급":"refund","지원금":"subsidy","부고":"obituary","청첩장":"wedding invitation","초대장":"invitation","택배":"parcel","배송":"delivery","주소변경":"address change","본인인증":"identity verification","인증":"verification","재설정":"reset","카드":"card","대출":"loan","세금":"tax","과태료":"fine","범칙금":"penalty","로또":"lotto","당첨":"win","무료":"free","이벤트":"event","링크를 입력해 주세요.":"Enter a link.","스킴 형식을 보정해 해석했습니다.":"The scheme was normalised before reading.","스킴이 없어 https로 해석했습니다.":"No scheme, so it was read as https.","URL 형식이 올바르지 않습니다. 주소를 다시 확인해 주세요.":"That is not a valid URL. Check the address again.","http·https 링크만 진단할 수 있습니다. (":"Only http and https links can be checked. (","공용 접미사 아래에 만든 주소":"Address built under a public suffix","는":" is ","아래 누구나 만들 수 있는 주소입니다.":", where anyone can create an address. ","이고, 운영 주체는 이 주소만으로 알 수 없습니다.":", and the operator cannot be known from the address alone.","공식 도메인(":" official domain (",")입니다":").","브랜드 이름을 다른 도메인에 사용":"Brand name used on another domain","”는":"” is ","의 이름이지만 등록 도메인은":", but the registrable domain is ","글자 모양을 바꾼 브랜드 사칭 (호모그래프)":"Brand impersonation with altered glyphs (homograph)","화면에는 “":"On screen it reads “","”와 거의 같게 보이지만 실제 글자는":"”, nearly identical, but the actual characters are ","브랜드 이름이 섞인 유사 도메인":"Look-alike domain containing a brand name","안에":" contains ","의 이름(":") name (",")이 들어 있습니다. 공식 도메인은":"). The official domain is ","한두 글자만 다른 유사 도메인":"Look-alike domain one or two letters off","(편집 거리":" (edit distance ","공식 도메인은":" The official domain is ","브랜드 이름을 서브도메인에 넣은 위장":"Disguise with the brand name in a subdomain","실제 등록 도메인은":"The real registrable domain is ","인데, 앞부분에 “":", but “","”를 넣어 공식 사이트처럼 보이게 했습니다.":"” was put in front to look like the official site.","퓨니코드(xn--) 도메인":"Punycode (xn--) domain","화면에는":"On screen it reads ","로 보이지만 실제 주소는":" but the real address is ","입니다.":".","키릴·그리스 문자를 섞은 호모그래프 의심":"Possible homograph mixing Cyrillic or Greek letters","라틴 알파벳과 모양이 같은 다른 문자권 글자가 섞여 있습니다:":"Letters from another script that look like Latin ones are mixed in: ","영문이 아닌 문자(호모그래프) 도메인":"Domain with non-Latin characters (homograph)","라틴 알파벳이 아닌 글자로 만든 주소입니다:":"The address is built from non-Latin characters: ","IP 주소로 직접 접속":"Direct access by IP address","정상 서비스는 도메인을 쓰는 경우가 대부분입니다. 서버 주소":"Real services almost always use a domain. This connects straight to the server address ","로 바로 연결합니다.":".","@ 앞부분을 이용한 위장":"Disguise using the part before @","브라우저는 @ 뒤의 주소로 접속합니다. 실제 접속지는":"Browsers connect to the address after @. The real destination is ","최종 목적지를 알 수 없습니다.":"The final destination is unknown. ","는 주소를 줄여 주는 서비스입니다.":" is a link-shortening service.","암호화되지 않은 http":"Unencrypted http","입력한 정보가 그대로 전송될 수 있습니다. 주소창에 자물쇠가 없습니다.":"What you enter can travel in the clear. There is no padlock in the address bar.","서브도메인이 많은 주소":"Address with many subdomains","도메인 단계가":"It has ","개입니다. 실제 등록 도메인은":" domain levels. The real registrable domain is ","실행 파일 다운로드 링크":"Link to an executable download","링크 끝이 .":"The link ends in .","실행 파일입니다. 설치를 유도하는 문자 링크는 대부분 사칭입니다.":" — an executable. Text-message links pushing installs are almost always impersonation.","이중 확장자 파일":"Double-extension file","문서처럼 보이지만 실제로는 실행 파일입니다:":"It looks like a document but is an executable: ","계정·결제·긴급 유도 키워드":"Account, payment or urgency keywords","사용한 단어:":"Words used: ",". 공식 앱·즐겨찾기에서 직접 들어가 확인하세요.":". Open the official app or a bookmark instead to check.","하이픈이 많은 도메인":"Domain with many hyphens","사칭 사이트는":"Impersonation sites often string words together with hyphens, like ","처럼 낱말을 붙여 자연스럽게 만들곤 합니다.":".","지나치게 긴 도메인":"Unusually long domain","도메인 길이":"Domain length ","자.":" characters.","일반적이지 않은 포트":"Unusual port","— 웹 서비스는 보통 443을 씁니다.":" — web services usually use 443.","사칭에 자주 쓰이는 최상위 도메인":"Top-level domain often used for impersonation","은 값싸게 대량 등록되어 피싱에 자주 쓰입니다.":" is cheap to register in bulk and often used for phishing.","주소에 인코딩된 문자":"Encoded characters in the address","눈에 보이지 않는 문자로 도메인을 감추려는 시도일 수 있습니다.":"This may be an attempt to hide the domain with invisible characters.","다른 주소로 넘기는 파라미터":"Parameter that redirects elsewhere","이 링크는 다른 사이트로 이동시키는 데 쓰일 수 있습니다.":"This link may be used to send you to another site.","https 암호화 연결":"Encrypted https connection","IP 주소가 아닌 도메인 사용":"Domain used instead of an IP","영문 도메인":"Latin-script domain","단축 URL 아님":"Not a short URL","실행 파일 링크 아님":"Not an executable link","공식 도메인과 정확히 일치":"Exactly matches the official domain","단순한 도메인 구조":"Simple domain structure","매우 위험":"Very dangerous","접속하지 마세요":"Do not open it","링크를 열지 말고 삭제하세요. 이미 열었다면 비밀번호를 바꾸고, 돈이 오갔다면 카드사·은행에 즉시 알리세요.":"Don't open the link — delete it. If you already did, change your password, and if money moved, tell your card issuer or bank at once.","위험 신호가 뚜렷합니다":"Clear risk signals","주소를 직접 입력하거나 공식 앱에서 들어가 확인하세요. 이 링크에서는 로그인·결제를 하지 마세요.":"Type the address yourself or go through the official app. Do not log in or pay through this link.","주의":"Caution","한 번 더 확인하세요":"Check once more","아는 사람이 보냈는지, 공식 도메인과 똑같은지 확인하세요. 개인정보를 입력하기 전에 멈추는 게 안전합니다.":"Check that you know the sender and that the domain matches the official one. Stopping before entering personal data is safest.","큰 위험 신호는 없습니다":"No major risk signals","그래도 로그인·결제 화면에서는 주소창의 도메인을 한 번 더 확인하세요.":"Still, check the domain in the address bar once more on any login or payment screen.","이 브라우저에서는 Web Crypto를 쓸 수 없습니다.":"Web Crypto is not available in this browser.","JPEG 이미지":"JPEG image","PNG 이미지":"PNG image","GIF 이미지":"GIF image","PDF 문서":"PDF document","ZIP 압축 파일":"ZIP archive","ZIP 압축 파일(빈)":"ZIP archive (empty)","ZIP 압축 파일(분할)":"ZIP archive (split)","RAR 압축 파일":"RAR archive","7-Zip 압축 파일":"7-Zip archive","윈도우 실행 파일 (MZ/PE)":"Windows executable (MZ/PE)","리눅스 실행 파일 (ELF)":"Linux executable (ELF)","맥 실행 파일 (Mach-O)":"Mac executable (Mach-O)","MS 오피스 구형 문서 (doc/xls/ppt)":"Legacy MS Office document (doc/xls/ppt)","한글 문서 (HWP)":"Hangul document (HWP)","MP3 오디오":"MP3 audio","MP4 영상":"MP4 video","BMP 이미지":"BMP image","ICO 아이콘":"ICO icon","RTF 문서":"RTF document","GZIP 압축":"GZIP archive","TAR 아카이브":"TAR archive","ISO 디스크 이미지":"ISO disk image","WebP 이미지":"WebP image","TIFF 이미지":"TIFF image","HEIC/HEIF 사진":"HEIC/HEIF photo","AVIF 이미지":"AVIF image","윈도우 실행 파일":"Windows executable","리눅스 실행 파일":"Linux executable","맥 실행 파일":"Mac executable","MS 오피스 구형 문서":"Legacy MS Office document","한글 문서":"Hangul document","WAV 오디오":"WAV audio","AVI 영상":"AVI video","ISO 이미지":"ISO image","텍스트":" text","빈 파일":"Empty file","알 수 없는 형식":"Unknown format","이미지 설명":"Image description","제조사(Make)":"Make","기종(Model)":"Model","방향(Orientation)":"Orientation","가로 해상도":"Horizontal resolution","세로 해상도":"Vertical resolution","해상도 단위":"Resolution unit","작성자(Artist)":"Artist","저작권":"Copyright","노출 시간":"Exposure time","조리개 값":"Aperture","노출 모드":"Exposure mode","원본 촬영 시각":"Original date/time","디지털화 시각":"Digitised date/time","셔터 속도":"Shutter speed","조리개":"Aperture","초점 거리":"Focal length","사용자 주석":"User comment","픽셀 폭":"Pixel width","픽셀 높이":"Pixel height","촬영자":"Photographer","바디 시리얼":"Body serial","렌즈 모델":"Lens model","이미지 폭":"Image width","이미지 높이":"Image height","GPS 버전":"GPS version","위도 방향":"Latitude ref","위도":"Latitude","경도 방향":"Longitude ref","경도":"Longitude","고도 기준":"Altitude ref","고도":"Altitude","시각(UTC)":"Time (UTC)","위성":"Satellites","상태":"Status","촬영 날짜":"Date taken","이 파일에는 Exif 아이템이 없습니다(촬영 정보가 지워졌거나 원래 없음).":"This file has no Exif items (capture data was removed or never present).","메타데이터를 읽지 못했습니다.":"Could not read the metadata.","”로 시작해 문서처럼 보이지만 실제 확장자는 “.":"” so it looks like a document, but the real extension is “.","” 실행 파일입니다.":"” — an executable.","보이지 않는 문자 포함":"Invisible characters present","파일명에 방향 전환·제로폭 문자(RTL override 등)가 들어 있습니다. 실제 확장자가 반대로 보일 수 있습니다.":"The file name contains direction or zero-width characters (RTL override and similar). The real extension may appear reversed.","끝에 점·공백":"Trailing dot or space","윈도우가 확장자를 잘라 해석할 수 있는 이름입니다.":"Windows may truncate and reinterpret the extension in a name like this.","숨김 파일 이름":"Hidden file name","점으로 시작해 탐색기에서 숨겨질 수 있습니다.":"Starting with a dot, it can be hidden in file explorers.","실행 파일 (.":"Executable (. ","받은 파일이면 출처를 확인하기 전에는 열지 마세요.":"If it was sent to you, don't open it until you know the source.","매우 긴 파일명":"Very long file name","자 — 확장자를 가리려는 시도일 수 있습니다.":" characters — possibly an attempt to hide the extension.","확장자와 실제 내용이 일치합니다":"Extension matches the actual contents","위장 파일: 확장자와 실제 내용이 다릅니다":"Disguised file: extension and contents differ","확장자는 “.":"The extension is “.","”)인데 실제 내용은 “.":"”), but the contents are “.","확인할 수 없는 확장자":"Unrecognised extension","확장자 없는 파일":"File with no extension","” 형식은 대조표에 없습니다.":"” is not in the reference table. ","확장자가 없습니다.":"There is no extension. ","실제 내용은 “.":"The contents are “.","내용이 0바이트입니다.":"The file is 0 bytes.","EXIF 파싱 실패":"EXIF parsing failed","사랑":"love","대한민국":"Korea","서울":"Seoul","부산":"Busan","행복":"happy","돈":"money","회사":"company","엄마":"mother","아빠":"father","우리집":"myhouse","생일":"birthday","홍길동":"honggildong","피클":"pickle","테스트":"test","관리자":"admin","즉시":"instant","1초 미만":"under a second","초":"seconds","분":"minutes","시간":"hours","일":"days","개월":"months","년":"years","천 년":"thousand years","년 이상":"years or more","매우 약함":"very weak","약함":"weak","보통":"fair","강함":"strong","매우 강함":"very strong","키보드에서 나란한 글자 배열은 쉽게 추측됩니다":"Runs of adjacent keys are easy to guess","짧은 키보드 패턴은 쉽게 추측됩니다":"Short keyboard patterns are easy to guess","\"aaa\"처럼 같은 글자 반복은 쉽게 추측됩니다":"Repeating one character (aaa) is easy to guess","\"abcabcabc\"처럼 덩어리 반복은 \"abc\"보다 조금 어려울 뿐입니다":"Repeating a chunk (abcabcabc) is only slightly harder than abc","abc·6543 같은 연속 배열은 쉽게 추측됩니다":"Sequences like abc or 6543 are easy to guess","최근 연도는 쉽게 추측됩니다":"Recent years are easy to guess","날짜는 대개 쉽게 추측됩니다":"Dates are usually easy to guess","가장 많이 쓰이는 상위 10개 비밀번호입니다":"It is one of the ten most used passwords","가장 많이 쓰이는 상위 100개 비밀번호입니다":"It is one of the hundred most used passwords","아주 흔한 비밀번호입니다":"It is a very common password","널리 쓰이는 비밀번호와 비슷합니다":"It is close to a widely used password","낱말 하나만으로는 쉽게 추측됩니다":"A single word is easy to guess","이름·성을 그대로 쓰면 쉽게 추측됩니다":"Using your name or surname as is makes it easy to guess","흔한 이름 조합은 쉽게 추측됩니다":"Common name combinations are easy to guess","몇 개의 낱말을 붙이되 흔한 문구는 피하세요":"Join several words and avoid common phrases","기호·숫자·대문자를 억지로 넣지 않아도 됩니다":"You don't need to force in symbols, digits or capitals","낱말을 한두 개 더 넣으세요. 드문 낱말이 좋습니다":"Add a word or two — uncommon words are better","첫 글자만 대문자로 바꾸는 것은 거의 도움이 되지 않습니다":"Capitalising the first letter barely helps","전부 대문자로 쓰는 것은 소문자와 비슷하게 쉽습니다":"All capitals is about as easy as all lowercase","낱말을 거꾸로 쓰는 것은 그다지 어렵지 않습니다":"Reversing a word is not much harder","'a'를 '@'로 바꾸는 식의 치환은 큰 도움이 되지 않습니다":"Swapping a for @ does not help much","자주 쓰이는 비밀번호·단어가 포함됨:":"Contains a common password or word: ","같은 글자를 3번 이상 반복 (":"Repeats one character three times or more (","곳)":" places)","같은 덩어리를 반복 (abcabcabc 등)":"Repeats the same chunk (abcabcabc etc.)","키보드·알파벳 연속 배열 (":"Keyboard or alphabet run (","연도·생일로 보이는 숫자":"Numbers that look like a year or birthday","8자 미만 — 너무 짧습니다":"Under 8 characters — too short","한 종류의 글자만 사용":"Uses only one type of character","쓰인 글자의 종류가 적습니다":"Uses few character types","입력 대기":"waiting for input","사전에 있는 단어":"Word found in the dictionary ","곳:":" places: ","보안 난수 생성기를 사용할 수 없습니다.":"The secure random generator is not available.","[문의] 안녕하세요, 홍길동입니다.":"[Enquiry] Hello, this is Hong Gil-dong.","연락처는 010-1234-5678, 사무실 전화는 02-345-6789 입니다.":"My mobile is 010-1234-5678 and my office phone is 02-345-6789.","주민등록번호 900101-1234568, 사업자등록번호 123-45-67891 로 등록되어 있습니다.":"It is registered under resident number 900101-1234568 and business number 123-45-67891.","환불 계좌는 110-123-456789 이고, 결제 카드는 4111-1111-1111-1111 입니다.":"The refund account is 110-123-456789 and the card is 4111-1111-1111-1111.","회신은 hong.gildong@example.com 으로 주세요.":"Please reply to hong.gildong@example.com.","서버 주소는 203.0.113.45 이고, 접속 기록은 3일 보관합니다.":"The server address is 203.0.113.45 and access logs are kept for three days.","안녕하세요! 아래 내용 확인 부탁드립니다.":"Hello! Please check the details below.","· 신청자: 김서연 (010-9876-5432)":"· Applicant: Kim Seo-yeon (010-9876-5432)","· 주민번호: 950303-2345678 (오타 포함 — 체크섬 불일치 예시)":"· Resident number: 950303-2345678 (with a typo — checksum mismatch example)","· 입금 계좌: 국민은행 123456-01-234567":"· Deposit account: KB Kookmin Bank 123456-01-234567","· 카드: 5555 5555 5555 4444":"· Card: 5555 5555 5555 4444","· 메일: seoyeon.kim@example.org / 보조 kim.sy@example.net":"· Email: seoyeon.kim@example.org / alt kim.sy@example.net","· 접속 IP: 198.51.100.7, 2001:db8:85a3::8a2e:370:7334":"· IP: 198.51.100.7, 2001:db8:85a3::8a2e:370:7334","확인 후 회신 주세요. 감사합니다.":"Please reply once you have checked. Thank you.","네이버 사칭":"Naver impersonation","브랜드 이름 + 계정 확인 유도":"brand name + account verification lure","최종 목적지를 알 수 없음":"final destination unknown","퓨니코드 위장":"Punycode disguise","화면에는 navear 처럼 보이는 주소":"an address that looks like navear on screen","홈택스 환급 사칭":"HomeTax refund impersonation","세금 환급·계좌 입력 유도":"lures you into a tax refund and bank details","IP 직접 접속 + 실행 파일":"direct IP access + executable","정상 주소":"normal address","공식 도메인 대조용":"for comparing with the official domain","주소의 @ 앞부분은 무시됩니다. 실제 접속지는 @ 뒤입니다.":"Everything before @ in an address is ignored; the real destination is after it.","한글·키릴 글자로 만든 비슷한 도메인은 눈으로 구별되지 않습니다.":"Look-alike domains built from Hangul or Cyrillic letters cannot be told apart by eye.","문자로 온 링크는 공식 앱·즐겨찾기에서 직접 들어가 확인하세요.":"For a link that arrived by text, open the official app or a bookmark to check.","주민등록번호는 뒤 6자리만 가려도 대부분의 유출 피해를 막습니다.":"Masking just the last six digits of a resident number prevents most leak damage.","카드번호는 앞 4자리와 끝 4자리만 남겨도 결제에 쓸 수 없습니다.":"A card number with only the first and last four digits cannot be used to pay.","계좌번호는 끝 4자리만 남기면 입금 확인용으로는 충분합니다.":"Keeping only the last four digits of an account number is enough to confirm a deposit.","이메일은 아이디 일부를 가려도 도메인은 유지됩니다.":"An email keeps its domain even with part of the local name hidden.","IP 주소는 앞 두 자리만 남겨도 통신사·지역 추정이 어려워집니다.":"Leaving only the first two parts of an IP makes carrier and region much harder to infer.","쿠팡 공식":"Coupang official"};
  var PATTERNS = /*__PATTERNS__*/ [[new RegExp("^(\\d[\\d.,]*)\\s*일$", ""), "$1 days"],[new RegExp("^(\\d[\\d.,]*)\\s*년$", ""), "$1 years"],[new RegExp("^(\\d[\\d.,]*)\\s*개월$", ""), "$1 months"],[new RegExp("^(\\d[\\d.,]*)\\s*시간$", ""), "$1 hours"],[new RegExp("^(\\d[\\d.,]*)\\s*분$", ""), "$1 min"],[new RegExp("^(\\d[\\d.,]*)\\s*명$", ""), "$1 people"],[new RegExp("^(\\d[\\d.,]*)\\s*개$", ""), "$1"],[new RegExp("^(\\d[\\d.,]*)\\s*년\\s*(\\d[\\d.,]*)\\s*개월$", ""), "$1 yr $2 mo"],[new RegExp("^(\\d[\\d.,]*)\\s*년\\s*(\\d[\\d.,]*)\\s*개월\\s*(\\d[\\d.,]*)\\s*일$", ""), "$1 yr $2 mo $3 d"],[new RegExp("^(\\d[\\d.,]*)\\s*개월\\s*(\\d[\\d.,]*)\\s*일$", ""), "$1 mo $2 d"],[new RegExp("^(\\d[\\d.,]*)\\s*일\\s*전$", ""), "$1 days ago"],[new RegExp("^(\\d[\\d.,]*)\\s*개월\\s*전$", ""), "$1 months ago"],[new RegExp("^(\\d[\\d.,]*)\\s*년\\s*전$", ""), "$1 years ago"],[new RegExp("^(\\d[\\d.,]*)자$", ""), "$1 chars"],[new RegExp("^(\\d[\\d.,]*)건$", ""), "$1 found"],[new RegExp("^(.+) 안에 (.+)의 이름\\((.+)\\)이 들어 있습니다\\. 공식 도메인은 (.+)입니다\\.$", ""), "The name $2 ($3) appears inside $1. The official domain is $4."],[new RegExp("^계정·결제·긴급 유도 키워드 (\\d[\\d.,]*)개$", ""), "Account, payment or urgency keywords: $1"],[new RegExp("^사용한 단어: (.+)\\. 공식 앱·즐겨찾기에서 직접 들어가 확인하세요\\.$", ""), "Words used: $1. Open the official app or a bookmark instead to check."],[new RegExp("^사칭 사이트는 (.+) 처럼 낱말을 붙여 자연스럽게 만들곤 합니다\\.$", ""), "Impersonation sites string words together with hyphens, like $1."],[new RegExp("^(\\d[\\d.,]*)비트$", ""), "$1 bits"],[new RegExp("^(\\d[\\d.,]*)가지 · (\\d[\\d.,]*)자$", ""), "$1-character set · $2 chars"],[new RegExp("^사전에 있는 단어 (\\d[\\d.,]*)곳: (.+)$", ""), "Words from the dictionary ($1): $2"],[new RegExp("^추측 저항 (\\d[\\d.,]*)/(\\d[\\d.,]*)$", ""), "Guess resistance $1/$2"],[new RegExp("^약 (.+)회$", ""), "about $1 guesses"],[new RegExp("^(\\d[\\d.,]*)개 · 사전 (\\d[\\d.,]*)개$", ""), "$1 · $2 from the dictionary"],[new RegExp("^(\\d[\\d.,]*)자 · (\\d[\\d.,]*)가지 글자 · 약 (.+) · 오프라인 기준 (.+)$", ""), "$1 chars · $2-character set · about $3 · offline $4"],[new RegExp("^원문 (.+) → 마스킹 (.+)$", ""), "Original $1 → masked $2"],[new RegExp("^(\\d[\\d.,]*)비트 · (.+)$", ""), "$1 bits · $2"],[new RegExp("^(.+) · IPv4$", ""), "$1 · IPv4"],[new RegExp("^(\\d[\\d.,]*)자 · 약 (\\d[\\d.,]*)가지 · (.+)$", ""), "$1 chars · about $2 possibilities · $3"],[new RegExp("^(\\d[\\d.,]*)가지 글자$", ""), "$1-character set"],[new RegExp("^(\\d[\\d.,]*)개 항목$", ""), "$1 items"],[new RegExp("^약 (.+)$", ""), "about $1"],[new RegExp("^오프라인 기준 (.+)$", ""), "offline $1"],[new RegExp("^(.+)년 이상$", ""), "$1 years or more"],[new RegExp("^(.+) 공식 도메인\\((.+)\\)입니다$", ""), "This is the official $1 domain ($2)."],[new RegExp("^불일치 \\((.+)\\)$", ""), "Mismatch ($1)"],[new RegExp("^(.+) · 고도 (.+)$", ""), "$1 · altitude $2"],[new RegExp("^(.+) 목록에서 빼기$", ""), "Remove $1 from the list"],[new RegExp("^(SHA-\\d+) 복사$", ""), "Copy $1"],[new RegExp("^(SHA-\\d+) 해시를 복사했습니다\\.$", ""), "Copied the $1 hash."]];
  var BLOCKS = /*__BLOCKS__*/ {};

  var DICT = {};
  var k;
  for (k in COMMON) if (Object.prototype.hasOwnProperty.call(COMMON, k)) DICT[k] = COMMON[k];
  for (k in APP) if (Object.prototype.hasOwnProperty.call(APP, k)) DICT[k] = APP[k];

  var HANGUL = /[\u1100-\u11FF\u3130-\u318F\uAC00-\uD7A3]/;
  var SKIP_TAG = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEXTAREA: 1, CODE: 1, SVG: 1 };
  var ATTRS = ['placeholder', 'aria-label', 'title', 'alt'];
  var state = { lang: 'ko' };
  var records = [];
  var missing = {};
  var missingList = [];
  var observer = null;

  /* ---------- language ---------- */
  function detect() {
    try {
      var q = new URLSearchParams(root.location.search).get('lang');
      if (q === 'ko' || q === 'en') return q;
    } catch (e) { /* very old browser */ }
    try {
      var saved = root.localStorage.getItem(LANG_KEY);
      if (saved === 'ko' || saved === 'en') return saved;
    } catch (e) { /* private mode */ }
    var nav = root.navigator.language || root.navigator.userLanguage || 'ko';
    return /^ko/i.test(nav) ? 'ko' : 'en';
  }

  /* ---------- lookup ---------- */
  function report(text) {
    if (missing[text]) return;
    missing[text] = 1;
    missingList.push(text);
    if (root.console && console.warn) console.warn('I18N_MISS: ' + text);
  }

  /* Pattern with capture translation: captures that still hold Korean are looked up too. */
  function applyPattern(core, p) {
    if (!p[0].test(core)) return null;
    var m = p[0].exec(core);
    var caps = [], i, ok = true;
    for (i = 1; i < m.length; i++) {
      var c = m[i];
      if (c == null) { caps[i] = ''; continue; }
      if (HANGUL.test(c)) {
        var t = lookupSmall(c.trim());
        if (t == null) { ok = false; caps[i] = c; } else { caps[i] = t; }
      } else { caps[i] = c; }
    }
    var out = p[1].replace(/\$(\d+)/g, function (all, n) { return caps[+n] != null ? caps[+n] : all; });
    if (!ok || HANGUL.test(out)) return null;
    return out;
  }

  function tr(raw) {
    if (typeof raw !== 'string' || !HANGUL.test(raw)) return raw;
    raw = raw.replace(/\u00a0/g, ' ');
    var m = /^(\s*)([\s\S]*?)(\s*)$/.exec(raw);
    var lead = m[1], core = m[2], tail = m[3];
    if (!core) return raw;
    var hit = DICT[core];
    if (hit == null && /\s{2,}|\n/.test(core)) hit = DICT[core.replace(/\s+/g, ' ').trim()];
    if (hit != null) return lead + hit + tail;

    /* Korean date: 2026년 11월 27일 -> November 27, 2026 */
    var dt = /^(\d{4})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})\s*일$/.exec(core);
    if (dt) {
      var MO = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      var mm = parseInt(dt[2], 10);
      if (mm >= 1 && mm <= 12) return lead + MO[mm - 1] + ' ' + parseInt(dt[3], 10) + ', ' + dt[1] + tail;
    }

    /* money in Korean format: 81만 원 / 2,980,750원  ->  {0} template */
    var money = takeMoney(core);
    if (money.map.length) {
      var tpl = money.text;
      var th = DICT[tpl];
      if (th == null && /\s{2,}|\n/.test(tpl)) th = DICT[tpl.replace(/\s+/g, ' ').trim()];
      if (th == null && /^\{0\}$/.test(tpl.trim())) th = '{0}';
      if (th != null) return lead + putMoney(th, money.map) + tail;
      for (var mi = 0; mi < PATTERNS.length; mi++) {
        var mo = applyPattern(tpl, PATTERNS[mi]);
        if (mo != null) return lead + putMoney(mo, money.map) + tail;
      }
      var mseg = trSegments(tpl);
      if (mseg != null) return lead + putMoney(mseg, money.map) + tail;
    }
    for (var i = 0; i < PATTERNS.length; i++) {
      var pout = applyPattern(core, PATTERNS[i]);
      if (pout != null) return lead + pout + tail;
    }
    var seg = trSegments(core);
    if (seg != null) return lead + seg + tail;
    report(core);
    return raw;
  }


  /* Korean money -> token template; values are formatted as ₩1,234,567 */
  function won(n) { return (n < 0 ? '−₩' : '₩') + Math.abs(n).toLocaleString('en-US'); }
  function takeMoney(core) {
    var map = [];
    var out = core.replace(/([\d,]+)\s*억(?:\s*([\d,]+)\s*만)?(?:\s*([\d,]+))?\s*원/g, function (all, a, b, c) {
      var n = parseInt(a.replace(/,/g, ''), 10) * 100000000 +
        (b ? parseInt(b.replace(/,/g, ''), 10) * 10000 : 0) +
        (c ? parseInt(c.replace(/,/g, ''), 10) : 0);
      map.push(won(n));
      return '{' + (map.length - 1) + '}';
    });
    out = out.replace(/([\d,]+)\s*만(?:\s*([\d,]+))?\s*원/g, function (all, a, b) {
      var n = parseInt(a.replace(/,/g, ''), 10) * 10000 + (b ? parseInt(b.replace(/,/g, ''), 10) : 0);
      map.push(won(n));
      return '{' + (map.length - 1) + '}';
    });
    out = out.replace(/([+\-\u2212]?[\d,]+)\s*원/g, function (all, a) {
      var raw = a.replace(/\u2212/g, '-').replace(/,/g, '');
      var num = parseInt(raw, 10);
      map.push(isFinite(num) ? won(num) : a);
      return '{' + (map.length - 1) + '}';
    });
    return { text: out, map: map };
  }
  function putMoney(s, map) {
    return s.replace(/\{(\d+)\}/g, function (all, i) { return map[+i] != null ? map[+i] : all; });
  }

  /* A small unit: dictionary hit or pattern hit, no whitespace trimming. */
  function lookupSmall(unit) {
    var hit = DICT[unit];
    if (hit != null) return hit;
    for (var i = 0; i < PATTERNS.length; i++) {
      var pout = applyPattern(unit, PATTERNS[i]);
      if (pout != null) return pout;
    }
    return null;
  }

  function trPipe(line) {
    var parts = line.split(/\s*\|\s*/);
    var out = [];
    for (var i = 0; i < parts.length; i++) {
      var t = lookupSmall(parts[i].trim());
      if (t == null) return null;
      out.push(t);
    }
    return out.join(' | ');
  }

  /* piece lookup: dictionary, patterns, money token, or bare number/unit */
  function piece(unit) {
    var u = unit.trim();
    if (!u) return '';
    if (!HANGUL.test(u)) return u;
    if (/^\{\d+\}$/.test(u)) return u;
    var t = lookupSmall(u);
    if (t != null) return t;
    return null;
  }

  var SEG_SPLIT = /\s*(\s·\s|\s→\s|\s:\s|\s\/\s)/;
  function trSplit(line) {
    var parts = line.split(SEG_SPLIT);
    if (parts.length < 3) return null;
    var out = [];
    for (var i = 0; i < parts.length; i++) {
      if (i % 2) { out.push(parts[i]); continue; }
      var t = piece(parts[i]);
      if (t == null) return null;
      out.push(t);
    }
    return out.join('');
  }

  function trSegments(core) {
    if (core.indexOf('\n') > -1) {
      var lines = core.split('\n');
      var out = [];
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (!line.trim()) { out.push(line); continue; }
        var t = line.indexOf('|') > -1 ? trPipe(line) : piece(line);
        if (t == null) t = trSplit(line);
        if (t == null) { if (root.__I18N_DEBUG) (root.__I18N_SEGFAIL = root.__I18N_SEGFAIL || []).push(line); return null; }
        out.push(t);
      }
      return out.join('\n');
    }
    if (core.indexOf('|') > -1) return trPipe(core);
    if (/[·:→]/.test(core) && /\s/.test(core)) return trSplit(core);
    return null;
  }

  /* ---------- DOM walking ---------- */
  function skipped(el) {
    while (el) {
      if (el.nodeType === 1) {
        if (SKIP_TAG[el.tagName]) return true;
        if (el.getAttribute && (el.hasAttribute('data-i18n-skip') || el.getAttribute('contenteditable') === 'true')) return true;
        if (el.classList && el.classList.contains('onetap-lang')) return true;
      }
      el = el.parentNode;
    }
    return false;
  }

  function trText(node) {
    var v = node.nodeValue;
    if (!v || !HANGUL.test(v)) return;
    var out = tr(v);
    if (out !== v) {
      records.push({ n: node, v: v });
      node.nodeValue = out;
    }
  }

  function trAttrs(el) {
    var i, at, v, out;
    for (i = 0; i < ATTRS.length; i++) {
      at = ATTRS[i];
      if (!el.hasAttribute(at)) continue;
      v = el.getAttribute(at);
      if (!v || !HANGUL.test(v)) continue;
      out = tr(v);
      if (out !== v) {
        records.push({ e: el, a: at, v: v });
        el.setAttribute(at, out);
      }
    }
    if (el.tagName === 'INPUT' && el.hasAttribute('value') && el.type !== 'checkbox' && el.type !== 'radio' && el.type !== 'hidden') {
      v = el.getAttribute('value');
      if (v && HANGUL.test(v)) {
        out = tr(v);
        if (out !== v) {
          records.push({ e: el, a: 'value', v: v });
          el.setAttribute('value', out);
          if (el.value === v) el.value = out;
        }
      }
    }
    if (el.tagName === 'INPUT') {
      var ty = (el.type || '').toLowerCase();
      if (ty === 'button' || ty === 'submit' || ty === 'reset') {
        v = el.value;
        if (v && HANGUL.test(v)) {
          out = tr(v);
          if (out !== v) { records.push({ e: el, a: 'value', v: v }); el.value = out; }
        }
      }
    }
  }

  function walk(node) {
    if (node.nodeType === 3) { trText(node); return; }
    if (node.nodeType !== 1) return;
    if (node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE' && node.tagName !== 'SVG' &&
        !(node.classList && node.classList.contains('onetap-lang'))) trAttrs(node);
    if (skipped(node)) return;
    if (node.tagName === 'META') return;
    for (var c = node.firstChild; c; c = c.nextSibling) walk(c);
  }

  function trMeta() {
    var list = doc.querySelectorAll('meta[name="description"], meta[property="og:title"], meta[property="og:description"], meta[name="twitter:title"], meta[name="twitter:description"]');
    for (var i = 0; i < list.length; i++) {
      var el = list[i], v = el.getAttribute('content');
      if (v && HANGUL.test(v)) {
        var out = tr(v);
        if (out !== v) { records.push({ e: el, a: 'content', v: v }); el.setAttribute('content', out); }
      }
    }
  }

  function trJsonLd() {
    var list = doc.querySelectorAll('script[type="application/ld+json"]');
    for (var i = 0; i < list.length; i++) {
      var el = list[i];
      try {
        var data = JSON.parse(el.textContent);
        var changed = fixJson(data);
        if (changed) el.textContent = JSON.stringify(data);
      } catch (e) { /* leave as is */ }
    }
  }

  function fixJson(o) {
    var changed = false, i;
    if (Array.isArray(o)) {
      for (i = 0; i < o.length; i++) if (fixJson(o[i])) changed = true;
      return changed;
    }
    if (!o || typeof o !== 'object') return false;
    for (var key in o) {
      if (!Object.prototype.hasOwnProperty.call(o, key)) continue;
      var v = o[key];
      if (typeof v === 'string' && HANGUL.test(v)) {
        var out = DICT[v.trim()];
        if (out != null) { o[key] = out; changed = true; }
      } else if (v && typeof v === 'object') {
        if (fixJson(v)) changed = true;
      }
    }
    return changed;
  }

  /* ---------- apply / restore ---------- */
  function applyBlocks() {
    var list = doc.querySelectorAll('[data-i18n-block]');
    for (var i = 0; i < list.length; i++) {
      var el = list[i], id = el.getAttribute('data-i18n-block');
      if (!BLOCKS[id] || el.__i18nOrig != null) continue;
      el.__i18nOrig = el.innerHTML;
      el.innerHTML = BLOCKS[id];
    }
  }
  function restoreBlocks() {
    var list = doc.querySelectorAll('[data-i18n-block]');
    for (var i = 0; i < list.length; i++) {
      var el = list[i];
      if (el.__i18nOrig != null) { el.innerHTML = el.__i18nOrig; el.__i18nOrig = null; }
    }
  }

  function applyEn() {
    var title = root.__onetapTitle || (root.__onetapTitle = doc.title);
    applyBlocks();
    walk(doc.body);
    trMeta();
    trJsonLd();
    doc.documentElement.lang = 'en';
    var t = DICT[title] || DICT[title.trim()];
    doc.title = t || title;
  }

  function restoreKo() {
    for (var i = records.length - 1; i >= 0; i--) {
      var r = records[i];
      if (r.n) { if (r.n.nodeValue !== r.v) r.n.nodeValue = r.v; }
      else if (r.e) {
        if (r.a === 'value') { if (r.e.value !== r.v) r.e.value = r.v; }
        else if (r.e.getAttribute(r.a) !== r.v) r.e.setAttribute(r.a, r.v);
      }
    }
    records.length = 0;
    restoreBlocks();
    var title = root.__onetapTitle;
    if (title) doc.title = title;
    doc.documentElement.lang = 'ko';
  }

  /* ---------- language switch UI ---------- */
  function buildSwitch() {
    var wrap = doc.createElement('div');
    wrap.className = 'onetap-lang';
    wrap.setAttribute('role', 'group');
    wrap.innerHTML = '<button type="button" data-onetap-lang="ko" aria-pressed="true">KO</button>' +
      '<button type="button" data-onetap-lang="en" aria-pressed="false">EN</button>';
    var box = doc.querySelector('.top-actions') || doc.querySelector('.topbar__inner') ||
      doc.querySelector('.topbar-inner') || doc.querySelector('.topbar-in') ||
      doc.querySelector('.top-badges') || doc.querySelector('.top-in') ||
      doc.querySelector('.topbar') || doc.querySelector('header');
    if (box) {
      if (box.classList.contains('top-badges')) box.insertBefore(wrap, box.firstChild);
      else if (box.classList.contains('top-actions')) box.insertBefore(wrap, box.firstChild);
      else {
        var act = box.querySelector('.top-actions');
        if (act) box.insertBefore(wrap, act); else box.appendChild(wrap);
      }
    } else {
      wrap.style.cssText = 'position:fixed;top:10px;right:10px;z-index:99999;background:rgba(255,255,255,.9);color:#111';
      doc.body.appendChild(wrap);
    }
    wrap.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-onetap-lang]');
      if (!b) return;
      setLang(b.getAttribute('data-onetap-lang'));
    });
    return wrap;
  }

  var CSS = '.onetap-lang{display:inline-flex;flex:none;align-items:center;padding:2px;border:1px solid currentColor;border-radius:999px;opacity:.72;transition:opacity .15s;vertical-align:middle;align-self:center}' +
    '.onetap-lang:hover,.onetap-lang:focus-within{opacity:1}' +
    '.onetap-lang button{appearance:none;-webkit-appearance:none;border:0;background:transparent;color:inherit;font:inherit;font-size:10.5px;font-weight:700;letter-spacing:.04em;line-height:1;padding:5px 6px;border-radius:999px;cursor:pointer;min-width:26px;text-align:center}' +
    '.onetap-lang button[aria-pressed="true"]{background:rgba(128,128,128,.3)}' +
    '@media (max-width:520px){.onetap-lang button{padding:4px 4px;font-size:10px;min-width:22px}.onetap-lang{margin-left:2px}}' +
    'html[lang="en"] .unit,html[lang="en"] .won{margin-left:4px}';

  function injectCss() {
    var s = doc.createElement('style');
    s.id = 'onetap-lang-css';
    s.textContent = CSS;
    (doc.head || doc.documentElement).appendChild(s);
  }

  function paintSwitch() {
    var bs = doc.querySelectorAll('[data-onetap-lang]');
    for (var i = 0; i < bs.length; i++) {
      bs[i].setAttribute('aria-pressed', bs[i].getAttribute('data-onetap-lang') === state.lang ? 'true' : 'false');
    }
    var wrap = doc.querySelector('.onetap-lang');
    if (wrap) wrap.setAttribute('aria-label', state.lang === 'ko' ? '언어' : 'Language');
  }

  /* ---------- observe ---------- */
  function startObserver() {
    if (observer || !root.MutationObserver) return;
    observer = new MutationObserver(function (muts) {
      if (state.lang !== 'en') return;
      for (var i = 0; i < muts.length; i++) {
        var m = muts[i];
        if (m.type === 'characterData') { trText(m.target); continue; }
        if (m.type === 'attributes') { if (m.target.nodeType === 1 && !skipped(m.target)) trAttrs(m.target); continue; }
        for (var j = 0; j < m.addedNodes.length; j++) {
          if (m.addedNodes[j].nodeType === 1 && m.addedNodes[j].hasAttribute && m.addedNodes[j].hasAttribute('data-i18n-block')) applyBlocks();
          walk(m.addedNodes[j]);
        }
      }
    });
    observer.observe(doc.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['placeholder', 'aria-label', 'title', 'alt'] });
  }

  function setLang(lang) {
    state.lang = lang === 'en' ? 'en' : 'ko';
    try { root.localStorage.setItem(LANG_KEY, state.lang); } catch (e) { /* private mode */ }
    if (state.lang === 'en') {
      applyEn();
      startObserver();
    } else {
      if (observer) { observer.disconnect(); observer = null; }
      restoreKo();
    }
    paintSwitch();
    try { doc.dispatchEvent(new CustomEvent('onetap:lang', { detail: { lang: state.lang } })); } catch (e) { /* old */ }
  }

  function boot() {
    injectCss();
    buildSwitch();
    state.lang = detect();
    if (state.lang === 'en') {
      applyEn();
      startObserver();
    } else {
      doc.documentElement.lang = 'ko';
    }
    paintSwitch();
    root.ONETAP_I18N = {
      lang: function () { return state.lang; },
      setLang: setLang,
      t: tr,
      missing: function () { return missingList.slice(); },
      dict: DICT
    };
    try { doc.dispatchEvent(new CustomEvent('onetap:lang', { detail: { lang: state.lang } })); } catch (e) { /* old */ }
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window, document);
