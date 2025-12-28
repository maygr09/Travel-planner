import {
  searchTrips,
  updateTrip,
  createVersion,
  duplicateVersion,
  activateVersion
} from './api.js';

/* ================= STATE ================= */
let currentTrip = null;
let currentVersion = null;

/* ================= UTILS ================= */
const getTripNameFromURL = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('trip');
};

/* ================= LOAD TRIP ================= */
const loadTrip = async () => {
  const tripName = getTripNameFromURL();
  if (!tripName) {
    alert('No trip specified');
    return;
  }

  const results = await searchTrips(tripName);
  if (!results.length) {
    alert('Trip not found');
    return;
  }

  currentTrip = results[0];
  currentVersion = currentTrip.versions.find(v => v.isActive);

  renderHeader();
  renderVersions();
  renderBasicInfo();
  renderCurrencies();
  renderTransports();
  renderActivities();
  renderMeals();
  renderSummary();
};

/* ================= RENDER ================= */
const renderHeader = () => {
  document.getElementById('tripTitle').textContent =
    `Edit trip: ${currentTrip.tripName}`;
};

const renderVersions = () => {
  const select = document.getElementById('versionSelect');
  select.innerHTML = '';

  currentTrip.versions.forEach(v => {
    const option = document.createElement('option');
    option.value = v.id;
    option.textContent = v.name + (v.isActive ? ' (active)' : '');
    if (v.isActive) option.selected = true;
    select.appendChild(option);
  });

  currentVersion = currentTrip.versions.find(v => v.id === select.value);
};

const renderBasicInfo = () => {
  document.getElementById('peopleCount').value =
    currentTrip.peopleCount || 1;
};

const renderCurrencies = () => {
  const list = document.getElementById('currencyList');
  list.innerHTML = '';

  (currentTrip.currencies || []).forEach((c, index) => {
    const li = document.createElement('li');
    li.textContent = `${c.code} → ${c.exchangeToMXN} MXN`;

    const del = document.createElement('button');
    del.textContent = 'Delete';
    del.onclick = async () => {
      const updated = currentTrip.currencies.filter((_, i) => i !== index);

      currentTrip = await updateTrip({
        tripName: currentTrip.tripName,
        updates: { currencies: updated }
      });

      renderCurrencies();
      renderSummary();
    };

    li.appendChild(del);
    list.appendChild(li);
  });
};

document.getElementById('addCurrency').addEventListener('click', async () => {
  const code = document.getElementById('currencyCode').value.trim();
  const exchangeToMXN = Number(document.getElementById('exchangeRate').value);

  if (!code || !exchangeToMXN) return;

  const currencies = [
    ...(currentTrip.currencies || []),
    { code, exchangeToMXN }
  ];

  currentTrip = await updateTrip({
    tripName: currentTrip.tripName,
    updates: { currencies }
  });

  document.getElementById('currencyCode').value = '';
  document.getElementById('exchangeRate').value = '';

  renderCurrencies();
  renderSummary();
});

const renderTransports = () => {
  const list = document.getElementById('transportList');
  list.innerHTML = '';

  currentVersion.transports.forEach(t => {
    const div = document.createElement('div');

    div.innerHTML = `
      <strong>${t.type} ${t.flightNumber || ''}</strong><br/>
      ${t.from} → ${t.to}<br/>
      ${t.departureDate} ${t.departureTime}<br/>
      ${t.cost} ${t.currencyCode}
      <br/>
      <button class="edit">Edit</button>
      <button class="delete">Delete</button>
    `;

    // EDIT → otra página
    div.querySelector('.edit').onclick = () => {
      window.location.href =
        `editTransport.html?trip=${encodeURIComponent(currentTrip.tripName)}&version=${currentVersion.id}&item=${t.id}`;
    };

    // DELETE
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

document.getElementById('addTransport').addEventListener('click', () => {
  window.location.href =
    `editTransport.html?trip=${encodeURIComponent(currentTrip.tripName)}&version=${currentVersion.id}`;
});

const renderActivities = () => {
  const list = document.getElementById('activityList');
  list.innerHTML = '';

  currentVersion.activities.forEach(a => {
    const div = document.createElement('div');

    div.innerHTML = `
      <strong>${a.name}</strong><br/>
      ${a.cost} ${a.currencyCode}
      <br/>
      <button class="edit">Edit</button>
      <button class="delete">Delete</button>
    `;

    // EDIT
    div.querySelector('.edit').onclick = async () => {
      const name = prompt('Name', a.name);
      const cost = prompt('Cost', a.cost);
      const currencyCode = prompt('Currency', a.currencyCode);

      const version = await updateItem({
        tripName: currentTrip.tripName,
        versionId: currentVersion.id,
        itemType: 'activities',
        itemId: a.id,
        updates: {
          name,
          cost: Number(cost),
          currencyCode
        }
      });

      currentVersion = version;
      renderActivities();
      renderSummary();
    };

    // DELETE
    div.querySelector('.delete').onclick = async () => {
      if (!confirm('Delete activity?')) return;

      const version = await deleteItem({
        tripName: currentTrip.tripName,
        versionId: currentVersion.id,
        itemType: 'activities',
        itemId: a.id
      });

      currentVersion = version;
      renderActivities();
      renderSummary();
    };

    list.appendChild(div);
  });
};

document.getElementById('addActivity').addEventListener('click', async () => {
  const name = document.getElementById('activityName').value.trim();
  const cost = Number(document.getElementById('activityCost').value);
  const currencyCode = document.getElementById('activityCurrency').value.trim();

  if (!name || !cost || !currencyCode) return;

  const version = await addItem({
    tripName: currentTrip.tripName,
    versionId: currentVersion.id,
    itemType: 'activities',
    item: { name, cost, currencyCode }
  });

  currentVersion = version;

  document.getElementById('activityName').value = '';
  document.getElementById('activityCost').value = '';
  document.getElementById('activityCurrency').value = '';

  renderActivities();
  renderSummary();
});

const renderMeals = () => {
  const list = document.getElementById('mealList');
  list.innerHTML = '';

  currentVersion.meals.forEach(m => {
    const div = document.createElement('div');

    div.innerHTML = `
      <strong>${m.name}</strong><br/>
      ${m.cost} ${m.currencyCode}
      <br/>
      <button class="edit">Edit</button>
      <button class="delete">Delete</button>
    `;

    // EDIT
    div.querySelector('.edit').onclick = async () => {
      const name = prompt('Name', m.name);
      const cost = prompt('Cost', m.cost);
      const currencyCode = prompt('Currency', m.currencyCode);

      const version = await updateItem({
        tripName: currentTrip.tripName,
        versionId: currentVersion.id,
        itemType: 'meals',
        itemId: m.id,
        updates: {
          name,
          cost: Number(cost),
          currencyCode
        }
      });

      currentVersion = version;
      renderMeals();
      renderSummary();
    };

    // DELETE
    div.querySelector('.delete').onclick = async () => {
      if (!confirm('Delete meal?')) return;

      const version = await deleteItem({
        tripName: currentTrip.tripName,
        versionId: currentVersion.id,
        itemType: 'meals',
        itemId: m.id
      });

      currentVersion = version;
      renderMeals();
      renderSummary();
    };

    list.appendChild(div);
  });
};

document.getElementById('addMeal').addEventListener('click', async () => {
  const name = document.getElementById('mealName').value.trim();
  const cost = Number(document.getElementById('mealCost').value);
  const currencyCode = document.getElementById('mealCurrency').value.trim();

  if (!name || !cost || !currencyCode) return;

  const version = await addItem({
    tripName: currentTrip.tripName,
    versionId: currentVersion.id,
    itemType: 'meals',
    item: { name, cost, currencyCode }
  });

  currentVersion = version;

  document.getElementById('mealName').value = '';
  document.getElementById('mealCost').value = '';
  document.getElementById('mealCurrency').value = '';

  renderMeals();
  renderSummary();
});

document.getElementById('duplicateVersion').addEventListener('click', async () => {
  const name = prompt('New version name');
  if (!name) return;

  const newVersion = await duplicateVersion({
    tripName: currentTrip.tripName,
    versionId: currentVersion.id,
    newName: name
  });

  currentTrip.versions.push(newVersion);
  renderVersions();
});

const renderSummary = () => {
  document.getElementById('summary').textContent =
    JSON.stringify(currentVersion.summary, null, 2);
};

/* ================= EVENTS (BASE) ================= */

document.getElementById('versionSelect').addEventListener('change', (e) => {
  currentVersion = currentTrip.versions.find(v => v.id === e.target.value);
  renderSummary();
});

document.getElementById('saveBasic').addEventListener('click', async () => {
  const peopleCount = Number(document.getElementById('peopleCount').value);

  currentTrip = await updateTrip({
    tripName: currentTrip.tripName,
    updates: { peopleCount }
  });

  renderSummary();
});

document.getElementById('goToTrip').addEventListener('click', () => {
  window.location.href =
    `trip.html?trip=${encodeURIComponent(currentTrip.tripName)}`;
});

/* ================= INIT ================= */
loadTrip();