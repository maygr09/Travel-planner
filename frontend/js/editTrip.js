import { updateTrip } from './api.js';

document.getElementById('updateBtn').addEventListener('click', async () => {
  const data = {
    tripName: document.getElementById('tripName').value,
    updates: {
      peopleCount: Number(document.getElementById('peopleCount').value)
    }
  };

  const result = await updateTrip(data);
  document.getElementById('result').textContent =
    JSON.stringify(result, null, 2);
});