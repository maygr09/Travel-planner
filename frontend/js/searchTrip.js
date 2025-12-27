import { searchTrips } from './api.js';

document.getElementById('searchBtn').addEventListener('click', async () => {
  const name = document.getElementById('searchInput').value;
  const results = await searchTrips(name);

  document.getElementById('results').textContent =
    JSON.stringify(results, null, 2);
});