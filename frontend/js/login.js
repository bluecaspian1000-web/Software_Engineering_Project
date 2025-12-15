// ================================
// API Base URL Configuration
// ================================
const API_BASE_URL = "http://localhost:8000/api";

// ================================
// Toggle Password Visibility
// ================================
const passwordInput = document.getElementById("password");
const toggleBtn = document.getElementById("passwordToggle");
const eyeIcon = toggleBtn.querySelector(".eye-icon");

toggleBtn.addEventListener("click", () => {
    // تغییر نوع input
    passwordInput.type = passwordInput.type === "password" ? "text" : "password";
    // تغییر آیکون چشم
    eyeIcon.classList.toggle("show-open");
});

// ================================
// Form Validation & Submit
// ================================
const form = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const usernameError = document.getElementById("usernameError");
const passwordError = document.getElementById("passwordError");
const successBox = document.getElementById("successMessage");

form.addEventListener("submit", async function(e) {
    e.preventDefault(); // جلوگیری از ریفرش شدن فرم

    let isValid = true;
    usernameError.textContent = "";
    passwordError.textContent = "";

    // ---------------- Username Validation ----------------
    const usernameValue = usernameInput.value.trim();
    const alphanumericRegex = /^[a-zA-Z0-9]+$/; // حروف و اعداد

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
            const response = await fetch(`${API_BASE_URL}/auth/login/`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ 
                    username: usernameValue, 
                    password: passValue 
                })
            });

            const data = await response.json();
            hideLoading();

            if (response.ok && data.success) {
                // ذخیره توکن‌ها در localStorage
                localStorage.setItem('accessToken', data.tokens.access);
                localStorage.setItem('refreshToken', data.tokens.refresh);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                showSuccessMessage();
                // انتقال به داشبورد پس از 1.5 ثانیه
                setTimeout(() => {
                    window.location.href = "admin_dashboard.html";
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

// ================================
// Loading Button Animation
// ================================
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

// ================================
// Show Success Message
// ================================
function showSuccessMessage() {
    const card = document.querySelector(".login-card");
    successBox.style.display = "flex";
    successBox.classList.add("show");
}

// ================================
// Check if already logged in
// ================================
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        // اگر توکن موجود بود، بررسی اعتبار آن
        verifyToken(token);
    }
});

async function verifyToken(token) {
    try {
        const response = await fetch(`${API_BASE_URL}/token/verify/`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ token: token })
        });

        if (response.ok) {
            // توکن معتبر است، انتقال به داشبورد
            window.location.href = "admin_dashboard.html";
        } else {
            // توکن نامعتبر است، پاک کردن
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
        }
    } catch (error) {
        console.error("Token verification error:", error);
    }
}
