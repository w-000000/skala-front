/* Cloudflare Workers AI에서 무료 Qwen 모델을 호출합니다. */
const AI_API_ENDPOINT =
    "https://cw-ai-guide.changwoo-ai.workers.dev";

const aiGuideForm = document.querySelector("#aiGuideForm");
const aiGuideQuestion = document.querySelector("#aiGuideQuestion");
const aiGuideSubmit = document.querySelector("#aiGuideSubmit");
const aiGuideMessages = document.querySelector("#aiGuideMessages");
const aiGuideSuggestions = document.querySelectorAll(
    ".ai-guide-suggestions button"
);

function addAiMessage(text, type, isError = false) {
    const message = document.createElement("div");
    message.className = `ai-message ai-message-${type}`;

    if (isError) {
        message.classList.add("ai-message-error");
    }

    message.textContent = text;
    aiGuideMessages.append(message);
    aiGuideMessages.scrollTop = aiGuideMessages.scrollHeight;
}

async function askAiGuide(question) {
    if (!AI_API_ENDPOINT) {
        throw new Error(
            "무료 AI 서버를 연결하는 중입니다. 잠시 후 다시 이용해 주세요."
        );
    }

    const response = await fetch(AI_API_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ question })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(
            data.error || "답변을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요."
        );
    }

    return data.answer;
}

if (aiGuideForm) {
    aiGuideForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const question = aiGuideQuestion.value.trim();

        if (!question || aiGuideSubmit.disabled) {
            return;
        }

        addAiMessage(question, "user");
        aiGuideQuestion.value = "";
        aiGuideSubmit.disabled = true;
        aiGuideSubmit.firstChild.textContent = "답변 중 ";

        try {
            const answer = await askAiGuide(question);
            addAiMessage(answer, "assistant");
        } catch (error) {
            addAiMessage(error.message, "assistant", true);
        } finally {
            aiGuideSubmit.disabled = false;
            aiGuideSubmit.firstChild.textContent = "질문하기 ";
            aiGuideQuestion.focus();
        }
    });

    aiGuideQuestion.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            aiGuideForm.requestSubmit();
        }
    });
}

aiGuideSuggestions.forEach((button) => {
    button.addEventListener("click", () => {
        aiGuideQuestion.value = button.textContent.trim();
        aiGuideForm.requestSubmit();
    });
});
