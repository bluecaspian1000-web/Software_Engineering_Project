document.addEventListener("DOMContentLoaded", () => {
    const mainContent = document.querySelector(".main-content");
    const menuButtons = document.querySelectorAll(".panel-menu button");

    // ==========================
    // مدیریت منو
    // ==========================
    menuButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const action = btn.dataset.action;
            document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));

            switch (action) {
                case "add-course":
                    document.getElementById("add-course-page").classList.remove("hidden");
                    break;
                case "view-courses":
                    document.getElementById("courses-list-page").classList.remove("hidden");
                    renderCourseList();
                    break;
                case "add-user":
                    document.getElementById("add-user-page").classList.remove("hidden");
                    break;
                case "view-users":
                    document.getElementById("users-list-page").classList.remove("hidden");
                    renderUserList();
                    break;
            }
        });
    });

    // ==========================
    // اضافه کردن کاربر با fetch
    // ==========================
    const addUserBtn = document.getElementById("add-user-btn");
    addUserBtn.addEventListener("click", async() => {
        const name = document.getElementById("user-name").value.trim();
        const family = document.getElementById("user-family").value.trim();
        const id = document.getElementById("user-id").value.trim();
        const code = document.getElementById("user-code").value.trim();
        const pass = document.getElementById("user-pass").value.trim();
        const email = document.getElementById("user-email").value.trim();
        const role = document.getElementById("user-role").value;
        const errorEl = document.getElementById("user-error");

        try {
            const res = await fetch("http://localhost:8000/api/users", { // ← تغییر URL
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, family, id, code, pass, email, role })
            });
            const data = await res.json();
            if (res.ok) {
                errorEl.textContent = "کاربر با موفقیت اضافه شد!";
                document.querySelectorAll("#add-user-page input").forEach(i => i.value = "");
            } else {
                errorEl.textContent = data.message || "خطا در ثبت کاربر";
            }
        } catch (err) {
            errorEl.textContent = "ارتباط با سرور برقرار نشد";
        }
    });

    // ==========================
    // اضافه کردن درس با fetch
    // ==========================
    const addCourseBtn = document.getElementById("add-course-btn");
    addCourseBtn.addEventListener("click", async() => {
        const courseName = document.getElementById("course-name").value.trim();
        const teacherName = document.getElementById("course-teacher").value.trim();
        const codes = Array.from(document.querySelectorAll(".course-code")).map(e => e.value.trim());
        const classes = Array.from(document.querySelectorAll(".course-class")).map(e => e.value.trim());
        const days = Array.from(document.querySelectorAll(".course-day")).map(e => e.value.trim());
        const times = Array.from(document.querySelectorAll(".course-time")).map(e => e.value.trim());
        const errorEl = document.getElementById("course-error");

        try {
            const res = await fetch("http://localhost:8000/api/courses", { // ← تغییر URL
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: courseName, teacher: teacherName, codes, classes, days, times })
            });
            const data = await res.json();
            if (res.ok) {
                errorEl.textContent = "درس با موفقیت اضافه شد!";
                document.querySelector("#course-name").value = "";
            } else {
                errorEl.textContent = data.message || "خطا در ثبت درس";
            }
        } catch (err) {
            errorEl.textContent = "ارتباط با سرور برقرار نشد";
        }
    });

    // ==========================
    // نمایش کاربران
    // ==========================
    async function renderUserList() {
        const tbody = document.querySelector("#users-table-body");
        tbody.innerHTML = "";
        try {
            const res = await fetch("http://localhost:8000/api/users"); // ← تغییر URL
            const users = await res.json();
            users.forEach(u => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${u.name}</td>
                    <td>${u.family}</td>
                    <td>${u.id}</td>
                    <td>${u.code}</td>
                    <td>${u.email || ""}</td>
                    <td>${u.role === 'teacher' ? 'استاد' : 'دانشجو'}</td>
                `;
                tbody.appendChild(tr);
            });
        } catch (err) {
            tbody.innerHTML = "<tr><td colspan='6'>خطا در دریافت کاربران</td></tr>";
        }
    }

    // ==========================
    // نمایش دروس
    // ==========================
    async function renderCourseList() {
        const tbody = document.querySelector("#courses-table-body");
        tbody.innerHTML = "";
        try {
            const res = await fetch("http://localhost:8000/api/courses"); // ← تغییر URL
            const courses = await res.json();
            courses.forEach(c => {
                for (let i = 0; i < c.times.length; i++) {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td>${c.name}</td>
                        <td>${c.teacher}</td>
                        <td>${c.codes[i]}</td>
                        <td>${c.classes[i]}</td>
                        <td>${c.days[i]}</td>
                        <td>${c.times[i]}</td>
                    `;
                    tbody.appendChild(tr);
                }
            });
        } catch (err) {
            tbody.innerHTML = "<tr><td colspan='6'>خطا در دریافت دروس</td></tr>";
        }
    }
});