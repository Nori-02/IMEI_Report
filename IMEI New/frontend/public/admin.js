document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const username = form.username.value.trim();
  const password = form.password.value.trim();

  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const msg = document.getElementById('message');
  if (res.ok) {
    const data = await res.json();
    msg.textContent = '✅ تم تسجيل الدخول بنجاح';
    msg.style.color = 'green';
    localStorage.setItem('token', data.token);
    // يمكنك إعادة التوجيه إلى لوحة التحكم لاحقًا
  } else {
    const error = await res.json();
    msg.textContent = `❌ ${error.message || 'فشل تسجيل الدخول'}`;
    msg.style.color = 'red';
  }
});
