document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('reportForm');
  const message = document.getElementById('message');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const imei = form.imei.value.trim();
    const description = form.description.value.trim();

    if (!imei || !description) {
      message.textContent = '❌ يرجى إدخال رقم IMEI والوصف';
      message.className = 'msg error';
      return;
    }

    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imei, description })
      });

      const result = await res.json();

      if (res.ok) {
        message.textContent = '✅ تم إرسال البلاغ بنجاح';
        message.className = 'msg success';
        form.reset();
      } else {
        message.textContent = `❌ ${result.message || 'حدث خطأ أثناء الإرسال'}`;
        message.className = 'msg error';
      }
    } catch (err) {
      message.textContent = '❌ فشل الاتصال بالخادم';
      message.className = 'msg error';
    }
  });
});
