import {
  searchTrips,
  addItem,
  updateItem
} from './api.js';

/* ================= STATE ================= */
let currentTrip = null;
let currentVersion = null;
let currentItem = null;

/* ================= PARAMS ================= */
const params = new URLSearchParams(window.location.search);
const tripName = params.get('trip');
const versionId = params.get('version');
const itemId = params.get('item');

/* ================= LOAD ================= */
const load = async () => {
  const results = await searchTrips(tripName);
  if (!results.length) {
    alert('Trip not found');
    return;
  }

  currentTrip = results[0];
  currentVersion = currentTrip.versions.find(v => v.id === versionId);

  if (!currentVersion) {
    alert('Version not found');
    return;
  }

  if (itemId) {
    currentItem = currentVersion.activities.find(a => a.id === itemId);
    if (!currentItem) {
      alert('Activity not found');
      return;
    }

    fillForm(currentItem);
    document.getElementById('title').textContent = 'Edit activity';
  } else {
    document.getElementById('title').textContent = 'Add activity';
  }
};

/* ================= FILL ================= */
const fillForm = (a) => {
  document.getElementById('name').value = a.name || '';
  document.getElementById('startDate').value = a.startDate || '';
  document.getElementById('startTime').value = a.startTime || '';
  document.getElementById('endDate').value = a.endDate || '';
  document.getElementById('endTime').value = a.endTime || '';
  document.getElementById('confirmationCode').value = a.confirmationCode || '';
  document.getElementById('bookingUrl').value = a.bookingUrl || '';
  document.getElementById('cost').value = a.cost || '';
  document.getElementById('currencyCode').value = a.currencyCode || '';
};

/* ================= SAVE ================= */
document.getElementById('save').addEventListener('click', async () => {
  const item = {
    name: document.getElementById('name').value,
    startDate: document.getElementById('startDate').value,
    startTime: document.getElementById('startTime').value,
    endDate: document.getElementById('endDate').value,
    endTime: document.getElementById('endTime').value,
    confirmationCode: document.getElementById('confirmationCode').value,
    bookingUrl: document.getElementById('bookingUrl').value,
    cost: Number(document.getElementById('cost').value),
    currencyCode: document.getElementById('currencyCode').value
  };

  if (itemId) {
    await updateItem({
      tripName,
      versionId,
      itemType: 'activities',
      itemId,
      updates: item
    });
  } else {
    await addItem({
      tripName,
      versionId,
      itemType: 'activities',
      item
    });
  }

  window.location.href =
    `edit-trip.html?trip=${encodeURIComponent(tripName)}`;
});

/* ================= CANCEL ================= */
document.getElementById('cancel').addEventListener('click', () => {
  window.location.href =
    `edit-trip.html?trip=${encodeURIComponent(tripName)}`;
});

/* ================= INIT ================= */
load();