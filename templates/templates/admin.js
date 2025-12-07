document.addEventListener("DOMContentLoaded", () => {
    const pages = {
        addCourse: document.getElementById("add-course-section"),
        addUser: document.getElementById("add-user-section"),
        viewUsers: document.getElementById("user-list-section"),
        viewCourses: document.getElementById("course-list-section")
    };

    const menuButtons = document.querySelectorAll(".panel-menu button");

    let courses = [];
    let users = [];
    let teachersList = [];

    function hideAllPages() {
        Object.values(pages).forEach(p => p.classList.add("hidden"));
    }

    menuButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const action = btn.dataset.action;
            hideAllPages();
            switch (action) {
                case "add-course":
                    pages.addCourse.classList.remove("hidden");
                    renderTimes();
                    break;
                case "view-courses":
                    pages.viewCourses.classList.remove("hidden");
                    renderCourseList();
                    break;
                case "add-user":
                    pages.addUser.classList.remove("hidden");
                    break;
                case "view-users":
                    pages.viewUsers.classList.remove("hidden");
                    renderUserList();
                    break;
                default:
                    break;
            }
        });
    });

    // ==========================
    //  افزودن درس
    // ==========================
    const courseUnit = document.getElementById("course-unit");
    const timesContainer = document.getElementById("course-times-container");

    function renderTimes() {
        const unit = courseUnit.value;
        timesContainer.innerHTML = "";
        const timesCount = unit === "3" ? 2 : 1;
        for (let i = 0; i < timesCount; i++) {
            timesContainer.innerHTML += `
                <div class="form-group">
                    <label>کد درس</label>
                    <input type="number" class="course-code">
                </div>
                <div class="form-group">
                    <label>اسم کلاس</label>
                    <input type="text" class="course-class">
                </div>
                <div class="form-group">
                    <label>روز هفته</label>
                    <select class="course-day">
                        <option>شنبه</option>
                        <option>یکشنبه</option>
                        <option>دوشنبه</option>
                        <option>سه‌شنبه</option>
                        <option>چهارشنبه</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>تایم کلاس</label>
                    <select class="course-time">
                        <option>8-10</option>
                        <option>10-12</option>
                        <option>2-4</option>
                        <option>4-6</option>
                    </select>
                </div>
                <hr>`;
        }
    }

    courseUnit.addEventListener("change", renderTimes);

    document.getElementById("add-course-btn").addEventListener("click", () => {
        if (teachersList.length === 0) {
            document.getElementById("course-error").textContent =
                "هیچ استادی ثبت نشده است. لطفاً ابتدا استاد اضافه کنید.";
            return;
        }
        const courseName = document.getElementById("course-name").value.trim();
        const teacherName = document.getElementById("course-teacher").value.trim();
        const codes = Array.from(document.querySelectorAll(".course-code")).map(e => e.value.trim());
        const classes = Array.from(document.querySelectorAll(".course-class")).map(e => e.value.trim());
        const days = Array.from(document.querySelectorAll(".course-day")).map(e => e.value.trim());
        const times = Array.from(document.querySelectorAll(".course-time")).map(e => e.value.trim());

        if (!courseName || !teacherName || codes.some(c => !c) || classes.some(c => !c)) {
            document.getElementById("course-error").textContent = "لطفا همه فیلدها را پر کنید.";
            return;
        }

        for (let i = 0; i < times.length; i++) {
            for (let c of courses) {
                for (let j = 0; j < c.times.length; j++) {
                    if (c.teacher === teacherName && c.days[j] === days[i] && c.times[j] === times[i]) {
                        document.getElementById("course-error").textContent =
                            `استاد ${teacherName} قبلا کلاس دارد در ${days[i]} ${times[i]}`;
                        return;
                    }
                }
            }
        }

        courses.push({
            name: courseName,
            teacher: teacherName,
            codes,
            classes,
            days,
            times
        });

        document.getElementById("course-error").textContent = "درس با موفقیت اضافه شد!";
        document.getElementById("course-name").value = "";
        renderTimes();
    });

    // ==========================
    //  اضافه کردن کاربر
    // ==========================
    document.getElementById("add-user-btn").addEventListener("click", () => {
        const name = document.getElementById("user-name").value.trim();
        const family = document.getElementById("user-family").value.trim();
        const id = document.getElementById("user-id").value.trim();
        const code = document.getElementById("user-code").value.trim();
        const pass = document.getElementById("user-pass").value.trim();
        const email = document.getElementById("user-email").value.trim();
        const role = document.getElementById("user-role").value;

        const nameRegex = /^[a-zA-Z\u0600-\u06FF\s]+$/;
        const codeRegex = /^\d{10}$/;
        const idRegex = /^\d+$/;

        if (!nameRegex.test(name) || !nameRegex.test(family)) {
            document.getElementById("user-error").textContent = "نام و نام خانوادگی باید فقط حروف باشند.";
            return;
        }
        if (!codeRegex.test(code)) {
            document.getElementById("user-error").textContent = "کد ملی باید 10 رقمی باشد.";
            return;
        }
        if (!idRegex.test(id)) {
            document.getElementById("user-error").textContent =
                role === 'student' ? "شماره دانشجویی باید فقط عدد باشد." : "کد پرسنلی باید فقط عدد باشد.";
            return;
        }

        const duplicate = users.some(u => u.role === role && u.id === id);
        if (duplicate) {
            document.getElementById("user-error").textContent =
                role === 'student' ? "این شماره دانشجویی قبلا ثبت شده." : "این کد پرسنلی قبلا ثبت شده.";
            return;
        }

        if (!pass) {
            document.getElementById("user-error").textContent = "رمز عبور اجباری است.";
            return;
        }

        const newUser = { name, family, id, code, pass, email, role };
        users.push(newUser);

        if (role === "teacher") {
            teachersList.push({ name, family });
        }

        document.getElementById("user-error").textContent = "کاربر با موفقیت اضافه شد!";
        document.querySelectorAll("#add-user-section input").forEach(i => i.value = "");
    });

    // ==========================
    //  مشاهده لیست دروس
    // ==========================
    function renderCourseList() {
        const tbody = document.getElementById("courses-table-body");
        tbody.innerHTML = "";
        courses.forEach(c => {
            const rowsCount = c.times.length;
            for (let i = 0; i < rowsCount; i++) {
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
    }

    // ==========================
    //  مشاهده لیست کاربران
    // ==========================
    function renderUserList() {
        const tbody = document.getElementById("users-table-body");
        tbody.innerHTML = "";
        const students = users.filter(u => u.role === "student");
        const teachers = users.filter(u => u.role === "teacher");

        [...teachers, ...students].forEach(u => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${u.name}</td>
                <td>${u.family}</td>
                <td>${u.id}</td>
                <td>${u.code}</td>
                <td>${u.email}</td>
                <td>${u.role === 'teacher' ? 'استاد' : 'دانشجو'}</td>
            `;
            tbody.appendChild(tr);
        });
    }
});