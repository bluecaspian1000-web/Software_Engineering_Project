

// فعال کردن باز و بسته شدن خودکار زیرمنوها
document.querySelectorAll('.menu-item').forEach(item => {
  const targetId = item.getAttribute('data-target');
  if (!targetId) return;

  item.addEventListener('click', () => {
    const menu = document.getElementById(targetId);
    if (!menu) return;

    // بستن بقیه submenu ها
    document.querySelectorAll('.submenu').forEach(sm => {
      if (sm !== menu) sm.style.display = 'none';
    });

    // باز یا بسته کردن همین منو
    menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
  });
});




// ---------------- coursesList ------------------
async function renderOferedCourseList() {
  content.innerHTML = `
    <h2>لیست دروس ارائه شده</h2>
    <input type="text" id="searchInput" placeholder="جستجو بر اساس نام درس، کد یا استاد..." style="width: 100%; padding: 10px; margin-bottom: 20px; border-radius: 8px; border: 1px solid #ccc;">
    <div class="offered-container"></div>
  `;

  const container = document.querySelector('.offered-container');
  const searchInput = document.getElementById('searchInput');

  async function render(query='') {
    container.innerHTML = '';
    try {
      const data = await fetchOfferedCourses(query);

      data.forEach(c => {
        const courseName = c.course?.name || 'نامشخص';
        const courseCode = c.course?.code || '---';
        const group = c.group_code || '---';
        const prof = c.prof_name || 'نامشخص';
        const capacity = c.capacity || '---';
        const semester = c.semester || '---';
        const sessions = c.sessions?.length
          ? c.sessions.map(s => `${s.day_of_week} (${s.time_slot})`).join(', ')
          : 'ندارد';

        const card = document.createElement('div');
        card.className = 'offered-card';
        card.innerHTML = `
          <h3>${courseName} (${courseCode})</h3>
          <p><strong>گروه:</strong> ${group}</p>
          <p><strong>استاد:</strong> ${prof}</p>
          <p><strong>ظرفیت:</strong> ${capacity}</p>
          <p><strong>ترم:</strong> ${semester}</p>
          <p><strong>جلسات:</strong> ${sessions}</p>
        `;

        card.addEventListener('click', () => showCourseOfferingDetails(c));
        container.appendChild(card);
      });
    } catch(err) {
      console.error(err);
      alert('خطا در دریافت داده‌ها');
    }
  }

  render();

  let typingTimer;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
      const query = e.target.value.trim(); 
      render(query); 
    },300);
  });

}

async function fetchOfferedCourses(query='') {
  let url = `${API}/courseofferings/`;
  if(query){ 
    const params = new URLSearchParams();
    params.append('search', query);
    url += `?${params.toString()}`;
  }
  const res = await fetch(url);
  if(!res.ok) throw new Error('خطا در دریافت داده‌ها');
  return await res.json();
}




// نمایش جزئیات کامل درس ارائه شده + پیشنیازها
function showCourseOfferingDetails(offering) {
  const course = offering.course;

  content.innerHTML = `
    <div class="offered-detail-card">
      <h2>جزئیات درس ارائه شده</h2>

      <p><strong>نام درس:</strong> ${course.name}</p>
      <p><strong>کد درس:</strong> ${course.code}</p>
      <p><strong>واحد:</strong> ${course.unit}</p>
      <p><strong>گروه:</strong> ${offering.group_code}</p>
      <p><strong>ترم:</strong> ${offering.semester}</p>
      <p><strong>استاد:</strong> ${offering.prof_name || 'نامشخص'}</p>
      <p><strong>ظرفیت:</strong> ${offering.capacity}</p>

      <h4>جلسات</h4>
      <ul>
        ${offering.sessions.length
          ? offering.sessions.map(s => `<li>${s.day_of_week || 'روز نامشخص'} (${s.time_slot || 'زمان نامشخص'}) - ${s.location || 'مکان نامشخص'}</li>`).join('')
          : '<li>ندارد</li>'}
      </ul>

      <h4>پیش‌نیازها</h4>
      <ul>
        ${course.prerequisites.length
          ? course.prerequisites.map(p => `<li>${p.name} (${p.code})</li>`).join('')
          : '<li>ندارد</li>'}
      </ul>

      <button onclick="renderOferedCourseList()">بازگشت</button>
    </div>
  `;
}

window.renderOferedCourseList = renderOferedCourseList;