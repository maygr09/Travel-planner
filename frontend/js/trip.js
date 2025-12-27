import { updateTrip, searchTrips, recalculateTrip } from './api.js';

let currentTrip = null;

// Buscar viaje por nombre
const loadTrip = async () => {
  const name = prompt('Trip name');
  const results = await searchTrips(name);
  currentTrip = results[0];

  document.getElementById('tripTitle').textContent = currentTrip.tripName;
  document.getElementById('summary').textContent =
    JSON.stringify(currentTrip.summary, null, 2);
};

await loadTrip();

// BASIC INFO
document.getElementById('saveBasic').onclick = async () => {
  const updates = {
    peopleCount: Number(document.getElementById('peopleCount').value)
  };

  currentTrip = await updateTrip({
    tripName: currentTrip.tripName,
    updates
  });

  document.getElementById('summary').textContent =
    JSON.stringify(currentTrip.summary, null, 2);
};

// CURRENCIES
document.getElementById('addCurrency').onclick = async () => {
  const currency = {
    code: document.getElementById('currencyCode').value,
    exchangeToMXN: Number(document.getElementById('exchangeRate').value)
  };

  const currencies = [...(currentTrip.currencies || []), currency];

  currentTrip = await updateTrip({
    tripName: currentTrip.tripName,
    updates: { currencies }
  });

  document.getElementById('currencyList').textContent =
    JSON.stringify(currencies, null, 2);

  document.getElementById('summary').textContent =
    JSON.stringify(currentTrip.summary, null, 2);
};

// TRANSPORT
document.getElementById('addTransport').onclick = async () => {
  const transport = {
    cost: Number(document.getElementById('transportCost').value),
    currencyCode: document.getElementById('transportCurrency').value
  };

  const transports = [...(currentTrip.transports || []), transport];

  currentTrip = await updateTrip({
    tripName: currentTrip.tripName,
    updates: { transports }
  });

  document.getElementById('summary').textContent =
    JSON.stringify(currentTrip.summary, null, 2);
};

// ACTIVITIES
document.getElementById('addActivity').onclick = async () => {
  const activity = {
    name: document.getElementById('activityName').value,
    cost: Number(document.getElementById('activityCost').value),
    currencyCode: document.getElementById('activityCurrency').value
  };

  const activities = [...(currentTrip.activities || []), activity];

  currentTrip = await updateTrip({
    tripName: currentTrip.tripName,
    updates: { activities }
  });

  document.getElementById('summary').textContent =
    JSON.stringify(currentTrip.summary, null, 2);
};