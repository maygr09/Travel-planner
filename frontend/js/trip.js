import { searchTrips } from './api.js';

/* ================= ICONS ================= */
const ICONS = {
  transport: '✈️',
  activity: '🎟️',
  meal: '🍽️',
  accommodation: '🏨'
};

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
  setHeaderHeightVar();
  renderSummaryCards();
  renderDayCards();
};

/* ================= HEADER ================= */
const renderHeader = () => {
  document.getElementById('tripTitle').textContent = currentTrip.tripName;
  document.getElementById('people').textContent =
    `👥 ${currentTrip.peopleCount}`;
  document.getElementById('activeVersion').textContent =
    `📌 ${currentVersion.name}`;
};

/* ================= SUMMARY ================= */
const renderSummaryCards = () => {
  const container = document.getElementById('summaryCards');
  if (!container) return;

  const s = currentVersion.summary || {};

  container.innerHTML = `
    <div class="summary-card">
      <strong>Total</strong>
      <span>${s.totalMXN || 0} MXN</span>
    </div>
    <div class="summary-card">
      <strong>Per person</strong>
      <span>${s.perPersonMXN || 0} MXN</span>
    </div>
    <div class="summary-card">
      <strong>Transports</strong>
      <span>${currentVersion.transports.length}</span>
    </div>
    <div class="summary-card">
      <strong>Activities</strong>
      <span>${currentVersion.activities.length}</span>
    </div>
    <div class="summary-card">
      <strong>Meals</strong>
      <span>${currentVersion.meals.length}</span>
    </div>
    <div class="summary-card">
      <strong>Accommodation</strong>
      <span>${currentVersion.accommodations.length}</span>
    </div>
  `;
};

/* ================= EVENTS ================= */
const collectEvents = () => {
  const events = [];

  // TRANSPORTS
  currentVersion.transports.forEach(t => {
    if (t.departureDate && t.departureTime) {
      events.push({
        date: t.departureDate,
        time: t.departureTime,
        type: 'transport',
        title: `${t.type}: ${t.from} → ${t.to}`,
        cost: `${t.cost} ${t.currencyCode}`
      });
    }

      if (t.arrivalDate && t.arrivalTime) {
    events.push({
      date: t.arrivalDate,
      time: t.arrivalTime,
      type: 'transport',
      title: `${t.type}: Arrival in ${t.to}`,
      cost: null
    });
  }

  });

  // ACTIVITIES
  currentVersion.activities.forEach(a => {
    if (a.startDate && a.startTime) {
      events.push({
        date: a.startDate,
        time: a.startTime,
        type: 'activity',
        title: a.name,
        cost: `${a.cost} ${a.currencyCode}`
      });
    }
  });

  // MEALS
  currentVersion.meals.forEach(m => {
    if (m.startDate && m.startTime) {
      events.push({
        date: m.startDate,
        time: m.startTime,
        type: 'meal',
        title: m.name,
        cost: `${m.cost} ${m.currencyCode}`
      });
    }
  });

  // ACCOMMODATION (check-in)
  currentVersion.accommodations.forEach(a => {
    if (a.checkInDate) {
      events.push({
        date: a.checkInDate,
        time: a.checkInTime,
        type: 'accommodation',
        title: `Check-in: ${a.name}`,
        cost: `${a.cost} ${a.currencyCode}`
      });
    }
  });

  return events;
};

/* ================= GROUP BY DAY ================= */
const groupEventsByDay = (events) => {
  const days = {};

  events.forEach(e => {
    if (!days[e.date]) days[e.date] = [];
    days[e.date].push(e);
  });

  Object.keys(days).forEach(date => {
    days[date].sort((a, b) => a.time.localeCompare(b.time));
  });

  return days;
};

/* ================= DAY CARDS ================= */
const renderDayCards = () => {
  const container = document.getElementById('dayCards');
  container.innerHTML = '';

  const events = collectEvents();
  const days = groupEventsByDay(events);

  const sortedDates = Object.keys(days).sort((a, b) => {
    const toVal = s => {
      const t = Date.parse(s);
      if (!isNaN(t)) return t;
      const n = Number(s);
      return isNaN(n) ? String(s) : n;
    };
    const va = toVal(a);
    const vb = toVal(b);
    if (typeof va === 'string' || typeof vb === 'string') {
      return String(va).localeCompare(String(vb));
    }
    return va - vb;
  });

  if (!sortedDates.length) {
    container.textContent = 'No itinerary yet';
    return;
  }

  sortedDates.forEach((date, index) => {
    const items = days[date];
    const card = document.createElement('div');
    card.className = 'day-card';

    card.innerHTML = `
      <h3>Day ${index + 1} <span class ="muted">${date}</span></h3>
      <div class="day-timeline"></div>
    `;

    const timeline = card.querySelector('.day-timeline');

    items.forEach(item => {
      const div = document.createElement('div');
      div.className = `timeline-item ${item.type}`;

      div.innerHTML = `
        <span class="icon">${ICONS[item.type]}</span>
        <div class="content">
          <strong>${item.title}</strong>
          ${item.time ? `<small>${item.time}</small>` : ''}
          ${item.cost ? `<span class="cost">${item.cost}</span>` : ''}
        </div>
      `;

      timeline.appendChild(div);
    });

    container.appendChild(card);
  });
};

/* ================= NAV ================= */
document.getElementById('editTripBtn')
  ?.addEventListener('click', () => {
    window.location.href =
      `editTrip.html?trip=${encodeURIComponent(currentTrip.tripName)}`;
  });

document.getElementById('indexBtn')
  ?.addEventListener('click', () => {
    window.location.href = `../index.html`;
  });

  const setHeaderHeightVar = () => {
  const header = document.querySelector('.trip-header');
  if (!header) return;
  document.documentElement.style.setProperty('--header-height', `${header.getBoundingClientRect().height}px`);
};
window.addEventListener('load', setHeaderHeightVar);
window.addEventListener('resize', setHeaderHeightVar);


/* ================= INIT ================= */
loadTrip();