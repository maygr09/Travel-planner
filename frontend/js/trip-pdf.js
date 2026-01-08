import { searchTrips } from './api.js';

/* ================= PARAMS ================= */
const params = new URLSearchParams(window.location.search);
const tripName = params.get('trip');

const getTripPeriod = (version) => {
  const dates = [];

  version.transports.forEach(t => {
    if (t.departureDate) dates.push(t.departureDate);
    if (t.arrivalDate) dates.push(t.arrivalDate);
  });

  version.activities.forEach(a => {
    if (a.startDate) dates.push(a.startDate);
    if (a.endDate) dates.push(a.endDate);
  });

  version.meals.forEach(m => {
    if (m.startDate) dates.push(m.startDate);
  });

  version.accommodations.forEach(a => {
    if (a.checkInDate) dates.push(a.checkInDate);
    if (a.checkOutDate) dates.push(a.checkOutDate);
  });

  if (!dates.length) return '—';

  dates.sort((a, b) => new Date(a) - new Date(b));

  return `${dates[0]} – ${dates[dates.length - 1]}`;
};

/* ================= LOAD PDF ================= */
const loadPdf = async () => {
  if (!tripName) {
    alert('No trip specified');
    return;
  }

  const trips = await searchTrips(tripName);
  if (!trips.length) {
    alert('Trip not found');
    return;
  }

  const trip = trips[0];
  const version = trip.versions.find(v => v.isActive);

  if (!version) {
    alert('Active version not found');
    return;
  }

  // Header
  document.getElementById('tripTitle').textContent = trip.tripName;
  document.getElementById('destination').textContent = trip.tripName;
  document.getElementById('period').textContent =
     getTripPeriod(version);
  document.getElementById('totalBudget').textContent =
    `${version.summary?.totalMXN || 0} MXN`;

  renderItinerary(version);
};

/* ================= ITINERARY ================= */
const renderItinerary = (version) => {
  const container = document.getElementById('itinerary');
  container.innerHTML = '';

  const events = [];

  // TRANSPORTS (departure)
  version.transports.forEach(t => {
    if (t.departureDate && t.departureTime) {
      events.push({
        date: t.departureDate,
        time: t.departureTime,
        title: `Flight: ${t.from} → ${t.to}`
      });
    }
  });

  // ACTIVITIES
  version.activities.forEach(a => {
    if (a.startDate && a.startTime) {
      events.push({
        date: a.startDate,
        time: a.startTime,
        title: a.name
      });
    }
  });

  // MEALS
  version.meals.forEach(m => {
    if (m.startDate && m.startTime) {
      events.push({
        date: m.startDate,
        time: m.startTime,
        title: m.name
      });
    }
  });

  if (!events.length) {
    container.textContent = 'No itinerary items';
    return;
  }

  /* ===== GROUP BY DAY ===== */
  const days = {};
  events.forEach(e => {
    if (!days[e.date]) days[e.date] = [];
    days[e.date].push(e);
  });

  /* ===== SORT DAYS ===== */
  const sortedDates = Object.keys(days)
    .sort((a, b) => new Date(a) - new Date(b));

  /* ===== RENDER DAYS ===== */
  sortedDates.forEach((date, index) => {
    const items = days[date].sort(
      (a, b) => a.time.localeCompare(b.time)
    );

    const section = document.createElement('section');
    section.className = 'day';

    section.innerHTML = `
      <h2>Day ${index + 1} · ${date}</h2>

      <table class="day-table">
        <thead>
          <tr>
            <th class="time">Time</th>
            <th>Activity</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(i => `
            <tr>
              <td class="time">${i.time}</td>
              <td>
                <div class="activity">${i.title}</div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    container.appendChild(section);
  });
};

/* ================= INIT ================= */
loadPdf();
