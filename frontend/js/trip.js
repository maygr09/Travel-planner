const ICONS = {
  transport: '✈️',
  activity: '🎟️',
  meal: '🍽️',
  accommodation: '🏨'
};
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
  renderAccommodations();
  renderSummary();
  renderTimeline();
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

/* ================= ACCOMMODATIONS ================= */

const renderAccommodations = () => {
  const list = document.getElementById('accommodationList');
  list.innerHTML = '';

  if (!currentVersion.accommodations.length) {
    list.textContent = 'No accommodations';
    return;
  }

  currentVersion.accommodations.forEach(acc => {
    const div = document.createElement('div');
    div.className = 'item';

    div.innerHTML = `
      <strong>${acc.name}</strong><br/> (${acc.city || ''})<br/>
      ${acc.checkInDate} → ${acc.checkOutDate}<br/>
      ${acc.cost} ${acc.currencyCode}<br/>
      ${acc.bookingCode ? `Code: ${acc.bookingCode}<br/>` : ''}
      ${acc.bookingUrl ? `<a href="${acc.bookingUrl}" target="_blank">Booking</a>` : ''}
    `;

    list.appendChild(div);
  });
};

/* ================= SUMMARY ================= */
const renderSummary = () => {
  const container = document.getElementById('summaryCards');
  if (!container) return;

  const s = currentVersion.summary || {};
  container.innerHTML = '';

  const cards = [
    { label: 'Total MXN', value: s.totalMXN || 0 },
    { label: 'Per person', value: s.perPersonMXN || 0 },
    { label: 'Transports', value: currentVersion.transports.length },
    { label: 'Activities', value: currentVersion.activities.length },
    { label: 'Meals', value: currentVersion.meals.length },
    { label: 'Accommodation', value: currentVersion.accommodations.length }
  ];

  cards.forEach(c => {
    const div = document.createElement('div');
    div.className = 'summary-card';
    div.innerHTML = `
      <strong>${c.value}</strong>
      <span>${c.label}</span>
    `;
    container.appendChild(div);
  });
};



/* ================= TIMELINE ================= */
const normalizeDate = (dateStr) => {
  if (!dateStr) return null;
  return dateStr.split('T')[0];
};

const buildTimeline = () => {
  const timeline = {};

  const pushItem = (date, item) => {
    if (!date) return;
    if (!timeline[date]) timeline[date] = [];
    timeline[date].push(item);
  };

  //  TRANSPORTS
  currentVersion.transports.forEach(t => {
    pushItem(normalizeDate(t.departureDate), {
      type: 'transport',
      data: t
    });
  });

  //  ACTIVITIES
  currentVersion.activities.forEach(a => {
    pushItem(normalizeDate(a.startDate), {
      type: 'activity',
      data: a
    });
  });

  //  MEALS
  currentVersion.meals.forEach(m => {
    pushItem(normalizeDate(m.startDate), {
      type: 'meal',
      data: m
    });
  });

  //  ACCOMMODATIONS (día por día)
  currentVersion.accommodations.forEach(acc => {
    let current = new Date(acc.checkInDate);
    const end = new Date(acc.checkOutDate);

    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      pushItem(dateStr, {
        type: 'accommodation',
        data: acc
      });
      current.setDate(current.getDate() + 1);
    }
  });

  return timeline;
};

const renderTimeline = () => {
  const container = document.getElementById('timeline');
  container.innerHTML = '';

  const events = [];

  currentVersion.transports.forEach(t => {
    if (t.departureDate && t.departureTime) {
      events.push({
        type: 'transport',
        date: t.departureDate,
        time: t.departureTime,
        title: `${t.type}: ${t.from} → ${t.to}`
      });
    }
  });

  currentVersion.activities.forEach(a => {
    if (a.startDate && a.startTime) {
      events.push({
        type: 'activity',
        date: a.startDate,
        time: a.startTime,
        title: a.name
      });
    }
  });

  currentVersion.meals.forEach(m => {
    if (m.startDate && m.startTime) {
      events.push({
        type: 'meal',
        date: m.startDate,
        time: m.startTime,
        title: m.name
      });
    }
  });

  currentVersion.accommodations.forEach(a => {
    if (a.checkInDate) {
      events.push({
        type: 'accommodation',
        date: a.checkInDate,
        time: '00:00',
        title: `Check-in: ${a.name}`
      });
    }
  });

  if (!events.length) {
    container.textContent = 'No events yet';
    return;
  }

  events.sort((a, b) =>
    `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
  );

  let currentDay = null;
  let dayDiv = null;

  events.forEach(e => {
    if (e.date !== currentDay) {
      currentDay = e.date;
      dayDiv = document.createElement('div');
      dayDiv.className = 'day';
      dayDiv.innerHTML = `<h3>${e.date}</h3>`;
      container.appendChild(dayDiv);
    }

    const item = document.createElement('div');
    item.className = `timeline-item ${e.type}`;
    item.innerHTML = `
      <span class="icon">${ICONS[e.type]}</span>
      <div>
        <strong>${e.title}</strong><br/>
        <small>${e.time}</small>
      </div>
    `;

    dayDiv.appendChild(item);
  });
};



/* ================= INIT ================= */
loadTrip();