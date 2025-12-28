import { searchTrips } from './api.js';

/* ================= STATE ================= */
let currentTrip = null;
let currentVersion = null;

/* ================= PARAMS ================= */
const params = new URLSearchParams(window.location.search);
const tripName = params.get('trip');

/* ================= LOAD ================= */
const loadTrip = async () => {
  if (!tripName) {
    alert('No trip specified');
    return;
  }

  const results = await searchTrips(tripName);
  if (!results.length) {
    alert('Trip not found');
    return;
  }

  currentTrip = results[0];
  currentVersion = currentTrip.versions.find(v => v.isActive);

  renderHeader();
  renderTransports();
  renderActivities();
  renderMeals();
  renderSummary();
};

/* ================= HEADER ================= */
const renderHeader = () => {
  document.getElementById('tripTitle').textContent = currentTrip.tripName;
  document.getElementById('people').textContent =
    `People: ${currentTrip.peopleCount}`;
  document.getElementById('activeVersion').textContent =
    `Version: ${currentVersion.name}`;
};

/* ================= TRANSPORTS ================= */
const renderTransports = () => {
  const list = document.getElementById('transportList');
  list.innerHTML = '';

  if (!currentVersion.transports.length) {
    list.textContent = 'No transports';
    return;
  }

  currentVersion.transports.forEach(t => {
    const div = document.createElement('div');
    div.className = 'item';

    div.innerHTML = `
      <strong>${t.type}</strong><br/>
      ${t.from} → ${t.to}<br/>
      ${t.departureDate} ${t.departureTime} →
      ${t.arrivalDate} ${t.arrivalTime}<br/>
      ${t.cost} ${t.currencyCode}<br/>
      ${t.confirmationCode ? `Confirmation: ${t.confirmationCode}<br/>` : ''}
      ${t.bookingUrl ? `<a href="${t.bookingUrl}" target="_blank">Booking</a>` : ''}
    `;

    list.appendChild(div);
  });
};

/* ================= ACTIVITIES ================= */
const renderActivities = () => {
  const list = document.getElementById('activityList');
  list.innerHTML = '';

  if (!currentVersion.activities.length) {
    list.textContent = 'No activities';
    return;
  }

  currentVersion.activities.forEach(a => {
    const div = document.createElement('div');
    div.className = 'item';

    div.innerHTML = `
      <strong>${a.name}</strong><br/>
      ${a.startDate} ${a.startTime} →
      ${a.endDate} ${a.endTime}<br/>
      ${a.cost} ${a.currencyCode}<br/>
      ${a.confirmationCode ? `Confirmation: ${a.confirmationCode}<br/>` : ''}
      ${a.bookingUrl ? `<a href="${a.bookingUrl}" target="_blank">Booking</a>` : ''}
    `;

    list.appendChild(div);
  });
};

/* ================= MEALS ================= */
const renderMeals = () => {
  const list = document.getElementById('mealList');
  list.innerHTML = '';

  if (!currentVersion.meals.length) {
    list.textContent = 'No meals';
    return;
  }

  currentVersion.meals.forEach(m => {
    const div = document.createElement('div');
    div.className = 'item';

    div.innerHTML = `
      <strong>${m.name}</strong><br/>
      ${m.startDate} ${m.startTime} →
      ${m.endDate} ${m.endTime}<br/>
      ${m.cost} ${m.currencyCode}<br/>
      ${m.confirmationCode ? `Confirmation: ${m.confirmationCode}<br/>` : ''}
      ${m.bookingUrl ? `<a href="${m.bookingUrl}" target="_blank">Booking</a>` : ''}
    `;

    list.appendChild(div);
  });
};

/* ================= SUMMARY ================= */
const renderSummary = () => {
  document.getElementById('summary').textContent =
    JSON.stringify(currentVersion.summary, null, 2);
};

/* ================= INIT ================= */
loadTrip();