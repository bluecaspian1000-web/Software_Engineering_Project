const API_BASE_URL = "http://localhost:8000/api";

// Toggle Password Visibility
const passwordInput = document.getElementById("password");
const toggleBtn = document.getElementById("passwordToggle");
const eyeIcon = toggleBtn.querySelector(".eye-icon");

toggleBtn.addEventListener("click", () => {
    passwordInput.type = passwordInput.type === "password" ? "text" : "password";
    eyeIcon.classList.toggle("show-open");
});

// Form Validation & Submit
const form = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const usernameError = document.getElementById("usernameError");
const passwordError = document.getElementById("passwordError");
const successBox = document.getElementById("successMessage");

form.addEventListener("submit", async function(e) {
    e.preventDefault();

    let isValid = true;
    usernameError.textContent = "";
    passwordError.textContent = "";

    // ---------------- Username Validation ----------------
    const usernameValue = usernameInput.value.trim();
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;

    if (usernameValue === "") {
        usernameError.textContent = "نام کاربری را وارد کنید.";
        isValid = false;
    } else if (!alphanumericRegex.test(usernameValue)) {
        usernameError.textContent = "نام کاربری باید شامل حروف و اعداد باشد.";
        isValid = false;
    } else if (usernameValue.length < 3) {
        usernameError.textContent = "نام کاربری باید حداقل ۳ کاراکتر باشد.";
        isValid = false;
    }

    // ---------------- Password Validation ----------------
    const passValue = passwordInput.value.trim();
    if (passValue.length < 6) {
        passwordError.textContent = "رمز عبور باید حداقل ۶ کاراکتر باشد.";
        isValid = false;
    }

    // ---------------- Submit if Valid ----------------
    if (isValid) {
        showLoading();

        try {
            let response;
            let data;

            if (window.api && typeof window.api.login === "function") {
                const result = await window.api.login(usernameValue, passValue);
                response = result.res;
                data = result.data;
            } else {
                response = await fetch(`http://127.0.0.1:8000/login/`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        username: usernameValue,
                        password: passValue
                    })
                });

                data = await response.json();
            }
            hideLoading();

            if (response.ok && data.success) {
                localStorage.setItem('accessToken', data.tokens.access);
                localStorage.setItem('refreshToken', data.tokens.refresh);
                localStorage.setItem('user', JSON.stringify(data.user));

                showSuccessMessage();

                // هدایت بر اساس نقش کاربر
                setTimeout(() => {
                    switch (data.user.role) {
                        case "admin":
                            window.location.href = "admin_dashboard.html";
                            break;
                        case "student":
                            window.location.href = "student.html";
                            break;
                        case "professor":
                            window.location.href = "professor.html";
                            break;
                        default:
                            alert("نقش کاربر مشخص نیست!");
                            break;
                    }
                }, 1500);
            } else {
                passwordError.textContent = data.message || "خطا در ورود!";
            }

        } catch (error) {
            hideLoading();
            console.error("Login error:", error);
            passwordError.textContent = "اتصال به سرور برقرار نشد.";
        }
    }
});

// Loading Button Animation
function showLoading() {
    const btn = document.querySelector(".login-btn");
    const loader = btn.querySelector(".btn-loader");
    loader.style.opacity = "1";
    btn.disabled = true;
}

function hideLoading() {
    const btn = document.querySelector(".login-btn");
    const loader = btn.querySelector(".btn-loader");
    loader.style.opacity = "0";
    btn.disabled = false;
}

// Show Success Message
function showSuccessMessage() {
    successBox.style.display = "flex";
    successBox.classList.add("show");
}

// Check if already logged in
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        verifyToken(token);
    }
});

async function verifyToken(token) {
    try {
        const response = await fetch(`${API_BASE_URL}/token/verify/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: token })
        });

        if (response.ok) {
            const user = JSON.parse(localStorage.getItem('user'));
            switch (user.role) {
                case "admin":
                    window.location.href = "admin_dashboard.html";
                    break;
                case "student":
                    window.location.href = "student.html";
                    break;
                case "professor":
                    window.location.href = "professor.html";
                    break;
            }
        } else {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
        }
    } catch (error) {
        console.error("Token verification error:", error);
    }
}
document.addEventListener("DOMContentLoaded", () => {
    const forgotLink = document.querySelector(".forgot-password");
    if (forgotLink) {
        forgotLink.addEventListener("click", (e) => {
            e.preventDefault();
            forgotLink.textContent = "می‌تونی بیشتر فکر کنی!";
        });
    }
});