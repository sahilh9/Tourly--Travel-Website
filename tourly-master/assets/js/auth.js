'use strict';

const API_BASE = ''; // same origin

async function postJSON(url, data) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(payload.error || 'Request failed');
  return payload;
}

// Signup handler
(function () {
  const form = document.querySelector('form.auth-form');
  if (!form || !location.pathname.endsWith('signup.html')) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const password = fd.get('password');
    const confirm = fd.get('confirmPassword');
    if (password !== confirm) { alert('Passwords do not match'); return; }
    try {
      const data = await postJSON(`${API_BASE}/api/auth/signup`, {
        firstName: fd.get('firstName'),
        lastName: fd.get('lastName'),
        email: fd.get('email'),
        phone: fd.get('phone'),
        password
      });
      localStorage.setItem('tourly_user', JSON.stringify(data));
      alert('Account created! You can now log in.');
      location.href = 'login.html';
    } catch (err) { alert(err.message); }
  });
})();

// Login handler
(function () {
  const form = document.querySelector('form.auth-form');
  if (!form || !location.pathname.endsWith('login.html')) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    try {
      const data = await postJSON(`${API_BASE}/api/auth/login`, {
        email: fd.get('email'),
        password: fd.get('password')
      });
      localStorage.setItem('tourly_user', JSON.stringify(data));
      alert(`Welcome back, ${data.firstName}!`);
      location.href = 'index.html';
    } catch (err) { alert(err.message); }
  });
})();


