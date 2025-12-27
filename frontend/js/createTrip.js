import { createTrip } from './api.js';

document.getElementById('tripForm').addEventListener('submit', async e => {
  e.preventDefault();

  const data = {
    tripName: document.getElementById('tripName').value,
    peopleCount: Number(document.getElementById('peopleCount').value),
    currencies: [],
    transports: [],
    activities: [],
    meals: []
  };

  const result = await createTrip(data);
  document.getElementById('result').textContent =
    JSON.stringify(result, null, 2);
});