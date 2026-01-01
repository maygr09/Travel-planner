import { createTrip, searchTrips } from './api.js';

/* ================= CREATE ================= */
document.getElementById('createTrip').addEventListener('click', async () => {
  const tripName = document.getElementById('newTripName').value.trim();
  const peopleCount = Number(document.getElementById('newTripPeople').value) || 1;

  if (!tripName) {
    alert('Trip name required');
    return;
  }

  await createTrip({
    tripName,
    peopleCount
  });

  window.location.href =
    `editTrip.html?trip=${encodeURIComponent(tripName)}`;
});

/* ================= SEARCH ================= */
document.getElementById('searchTrip').addEventListener('click', async () => {
  const term = document.getElementById('searchInput').value.trim();
  if (!term) return;

  const results = await searchTrips(term);
  renderResults(results, 'searchResults');
});

/* ================= LIST ================= */
const renderResults = (trips, containerId) => {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  if (!trips.length) {
    container.textContent = 'No trips found';
    return;
  }

  trips.forEach(trip => {
    const div = document.createElement('div');
    div.className = 'trip-row';

    div.innerHTML = `
      <strong>${trip.tripName}</strong>
      <div class="trip-actions">
        <button class="secondary">View</button>
        <button class="primary">Edit</button>
      </div>
    `;

    div.querySelector('.primary').onclick = () => {
      window.location.href =
        `editTrip.html?trip=${encodeURIComponent(trip.tripName)}`;
    };

    div.querySelector('.secondary').onclick = () => {
      window.location.href =
        `trip.html?trip=${encodeURIComponent(trip.tripName)}`;
    };

    container.appendChild(div);
  });
};
