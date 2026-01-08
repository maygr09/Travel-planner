import { searchTrips } from '../js/api.js';

/* ================= PARAMS ================= */
const params = new URLSearchParams(window.location.search);
const tripName = params.get('trip');

/* ===== STATE ===== */
let currentTrip = null;
let currentVersion = null;

/* ================= LOAD ================= */
const loadPdfData = async () => {
  if (!tripName) {
    document.body.innerHTML = '<p>No trip specified</p>';
    return;
  }

  const results = await searchTrips(tripName);

  if (!results.length) {
    document.body.innerHTML = '<p>Trip not found</p>';
    return;
  }

  currentTrip = results[0];
  currentVersion = currentTrip.versions.find(v => v.isActive);

  if (!currentVersion) {
    document.body.innerHTML = '<p>No active version</p>';
    return;
  }

  renderPdf();
};

console.log('PDF trip:', currentTrip);
console.log('PDF version:', currentVersion);

/* ================= RENDER ================= */
const renderPdf = () => {
  document.getElementById('tripTitle').textContent =
    currentTrip.tripName;

  document.getElementById('summaryTotal').textContent =
    `${currentVersion.summary.totalMXN || 0} MXN`;

  renderItinerary();
};

const renderItinerary = () => {
  const list = document.getElementById('itinerary');
  list.innerHTML = '';

  const items = [];

  currentVersion.transports.forEach(t => {
    items.push(`✈️ ${t.from} → ${t.to}`);
  });

  currentVersion.activities.forEach(a => {
    if (a.cost > 1) items.push(`🎟️ ${a.name}`);
  });
  
  currentVersion.meals.forEach(m => {
    if (m.cost > 1) items.push(`🍽️ ${m.name}`);
  });

  currentVersion.accommodations.forEach(a => {
    items.push(`🏨 ${a.name}`);
  });

  if (!items.length) {
    list.innerHTML = '<p>No items</p>';
    return;
  }

  items.forEach(text => {
    const p = document.createElement('p');
    p.textContent = text;
    list.appendChild(p);
  });
};

/* ================= INIT ================= */
loadPdfData();
