// ================================
// API Configuration (simple)
// ================================
const API_BASE_URL = "http://localhost:8000/api";

function getAccessToken() {
    return localStorage.getItem('accessToken');
}

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

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // اگر توکن منقضی شده یا وجود ندارد، به صفحه لاگین برو
    if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = "login.html";
        return null;
    }

    return response;
}

function getCourseIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

document.addEventListener("DOMContentLoaded", async () => {
    const courseId = getCourseIdFromUrl();
    const nameInput = document.getElementById("course-name");
    const codeInput = document.getElementById("course-code");
    const capacityInput = document.getElementById("course-capacity");
    const teacherSelect = document.getElementById("course-teacher");
    const messageEl = document.getElementById("edit-course-message");
    const saveBtn = document.getElementById("save-course-btn");
    const timesContainer = document.getElementById("course-times-container");
    const addTimeBtn = document.getElementById("add-time-slot-btn");

    if (!courseId) {
        messageEl.textContent = "شناسه درس نامعتبر است.";
        messageEl.style.color = "red";
        return;
    }

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

    function createCourseTimeRow(initial) {
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

        if (initial) {
            if (initial.day_of_week) daySelect.value = initial.day_of_week;
            if (initial.time_slot) timeSelect.value = initial.time_slot;
            if (initial.location) locationInput.value = initial.location;
        }

        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "remove-time-slot-btn";
        removeBtn.textContent = "حذف";
        removeBtn.addEventListener("click", () => {
            row.remove();
            const rows = timesContainer.querySelectorAll(".course-time-row");
            if (rows.length === 0) {
                timesContainer.appendChild(createCourseTimeRow());
            }
        });

        row.appendChild(daySelect);
        row.appendChild(timeSelect);
        row.appendChild(locationInput);
        row.appendChild(removeBtn);

        return row;
    }

    // لود اساتید برای dropdown
    async function loadProfessors(selectedProfessorId) {
        try {
            const response = await apiRequest('/auth/professors/');
            if (response && response.ok) {
                const professors = await response.json();
                teacherSelect.innerHTML = '<option value="">انتخاب استاد</option>';
                professors.forEach(p => {
                    const option = document.createElement('option');
                    option.value = p.id;
                    option.textContent = p.name || `${p.first_name} ${p.last_name}`;
                    if (selectedProfessorId && selectedProfessorId === p.id) {
                        option.selected = true;
                    }
                    teacherSelect.appendChild(option);
                });
            } else {
                teacherSelect.innerHTML = '<option value="">خطا در دریافت لیست اساتید</option>';
            }
        } catch (error) {
            console.error("Error loading professors:", error);
            teacherSelect.innerHTML = '<option value="">خطا در دریافت لیست اساتید</option>';
        }
    }

    // لود اطلاعات درس
    try {
        const response = await apiRequest(`/courses/${courseId}/`);
        if (response && response.ok) {
            const course = await response.json();
            nameInput.value = course.name || "";
            codeInput.value = course.code || "";
            capacityInput.value = course.capacity || 30;

            // زمان‌بندی‌ها
            const schedules = course.schedules || [];
            if (timesContainer) {
                timesContainer.innerHTML = "";
                if (schedules.length > 0) {
                    schedules.slice(0, 2).forEach(s => {
                        timesContainer.appendChild(createCourseTimeRow(s));
                    });
                } else {
                    timesContainer.appendChild(createCourseTimeRow());
                }
            }

            await loadProfessors(course.professor);
        } else {
            messageEl.textContent = "خطا در دریافت اطلاعات درس.";
            messageEl.style.color = "red";
            return;
        }
    } catch (err) {
        console.error("Error loading course:", err);
        messageEl.textContent = "خطا در دریافت اطلاعات درس.";
        messageEl.style.color = "red";
        return;
    }

    // دکمه افزودن زمان دوم
    if (addTimeBtn) {
        addTimeBtn.addEventListener("click", () => {
            const rows = timesContainer.querySelectorAll(".course-time-row");
            if (rows.length >= 2) return;
            timesContainer.appendChild(createCourseTimeRow());
        });
    }

    // ذخیره تغییرات
    saveBtn.addEventListener("click", async () => {
        const name = nameInput.value.trim();
        const code = codeInput.value.trim();
        const capacity = parseInt(capacityInput.value, 10);
        const professorId = teacherSelect.value;

        messageEl.textContent = "";

        if (!name || !code || !capacity || !professorId) {
            messageEl.textContent = "لطفاً تمام فیلدها را پر کنید.";
            messageEl.style.color = "red";
            return;
        }

        if (capacity < 10 || capacity > 50) {
            messageEl.textContent = "ظرفیت باید بین ۱۰ تا ۵۰ باشد.";
            messageEl.style.color = "red";
            return;
        }

        // جمع‌آوری زمان‌ها
        const timeRows = timesContainer.querySelectorAll(".course-time-row");
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
                    messageEl.textContent = "زمان‌ها و کلاس‌های تکراری وارد شده است.";
                    messageEl.style.color = "red";
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
            messageEl.textContent = "حداقل یک زمان و کلاس برای درس انتخاب کنید.";
            messageEl.style.color = "red";
            return;
        }

        try {
            const response = await apiRequest(`/courses/${courseId}/update/`, {
                method: "PUT",
                body: JSON.stringify({
                    name: name,
                    code: code,
                    capacity: capacity,
                    professor: professorId,
                    schedules: schedules
                })
            });

            if (response) {
                const data = await response.json().catch(() => ({}));
                if (response.ok && data.success !== false) {
                    messageEl.textContent = "تغییرات با موفقیت ذخیره شد.";
                    messageEl.style.color = "lightgreen";

                    setTimeout(() => {
                        window.location.href = "admin_dashboard.html";
                    }, 1200);
                } else {
                    messageEl.textContent = data.message || "خطا در ذخیره تغییرات.";
                    messageEl.style.color = "red";
                }
            }
        } catch (error) {
            console.error("Error updating course:", error);
            messageEl.textContent = "خطا در ارتباط با سرور.";
            messageEl.style.color = "red";
        }
    });
});


