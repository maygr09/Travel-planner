console.log('EDIT ACTIVITY JS LOADED');

import { searchTrips, updateItem } from './api.js';

/* ================= READ URL PARAMS ================= */
const params = new URLSearchParams(window.location.search);
const tripName = params.get('trip');
const versionId = params.get('version');
const itemId = params.get('item');

let activity = null;

/* ================= LOAD ACTIVITY ================= */
const loadActivity = async () => {
  const trips = await searchTrips(tripName);
  const trip = trips[0];
  const version = trip.versions.find(v => v.id === versionId);
  activity = version.activities.find(a => a.id === itemId);

  if (!activity) {
    alert('Activity not found');
    return;
  }

  // AUTOLLENADO
  document.getElementById('aName').value = activity.name || '';
  document.getElementById('aCost').value = activity.cost || '';
  document.getElementById('aCurrency').value = activity.currencyCode || '';
};

/* ================= INIT ================= */
document.addEventListener('DOMContentLoaded', () => {

  // LOAD
  loadActivity();

  // SAVE
  document.getElementById('saveActivity')
    .addEventListener('click', async () => {

      const updates = {
        name: document.getElementById('aName').value.trim(),
        cost: Number(document.getElementById('aCost').value),
        currencyCode: document.getElementById('aCurrency').value.trim()
      };

      await updateItem({
        tripName,
        versionId,
        itemType: 'activities',
        itemId,
        updates
      });

      // volver a editTrip
      window.location.href =
        `editTrip.html?trip=${encodeURIComponent(tripName)}`;
    });

  // CANCEL
  document.getElementById('cancelActivity')
    .addEventListener('click', () => {
      window.location.href =
        `editTrip.html?trip=${encodeURIComponent(tripName)}`;
    });
});
