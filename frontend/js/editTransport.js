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
    currentItem = currentVersion.transports.find(t => t.id === itemId);
    if (!currentItem) {
      alert('Transport not found');
      return;
    }

    fillForm(currentItem);
    document.getElementById('title').textContent = 'Edit transport';
  } else {
    document.getElementById('title').textContent = 'Add transport';
  }
};

/* ================= FILL FORM ================= */
const fillForm = (t) => {
  document.getElementById('type').value = t.type || '';
  document.getElementById('flightNumber').value = t.flightNumber || '';
  document.getElementById('from').value = t.from || '';
  document.getElementById('to').value = t.to || '';
  document.getElementById('departureDate').value = t.departureDate || '';
  document.getElementById('departureTime').value = t.departureTime || '';
  document.getElementById('arrivalDate').value = t.arrivalDate || '';
  document.getElementById('arrivalTime').value = t.arrivalTime || '';
  document.getElementById('confirmationCode').value = t.confirmationCode || '';
  document.getElementById('bookingUrl').value = t.bookingUrl || '';
  document.getElementById('cost').value = t.cost || '';
  document.getElementById('currencyCode').value = t.currencyCode || '';
};

/* ================= SAVE ================= */
document.getElementById('save').addEventListener('click', async () => {
  const item = {
    type: document.getElementById('type').value,
    flightNumber: document.getElementById('flightNumber').value,
    from: document.getElementById('from').value,
    to: document.getElementById('to').value,
    departureDate: document.getElementById('departureDate').value,
    departureTime: document.getElementById('departureTime').value,
    arrivalDate: document.getElementById('arrivalDate').value,
    arrivalTime: document.getElementById('arrivalTime').value,
    confirmationCode: document.getElementById('confirmationCode').value,
    bookingUrl: document.getElementById('bookingUrl').value,
    cost: Number(document.getElementById('cost').value),
    currencyCode: document.getElementById('currencyCode').value
  };

  if (itemId) {
    await updateItem({
      tripName,
      versionId,
      itemType: 'transports',
      itemId,
      updates: item
    });
  } else {
    await addItem({
      tripName,
      versionId,
      itemType: 'transports',
      item
    });
  }

  window.location.href =
    `editTrip.html?trip=${encodeURIComponent(tripName)}`;
});

/* ================= CANCEL ================= */
document.getElementById('cancel').addEventListener('click', () => {
  window.location.href =
    `editTrip.html?trip=${encodeURIComponent(tripName)}`;
});

/* ================= INIT ================= */
load();