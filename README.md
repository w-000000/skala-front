# SKALA Front-End 개인 포털

임창우님의 프로필, 프로젝트, 강의, 일상과 여행 기록을 한곳에서 소개하는 개인 포털 웹사이트입니다. HTML, CSS, JavaScript를 중심으로 제작했으며 Firebase 기반 사용자 기능과 Cloudflare Workers AI 기반 무료 AI 가이드를 제공합니다.

## 웹사이트

- 배포 주소: [https://w-000000.github.io/](https://w-000000.github.io/)
- AI Worker: [https://cw-ai-guide.changwoo-ai.workers.dev](https://cw-ai-guide.changwoo-ai.workers.dev)

## 주요 페이지

| 파일 | 내용 |
| --- | --- |
| `home.html` | 로켓 발사 효과가 적용된 포털 입장 화면 |
| `index.html` | 프로필과 전체 콘텐츠를 연결하는 메인 화면 |
| `myProfile.html` | 기본 정보, 성장 과정, 관심사와 목표 |
| `portfolio.html` | 프로젝트, 기술 스택, 수상 및 자격 |
| `myClass.html` | 월요일부터 금요일까지의 주간 강의 시간표 |
| `myHoliday.html` | 시간대별 휴일 일과와 주말 루틴 |
| `myTrip.html` | 여행 사진, 음악과 크로아티아 여행 영상 |
| `comments.html` | 로그인 사용자를 위한 댓글 게시판 |
| `signUp.html` | Firebase 회원가입 |
| `signUpResult.html` | 가입 완료와 사이트 탐색 안내 |
| `login.html` | Firebase 로그인 |

## 주요 기능

### 포털 UI

- 프로필, 포트폴리오, 강의, 휴일, 여행과 댓글 페이지 연결
- CSS Grid와 Flexbox 기반 반응형 레이아웃
- 모바일 화면과 터치 영역 대응
- 라이트 모드와 다크 모드 전환
- 스크롤 진행률과 콘텐츠 등장 애니메이션
- 현재 위치를 알려주는 큰 스크롤 안내 버튼
- 방문자가 이해하기 쉬운 소개 및 탐색 문구

### 인터랙티브 랩

업다운, 성적 확인과 가방 기능을 게임이 아닌 `INTERACTIVE LAB · 참여형 도구` 카테고리로 묶었습니다.

- `INTERACTIVE TOOL · 01`: 1부터 50까지 숫자를 맞히는 Up-Down
- `INTERACTIVE TOOL · 02`: HTML, CSS, JavaScript 점수 평균 및 등급 계산
- `INTERACTIVE TOOL · 03`: 임창우님의 가방 목록 열람과 관리자 편집
- Up-Down 최고 기록, 최근 기록과 플레이 횟수 브라우저 저장
- 가방 목록 Firebase 동기화
- 관리자 계정에만 물품 추가, 변경과 삭제 허용

### 실시간 정보

- 사용자의 기기 시간을 따르는 실시간 날짜와 시계
- 광주광역시 위치 정보
- Open-Meteo API를 이용한 도시별 현재 온도와 습도

### 회원 및 댓글

- Firebase Authentication 회원가입, 로그인과 로그아웃
- Cloud Firestore 기반 댓글 등록, 수정과 삭제
- 로그인 상태에 따른 메뉴와 사용자 정보 표시

## AI 가이드

메인 메뉴의 `AI 질문`을 누르면 **AI에게 질문하세요.** 영역으로 이동합니다. 방문자는 임창우님이나 이 웹사이트에 관한 내용을 자연어로 질문할 수 있습니다.

### 사용 모델과 구성

- 모델: Cloudflare Workers AI의 `@cf/qwen/qwen3-30b-a3b-fp8`
- 백엔드: Cloudflare Worker
- 프론트엔드: `js/ai-guide.js`
- Worker 코드: `cloudflare-worker/worker.js`
- Worker 설정: `cloudflare-worker/wrangler.toml`
- 배포 엔드포인트: `https://cw-ai-guide.changwoo-ai.workers.dev`

```text
방문자 질문
    ↓
GitHub Pages의 AI 질문 UI
    ↓
Cloudflare Worker
    ↓
Qwen3 + 사이트 정보
    ↓
한국어 답변 반환
```

### 답변 정책

- 임창우님과 사이트에 공개된 정보만 사용
- 프로필, 성장 과정, 프로젝트, 기술, 강의, 여행과 휴일 일과에 직접 답변
- 사이트에 없는 정보는 추측하지 않음
- 관련 없는 질문은 정중하게 거절
- 페이지 링크만 안내하지 않고 실제 정보를 먼저 설명
- 링크는 답변을 마친 뒤 참고 정보로만 제공
- Qwen의 `/no_think` 모드로 불필요한 추론 출력과 사용량 절감
- 질문은 최대 300자, 답변은 최대 800토큰으로 제한

### 무료 사용량

Workers AI 무료 플랜은 현재 하루 10,000 Neurons를 제공합니다. 사용량은 Cloudflare 대시보드의 `AI → Workers AI`에서 확인할 수 있으며 무료 한도는 매일 UTC 00:00에 초기화됩니다. 무료 제공량과 정책은 Cloudflare 정책에 따라 변경될 수 있습니다.

## 포트폴리오 내용

- 멀티에이전트 기반 면접 표현 습관 분석 시스템
- AI 기반 감귤 자동 수확 및 품질 분류 로봇
- TabPFN 기반 소프트웨어 결함 예측
- LSTM AutoEncoder 기반 시스템 이상 탐지
- 사용자 맞춤 레시피 추천 시스템
- Java 기반 Shoot the Duck 게임
- 프로그래밍 언어 및 기술 스택
- 수상 내역 및 자격증

## 사용 기술

- HTML5
- CSS3
- JavaScript
- Firebase Authentication
- Cloud Firestore
- Open-Meteo API
- Cloudflare Workers AI
- Qwen3 30B
- GitHub Pages

Bootstrap, Tailwind CSS와 jQuery 같은 UI 프레임워크 없이 직접 디자인하고 구현했습니다.

## 프로젝트 구조

```text
skala-front/
├── index.html
├── home.html
├── myProfile.html
├── portfolio.html
├── myClass.html
├── myHoliday.html
├── myTrip.html
├── comments.html
├── signUp.html
├── signUpResult.html
├── login.html
├── css/
│   ├── entry.css
│   ├── style.css
│   └── showcase.css
├── js/
│   ├── ai-guide.js
│   ├── auth-menu.js
│   ├── comments.js
│   ├── entry-redirect.js
│   ├── entry.js
│   ├── firebase-config.js
│   ├── login.js
│   ├── showcase.js
│   ├── signup.js
│   └── theme.js
├── script/
│   ├── upDown.js
│   ├── grade.js
│   ├── bag.js
│   ├── weatherAPI.js
│   └── realtimeInfo.js
├── cloudflare-worker/
│   ├── worker.js
│   └── wrangler.toml
└── media/
    ├── myphoto.jpeg
    ├── music.mp3
    ├── croatia_travel.mp4
    └── 여행 이미지 파일
```

## 로컬 실행

저장소를 내려받은 후 VS Code Live Server 등 정적 웹 서버로 `home.html`을 실행합니다.

```bash
git clone <repository-url>
cd skala-front
```

AI Worker는 다음 로컬 주소의 요청을 허용하도록 설정되어 있습니다.

- `http://127.0.0.1:5500`
- `http://localhost:5500`
- `https://w-000000.github.io`

파일을 브라우저에서 직접 여는 `file://` 방식보다 Live Server 사용을 권장합니다.

## Cloudflare Worker 배포

Worker 내용을 변경한 경우 Cloudflare에 로그인한 뒤 다시 배포합니다.

```bash
cd cloudflare-worker
pnpm dlx wrangler login
pnpm dlx wrangler deploy
```

새 Worker 주소를 사용하는 경우 `js/ai-guide.js`의 `AI_API_ENDPOINT`도 함께 수정해야 합니다. API 토큰이나 비밀 키를 프론트엔드 JavaScript에 넣지 않습니다.

## Firestore 보안 규칙 예시

가방 목록은 누구나 읽을 수 있지만 지정한 관리자 계정만 변경할 수 있도록 제한합니다.

```text
match /portfolioData/myBag {
  allow read: if true;
  allow create, update, delete: if request.auth != null
    && request.auth.token.email == "cwoo6115@jbnu.ac.kr";
}
```

댓글 컬렉션에도 로그인 여부와 작성자 확인을 기준으로 별도의 읽기·쓰기 규칙을 적용해야 합니다.

## 최근 개선 사항

- 스크롤 안내 문구와 화살표 크기 확대
- 가방 편집 버튼 및 카드 제목 가독성 개선
- 업다운, 성적 확인과 가방을 참여형 도구로 통합
- 가입 완료 페이지 문구를 방문자 중심 표현으로 정리
- 사이트 전반의 `임창우의`, `임창우 님의` 표현을 `임창우님의`으로 통일
- AI 질문 메뉴, 채팅 UI와 추천 질문 추가
- AI 입력창 아래에 큰 전체 너비 질문 버튼 배치
- AI 안내, 답변과 추천 질문 글자 크기 확대
- AI 메시지의 들여쓰기 공백과 정렬 문제 수정
- 사이트 내용을 직접 답하는 무료 Qwen AI Worker 배포
