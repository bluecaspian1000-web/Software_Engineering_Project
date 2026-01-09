// تابع خروج
function redirectToLogin() {


    // تابع لاگ‌اوت
    function logout() {
        clearAuth();
        redirectToLogin();
    }
    window.location.href = "login.html";
}

function clearAuth() {
    localStorage.clear();
}

function logout() {
    clearAuth();
    redirectToLogin();
}

// نمایش جدول دروس
const coursesBtn = document.getElementById("coursesBtn");
const tableContainer = document.querySelector(".table-container");
const searchFields = document.querySelector(".search-fields");
const tbody = document.querySelector("#coursesTable tbody");

coursesBtn.addEventListener("click", () => {
    tableContainer.classList.toggle("hidden");
    searchFields.classList.toggle("hidden");
    if (!tableContainer.classList.contains("hidden")) {
        fetchCourses();
    }
});

function getSessionText(course) {
    if (course.session) {

        if (Array.isArray(course.session)) {
            return course.session.map(s =>
                typeof s === "string" ?
                s :
                `${s.location} - ${s.day_of_week ?? s.day} - ${s.time_slot ?? s.time}`
            ).join("<br>");
        }

        if (typeof course.session === "object") {
            return `${course.session.location} - ${course.session.day_of_week ?? course.session.day} - ${course.session.time_slot ?? course.session.time}`;
        }

        if (typeof course.session === "string") {
            return course.session;
        }
    }

    return `${course.location} - ${course.day_of_week} - ${course.time_slot}`;
}
// گرفتن داده‌ها از API
async function fetchCourses() {
    try {
        let response;
        let data;

        if (window.api && window.api.courseOfferings && typeof window.api.courseOfferings.list === "function") {
            response = await window.api.courseOfferings.list();
            data = await response.json();
        } else {
            response = await fetch("http://127.0.0.1:8000/courseofferings/");
            data = await response.json();
        }

        // Sync backend fields to existing UI keys (without removing anything)
        if (Array.isArray(data)) {
            data.forEach(c => {
                if (c && c.prof_name !== undefined && c.professor_name === undefined) c.professor_name = c.prof_name;
                if (c && c.sessions !== undefined && c.session === undefined) c.session = c.sessions;
            });
        }

        tbody.innerHTML = "";

        data.forEach(course => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${course.course_name}</td>
                <td>${course.professor_name}</td>
                <td>${course.code}</td>
                <td>${course.capacity}</td>
               <td>${getSessionText(course)}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error("خطا در دریافت دروس:", error);
    }
}
const searchCourse = document.getElementById("searchCourse");
const searchTeacher = document.getElementById("searchTeacher");

function filterTable() {
    const courseValue = searchCourse.value.toLowerCase();
    const teacherValue = searchTeacher.value.toLowerCase();

    const rows = tbody.querySelectorAll("tr");
    rows.forEach(row => {
        const courseName = row.cells[0].textContent.toLowerCase();
        const teacherName = row.cells[1].textContent.toLowerCase();

        if (courseName.includes(courseValue) && teacherName.includes(teacherValue)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
}

searchCourse.addEventListener("input", filterTable);
searchTeacher.addEventListener("input", filterTable);