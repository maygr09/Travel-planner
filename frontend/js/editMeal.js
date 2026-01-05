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
    currentItem = currentVersion.meals.find(m => m.id === itemId);
    if (!currentItem) {
      alert('Meal not found');
      return;
    }

    fillForm(currentItem);
    document.getElementById('title').textContent = 'Edit meal';
  } else {
    document.getElementById('title').textContent = 'Add meal';
  }
};

/* ================= FILL ================= */
const fillForm = (m) => {
  document.getElementById('name').value = m.name || '';
  document.getElementById('startDate').value = m.startDate || '';
  document.getElementById('startTime').value = m.startTime || '';
  document.getElementById('endDate').value = m.endDate || '';
  document.getElementById('endTime').value = m.endTime || '';
  document.getElementById('confirmationCode').value = m.confirmationCode || '';
  document.getElementById('bookingUrl').value = m.bookingUrl || '';
  document.getElementById('cost').value = m.cost || '';
  document.getElementById('currencyCode').value = m.currencyCode || '';
};

/* ================= SAVE ================= */
const form = document.getElementById('editForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

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
      itemType: 'meals',
      itemId,
      updates: item
    });
  } else {
    await addItem({
      tripName,
      versionId,
      itemType: 'meals',
      item
    });
  }

  window.location.href =
    `editTrip.html?trip=${encodeURIComponent(tripName)}`;
});


/* ================= CANCEL ================= */
document.getElementById('cancelMeal').addEventListener('click', () => {
  window.location.href =
    `editTrip.html?trip=${encodeURIComponent(tripName)}`;
});

/* ================= INIT ================= */
load();