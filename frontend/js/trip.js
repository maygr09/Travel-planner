import { searchTrips, updateItem, deleteItem } from './api.js';

let currentTrip = null;
let currentVersion = null;

/* ===== LOAD TRIP ===== */
const loadTrip = async () => {
  const name = prompt('Trip name');
  const results = await searchTrips(name);

  if (!results.length) {
    alert('Trip not found');
    return;
  }

  currentTrip = results[0];
  currentVersion = currentTrip.versions.find(v => v.isActive);

  document.getElementById('tripTitle').textContent = currentTrip.tripName;
  renderTransports();
  renderSummary();
};

/* ===== RENDER ===== */
const renderSummary = () => {
  document.getElementById('summary').textContent =
    JSON.stringify(currentVersion.summary, null, 2);
};

const renderTransports = () => {
  const list = document.getElementById('transportList');
  list.innerHTML = '';

  currentVersion.transports.forEach(t => {
    const div = document.createElement('div');
    div.innerHTML = `
      ✈️ ${t.cost} ${t.currencyCode}
      <button class="edit">Edit</button>
      <button class="delete">Delete</button>
    `;

    div.querySelector('.edit').onclick = async () => {
      const newCost = prompt('New cost', t.cost);
      if (!newCost) return;

      const version = await updateItem({
        tripName: currentTrip.tripName,
        versionId: currentVersion.id,
        itemType: 'transports',
        itemId: t.id,
        updates: { cost: Number(newCost) }
      });

      currentVersion = version;
      renderTransports();
      renderSummary();
    };

    div.querySelector('.delete').onclick = async () => {
      if (!confirm('Delete transport?')) return;

      const version = await deleteItem({
        tripName: currentTrip.tripName,
        versionId: currentVersion.id,
        itemType: 'transports',
        itemId: t.id
      });

      currentVersion = version;
      renderTransports();
      renderSummary();
    };

    list.appendChild(div);
  });
};

loadTrip();