// پاک کردن توکن‌ها و کاربر از localStorage
function clearAuth() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
}

function redirectToLogin() {
    window.location.href = "login.html";
}

// تابع لاگ‌اوت
function logout() {
    // If api.js is available, logout from backend too (no feature removed)
    if (window.api && typeof window.api.logout === "function") {
        window.api.logout().finally(() => {
            clearAuth();
            redirectToLogin();
        });
        return;
    }
    clearAuth();
    redirectToLogin();
}

// اتصال دکمه خروج به تابع logout
document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.querySelector(".header-right button");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }
});