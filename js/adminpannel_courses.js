//(() => {
//const API = 'http://127.0.0.1:8000';
//const content = document.getElementById('content');


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


/* ================= لیست دروس ================= */
async function renderCourseList(){
  content.innerHTML = `<h2>لیست دروس</h2><div id="courseContainer" class="course-container"></div>`;
  const container = document.getElementById('courseContainer');

  try{
    const res = await fetch(`${API}/courses/`);
    const data = await res.json();

    data.forEach(d=>{
      const card = document.createElement('div');
      card.className = 'course-card';
      card.innerHTML = `
        <h3>${d.name}</h3>
        <p><strong>کد درس:</strong> ${d.code}</p>
        <p><strong>واحد:</strong> ${d.unit}</p>
      `;
      card.onclick = () => showCourseDetails(d.id);
      container.appendChild(card);
    });
  }catch{
    alert('خطا در دریافت لیست');
  }
}

/* ================= افزودن درس ================= */
function renderAddCourse(){
  content.innerHTML = `
    <h2>افزودن درس</h2>

    <label>نام درس</label>
    <input id="addName">

    <label>کد درس</label>
    <input id="addCode" type="number">

    <label>تعداد واحد</label>
    <input id="addUnits" type="number">

    <br><br>
    <button onclick="submitAdd()">ثبت</button>
  `;
}

async function submitAdd(){
  const payload = {
    name: addName.value.trim(),
    code: Number(addCode.value),
    units: Number(addUnits.value)
  };

  if(!payload.name || !payload.code || !payload.units){
    alert('همه فیلدها الزامی هستند');
    return;
  }

  await fetch(`${API}/courses/`,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  });

  renderCourseList();
}

/* ================= آپدیت درس ================= */
async function renderUpdateCourse(){
  content.innerHTML = `<h2>انتخاب درس برای آپدیت</h2><div class="update-container"></div>`;
  const container = document.querySelector('.update-container');

  const res = await fetch(`${API}/courses/`);
  const data = await res.json();

  data.forEach(d=>{
    const card = document.createElement('div');
    card.className = 'update-card';
    card.innerHTML = `
      <h3>${d.name}</h3>
      <p><strong>کد درس:</strong> ${d.code}</p>
      <p><strong>واحد:</strong> ${d.unit}</p>
    `;
    card.onclick = ()=>renderUpdateForm(d);
    container.appendChild(card);
  });
}

function renderUpdateForm(course){
  content.innerHTML = `
    <div class="update-form-card">
      <h2>آپدیت درس</h2>

      <label>نام درس:</label>
      <input id="updateName" value="${course.name}">

      <label>کد درس:</label>
      <input id="updateCode" value="${course.code}" type="number">

      <label>تعداد واحد:</label>
      <input id="updateUnits" value="${course.unit}" type="number">

      <br><br>
      <button onclick="submitUpdate(${course.id})">ثبت تغییرات</button>
    </div>
  `;
}

async function submitUpdate(id){
  // گرفتن مقدارهای ورودی با document.getElementById
  const payload = {
    name: document.getElementById('updateName').value.trim(),
    code: Number(document.getElementById('updateCode').value),
    unit: Number(document.getElementById('updateUnits').value)
  };

  try {
    const res = await fetch(`${API}/courses/${id}/`, {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json();
      console.error(err);
      alert('خطا در آپدیت درس');
      return;
    }

    alert('درس با موفقیت آپدیت شد');
    renderUpdateCourse(); // بازگشت به لیست درس‌ها
  } catch (error) {
    console.error(error);
    alert('خطا در ارتباط با سرور');
  }
}


/* ================= حذف درس ================= */
async function renderDeleteCourse(){
  content.innerHTML = `<h2>حذف درس</h2>`;

  const res = await fetch(`${API}/courses/`);
  const data = await res.json();

  data.forEach(d=>{
    const btn = document.createElement('button');
    btn.textContent = `حذف ${d.name} (${d.code})`; // ← اسم و کد درس
    btn.className = 'delete-btn';
    btn.onclick = ()=>deleteCourse(d.id);
    content.appendChild(btn);
  });
}

async function deleteCourse(id){
  if(!confirm('مطمئن هستید؟')) return;

  await fetch(`${API}/courses/${id}/`,{ method:'DELETE' });
  renderDeleteCourse();
}

/* ================= پیشنیاز ================= */
function renderAddPrereq(){
  content.innerHTML = `
    <h2>افزودن پیشنیاز</h2>
    <div class="prereq-form">
      <input id="mainCode" placeholder="کد درس اصلی">
      <input id="preCode" placeholder="کد درس پیشنیاز">
      <button onclick="submitAddPrereq()">ثبت</button>
    </div>
  `;
}

async function submitAddPrereq(){
  try {
    const res = await fetch(`${API}/courses/add-prerequisite/`,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        coursecode: document.getElementById('mainCode').value,
        prereqcode: document.getElementById('preCode').value
      })
    });

    if (!res.ok) {
      const err = await res.json();  // دریافت پیام خطا از سرور
      console.error(err);
      alert('خطا در افزودن پیشنیاز: ' + (err.detail || 'مشکل نامشخص'));
      return;
    }

    alert('پیشنیاز با موفقیت اضافه شد');

    document.getElementById('mainCode').value = '';
    document.getElementById('preCode').value = '';

  } catch (error) {
    console.error(error);
    alert('خطا در ارتباط با سرور');
  }
}

function renderRemovePrereq(){
 content.innerHTML = `
    <h2>حذف پیشنیاز</h2>
    <div class="prereq-form">
      <input id="mainCode" placeholder="کد درس اصلی">
      <input id="preCode" placeholder="کد درس پیشنیاز">
      <button onclick="submitRemovePrereq()">حذف</button>
    </div>
  `;
}
async function submitRemovePrereq(){
  try {
    const res = await fetch(`${API}/courses/remove-prerequisite/`,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        coursecode: document.getElementById('mainCode').value,
        prereqcode: document.getElementById('preCode').value
      })
    });

    if (!res.ok) {
      const err = await res.json();  
      console.error(err);
      alert('خطا در حذف پیشنیاز: ' + (err.detail || 'مشکل نامشخص'));
      return;
    }

    alert('پیشنیاز با موفقیت حذف شد');

    document.getElementById('mainCode').value = '';
    document.getElementById('preCode').value = '';

  } catch (error) {
    console.error(error);
    alert('خطا در ارتباط با سرور');
  }
}


async function showCourseDetails(id){
  const res = await fetch(`${API}/courses/${id}/`);
  const d = await res.json();

  content.innerHTML = `
    <div class="course-detail-card">
      <h2>${d.name}</h2>

      <div class="course-info">
        <p><strong>کد درس:</strong> ${d.code}</p>
        <p><strong>واحد:</strong> ${d.unit}</p>
      </div>
         
      <div class="course-prereq">
        <h4>پیشنیازها</h4>
        <div class="prereq-list">
          ${d.prerequisites.length
            ? d.prerequisites.map(p=>`<span class="prereq-item">${p.name} (${p.code})</span>`).join('')
            : '<span class="prereq-item none">ندارد</span>'}
        </div>
      </div>

      <button class="back-btn" onclick="renderCourseList()">بازگشت</button>
    </div>
  `;
}

/*
  window.renderCourseList = renderCourseList;
  window.renderAddCourse = renderAddCourse;
  window.renderUpdateCourse = renderUpdateCourse;
  window.renderDeleteCourse = renderDeleteCourse;
  window.renderAddPrereq = renderAddPrereq;
  window.renderRemovePrereq = renderRemovePrereq;
})();
*/