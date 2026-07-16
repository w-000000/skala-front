import {
    auth
} from "./firebase-config.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

const loginLink =
    document.querySelector("#loginLink");

const signupLink =
    document.querySelector("#signupLink");

const logoutButton =
    document.querySelector("#logoutButton");

const loginUserInfo =
    document.querySelector("#loginUserInfo");

const userEmail =
    document.querySelector("#userEmail");

function showLoggedOutMenu() {
    loginLink.hidden = false;
    signupLink.hidden = false;
    logoutButton.hidden = true;

    if (loginUserInfo) {
        loginUserInfo.hidden = true;
    }

    if (userEmail) {
        userEmail.textContent = "";
    }
}

function showLoggedInMenu(user) {
    loginLink.hidden = true;
    signupLink.hidden = true;
    logoutButton.hidden = false;

    if (loginUserInfo) {
        loginUserInfo.hidden = false;
    }

    if (userEmail) {
        userEmail.textContent =
            user.email ?? "";
    }
}

onAuthStateChanged(auth, async (user) => {
    const sessionLogin =
        sessionStorage.getItem("sessionLogin");

    /*
    Firebase에는 사용자가 남아 있지만
    현재 탭의 로그인 기록이 없으면 로그아웃합니다.
    */
    if (user && sessionLogin !== "true") {
        try {
            await signOut(auth);
        } catch (error) {
            console.error(
                "자동 로그아웃 오류:",
                error
            );
        }

        showLoggedOutMenu();
        return;
    }

    if (user) {
        showLoggedInMenu(user);
        return;
    }

    sessionStorage.removeItem(
        "sessionLogin"
    );

    showLoggedOutMenu();
});

logoutButton.addEventListener(
    "click",
    async () => {
        try {
            logoutButton.disabled = true;
            logoutButton.textContent =
                "로그아웃 중...";

            sessionStorage.removeItem(
                "sessionLogin"
            );

            await signOut(auth);

            alert("로그아웃되었습니다.");

            window.location.replace(
                "index.html"
            );
        } catch (error) {
            console.error(
                "로그아웃 오류:",
                error
            );

            alert(
                "로그아웃 중 오류가 발생했습니다."
            );

            logoutButton.disabled = false;
            logoutButton.textContent =
                "로그아웃";
        }
    }
);