import { searchTrips } from './api.js';

const input = document.getElementById('searchInput');
const resultsEl = document.getElementById('results');

document.getElementById('searchBtn').addEventListener('click', async () => {
  const name = input.value.trim();
  if (!name) return;

  const results = await searchTrips(name);
  resultsEl.innerHTML = '';

  if (!results.length) {
    resultsEl.innerHTML = '<li>No trips found</li>';
    return;
  }

  results.forEach(trip => {
    const li = document.createElement('li');
    li.textContent = trip.tripName;

    li.style.cursor = 'pointer';
    li.onclick = () => {
      window.location.href =
        `trip.html?trip=${encodeURIComponent(trip.tripName)}`;
    };

    resultsEl.appendChild(li);
  });
});