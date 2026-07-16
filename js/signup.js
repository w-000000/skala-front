import {
    auth,
    db
} from "./firebase-config.js";

import {
    createUserWithEmailAndPassword,
    deleteUser
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

const signupForm = document.querySelector("#signupForm");
const signupButton = document.querySelector("#signupButton");
const signupMessage = document.querySelector("#signupMessage");

function getInputValue(selector) {
    const element = document.querySelector(selector);

    if (!element) {
        return "";
    }

    return element.value.trim();
}

function isValidEmail(email) {
    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailPattern.test(email);
}

function showMessage(message, isError = false) {
    signupMessage.textContent = message;

    signupMessage.style.color = isError
        ? "#c0392b"
        : "#276749";
}

function setLoading(isLoading) {
    signupButton.disabled = isLoading;

    signupButton.textContent = isLoading
        ? "가입 처리 중..."
        : "회원가입";
}

signupForm.addEventListener("reset", () => {
    signupMessage.textContent = "";
});

signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    signupMessage.textContent = "";

    const email = getInputValue("#userId");

    const password =
        document.querySelector("#password").value;

    const passwordCheck =
        document.querySelector("#passwordCheck").value;

    const name = getInputValue("#name");

    if (!isValidEmail(email)) {
        showMessage(
            "아이디를 이메일 형식으로 입력해 주세요.",
            true
        );

        document.querySelector("#userId").focus();
        return;
    }

    if (password !== passwordCheck) {
        showMessage(
            "비밀번호와 비밀번호 확인이 일치하지 않습니다.",
            true
        );

        document.querySelector("#passwordCheck").focus();
        return;
    }

    if (password.length < 6) {
        showMessage(
            "비밀번호는 6자 이상 입력해 주세요.",
            true
        );

        document.querySelector("#password").focus();
        return;
    }

    const agreement =
        document.querySelector("#agreement").checked;

    if (!agreement) {
        showMessage(
            "개인정보 수집 및 이용에 동의해 주세요.",
            true
        );

        document.querySelector("#agreement").focus();
        return;
    }

    const selectedExperience =
        document.querySelector(
            'input[name="experience"]:checked'
        );

    const selectedInterests = Array.from(
        document.querySelectorAll(
            'input[name="interest"]:checked'
        )
    ).map((checkbox) => checkbox.value);

    setLoading(true);

    let createdUser = null;
    let firestoreSaved = false;

    try {
        const userCredential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

        createdUser = userCredential.user;

        const userDocument = {
            uid: createdUser.uid,

            account: {
                email: email
            },

            personal: {
                name: name,
                birth: getInputValue("#birth"),
                phone: getInputValue("#phone"),
                region: getInputValue("#region")
            },

            interests: selectedInterests,

            development: {
                experience:
                    selectedExperience?.value ?? "",

                experienceLevel:
                    getInputValue("#experienceLevel"),

                favoriteLanguage:
                    getInputValue("#favoriteLanguage")
            },

            links: {
                github: getInputValue("#github"),
                notion: getInputValue("#notion"),
                blog: getInputValue("#blog"),
                portfolio: getInputValue("#portfolio"),
                linkedin: getInputValue("#linkedin"),
                project: getInputValue("#project")
            },

            additional: {
                joinPath: getInputValue("#joinPath"),

                goal: getInputValue("#goal"),

                introduction:
                    getInputValue("#introduction"),

                expectation:
                    getInputValue("#expectation"),

                agreement: agreement,

                emailAgreement:
                    document.querySelector(
                        "#emailAgreement"
                    ).checked
            },

            createdAt: serverTimestamp()
        };

        await setDoc(
            doc(db, "users", createdUser.uid),
            userDocument
        );

        firestoreSaved = true;

        showMessage("회원가입이 완료되었습니다.");

        setTimeout(() => {
            window.location.href =
                `signUpResult.html?name=${
                    encodeURIComponent(name)
                }`;
        }, 1000);
    } catch (error) {
        console.error("회원가입 오류:", error);

        /*
        Authentication 계정은 생성됐지만
        Firestore 저장에 실패한 경우 계정을 삭제합니다.
        */
        if (createdUser && !firestoreSaved) {
            try {
                await deleteUser(createdUser);
            } catch (deleteError) {
                console.error(
                    "생성된 계정 삭제 오류:",
                    deleteError
                );
            }
        }

        switch (error.code) {
            case "auth/email-already-in-use":
                showMessage(
                    "이미 사용 중인 이메일입니다.",
                    true
                );
                break;

            case "auth/invalid-email":
                showMessage(
                    "아이디를 올바른 이메일 형식으로 입력해 주세요.",
                    true
                );
                break;

            case "auth/weak-password":
                showMessage(
                    "비밀번호를 6자 이상 입력해 주세요.",
                    true
                );
                break;

            case "auth/operation-not-allowed":
                showMessage(
                    "Firebase에서 이메일/비밀번호 인증이 활성화되지 않았습니다.",
                    true
                );
                break;

            case "auth/network-request-failed":
                showMessage(
                    "네트워크 연결을 확인해 주세요.",
                    true
                );
                break;

            case "permission-denied":
                showMessage(
                    "Firestore 보안 규칙 때문에 회원정보를 저장할 수 없습니다.",
                    true
                );
                break;

            default:
                showMessage(
                    `회원가입 중 오류가 발생했습니다: ${
                        error.message
                    }`,
                    true
                );
        }
    } finally {
        setLoading(false);
    }
});