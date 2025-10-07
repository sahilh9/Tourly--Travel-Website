'use strict';

/**
 * navbar toggle
 */

const overlay = document.querySelector("[data-overlay]");
const navOpenBtn = document.querySelector("[data-nav-open-btn]");
const navbar = document.querySelector("[data-navbar]");
const navCloseBtn = document.querySelector("[data-nav-close-btn]");
const navLinks = document.querySelectorAll("[data-nav-link]");

const navElemArr = [navOpenBtn, navCloseBtn, overlay];

const navToggleEvent = function (elem) {
  for (let i = 0; i < elem.length; i++) {
    elem[i].addEventListener("click", function () {
      navbar.classList.toggle("active");
      overlay.classList.toggle("active");
    });
  }
}

navToggleEvent(navElemArr);
navToggleEvent(navLinks);



/**
 * header sticky & go to top
 */

const header = document.querySelector("[data-header]");
const goTopBtn = document.querySelector("[data-go-top]");

window.addEventListener("scroll", function () {

  if (window.scrollY >= 200) {
    header.classList.add("active");
    goTopBtn.classList.add("active");
  } else {
    header.classList.remove("active");
    goTopBtn.classList.remove("active");
  }

});

/**
 * Smooth scroll for in-page anchors
 */
document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(function (link) {
  link.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/**
 * Booking modal + localStorage persistence
 */
(function () {
  const openButtons = document.querySelectorAll('[data-book-btn]');
  const modal = document.getElementById('booking-modal');
  if (!modal) return; // safety if modal not on this page

  const closeElems = modal.querySelectorAll('[data-booking-close]');
  const nameEl = modal.querySelector('[data-booking-name]');
  const locationEl = modal.querySelector('[data-booking-location]');
  const durationEl = modal.querySelector('[data-booking-duration]');
  const priceEl = modal.querySelector('[data-booking-price]');
  const form = document.getElementById('booking-form');
  const success = modal.querySelector('.booking-success');

  function openModal(pkgBtn) {
    nameEl.textContent = pkgBtn.getAttribute('data-package-title') || '-';
    locationEl.textContent = pkgBtn.getAttribute('data-package-location') || '-';
    durationEl.textContent = pkgBtn.getAttribute('data-package-duration') || '-';
    priceEl.textContent = pkgBtn.getAttribute('data-package-price') || '-';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    success.hidden = true;
    form.reset();
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  openButtons.forEach(function (btn) {
    btn.addEventListener('click', function () { openModal(btn); });
  });
  closeElems.forEach(function (el) { el.addEventListener('click', closeModal); });
  window.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

  form && form.addEventListener('submit', function (e) {
    e.preventDefault();
    const formData = new FormData(form);
    const booking = {
      package: nameEl.textContent,
      location: locationEl.textContent,
      duration: durationEl.textContent,
      price: priceEl.textContent,
      fullName: formData.get('fullName'),
      email: formData.get('email'),
      pax: Number(formData.get('pax')),
      date: formData.get('date'),
      createdAt: new Date().toISOString()
    };

    if (!booking.fullName || !booking.email || !booking.date) return;

    const all = JSON.parse(localStorage.getItem('tourly_bookings') || '[]');
    all.push(booking);
    localStorage.setItem('tourly_bookings', JSON.stringify(all));
    success.hidden = false;
    setTimeout(closeModal, 1200);
  });
})();

/**
 * Toggle navbar items based on auth state and handle logout
 */
(function () {
  const user = localStorage.getItem('tourly_user');
  const guestEls = document.querySelectorAll('[data-nav-auth="guest"]');
  const userEls = document.querySelectorAll('[data-nav-auth="user"]');
  const isLoggedIn = Boolean(user);

  guestEls.forEach(el => el.style.display = isLoggedIn ? 'none' : 'block');
  userEls.forEach(el => el.style.display = isLoggedIn ? 'block' : 'none');

  const logout = document.getElementById('logout-link');
  if (logout) {
    logout.addEventListener('click', function (e) {
      e.preventDefault();
      localStorage.removeItem('tourly_user');
      location.reload();
    });
  }
})();