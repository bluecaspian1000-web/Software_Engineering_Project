// ================================
// Toggle Password Visibility
// ================================
const passwordInput = document.getElementById("password");
const toggleBtn = document.getElementById("passwordToggle");

toggleBtn.addEventListener("click", () => {
    const type = passwordInput.type === "password" ? "text" : "password";
    passwordInput.type = type;
    toggleBtn.classList.toggle("active");
});

// ================================
// Form Validation
// ================================
const form = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const successBox = document.getElementById("successMessage");

form.addEventListener("submit", function(e) {
    e.preventDefault(); // جلوگیری از ریفرش شدن

    let isValid = true;
    emailError.textContent = "";
    passwordError.textContent = "";

    // ---------------- Email Validation ----------------
    const emailValue = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (emailValue === "") {
        emailError.textContent = "ایمیل را وارد کنید.";
        isValid = false;
    } else if (!emailRegex.test(emailValue)) {
        emailError.textContent = "ایمیل معتبر نیست.";
        isValid = false;
    }

    // ---------------- Password Validation ----------------
    const passValue = passwordInput.value.trim();

    if (passValue.length < 6) {
        passwordError.textContent = "رمز عبور باید حداقل ۶ کاراکتر باشد.";
        isValid = false;
    }

    // If form is valid
    if (isValid) {
        showLoading();
        setTimeout(() => {
            showSuccessMessage();
        }, 1800);
    }
});

// ================================
// Loading Button Animation
// ================================
function showLoading() {
    const btn = document.querySelector(".login-btn");
    btn.classList.add("loading");
}

// ================================
// Show Success Message
// ================================
function showSuccessMessage() {
    const card = document.querySelector(".login-card");
    successBox.style.display = "flex";
    successBox.classList.add("show");
}