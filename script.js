const toggle = document.querySelector('.menu-toggle');
const header = document.querySelector('.site-header');

toggle.addEventListener('click', () => {
  const open = header.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
});

document.querySelectorAll('.site-header nav a').forEach(link => {
  link.addEventListener('click', () => {
    header.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  });
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(element => observer.observe(element));

const activeCustomer = JSON.parse(localStorage.getItem('ramakkalmedu_session') || 'null');
if (activeCustomer) {
  const loginLink = document.querySelector('.login-link');
  loginLink.textContent = `Hi, ${activeCustomer.name.split(' ')[0]}`;
  loginLink.href = 'booking.html#my-bookings';
}

const quickBook = document.getElementById('quick-book');
if (quickBook) {
  const quickDate = document.getElementById('quick-date');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  quickDate.min = tomorrow.toISOString().split('T')[0];
  quickDate.value = quickDate.min;
  quickBook.addEventListener('submit', event => {
    event.preventDefault();
    const type = document.getElementById('quick-type').value;
    window.location.href = `booking.html?type=${type}&date=${quickDate.value}`;
  });
}
