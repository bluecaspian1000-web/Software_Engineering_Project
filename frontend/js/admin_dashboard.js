const API_BASE_URL = "http://localhost:8000/api";

// Auth Helper Functions

function getAccessToken() {
    return localStorage.getItem('accessToken');
}

function getRefreshToken() {
    return localStorage.getItem('refreshToken');
}

function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

function setTokens(access, refresh) {
    localStorage.setItem('accessToken', access);
    if (refresh) {
        localStorage.setItem('refreshToken', refresh);
    }
}

function clearAuth() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
}

function redirectToLogin() {
    window.location.href = "login.html";
}

// API Request 

async function apiRequest(endpoint, options = {}) {
    const token = getAccessToken();

    const defaultHeaders = {
        "Content-Type": "application/json",
    };

    if (token) {
        defaultHeaders["Authorization"] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    try {
        let response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        if (response.status === 401) {
            const refreshed = await refreshAccessToken();
            if (refreshed) {
                config.headers["Authorization"] = `Bearer ${getAccessToken()}`;
                response = await fetch(`${API_BASE_URL}${endpoint}`, config);
            } else {
                clearAuth();
                redirectToLogin();
                return null;
            }
        }

        return response;
    } catch (error) {
        console.error("API Request Error:", error);
        throw error;
    }
}

async function refreshAccessToken() {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    try {
        const response = await fetch(`${API_BASE_URL}/token/refresh/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh: refreshToken })
        });

        if (response.ok) {
            const data = await response.json();
            setTokens(data.access, null);
            return true;
        }
        return false;
    } catch (error) {
        console.error("Token refresh error:", error);
        return false;
    }
}

// Auth Check on Page Load

async function checkAuth() {
    const token = getAccessToken();

    if (!token) {
        redirectToLogin();
        return false;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/token/verify/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: token })
        });

        if (!response.ok) {
            const refreshed = await refreshAccessToken();
            if (!refreshed) {
                clearAuth();
                redirectToLogin();
                return false;
            }
        }

        updateUserInfo();
        return true;
    } catch (error) {
        console.error("Auth check error:", error);
        clearAuth();
        redirectToLogin();
        return false;
    }
}

function updateUserInfo() {
    const user = getCurrentUser();
    const userInfoEl = document.getElementById('user-info');
    if (userInfoEl && user) {
        userInfoEl.textContent = `${user.first_name || user.username}`;
    }
}


// Logout Function

async function logout() {
    const refreshToken = getRefreshToken();

    try {
        await apiRequest('/accounts/logout/', {
            method: 'POST',
            body: JSON.stringify({ refresh: refreshToken })
        });
    } catch (error) {
        console.error("Logout error:", error);
    }

    clearAuth();
    redirectToLogin();
}

// Main Application

document.addEventListener("DOMContentLoaded", async() => {
    // بررسی احراز هویت
    // const isAuthenticated = await checkAuth();
    // if (!isAuthenticated) return;

    const mainContent = document.querySelector(".main-content");
    const menuButtons = document.querySelectorAll(".panel-menu button");


    // مدیریت منو

    menuButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const action = btn.dataset.action;
            document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));

            switch (action) {
                case "add-course":
                    document.getElementById("add-course-section").classList.remove("hidden");
                    loadProfessorsForCourse();
                    break;
                case "view-courses":
                    document.getElementById("course-list-section").classList.remove("hidden");
                    renderCourseList();
                    break;
                case "add-user":
                    document.getElementById("add-user-section").classList.remove("hidden");
                    break;
                case "view-users":
                    document.getElementById("user-list-section").classList.remove("hidden");
                    renderUserList();
                    break;
            }
        });
    });

    // لود اساتید برای dropdown
    async function loadProfessorsForCourse() {
        const teacherSelect = document.getElementById("course-teacher");
        if (!teacherSelect) return;

        try {
            const response = await apiRequest('http://127.0.0.1:8000/Professor/');
            if (response && response.ok) {
                const professors = await response.json();
                teacherSelect.innerHTML = '<option value="">انتخاب استاد</option>';
                professors.forEach(p => {
                    const option = document.createElement('option');
                    option.value = p.id;
                    option.textContent = p.name || `${p.first_name} ${p.last_name}`;
                    teacherSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error("Error loading professors:", error);
        }
    }

    // اضافه کردن دانشجو و استاد

    const roleBtns = document.querySelectorAll(".role-btn");
    const roleSelection = document.getElementById("user-role-selection");
    const studentForm = document.getElementById("student-form");
    const teacherForm = document.getElementById("teacher-form");

    roleBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const role = btn.dataset.role;
            roleSelection.classList.add("hidden");
            studentForm.classList.add("hidden");
            teacherForm.classList.add("hidden");

            if (role === "student") studentForm.classList.remove("hidden");
            if (role === "teacher") teacherForm.classList.remove("hidden");
        });
    });

    const addStudentBtn = document.getElementById("add-student-btn");
    if (addStudentBtn) {
        addStudentBtn.addEventListener("click", async() => {
            const name = document.getElementById("student-name").value.trim();
            const family = document.getElementById("student-family").value.trim();
            const id = document.getElementById("student-id").value.trim();
            const code = document.getElementById("student-code").value.trim();
            const minUnit = parseInt(document.getElementById("student-min-unit").value, 10);
            const maxUnit = parseInt(document.getElementById("student-max-unit").value, 10);
            const pass = document.getElementById("student-pass").value.trim();
            const email = document.getElementById("student-email").value.trim();
            const errorEl = document.getElementById("student-error");

            if (!name || !family || !id || !code || !pass || !minUnit || !maxUnit) {
                errorEl.textContent = "لطفا تمام فیلدهای ضروری را پر کنید";
                errorEl.style.color = "red";
                errorEl.style.backgroundColor = "#f8f8f8";
                errorEl.style.padding = "5px 10px";
                errorEl.style.borderRadius = "4px";
                return;
            }
            if (minUnit < 1 || minUnit > 24 || maxUnit < 1 || maxUnit > 24 || minUnit > maxUnit) {
                errorEl.textContent = "تعداد واحدها باید بین 1 تا 24 باشد و حداکثر ≥ حداقل";
                errorEl.style.color = "red";
                errorEl.style.backgroundColor = "#f8f8f8";
                errorEl.style.padding = "5px 10px";
                errorEl.style.borderRadius = "4px";
                return;
            }

            try {
                const response = await apiRequest('http://127.0.0.1:8000/students/', {
                    method: "POST",
                    body: JSON.stringify({
                        first_name: name,
                        last_name: family,
                        user_id: id,
                        national_code: code,
                        password: pass,
                        email: email,
                        role: "student",
                        min_unit: minUnit,
                        max_unit: maxUnit
                    })
                });

                const data = await response.json();
                if (response.ok) {
                    errorEl.textContent = "دانشجو با موفقیت اضافه شد!";
                    errorEl.style.color = "green";
                    errorEl.style.backgroundColor = "#f8f8f8";
                    errorEl.style.padding = "5px 10px";
                    errorEl.style.borderRadius = "4px";
                    studentForm.reset();
                } else {
                    errorEl.textContent = data.message || "خطا در ثبت دانشجو";
                    errorEl.style.color = "red";
                    errorEl.style.backgroundColor = "#f8f8f8";
                    errorEl.style.padding = "5px 10px";
                    errorEl.style.borderRadius = "4px";
                }
            } catch (err) {
                errorEl.textContent = "ارتباط با سرور برقرار نشد";
                errorEl.style.color = "red";
                errorEl.style.backgroundColor = "#f8f8f8";
                errorEl.style.padding = "5px 10px";
                errorEl.style.borderRadius = "4px";
            }
        });
    }

    const addTeacherBtn = document.getElementById("add-teacher-btn");
    if (addTeacherBtn) {
        addTeacherBtn.addEventListener("click", async() => {
            const name = document.getElementById("teacher-name").value.trim();
            const family = document.getElementById("teacher-family").value.trim();
            const id = document.getElementById("teacher-id").value.trim();
            const code = document.getElementById("teacher-code").value.trim();
            const pass = document.getElementById("teacher-pass").value.trim();
            const email = document.getElementById("teacher-email").value.trim();
            const errorEl = document.getElementById("teacher-error");

            if (!name || !family || !id || !code || !pass) {
                errorEl.textContent = "لطفا تمام فیلدهای ضروری را پر کنید";
                errorEl.style.color = "red";
                errorEl.style.backgroundColor = "#f8f8f8";
                errorEl.style.padding = "5px 10px";
                errorEl.style.borderRadius = "4px";
                return;
            }

            try {
                const response = await apiRequest('http://127.0.0.1:8000/Professor/', {
                    method: "POST",
                    body: JSON.stringify({
                        first_name: name,
                        last_name: family,
                        user_id: id,
                        national_code: code,
                        password: pass,
                        email: email,
                        role: "teacher"
                    })
                });

                const data = await response.json();
                if (response.ok) {
                    errorEl.textContent = "استاد با موفقیت اضافه شد!";
                    errorEl.style.color = "green";
                    errorEl.style.backgroundColor = "#f8f8f8";
                    errorEl.style.padding = "5px 10px";
                    errorEl.style.borderRadius = "4px";
                    teacherForm.reset();
                } else {
                    errorEl.textContent = data.message || "خطا در ثبت استاد";
                    errorEl.style.color = "red";
                    errorEl.style.backgroundColor = "#f8f8f8";
                    errorEl.style.padding = "5px 10px";
                    errorEl.style.borderRadius = "4px";
                }
            } catch (err) {
                errorEl.textContent = "ارتباط با سرور برقرار نشد";
                errorEl.style.color = "red";
                errorEl.style.backgroundColor = "#f8f8f8";
                errorEl.style.padding = "5px 10px";
                errorEl.style.borderRadius = "4px";
            }
        });
    }
    // 🆕 لود دروس برای پیش‌نیاز
    async function loadCoursesForPrerequisite() {
        const prereqSelect = document.getElementById("course-prerequisite");
        const removePrereqBtn = document.getElementById("remove-prerequisite-btn");

        if (!prereqSelect || !removePrereqBtn) return;

        try {
            const response = await apiRequest('http://127.0.0.1:8000/courses/');
            if (response && response.ok) {
                const courses = await response.json();
                prereqSelect.innerHTML = '<option value="">بدون پیش‌نیاز</option>';
                courses.forEach(c => {
                    const option = document.createElement('option');
                    option.value = c.id;
                    option.textContent = c.name;
                    prereqSelect.appendChild(option);
                });
            }
        } catch (err) {
            console.error("Error loading courses for prerequisite:", err);
        }

        removePrereqBtn.addEventListener("click", () => {
            prereqSelect.value = "";
        });
    }


    // اضافه کردن درس

    const addCourseBtn = document.getElementById("add-course-btn");
    const courseCapacityInput = document.getElementById("course-capacity");
    const courseTimesContainer = document.getElementById("course-times-container");
    const addTimeSlotBtn = document.getElementById("add-time-slot-btn");

    const DAYS = [
        { value: "Saturday", label: "شنبه" },
        { value: "Sunday", label: "یکشنبه" },
        { value: "Monday", label: "دوشنبه" },
        { value: "Tuesday", label: "سه‌شنبه" },
        { value: "Wednesday", label: "چهارشنبه" },
    ];

    const TIME_SLOTS = [
        { value: "8-10", label: "8 - 10" },
        { value: "10-12", label: "10 - 12" },
        { value: "14-16", label: "14 - 16" },
        { value: "16-18", label: "16 - 18" },
    ];

    function createCourseTimeRow() {
        const row = document.createElement("div");
        row.className = "course-time-row";

        const daySelect = document.createElement("select");
        daySelect.name = "day_of_week";
        daySelect.innerHTML = `<option value="">روز هفته</option>`;
        DAYS.forEach(d => {
            const opt = document.createElement("option");
            opt.value = d.value;
            opt.textContent = d.label;
            daySelect.appendChild(opt);
        });

        const timeSelect = document.createElement("select");
        timeSelect.name = "time_slot";
        timeSelect.innerHTML = `<option value="">ساعت کلاس</option>`;
        TIME_SLOTS.forEach(t => {
            const opt = document.createElement("option");
            opt.value = t.value;
            opt.textContent = t.label;
            timeSelect.appendChild(opt);
        });

        const locationInput = document.createElement("input");
        locationInput.type = "text";
        locationInput.name = "location";
        locationInput.placeholder = "کلاس (مثلاً ۱۰۱)";

        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "remove-time-slot-btn";
        removeBtn.textContent = "حذف";
        removeBtn.addEventListener("click", () => {
            row.remove();
            const rows = courseTimesContainer.querySelectorAll(".course-time-row");
            if (rows.length === 0) {
                courseTimesContainer.appendChild(createCourseTimeRow());
            }
        });

        row.appendChild(daySelect);
        row.appendChild(timeSelect);
        row.appendChild(locationInput);
        row.appendChild(removeBtn);

        return row;
    }

    if (courseTimesContainer) {
        courseTimesContainer.innerHTML = "";
        courseTimesContainer.appendChild(createCourseTimeRow());
    }

    if (addTimeSlotBtn) {
        addTimeSlotBtn.addEventListener("click", () => {
            const rows = courseTimesContainer.querySelectorAll(".course-time-row");
            if (rows.length >= 2) return;
            courseTimesContainer.appendChild(createCourseTimeRow());
        });
    }

    addCourseBtn.addEventListener("click", async() => {
        const courseName = document.getElementById("course-name").value.trim();
        const teacherId = document.getElementById("course-teacher").value;
        const courseUnit = document.getElementById("course-unit").value;
        const capacityVal = courseCapacityInput ? parseInt(courseCapacityInput.value, 10) : 0;
        const errorEl = document.getElementById("course-error");

        if (!courseName || !teacherId) {
            errorEl.textContent = "لطفا نام درس و استاد را انتخاب کنید";
            errorEl.style.color = "red";
            errorEl.style.backgroundColor = "#f8f8f8";
            errorEl.style.padding = "5px 10px";
            errorEl.style.borderRadius = "4px";

            return;
            return;
        }

        if (!capacityVal || capacityVal < 10 || capacityVal > 50) {
            errorEl.textContent = "ظرفیت باید بین ۱۰ تا ۵۰ باشد";
            errorEl.style.color = "red";
            errorEl.style.backgroundColor = "#f8f8f8";
            errorEl.style.padding = "5px 10px";
            errorEl.style.borderRadius = "4px";

            return;
            return;
        }

        const timeRows = courseTimesContainer.querySelectorAll(".course-time-row");
        const schedules = [];
        const usedKeys = new Set();

        timeRows.forEach(row => {
            const daySelect = row.querySelector("select[name='day_of_week']");
            const timeSelect = row.querySelector("select[name='time_slot']");
            const locationInput = row.querySelector("input[name='location']");
            const day = daySelect ? daySelect.value : "";
            const time = timeSelect ? timeSelect.value : "";
            const location = locationInput ? locationInput.value.trim() : "";

            if (day && time && location) {
                const key = `${day}|${time}|${location}`;
                if (usedKeys.has(key)) {
                    errorEl.textContent = "زمان‌ها و کلاس‌های تکراری وارد شده است";
                    errorEl.style.color = "red";
                    errorEl.style.backgroundColor = "#f8f8f8";
                    errorEl.style.padding = "5px 10px";
                    errorEl.style.borderRadius = "4px";

                    return;
                    return;
                }
                usedKeys.add(key);

                schedules.push({
                    day_of_week: day,
                    time_slot: time,
                    location: location
                });
            }
        });

        if (schedules.length === 0) {
            errorEl.textContent = "حداقل یک زمان و کلاس برای درس انتخاب کنید";
            errorEl.style.color = "red";
            errorEl.style.backgroundColor = "#f8f8f8";
            errorEl.style.padding = "5px 10px";
            errorEl.style.borderRadius = "4px";

            return;

            return;
        }

        try {
            const response = await apiRequest('http://127.0.0.1:8000/courses/', {
                method: "POST",
                body: JSON.stringify({
                    name: courseName,
                    professor: teacherId,
                    capacity: capacityVal,
                    code: `C${Date.now().toString().slice(-6)}`,
                    schedules: schedules
                })
            });

            if (response) {
                const data = await response.json();
                if (response.ok) {
                    errorEl.style.color = "green";
                    errorEl.textContent = "درس با موفقیت اضافه شد!";
                    document.querySelector("#course-name").value = "";
                    if (courseCapacityInput) courseCapacityInput.value = "30";
                    if (courseTimesContainer) {
                        courseTimesContainer.innerHTML = "";
                        courseTimesContainer.appendChild(createCourseTimeRow());
                    }
                    // 🆕 افزودن پیش‌نیاز (اختیاری)
                    if (prereqId) {
                        await apiRequest('http://127.0.0.1:8000/courses/add-prerequistite/', {
                            method: "POST",
                            body: JSON.stringify({
                                course_id: data.id,
                                prerequisite_id: prereqId
                            })
                        });
                    }

                    // پاک کردن انتخاب پیش‌نیاز
                    const prereqSelect = document.getElementById("course-prerequisite");
                    if (prereqSelect) prereqSelect.value = "";

                } else {
                    errorEl.style.color = "red";
                    errorEl.style.backgroundColor = "#f8f8f8";
                    errorEl.style.padding = "5px 10px";
                    errorEl.style.borderRadius = "4px";

                    return;
                    errorEl.textContent = data.message || data.detail || "خطا در ثبت درس";
                }
            }
        } catch (err) {
            errorEl.style.color = "red";
            errorEl.style.backgroundColor = "#f8f8f8";
            errorEl.style.padding = "5px 10px";
            errorEl.style.borderRadius = "4px";

            return;
            errorEl.textContent = "ارتباط با سرور برقرار نشد";
        }
    });

    // نمایش لیست کاربران (اساتید)
    async function renderUserList() {
        const tbody = document.querySelector("#users-table-body");
        tbody.innerHTML = "<tr><td colspan='6'>در حال بارگذاری...</td></tr>";

        try {
            const response = await apiRequest('http://127.0.0.1:8000/Professor/');
            if (response && response.ok) {
                const users = await response.json();
                tbody.innerHTML = "";

                if (users.length === 0) {
                    tbody.innerHTML = "<tr><td colspan='6'>کاربری یافت نشد</td></tr>";
                    return;
                }

                users.forEach(u => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td>${u.first_name || u.name?.split(' ')[0] || '-'}</td>
                        <td>${u.last_name || u.name?.split(' ')[1] || '-'}</td>
                        <td>${u.professor_code || u.id || '-'}</td>
                        <td>-</td>
                        <td>-</td>
                        <td>استاد</td>
                    `;
                    tbody.appendChild(tr);
                });
            } else {
                tbody.innerHTML = "<tr><td colspan='6'>خطا در دریافت کاربران</td></tr>";
            }
        } catch (err) {
            console.error("Error fetching users:", err);
            tbody.innerHTML = "<tr><td colspan='6'>خطا در دریافت کاربران</td></tr>";
        }
    }

    // نمایش لیست دروس
    async function renderCourseList() {
        const tbody = document.querySelector("#courses-table-body");
        tbody.innerHTML = "<tr><td colspan='8'>در حال بارگذاری...</td></tr>";

        try {
            // 1️⃣ گرفتن لیست دروس (فقط برای IDها)
            const listResponse = await apiRequest('http://127.0.0.1:8000/courseofferings/');
            if (!listResponse || !listResponse.ok) {
                tbody.innerHTML = "<tr><td colspan='8'>خطا در دریافت لیست دروس</td></tr>";
                return;
            }

            const courseList = await listResponse.json();
            tbody.innerHTML = "";

            if (courseList.length === 0) {
                tbody.innerHTML = "<tr><td colspan='8'>درسی یافت نشد</td></tr>";
                return;
            }

            const DAY_FA_MAP = {
                "Saturday": "شنبه",
                "Sunday": "یکشنبه",
                "Monday": "دوشنبه",
                "Tuesday": "سه‌شنبه",
                "Wednesday": "چهارشنبه"
            };

            // 2️⃣ گرفتن جزئیات هر درس با courses_read
            for (const item of courseList) {
                const detailResponse = await apiRequest(
                    `/courses/${item.id}/courses_read`
                );

                if (!detailResponse || !detailResponse.ok) continue;

                const c = await detailResponse.json();

                const schedules = c.schedules || [];
                let classText = "-";
                let dayText = "-";
                let timeText = "-";

                if (schedules.length > 0) {
                    classText = schedules.map(s => s.location).join("، ");
                    dayText = schedules
                        .map(s => DAY_FA_MAP[s.day_of_week] || s.day_of_week)
                        .join(" و ");
                    timeText = schedules.map(s => s.time_display).join("، ");
                }

                const tr = document.createElement("tr");
                tr.innerHTML = `
                <td>${c.name}</td>
                <td>${c.professor_name || '-'}</td>
                <td>${c.code}</td>
                <td>${c.capacity}</td>
                <td>${classText}</td>
                <td>${dayText}</td>
                <td>${timeText}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn action-edit">ویرایش</button>
                        <button class="action-btn action-delete">حذف</button>
                    </div>
                </td>
            `;

                tr.querySelector(".action-edit").addEventListener("click", () => {
                    openEditCoursePage(c.id);
                });

                tr.querySelector(".action-delete").addEventListener("click", () => {
                    handleDeleteCourse(c.id);
                });

                tbody.appendChild(tr);
            }

        } catch (err) {
            console.error("Error fetching courses:", err);
            tbody.innerHTML = "<tr><td colspan='8'>خطا در دریافت دروس</td></tr>";
        }
    }


    async function handleDeleteCourse(courseId) {
        if (!confirm("آیا از حذف این درس مطمئن هستید؟")) return;

        try {
            const response = await apiRequest(`http://127.0.0.1:8000/courseofferings/${Id}/`, { method: "DELETE" });
            if (response && (response.status === 204 || response.ok)) {
                alert("درس با موفقیت حذف شد.");
                renderCourseList();
            } else if (response) {
                const data = await response.json().catch(() => ({}));
                alert(data.message || "خطا در حذف درس.");
            } else {
                alert("خطا در حذف درس.");
            }
        } catch (error) {
            console.error("Error deleting course:", error);
            alert("خطا در ارتباط با سرور.");
        }
    }

    function openEditCoursePage(courseId) {
        window.location.href = `edit_course.html?id=${courseId}`;
    }

    loadProfessorsForCourse();
});