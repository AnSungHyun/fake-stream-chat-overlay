# Fake Stream Chat Overlay

![Fake Stream Chat Overlay demo](./fake-stream-chat-overlay.gif)

게임 유튜버/스트리머 영상 촬영용 투명 채팅 오버레이 프로그램입니다.

실제 라이브처럼 보이는 멀티 플랫폼 채팅창, 시청자 수, 도네이션 알림을 Windows 화면 위에 띄울 수 있습니다.

## 주요 기능

- 투명 채팅 오버레이 창
- 별도 컨트롤 패널
- YouTube / CHZZK / SOOP 플랫폼 뱃지
- 채팅 인원, 채팅 간격, 애니메이션 속도 조절
- 닉네임 랜덤 색상
- 채팅창 투명도, 글자 크기 조절
- LIVE / watching 시청자 수 표시
- 시청자 수 실시간 랜덤 변동
- 항상 위 표시
- 클릭 통과 모드
- 오버레이 드래그 이동
- 오버레이 가장자리/모서리 리사이즈
- 감탄사, 질문, 게임 반응, 잡담 패턴 자동 채팅
- 화면 키워드 기반 채팅 문장 생성
- 채팅창과 분리된 도네이션 오버레이
- 도네이션 사운드, 표시 간격, 표시 시간, 금액 범위 조절
- 컨트롤 창 종료 시 모든 오버레이 함께 종료

## 실행 방법

### 1. 의존성 설치

```powershell
cd C:\HyunDev\fake-stream-chat-overlay
npm install
```

### 2. 실행

```powershell
npm start
```

또는 `run.bat`을 더블클릭해도 됩니다.

## 동작 확인 방법

JavaScript 문법 검사는 아래 명령으로 확인합니다.

```powershell
node --check src\main.js
node --check src\preload.js
node --check src\control.js
node --check src\overlay.js
node --check src\donation.js
```

실행 확인은 아래 명령으로 합니다.

```powershell
npm start
```

정상 실행 시 다음 창들이 뜹니다.

- 컨트롤 창
- 채팅 오버레이 창
- 도네이션 오버레이 창

도네이션 창은 평소에는 투명하게 있다가 `도네이션 테스트` 버튼을 누르거나 자동 알림 시간이 되었을 때 표시됩니다.

## GitHub 업로드 전 체크

```powershell
git status
git log --oneline -5
```

GitHub 원격 저장소를 만든 뒤:

```powershell
git remote add origin https://github.com/YOUR_ID/fake-stream-chat-overlay.git
git push -u origin main
```

## 프로젝트 구조

```text
fake-stream-chat-overlay/
  package.json
  package-lock.json
  run.bat
  README.md
  docs/
    REQUIREMENTS_AND_DESIGN.md
    PROMPT_TEMPLATE.md
  src/
    main.js
    preload.js
    control.html
    control.css
    control.js
    overlay.html
    overlay.css
    overlay.js
    donation.html
    donation.css
    donation.js
```

## 파일별 역할

### Electron 메인 프로세스

`src/main.js`

- Electron 앱 시작점
- 컨트롤 창 생성
- 채팅 오버레이 창 생성
- 도네이션 오버레이 창 생성
- 창 위치/크기 초기화
- 항상 위 표시 적용
- 클릭 통과 적용
- 컨트롤 창 종료 시 앱 전체 종료
- IPC 이벤트 처리

### Preload / IPC API

`src/preload.js`

- 렌더러 창에서 사용할 안전한 API 노출
- 컨트롤 창, 채팅 오버레이, 도네이션 오버레이가 메인 프로세스와 통신할 때 사용
- `window.streamChat` API 정의

## 패널별 수정 위치

### 컨트롤 패널

화면:

- `src/control.html`

스타일:

- `src/control.css`

동작:

- `src/control.js`

수정 예시:

- 컨트롤 항목 추가: `control.html`
- 버튼/슬라이더 디자인 수정: `control.css`
- 새 옵션 저장 및 오버레이로 전달: `control.js`
- 새 옵션 기본값 추가: `src/main.js`의 `defaultSettings`

### 채팅 오버레이 패널

화면:

- `src/overlay.html`

스타일:

- `src/overlay.css`

동작:

- `src/overlay.js`

수정 예시:

- 채팅 메시지 레이아웃 수정: `overlay.html`, `overlay.css`
- 채팅 말풍선 색상/투명도/간격 수정: `overlay.css`
- 채팅 문장 패턴 수정: `overlay.js`의 `messagePools`
- 닉네임 재료 수정: `overlay.js`의 `nameParts`, `nameSuffixes`
- 플랫폼 뱃지 수정: `overlay.js`의 `platformMeta`, `overlay.css`의 `.badge`
- LIVE / watching 헤더 수정: `overlay.html`, `overlay.css`
- 리사이즈 손잡이 동작 수정: `overlay.js`의 `setupResizeHandles`

### 도네이션 오버레이 패널

화면:

- `src/donation.html`

스타일:

- `src/donation.css`

동작:

- `src/donation.js`

수정 예시:

- 도네이션 카드 레이아웃 수정: `donation.html`, `donation.css`
- 도네이션 문구 수정: `donation.js`의 `donationMessages`
- 도네이션 닉네임 재료 수정: `donation.js`의 `nameParts`, `nameSuffixes`
- 도네이션 사운드 수정: `donation.js`의 `playDonationSound`
- 도네이션 표시 시간/간격 기본값 수정: `src/main.js`의 `defaultSettings`

## 옵션 기본값 수정 위치

기본 옵션은 `src/main.js`의 `defaultSettings`에서 수정합니다.

예시:

```js
const defaultSettings = {
  viewerCount: 127,
  viewerVariance: 12,
  chatPopulation: 34,
  intervalMs: 900,
  animationSpeed: 420,
  maxMessages: 38,
  opacity: 72,
  fontSize: 15,
  donationEnabled: true,
  donationIntervalMinutes: 3,
  donationOpacity: 82,
  donationDurationSec: 6
};
```

자주 바꿀 만한 값:

- `viewerCount`: 시작 시청자 수
- `viewerVariance`: 시청자 수 변동 폭
- `chatPopulation`: 가상 채팅 인원 수
- `intervalMs`: 채팅 생성 간격
- `animationSpeed`: 채팅 등장 애니메이션 속도
- `maxMessages`: 화면에 유지할 최대 채팅 줄 수
- `opacity`: 채팅창 투명도
- `fontSize`: 채팅 글자 크기
- `donationIntervalMinutes`: 도네이션 자동 표시 간격
- `donationDurationSec`: 도네이션 표시 시간
- `donationOpacity`: 도네이션 카드 투명도

## 새 옵션을 추가하는 방법

1. `src/main.js`의 `defaultSettings`에 기본값을 추가합니다.
2. 컨트롤 UI가 필요하면 `src/control.html`에 입력 요소를 추가합니다.
3. 슬라이더 옵션이면 `src/control.js`의 `rangeIds`에 id를 추가합니다.
4. 체크박스 옵션이면 `src/control.js`의 `checkboxIds`에 id를 추가합니다.
5. 표시 포맷이 필요하면 `src/control.js`의 `formatValue`를 수정합니다.
6. 채팅 오버레이에 반영할 옵션이면 `src/overlay.js`의 `applySettings`를 수정합니다.
7. 도네이션 오버레이에 반영할 옵션이면 `src/donation.js`의 `applySettings`를 수정합니다.

## 현재 문서

- `docs/REQUIREMENTS_AND_DESIGN.md`: 요구사항, 설계 분석, 구현 구조 정리
- `docs/PROMPT_TEMPLATE.md`: 같은 결과물을 만들기 위한 프롬프트 템플릿

## 향후 확장 아이디어

- 현재 화면 스크린샷 분석
- OpenAI API 연동으로 화면 맥락 기반 채팅 생성
- OBS 브라우저 소스용 웹 버전
- 채팅 대본 CSV/JSON 가져오기
- 도네이션 스킨 프리셋
- 플랫폼별 채팅 스타일 프리셋
- 실행 파일 패키징
