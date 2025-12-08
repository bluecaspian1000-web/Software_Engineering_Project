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
const usernameInput = document.getElementById("username");
const usernameError = document.getElementById("usernameError");
const passwordError = document.getElementById("passwordError");
const successBox = document.getElementById("successMessage");

form.addEventListener("submit", async function(e) {
    e.preventDefault(); // جلوگیری از ریفرش شدن

    let isValid = true;
    usernameError.textContent = "";
    passwordError.textContent = "";

    // ---------------- Username Validation ----------------
    const usernameValue = usernameInput.value.trim();
    const numericRegex = /^[0-9]+$/; // فقط عددی باشد

    if (usernameValue === "") {
        usernameError.textContent = "نام کاربری را وارد کنید.";
        isValid = false;
    } else if (!numericRegex.test(usernameValue)) {
        usernameError.textContent = "فقط عدد وارد کنید.";
        isValid = false;
    } else if (usernameValue.length < 5) {
        usernameError.textContent = "نام کاربری معتبر نیست.";
        isValid = false;
    }

    // ---------------- Password Validation ----------------
    const passValue = passwordInput.value.trim();

    if (passValue.length < 6) {
        passwordError.textContent = "رمز عبور باید حداقل ۶ کاراکتر باشد.";
        isValid = false;
    }

    // If form is valid → Send with fetch
    if (isValid) {
        showLoading();

        try {
            const response = await fetch("http://localhost:8000/api/login", {
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

            if (response.ok) {
                showSuccessMessage();
            } else {
                passwordError.textContent = data.message || "خطا در ورود!";
            }

        } catch (error) {
            passwordError.textContent = "اتصال به سرور برقرار نشد.";
        }
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