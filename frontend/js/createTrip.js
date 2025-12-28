import { createTrip } from './api.js';

document.getElementById('createBtn').addEventListener('click', async () => {
  const tripName = document.getElementById('tripName').value.trim();
  const peopleCount = Number(document.getElementById('peopleCount').value) || 1;

  if (!tripName) {
    alert('Trip name is required');
    return;
  }

  await createTrip({
    tripName,
    peopleCount
  });

  // después de crear → editar
  window.location.href =
    `edit-trip.html?trip=${encodeURIComponent(tripName)}`;
});