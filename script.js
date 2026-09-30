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
