/*
 * GitHub Pages 기본 주소를 로켓 입장 화면으로 연결합니다.
 * /index.html로 직접 들어오면 메인 화면을 그대로 보여줍니다.
 */

const isRootAddress =
    window.location.pathname.endsWith("/");

if (isRootAddress) {
    window.location.replace("home.html");
}
