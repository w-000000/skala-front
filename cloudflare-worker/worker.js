const ALLOWED_ORIGINS = new Set([
    "https://w-000000.github.io",
    "http://127.0.0.1:5500",
    "http://localhost:5500"
]);

const SITE_CONTEXT = `
임창우님은 소프트웨어와 인공지능을 공부하며 아이디어를 실제 시스템으로 구현하는 개발자입니다.
관심 분야는 인공지능, 서비스 개발, 데이터 분석입니다.

기본 정보:
- 2002년생이며 광주광역시 출신입니다.
- 전북대학교 소프트웨어공학과 전공입니다.
- 2021년 전북대학교 입학, 2022년 육군 25사단 입대, 2023년 전역, 2024년 복학 및 AI&SE 연구실 활동, 2026년 SKALA 교육 과정 입과 경력이 있습니다.
- 좋아하는 음식은 아이스 아메리카노, 치킨, 국밥, 초콜릿 케이크입니다.
- 호기심, 꾸준함, 협업을 중요하게 생각합니다.

대표 프로젝트:
- 멀티에이전트 기반 면접 표현 습관 분석: Whisper, MediaPipe, OpenCV와 여러 AI 에이전트를 활용해 음성·영상 데이터를 분석하고 피드백과 후속 질문을 제공합니다.
- AI 기반 감귤 자동 수확 및 품질 분류 로봇
- TabPFN 기반 소프트웨어 결함 예측
- LSTM AutoEncoder 기반 시스템 이상 탐지
- 사용자 맞춤 레시피 추천 시스템
- Java 기반 Shoot the Duck 게임

기술과 경험:
- HTML, CSS, JavaScript
- Firebase Authentication, Cloud Firestore
- 인공지능, 데이터 분석, 컴퓨터 비전
- Whisper, MediaPipe, OpenCV, Multi Agent

2026년 주간 강의 시간표:
- 월요일: 09:00~12:00 HTML 기초·웹 페이지 구조, 12:00~13:00 점심, 13:00~17:00 UI/UX 디자인 표준, 17:00~18:00 취업·창업 특강
- 화요일: 09:00~11:00 네트워크·보안 기초, 11:00~12:00 알고리즘 문제 풀이, 12:00~13:00 점심, 13:00~15:00 리눅스 시스템 관리, 15:00~18:00 Git & GitHub 버전 관리
- 수요일: 09:00~12:00 웹 시스템 설계 및 분석, 12:00~13:00 점심, 13:00~15:00 클라우드 AWS 기초, 15:00~18:00 인공지능·머신러닝 기초
- 목요일: 09:00~10:00 IT 트렌드 특강, 10:00~12:00 데이터베이스 SQL 실습, 12:00~13:00 점심, 13:00~16:00 자료구조, 16:00~18:00 빅데이터 분석 실무
- 금요일: 09:00~12:00 JavaScript 심화 실습, 12:00~13:00 점심, 13:00~14:00 개인 프로젝트, 14:00~17:00 오픈소스 소프트웨어, 17:00~18:00 주간 회고

여행 기록:
- 방문한 여행지는 호주, 크로아티아, 말레이시아, 베트남, 일본, 벨기에입니다.
- 호주는 넓은 자연과 여유로운 분위기, 크로아티아는 아름다운 바다와 유럽 거리, 말레이시아는 다양한 문화와 활기찬 도시가 인상적이었습니다.
- 베트남은 음식과 거리 풍경, 일본은 전통과 현대가 어우러진 도시 풍경, 벨기에는 고풍스러운 건축물과 거리가 기억에 남았습니다.
- 크로아티아 여행 풍경과 추억을 담은 영상이 있습니다.

휴일 일과:
- 오전에는 09:00 기상, 09:30 방 정리와 휴식, 10:30 브런치, 11:30 음악이나 낮잠으로 쉽니다.
- 오후에는 13:00 영화·드라마 감상, 15:00 산책과 카페, 16:30 친구와 약속, 17:30 귀가 후 휴식합니다.
- 저녁에는 18:30 저녁 식사, 20:00 영화나 게임, 22:00 샤워와 휴식, 23:30 취침 준비를 합니다.

사이트 페이지:
- 소개: /myProfile.html
- 포트폴리오와 프로젝트: /portfolio.html
- 강의 시간표: /myClass.html
- 휴일 일과: /myHoliday.html
- 여행 기록: /myTrip.html
- 댓글 게시판: /comments.html
- 연락처 이메일: cwoo6115@jbnu.ac.kr
`;

function corsHeaders(origin) {
    return {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Vary": "Origin"
    };
}

function jsonResponse(body, status, origin) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            ...corsHeaders(origin)
        }
    });
}

export default {
    async fetch(request, env) {
        const origin = request.headers.get("Origin") || "";

        if (!ALLOWED_ORIGINS.has(origin)) {
            return jsonResponse({ error: "허용되지 않은 요청입니다." }, 403, origin);
        }

        if (request.method === "OPTIONS") {
            return new Response(null, {
                status: 204,
                headers: corsHeaders(origin)
            });
        }

        if (request.method !== "POST") {
            return jsonResponse({ error: "POST 요청만 지원합니다." }, 405, origin);
        }

        const body = await request.json().catch(() => null);
        const question = body?.question?.trim();

        if (!question || question.length > 300) {
            return jsonResponse({ error: "질문을 300자 이내로 입력해 주세요." }, 400, origin);
        }

        const systemPrompt = `/no_think
당신은 임창우님의 개인 포털을 안내하는 AI입니다.
반드시 아래 사이트 정보만 근거로 한국어로 답변하세요.
사이트 정보에 없는 내용은 추측하지 말고 "사이트에서 확인할 수 없는 정보입니다"라고 안내하세요.
임창우님 또는 이 웹사이트와 무관한 질문에는 "임창우님과 이 사이트에 관한 질문에만 답변할 수 있어요"라고 짧게 답하세요.
질문에 해당하는 정보를 직접 구체적으로 답하는 것이 가장 중요합니다.
"페이지에서 확인하세요" 또는 링크만 제시하는 식으로 답변을 대신하지 마세요.
관련 페이지 링크는 직접 답변을 마친 뒤 참고 정보로만 마지막에 덧붙이세요.
답변은 친절하고 간결하게 작성하되, 시간표나 목록을 물으면 필요한 항목을 빠뜨리지 마세요.

[사이트 정보]
${SITE_CONTEXT}
`;

        try {
            const result = await env.AI.run(
                "@cf/qwen/qwen3-30b-a3b-fp8",
                {
                    messages: [
                        { role: "system", content: systemPrompt },
                        {
                            role: "user",
                            content: `${question}\n/no_think`
                        }
                    ],
                    max_tokens: 800,
                    temperature: 0.7,
                    top_p: 0.8,
                    top_k: 20
                }
            );

            const answer = result.response
                .replace(/<think>[\s\S]*?<\/think>/gi, "")
                .trim();

            return jsonResponse({ answer }, 200, origin);
        } catch (error) {
            return jsonResponse(
                { error: "무료 AI 사용량을 초과했거나 일시적인 오류가 발생했습니다." },
                503,
                origin
            );
        }
    }
};
