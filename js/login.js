// المنت‌ها
const loginBtn = document.getElementById('loginBtn');
const errorMsg = document.getElementById('errorMsg');


loginBtn.addEventListener('click', async () => {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  // بررسی فیلدهای خالی
  if (!username || !password) {
    errorMsg.textContent = "لطفاً همه فیلدها را پر کنید";
    errorMsg.style.display = 'block';
    return;
  }

  try {
    // ارسال اطلاعات به سرور
    const res = await fetch(`${API}/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('token', data.token);  
      localStorage.setItem('role', data.role);    


      if (data.role === 'admin') {
        window.location.href = './adminpanel.html';
      }
       else if (data.role === 'student') {
        window.location.href = './studentpanel.html';
      }
      else {
         window.location.href = './profpanel.html';
      }

    } else {

      errorMsg.textContent = data.message || 'نام کاربری یا رمز عبور اشتباه است';
      errorMsg.style.display = 'block';
    }

  } catch (err) {
    console.error(err);
    errorMsg.textContent = 'خطا در ارتباط با سرور';
    errorMsg.style.display = 'block';
  }
});
