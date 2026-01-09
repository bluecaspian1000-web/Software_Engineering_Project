// ================================
// api.js - Single Source of Truth for Backend APIs (FRONTEND)
// Backend base: http://127.0.0.1:8000
// ================================

(function() {
        const BASE_URL = "http://127.0.0.1:8000";

        function getAccessToken() {
            return localStorage.getItem("accessToken");
        }

        function getRefreshToken() {
            return localStorage.getItem("refreshToken");
        }

        function setTokens(access, refresh) {
            if (access) localStorage.setItem("accessToken", access);
            if (refresh) localStorage.setItem("refreshToken", refresh);
        }

        function clearAuth() {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
        }

        async function refreshAccessToken() {
            const refresh = getRefreshToken();
            if (!refresh) return false;

            try {
                const res = await fetch(`${BASE_URL}/api/token/refresh/`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ refresh }),
                });

                if (!res.ok) return false;

                const data = await res.json().catch(() => ({}));
                if (data && data.access) {
                    setTokens(data.access, null);
                    return true;
                }
                return false;
            } catch (e) {
                console.error("refreshAccessToken error:", e);
                return false;
            }
        }

        function buildUrl(pathOrUrl) {
            if (typeof pathOrUrl !== "string") return `${BASE_URL}/`;
            if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) return pathOrUrl;
            if (pathOrUrl.startsWith("/")) return `${BASE_URL}${pathOrUrl}`;
            return `${BASE_URL}/${pathOrUrl}`;
        }

        async function apiRequest(pathOrUrl, options = {}) {
            const headers = {
                "Content-Type": "application/json",
                ...(options.headers || {}),
            };

            const token = getAccessToken();
            if (token) headers["Authorization"] = `Bearer ${token}`;

            const config = {...options, headers };

            let res = await fetch(buildUrl(pathOrUrl), config);

            if (res.status === 401) {
                const refreshed = await refreshAccessToken();
                if (refreshed) {
                    const newToken = getAccessToken();
                    if (newToken) config.headers["Authorization"] = `Bearer ${newToken}`;
                    res = await fetch(buildUrl(pathOrUrl), config);
                }
            }

            return res;
        }

        async function login(username, password) {
            const res = await fetch(`${BASE_URL}/login/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json().catch(() => ({}));
            return { res, data };
        }

        async function logout() {
            const refresh = getRefreshToken();
            const res = await fetch(`${BASE_URL}/logout/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refresh }),
            });
            const data = await res.json().catch(() => ({}));
            return { res, data };
        }

        // Courses
        const courses = {
                list: (params = "") => apiRequest(`/courses/${params ? `?${params}` : ""}`),
    retrieve: (id) => apiRequest(`/courses/${id}/`),
    create: (payload) => apiRequest(`/courses/`, { method: "POST", body: JSON.stringify(payload) }),
    update: (id, payload) => apiRequest(`/courses/${id}/`, { method: "PUT", body: JSON.stringify(payload) }),
    patch: (id, payload) => apiRequest(`/courses/${id}/`, { method: "PATCH", body: JSON.stringify(payload) }),
    remove: (id) => apiRequest(`/courses/${id}/`, { method: "DELETE" }),
    addPrerequisite: (coursecode, prereqcode) =>
      apiRequest(`/courses/add-prerequisite/`, { method: "POST", body: JSON.stringify({ coursecode, prereqcode }) }),
    removePrerequisite: (coursecode, prereqcode) =>
      apiRequest(`/courses/remove-prerequisite/`, { method: "POST", body: JSON.stringify({ coursecode, prereqcode }) }),
  };

  const sessions = {
    list: (params = "") => apiRequest(`/sessions/${params ? `?${params}` : ""}`),
    retrieve: (id) => apiRequest(`/sessions/${id}/`),
    create: (payload) => apiRequest(`/sessions/`, { method: "POST", body: JSON.stringify(payload) }),
    update: (id, payload) => apiRequest(`/sessions/${id}/`, { method: "PUT", body: JSON.stringify(payload) }),
    patch: (id, payload) => apiRequest(`/sessions/${id}/`, { method: "PATCH", body: JSON.stringify(payload) }),
    remove: (id) => apiRequest(`/sessions/${id}/`, { method: "DELETE" }),
  };

  const courseOfferings = {
    list: (params = "") => apiRequest(`/courseofferings/${params ? `?${params}` : ""}`),
    retrieve: (id) => apiRequest(`/courseofferings/${id}/`),
    create: (payload) => apiRequest(`/courseofferings/`, { method: "POST", body: JSON.stringify(payload) }),
    update: (id, payload) => apiRequest(`/courseofferings/${id}/`, { method: "PUT", body: JSON.stringify(payload) }),
    patch: (id, payload) => apiRequest(`/courseofferings/${id}/`, { method: "PATCH", body: JSON.stringify(payload) }),
    remove: (id) => apiRequest(`/courseofferings/${id}/`, { method: "DELETE" }),
  };

  // Students
  const semesters = {
    list: (params = "") => apiRequest(`/semesters/${params ? `?${params}` : ""}`),
    retrieve: (id) => apiRequest(`/semesters/${id}/`),
    create: (payload) => apiRequest(`/semesters/`, { method: "POST", body: JSON.stringify(payload) }),
    update: (id, payload) => apiRequest(`/semesters/${id}/`, { method: "PUT", body: JSON.stringify(payload) }),
    patch: (id, payload) => apiRequest(`/semesters/${id}/`, { method: "PATCH", body: JSON.stringify(payload) }),
    remove: (id) => apiRequest(`/semesters/${id}/`, { method: "DELETE" }),
  };

  const studentSemester = {
    list: (params = "") => apiRequest(`/student-semester/${params ? `?${params}` : ""}`),
    retrieve: (id) => apiRequest(`/student-semester/${id}/`),
    create: (payload) => apiRequest(`/student-semester/`, { method: "POST", body: JSON.stringify(payload) }),
    update: (id, payload) => apiRequest(`/student-semester/${id}/`, { method: "PUT", body: JSON.stringify(payload) }),
    patch: (id, payload) => apiRequest(`/student-semester/${id}/`, { method: "PATCH", body: JSON.stringify(payload) }),
    remove: (id) => apiRequest(`/student-semester/${id}/`, { method: "DELETE" }),
    updateMaxMinUnits: (payload) => apiRequest(`/student-semester/maxmin-units/`, { method: "PATCH", body: JSON.stringify(payload) }),
    coursesInSemester: (semester_code) => apiRequest(`/student-semester/courses-in-semester/?semester_code=${encodeURIComponent(semester_code)}`),
  };

  window.api = {
    BASE_URL,
    buildUrl,
    apiRequest,
    getAccessToken,
    getRefreshToken,
    setTokens,
    clearAuth,
    login,
    logout,
    courses,
    sessions,
    courseOfferings,
    semesters,
    studentSemester,
  };
})();