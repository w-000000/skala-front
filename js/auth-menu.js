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

const signupShortcut =
    document.querySelector("#signupShortcut");

const loginUserInfo =
    document.querySelector("#loginUserInfo");

const userEmail =
    document.querySelector("#userEmail");

onAuthStateChanged(auth, (user) => {
    if (user) {
        loginLink.hidden = true;
        signupLink.hidden = true;
        logoutButton.hidden = false;

        if (signupShortcut) {
            signupShortcut.hidden = true;
        }

        if (loginUserInfo) {
            loginUserInfo.hidden = false;
        }

        if (userEmail) {
            userEmail.textContent = user.email;
        }

        return;
    }

    loginLink.hidden = false;
    signupLink.hidden = false;
    logoutButton.hidden = true;

    if (signupShortcut) {
        signupShortcut.hidden = false;
    }

    if (loginUserInfo) {
        loginUserInfo.hidden = true;
    }

    if (userEmail) {
        userEmail.textContent = "";
    }
});

logoutButton.addEventListener("click", async () => {
    try {
        logoutButton.disabled = true;
        logoutButton.textContent = "로그아웃 중...";

        await signOut(auth);

        alert("로그아웃되었습니다.");

        window.location.reload();
    } catch (error) {
        console.error("로그아웃 오류:", error);

        alert("로그아웃 중 오류가 발생했습니다.");

        logoutButton.disabled = false;
        logoutButton.textContent = "로그아웃";
    }
});