const session = Store.current();
const tabs = document.querySelectorAll('.booking-tab');
const panes = document.querySelectorAll('.booking-pane');
const form = document.getElementById('booking-form');
const pageParams = new URLSearchParams(location.search);
let activeType = pageParams.get('type') === 'safari' ? 'safari' : 'stay';
const today = new Date();
const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
const nextDay = new Date(today); nextDay.setDate(today.getDate() + 2);
const iso = date => date.toISOString().split('T')[0];
document.querySelectorAll('input[type="date"]').forEach(input => input.min = iso(tomorrow));
document.getElementById('checkin').value = iso(tomorrow);
document.getElementById('checkout').value = iso(nextDay);
document.getElementById('safariDate').value = iso(tomorrow);
const requestedDate = pageParams.get('date');
if (requestedDate && requestedDate >= iso(tomorrow)) {
  if (activeType === 'safari') document.getElementById('safariDate').value = requestedDate;
  else {
    document.getElementById('checkin').value = requestedDate;
    const requestedCheckout = new Date(`${requestedDate}T12:00:00`);
    requestedCheckout.setDate(requestedCheckout.getDate() + 1);
    document.getElementById('checkout').value = iso(requestedCheckout);
  }
}

if (session) {
  document.getElementById('welcome-user').textContent = `Hi, ${session.name.split(' ')[0]}`;
  const authLink = document.getElementById('auth-link');
  authLink.textContent = 'Log out'; authLink.href = '#';
  authLink.addEventListener('click', event => { event.preventDefault(); Store.logout(); location.reload(); });
  document.getElementById('login-note').classList.add('hidden');
  document.getElementById('my-bookings').classList.remove('hidden');
}

function setTab(type) {
  activeType = type;
  tabs.forEach(tab => tab.classList.toggle('active', tab.dataset.tab === type));
  panes.forEach(pane => pane.classList.toggle('active', pane.dataset.pane === type));
  updateSummary();
}
tabs.forEach(tab => tab.addEventListener('click', () => setTab(tab.dataset.tab)));

function stayNights() {
  const start = new Date(document.getElementById('checkin').value);
  const end = new Date(document.getElementById('checkout').value);
  return Math.max(1, Math.round((end - start) / 86400000) || 1);
}
function selected(selector) { return document.querySelector(`${selector}:checked`); }
function details() {
  if (activeType === 'stay') {
    const choice = selected('[name="stayType"]'); const nights = stayNights();
    return { type:'Accommodation', name:choice.value, date:document.getElementById('checkin').value, endDate:document.getElementById('checkout').value, unit:`${nights} night${nights>1?'s':''}`, guests:document.getElementById('guests').value, total:Number(choice.dataset.price)*nights };
  }
  const choice = selected('[name="safariType"]');
  return { type:'Off-road safari', name:choice.value, date:document.getElementById('safariDate').value, time:document.getElementById('safariTime').value, unit:document.getElementById('safariTime').value, guests:document.getElementById('passengers').value, total:Number(choice.dataset.price) };
}
function updateSummary() {
  const item = details();
  document.getElementById('summary-name').textContent = item.name;
  document.getElementById('summary-unit-label').textContent = activeType === 'stay' ? 'Duration' : 'Departure';
  document.getElementById('summary-unit').textContent = item.unit;
  document.getElementById('summary-guests').textContent = item.guests;
  document.getElementById('summary-total').textContent = `₹${item.total.toLocaleString('en-IN')}`;
}
form.addEventListener('input', updateSummary);
form.addEventListener('submit', event => {
  event.preventDefault();
  if (!session) { location.href = `login.html?next=${encodeURIComponent(`booking.html?type=${activeType}`)}`; return; }
  const item = details();
  if (!item.date) return showMessage(document.getElementById('booking-message'), 'Please choose a date.', 'error');
  if (activeType === 'stay' && new Date(item.endDate) <= new Date(item.date)) return showMessage(document.getElementById('booking-message'), 'Check-out must be after check-in.', 'error');
  const booking = { ...item, email:session.email, id:`RMK${Date.now().toString().slice(-6)}`, created:new Date().toISOString(), note:document.getElementById('note').value };
  Store.saveBooking(booking);
  showMessage(document.getElementById('booking-message'), `Booking confirmed! Reference ${booking.id}.`, 'success');
  renderBookings(); window.scrollTo({ top:document.getElementById('booking-message').offsetTop - 120, behavior:'smooth' });
});
function renderBookings() {
  if (!session) return;
  const list = document.getElementById('bookings-list');
  const items = Store.bookings().filter(item => item.email === session.email);
  list.innerHTML = items.length ? items.map(item => `<article class="booking-item"><div><strong>${item.name}</strong><small>${item.type} &middot; ${item.date}${item.time ? ` at ${item.time}` : ''} &middot; ${item.guests} guest${item.guests === '1' ? '' : 's'} &middot; ₹${item.total.toLocaleString('en-IN')}</small><small>Reference: ${item.id}</small></div><span class="booking-status">CONFIRMED</span></article>`).join('') : '<p class="empty-state">You have no bookings yet. Your confirmed trips will appear here.</p>';
}
setTab(activeType); renderBookings();
