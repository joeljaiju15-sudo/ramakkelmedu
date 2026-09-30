const Store = {
  getUsers: () => JSON.parse(localStorage.getItem('ramakkalmedu_users') || '[]'),
  saveUsers: users => localStorage.setItem('ramakkalmedu_users', JSON.stringify(users)),
  current: () => JSON.parse(localStorage.getItem('ramakkalmedu_session') || 'null'),
  login: user => localStorage.setItem('ramakkalmedu_session', JSON.stringify({ name: user.name, email: user.email })),
  logout: () => localStorage.removeItem('ramakkalmedu_session'),
  bookings: () => JSON.parse(localStorage.getItem('ramakkalmedu_bookings') || '[]'),
  saveBooking: booking => {
    const bookings = Store.bookings();
    bookings.unshift(booking);
    localStorage.setItem('ramakkalmedu_bookings', JSON.stringify(bookings));
  }
};

function showMessage(element, text, type) {
  element.textContent = text;
  element.className = `message show ${type}`;
}

document.querySelectorAll('[data-password-toggle]').forEach(button => {
  button.addEventListener('click', () => {
    const input = document.getElementById(button.dataset.passwordToggle);
    input.type = input.type === 'password' ? 'text' : 'password';
    button.textContent = input.type === 'password' ? 'Show' : 'Hide';
  });
});

const registerForm = document.getElementById('register-form');
if (registerForm) registerForm.addEventListener('submit', event => {
  event.preventDefault();
  const message = document.getElementById('form-message');
  const data = Object.fromEntries(new FormData(registerForm));
  if (data.password.length < 6) return showMessage(message, 'Use at least 6 characters for your password.', 'error');
  if (data.password !== data.confirmPassword) return showMessage(message, 'The passwords do not match.', 'error');
  const users = Store.getUsers();
  if (users.some(user => user.email.toLowerCase() === data.email.toLowerCase())) return showMessage(message, 'An account with this email already exists.', 'error');
  users.push({ name: data.name.trim(), email: data.email.trim(), phone: data.phone.trim(), password: data.password });
  Store.saveUsers(users);
  showMessage(message, 'Account created. Taking you to login...', 'success');
  setTimeout(() => location.href = 'login.html?registered=1', 900);
});

const loginForm = document.getElementById('login-form');
if (loginForm) {
  if (new URLSearchParams(location.search).has('registered')) showMessage(document.getElementById('form-message'), 'Registration complete. You can log in now.', 'success');
  loginForm.addEventListener('submit', event => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(loginForm));
    const user = Store.getUsers().find(item => item.email.toLowerCase() === data.email.toLowerCase() && item.password === data.password);
    if (!user) return showMessage(document.getElementById('form-message'), 'Email or password is incorrect. Please try again.', 'error');
    Store.login(user);
    const next = new URLSearchParams(location.search).get('next') || 'booking.html';
    location.href = next;
  });
}
