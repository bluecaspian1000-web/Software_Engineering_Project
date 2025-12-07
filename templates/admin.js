// ===============================
// Admin Panel JS - Professional
// ===============================

document.addEventListener("DOMContentLoaded", () => {
    const mainContent = document.querySelector(".main-content");
    const menuButtons = document.querySelectorAll(".panel-menu button");

    let courses = [];
    let users = [];
    let teachersList = [];

    menuButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const action = btn.dataset.action;
            mainContent.innerHTML = "";

            switch (action) {
                case "add-course":
                    renderAddCourse();
                    break;
                case "view-courses":
                    renderCourseList();
                    break;
                case "add-user":
                    renderAddUser();
                    break;
                case "view-users":
                    renderUserList();
                    break;
                default:
                    mainContent.innerHTML = "<p>صفحه‌ای برای این بخش موجود نیست.</p>";
            }
        });
    });

    // ==========================
    //  افزودن درس
    // ==========================
    function renderAddCourse() {
        const container = document.createElement("div");

        let teacherOptions = teachersList.length ?
            teachersList.map(t => `<option value="${t.name} ${t.family}">${t.name} ${t.family}</option>`).join("") :
            `<option>هیچ استادی ثبت نشده</option>`;

        container.innerHTML = `
            <h3>اضافه کردن درس</h3>
            <div class="form-group">
                <label>واحد درس</label>
                <select id="course-unit">
                    <option value="1-2">1 - واحد 2</option>
                    <option value="3">3 واحد</option>
                </select>
            </div>
            <div class="form-group">
                <label>نام درس</label>
                <input type="text" id="course-name">
            </div>

            <div class="form-group">
                <label>انتخاب استاد</label>
                <select id="course-teacher">
                    ${teacherOptions}
                </select>
            </div>

            <div id="course-times-container"></div>
            <button class="btn" id="add-course-btn">اضافه کردن درس</button>
            <p class="error-message" id="course-error"></p>
        `;
        mainContent.appendChild(container);

        const courseUnit = container.querySelector("#course-unit");
        const timesContainer = container.querySelector("#course-times-container");

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
        renderTimes();

        container.querySelector("#add-course-btn").addEventListener("click", () => {

            // ⭐ جلوگیری از ثبت درس بدون استاد
            if (teachersList.length === 0) {
                container.querySelector("#course-error").textContent =
                    "هیچ استادی ثبت نشده است. لطفاً ابتدا استاد اضافه کنید.";
                return;
            }

            const courseName = container.querySelector("#course-name").value.trim();
            const teacherName = container.querySelector("#course-teacher").value.trim();
            const codes = Array.from(container.querySelectorAll(".course-code")).map(e => e.value.trim());
            const classes = Array.from(container.querySelectorAll(".course-class")).map(e => e.value.trim());
            const days = Array.from(container.querySelectorAll(".course-day")).map(e => e.value.trim());
            const times = Array.from(container.querySelectorAll(".course-time")).map(e => e.value.trim());

            if (!courseName || !teacherName || codes.some(c => !c) || classes.some(c => !c)) {
                container.querySelector("#course-error").textContent = "لطفا همه فیلدها را پر کنید.";
                return;
            }

            for (let i = 0; i < times.length; i++) {
                for (let c of courses) {
                    for (let j = 0; j < c.times.length; j++) {
                        if (c.teacher === teacherName && c.days[j] === days[i] && c.times[j] === times[i]) {
                            container.querySelector("#course-error").textContent =
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

            container.querySelector("#course-error").textContent = "درس با موفقیت اضافه شد!";
            container.querySelector("#course-name").value = "";
            renderTimes();
        });
    }

    // ==========================
    //  اضافه کردن کاربر
    // ==========================
    function renderAddUser() {
        const container = document.createElement("div");
        container.innerHTML = `
            <h3>اضافه کردن کاربر</h3>
            <div class="form-group">
                <label>نقش کاربر</label>
                <select id="user-role">
                    <option value="student">دانشجو</option>
                    <option value="teacher">استاد</option>
                </select>
            </div>
            <div class="form-group">
                <label>نام</label>
                <input type="text" id="user-name">
            </div>
            <div class="form-group">
                <label>نام خانوادگی</label>
                <input type="text" id="user-family">
            </div>
            <div class="form-group">
                <label>شماره دانشجویی / کد پرسنلی</label>
                <input type="text" id="user-id">
            </div>
            <div class="form-group">
                <label>کد ملی</label>
                <input type="text" id="user-code">
            </div>
            <div class="form-group">
                <label>رمز عبور</label>
                <input type="password" id="user-pass">
            </div>
            <div class="form-group">
                <label>ایمیل (اختیاری)</label>
                <input type="email" id="user-email">
            </div>
            <button class="btn" id="add-user-btn">اضافه کردن کاربر</button>
            <p class="error-message" id="user-error"></p>
        `;
        mainContent.appendChild(container);

        container.querySelector("#add-user-btn").addEventListener("click", () => {
            const name = container.querySelector("#user-name").value.trim();
            const family = container.querySelector("#user-family").value.trim();
            const id = container.querySelector("#user-id").value.trim();
            const code = container.querySelector("#user-code").value.trim();
            const pass = container.querySelector("#user-pass").value.trim();
            const email = container.querySelector("#user-email").value.trim();
            const role = container.querySelector("#user-role").value;

            const nameRegex = /^[a-zA-Z\u0600-\u06FF\s]+$/;
            const codeRegex = /^\d{10}$/;
            const idRegex = /^\d+$/;

            if (!nameRegex.test(name) || !nameRegex.test(family)) {
                container.querySelector("#user-error").textContent = "نام و نام خانوادگی باید فقط حروف باشند.";
                return;
            }
            if (!codeRegex.test(code)) {
                container.querySelector("#user-error").textContent = "کد ملی باید 10 رقمی باشد.";
                return;
            }
            if (!idRegex.test(id)) {
                container.querySelector("#user-error").textContent =
                    role === 'student' ?
                    "شماره دانشجویی باید فقط عدد باشد." :
                    "کد پرسنلی باید فقط عدد باشد.";
                return;
            }

            const duplicate = users.some(u => u.role === role && u.id === id);
            if (duplicate) {
                container.querySelector("#user-error").textContent =
                    role === 'student' ? "این شماره دانشجویی قبلا ثبت شده." : "این کد پرسنلی قبلا ثبت شده.";
                return;
            }

            if (!pass) {
                container.querySelector("#user-error").textContent = "رمز عبور اجباری است.";
                return;
            }

            const newUser = { name, family, id, code, pass, email, role };
            users.push(newUser);

            if (role === "teacher") {
                teachersList.push({ name, family });
            }

            container.querySelector("#user-error").textContent = "کاربر با موفقیت اضافه شد!";
            container.querySelectorAll("input").forEach(i => i.value = "");
        });
    }

    // ==========================
    //  مشاهده لیست دروس
    // ==========================
    function renderCourseList() {
        const container = document.createElement("div");
        container.innerHTML = `<h3>لیست دروس</h3>`;
        mainContent.appendChild(container);

        if (courses.length === 0) {
            container.innerHTML += "<p>هیچ درسی اضافه نشده است.</p>";
            return;
        }

        const tableContainer = document.createElement("div");
        tableContainer.className = "table-container";
        const table = document.createElement("table");
        table.innerHTML = `
            <thead>
                <tr>
                    <th>نام درس</th>
                    <th>نام استاد</th>
                    <th>کد درس</th>
                    <th>کلاس</th>
                    <th>روز هفته</th>
                    <th>تایم کلاس</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        tableContainer.appendChild(table);
        container.appendChild(tableContainer);

        const tbody = table.querySelector("tbody");

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
        const container = document.createElement("div");
        container.innerHTML = `<h3>لیست کاربران</h3>`;
        mainContent.appendChild(container);

        if (users.length === 0) {
            container.innerHTML += "<p>هیچ کاربری اضافه نشده است.</p>";
            return;
        }

        const students = users.filter(u => u.role === "student");
        const teachers = users.filter(u => u.role === "teacher");

        const tableContainer = document.createElement("div");
        tableContainer.className = "table-container";
        const table = document.createElement("table");
        table.innerHTML = `
            <thead>
                <tr>
                    <th>نام</th>
                    <th>نام خانوادگی</th>
                    <th>شماره دانشجویی / کد پرسنلی</th>
                    <th>کد ملی</th>
                    <th>ایمیل</th>
                    <th>نقش</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        tableContainer.appendChild(table);
        container.appendChild(tableContainer);

        const tbody = table.querySelector("tbody");

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