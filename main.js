document.getElementById('reportForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const imei = form.imei.value.trim();
  const description = form.description.value.trim();

  const res = await fetch('/api/report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imei, description })
  });

  const msg = document.getElementById('message');
  if (res.ok) {
    msg.textContent = '✅ تم إرسال البلاغ بنجاح';
    msg.className = 'success';
    form.reset();
  } else {
    const error = await res.json();
    msg.textContent = `❌ ${error.message || 'حدث خطأ أثناء الإرسال'}`;
    msg.className = 'error';
  }
});
