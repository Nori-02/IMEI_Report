// ... نفس تعريف i18n و state و setLang و luhnIMEI

window.addEventListener("DOMContentLoaded", () => {
  setLang(state.lang);

  document.getElementById("lang-ar").addEventListener("click", () => setLang("ar"));
  document.getElementById("lang-en").addEventListener("click", () => setLang("en"));

  const reportForm = document.getElementById("reportForm");
  const reportMsg = document.getElementById("reportMsg");

  reportForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    reportMsg.className = "msg";
    reportMsg.textContent = "";

    const data = {
      imei: reportForm.imei.value.trim(),
      status: reportForm.status.value,
      brand: reportForm.brand.value.trim(),
      model: reportForm.model.value.trim(),
      color: reportForm.color.value.trim(),
      description: reportForm.description.value.trim(),
      lost_date: reportForm.lost_date.value || null,
      location: reportForm.location.value.trim(),
      contact_name: reportForm.contact_name.value.trim(),
      contact_email: reportForm.contact_email.value.trim(),
      contact_phone: reportForm.contact_phone.value.trim(),
      police_report: reportForm.police_report.value.trim(),
      is_public: reportForm.is_public.checked ? 1 : 0
    };

    if (!luhnIMEI(data.imei)) {
      reportMsg.classList.add("error");
      reportMsg.textContent = i18n[state.lang].invalid_imei;
      return;
    }

    try {
      const res = await fetch(`${state.apiBase}/api/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "err");

      reportMsg.classList.add("success");
      reportMsg.textContent = i18n[state.lang].success_ref(json.ref);

      // إعادة التوجيه بعد النجاح
      setTimeout(() => {
        window.location.href = "/thankyou.html";
      }, 2000);

      reportForm.reset();
    } catch (err) {
      reportMsg.classList.add("error");
      reportMsg.textContent = i18n[state.lang].server_error;
    }
  });

  const checkForm = document.getElementById("checkForm");
  const checkResult = document.getElementById("checkResult");

  checkForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    checkResult.className = "msg";
    checkResult.textContent = "";

    const imei = document.getElementById("checkImei").value.trim();
    if (!luhnIMEI(imei)) {
      checkResult.classList.add("error");
      checkResult.textContent = i18n[state.lang].invalid_imei;
      return;
    }

    try {
      const res = await fetch(`${state.apiBase}/api/check?imei=${encodeURIComponent(imei)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "err");

      checkResult.classList.add("success");
      const n = json.count || 0;
      let text = i18n[state.lang].results_found(n);

      if (n > 0) {
        const list = document.createElement("ul");
        json.reports.forEach(r => {
          const li = document.createElement("li");
          li.textContent = [
            r.status.toUpperCase(),
            [r.brand, r.model].filter(Boolean).join(" "),
            r.color || "",
            r.lost_date || "",
            r.location || ""
          ].filter(Boolean).join(" • ");
          list.appendChild(li);
        });
        checkResult.textContent = text;
        checkResult.appendChild(list);
      } else {
        checkResult.textContent = text;
      }
    } catch (err) {
      checkResult.classList.add("error");
      checkResult.textContent = i18n[state.lang].server_error;
    }
  });
});
