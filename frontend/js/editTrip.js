import {
  searchTrips,
  updateTrip,
  addItem,
  deleteItem,
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
  renderAccommodations();
  renderSummary();
  renderVersionComparison();
};

/* ================= RENDER HEADER ================= */
const renderHeader = () => {
  document.getElementById('tripTitle').textContent =
    `Edit trip: ${currentTrip.tripName}`;
};

/* ================= VERSIONS ================= */
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

document.getElementById('versionSelect').addEventListener('change', (e) => {
  currentVersion = currentTrip.versions.find(v => v.id === e.target.value);
  renderSummary();
  renderTransports();
  renderActivities();
  renderMeals();
  renderAccommodations();
});

/* ================= BASIC INFO ================= */
const renderBasicInfo = () => {
  document.getElementById('peopleCount').value =
    currentTrip.peopleCount || 1;
};

document.getElementById('saveBasic').addEventListener('click', async () => {
  const peopleCount = Number(document.getElementById('peopleCount').value);

  currentTrip = await updateTrip({
    tripName: currentTrip.tripName,
    updates: { peopleCount }
  });

  currentVersion = currentTrip.versions.find(v => v.isActive);

  renderBasicInfo();
  renderSummary();
  renderVersionComparison();
});


/* ================= CURRENCIES ================= */
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

/* ================= TRANSPORTS ================= */
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

   div.querySelector('.edit').addEventListener('click', () => {
  sessionStorage.setItem(
    'editingTransport',
    JSON.stringify(t)
  );

  window.location.href =
    `editTransport.html?trip=${currentTrip.tripName}&version=${currentVersion.id}&item=${t.id}`;
});


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

document.getElementById('addTransport')
  ?.addEventListener('click', async () => {

    const type = document.getElementById('tType').value.trim();
    const flightNumber = document.getElementById('tFlightNumber').value.trim();
    const from = document.getElementById('tFrom').value.trim();
    const to = document.getElementById('tTo').value.trim();
    const departureDate = document.getElementById('tDepartureDate').value;
    const departureTime = document.getElementById('tDepartureTime').value;
    const arrivalDate = document.getElementById('tArrivalDate').value;
    const arrivalTime = document.getElementById('tArrivalTime').value;
    const confirmationCode = document.getElementById('tConfirmationCode').value.trim();
    const bookingUrl = document.getElementById('tBookingUrl').value.trim();
    const cost = Number(document.getElementById('tCost').value);
    const currencyCode = document.getElementById('tCurrency').value.trim();

    if (!type || !from || !to || !departureDate || !departureTime || !arrivalDate || !arrivalTime) {
      alert('Missing required fields');
      return;
    }

    const version = await addItem({
      tripName: currentTrip.tripName,
      versionId: currentVersion.id,
      itemType: 'transports',
      item: {
        type,
        flightNumber,
        from,
        to,
        departureDate,
        departureTime,
        arrivalDate,
        arrivalTime,
        confirmationCode,
        bookingUrl,
        cost,
        currencyCode
      }
    });

    currentVersion = version;

    // limpiar form
    [
      'tType','tFlightNumber','tFrom','tTo',
      'tDepartureDate','tDepartureTime',
      'tArrivalDate','tArrivalTime',
      'tConfirmationCode','tBookingUrl',
      'tCost','tCurrency'
    ].forEach(id => document.getElementById(id).value = '');

    renderTransports();
    renderSummary();
  });


/* ================= ACTIVITIES ================= */
const renderActivities = () => {
  const list = document.getElementById('activityList');
  list.innerHTML = '';

  currentVersion.activities.forEach(a => {
    const div = document.createElement('div');

    div.innerHTML = `
      <strong>${a.name}</strong><br/>
      ${a.startDate} ${a.startTime} - ${a.endDate} ${a.endTime}<br/>
      ${a.cost} ${a.currencyCode}
      <br/>
      <button class="edit">Edit</button>
      <button class="delete">Delete</button>
    `;

   div.querySelector('.edit').onclick = async () => {
  sessionStorage.setItem(
    'editingActivity',
    JSON.stringify(a)
  );

  window.location.href =
    `editActivity.html?trip=${currentTrip.tripName}&version=${currentVersion.id}&item=${a.id}`;
};

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

document.getElementById('addActivity')
  .addEventListener('click', async () => {

    const name = document.getElementById('activityName').value.trim();
    const startDate = document.getElementById('activityStartDate').value.trim();
    const startTime = document.getElementById('activityStartTime').value.trim();
    const endDate = document.getElementById('activityEndDate').value.trim();
    const endTime = document.getElementById('activityEndTime').value.trim();
    const confirmationCode = document.getElementById('activityConfirmationCode').value.trim();
    const cost = Number(document.getElementById('activityCost').value);
    const currencyCode = document.getElementById('activityCurrency').value.trim();

    if (!name || !startDate || !startTime || !endDate || !endTime) {
      alert('Missing required fields');
      return;
    }

    const version = await addItem({
      tripName: currentTrip.tripName,
      versionId: currentVersion.id,
      itemType: 'activities',
      item: {
        name,
        startDate,
        startTime,
        endDate,
        endTime,
        confirmationCode,
        cost,
        currencyCode
      }
    });

    currentVersion = version;

    document.getElementById('activityName').value = '';
    document.getElementById('activityStartDate').value = '';
    document.getElementById('activityStartTime').value = '';
    document.getElementById('activityEndDate').value = '';
    document.getElementById('activityEndTime').value = '';
    document.getElementById('activityConfirmationCode').value = '';
    document.getElementById('activityCost').value = '';
    document.getElementById('activityCurrency').value = '';

    renderActivities();
    renderSummary();
  });


/* ================= MEALS ================= */
const renderMeals = () => {
  const list = document.getElementById('mealList');
  list.innerHTML = '';

  currentVersion.meals.forEach(m => {
    const div = document.createElement('div');

    div.innerHTML = `
      <strong>${m.name}</strong><br/>
      ${m.startDate} ${m.startTime} - ${m.endDate} ${m.endTime}<br/>
      ${m.cost} ${m.currencyCode}
      <br/>
      <button class="edit">Edit</button>
      <button class="delete">Delete</button>
    `;

   div.querySelector('.edit').addEventListener('click', () => {
  sessionStorage.setItem(
    'editingMeal',
    JSON.stringify(m)
  );

  window.location.href =
    `editMeal.html?trip=${currentTrip.tripName}&version=${currentVersion.id}&item=${m.id}`;
});


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

document.getElementById('addMeal')
  .addEventListener('click', async () => {

    const name = document.getElementById('mealName').value.trim();
    const startDate = document.getElementById('mealStartDate').value.trim();
    const startTime = document.getElementById('mealStartTime').value.trim();
    const endDate = document.getElementById('mealEndDate').value.trim();
    const endTime = document.getElementById('mealEndTime').value.trim();
    const confirmationCode = document.getElementById('mealConfirmationCode').value.trim();
    const bookingUrl = document.getElementById('mealBookingUrl').value.trim();
    const cost = Number(document.getElementById('mealCost').value);
    const currencyCode = document.getElementById('mealCurrency').value.trim();

    if (!name || !startDate || !startTime || !endDate || !endTime) {
      alert('Missing required fields');
      return;
    }

    const version = await addItem({
      tripName: currentTrip.tripName,
      versionId: currentVersion.id,
      itemType: 'meals',
      item: {
        name,
        startDate,
        startTime,
        endDate,
        endTime,
        confirmationCode,
        bookingUrl,
        cost,
        currencyCode
      }
    });

    currentVersion = version;

    document.getElementById('mealName').value = '';
    document.getElementById('mealStartDate').value = '';
    document.getElementById('mealStartTime').value = '';
    document.getElementById('mealEndDate').value = '';
    document.getElementById('mealEndTime').value = '';
    document.getElementById('mealConfirmationCode').value = '';
    document.getElementById('mealBookingUrl').value = '';
    document.getElementById('mealCost').value = '';
    document.getElementById('mealCurrency').value = '';

    renderMeals();
    renderSummary();
  });


/* ================= ACCOMMODATIONS ================= */
const renderAccommodations = () => {
  const list = document.getElementById('accommodationList');
  list.innerHTML = '';

  if (!currentVersion.accommodations.length) {
    list.innerHTML = '<p>No accommodations yet</p>';
    return;
  }

  currentVersion.accommodations.forEach(a => {
    const div = document.createElement('div');

    div.innerHTML = `
      <strong>${a.name}</strong> (${a.city || ''})<br/>
      ${a.checkInDate} ${a.checkInTime} → ${a.checkOutDate} ${a.checkOutTime}<br/>
      ${a.cost} ${a.currencyCode}<br/>
      ${a.bookingCode ? `Code: ${a.bookingCode}<br/>` : ''}
      ${a.bookingUrl ? `<a href="${a.bookingUrl}" target="_blank">Booking</a><br/>` : ''}
      <button class="edit">Edit</button>
      <button class="delete">Delete</button>
    `;

    div.querySelector('.edit').addEventListener('click', () => {
  sessionStorage.setItem(
    'editingAccommodation',
    JSON.stringify(a)
  );

  window.location.href =
    `editAccommodation.html?trip=${currentTrip.tripName}&version=${currentVersion.id}&item=${a.id}`;
});


    div.querySelector('.delete').onclick = async () => {
      if (!confirm('Delete accommodation?')) return;

      const version = await deleteItem({
        tripName: currentTrip.tripName,
        versionId: currentVersion.id,
        itemType: 'accommodations',
        itemId: a.id
      });

      currentVersion = version;
      renderAccommodations();
      renderSummary();
    };

    list.appendChild(div);
  });
};

document.getElementById('addAccommodation')
  .addEventListener('click', async () => {

    const name = document.getElementById('accName').value.trim();
    const city = document.getElementById('accCity').value.trim();
    const checkInDate = document.getElementById('accCheckIn').value;
    const checkInTime = document.getElementById('accCheckInTime').value;
    const checkOutDate = document.getElementById('accCheckOut').value;
    const checkOutTime = document.getElementById('accCheckOutTime').value;
    const cost = Number(document.getElementById('accCost').value);
    const currencyCode = document.getElementById('accCurrency').value.trim();
    const bookingCode = document.getElementById('accBookingCode').value.trim();
    const bookingUrl = document.getElementById('accBookingUrl').value.trim();

    if (!name || !checkInDate || !checkInTime || !checkOutDate || !checkOutTime || !cost || !currencyCode) {
      alert('Missing required fields');
      return;
    }

    const version = await addItem({
      tripName: currentTrip.tripName,
      versionId: currentVersion.id,
      itemType: 'accommodations',
      item: {
        name,
        city,
        checkInDate,
        checkInTime,
        checkOutDate,
        checkOutTime,
        cost,
        currencyCode,
        bookingCode,
        bookingUrl
      }
    });

    currentVersion = version;

    document.getElementById('accName').value = '';
    document.getElementById('accCity').value = '';
    document.getElementById('accCheckIn').value = '';
    document.getElementById('accCheckInTime').value = '';
    document.getElementById('accCheckOut').value = '';
    document.getElementById('accCheckOutTime').value = '';
    document.getElementById('accCost').value = '';
    document.getElementById('accCurrency').value = '';
    document.getElementById('accBookingCode').value = '';
    document.getElementById('accBookingUrl').value = '';

    renderAccommodations();
    renderSummary();
  });


/* ================= SUMMARY ================= */
const renderSummary = () => {
  document.getElementById('summary').textContent =
    JSON.stringify(currentVersion.summary, null, 2);
};

/* ================= VERSION COMPARISON ================= */
const renderVersionComparison = () => {
  const container = document.getElementById('versionsCompare');
  container.innerHTML = '';

  currentTrip.versions.forEach(v => {
    const div = document.createElement('div');
    div.style.border = '1px solid #ccc';
    div.style.padding = '10px';
    div.style.marginBottom = '10px';

    const summary = v.summary || {};

    div.innerHTML = `
      <h3>${v.name} ${v.isActive ? '(Active)' : ''}</h3>
      <p>Total MXN: ${summary.totalMXN || 0}</p>
      <p>Per person: ${summary.perPersonMXN || 0}</p>
      ${
        v.isActive
          ? '<strong>Active version</strong>'
          : '<button class="activate">Activate</button>'
      }
    `;

    if (!v.isActive) {
      div.querySelector('.activate').onclick = async () => {
        await activateVersion({
          tripName: currentTrip.tripName,
          versionId: v.id
        });

        currentTrip.versions.forEach(ver =>
          (ver.isActive = ver.id === v.id)
        );

        currentVersion = v;
        loadTrip();
      };
    }

    container.appendChild(div);
  });
};

/* ================= DUPLICATE VERSION ================= */
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
  renderVersionComparison();
});

/* ================= NAV ================= */
document.getElementById('goToTrip').addEventListener('click', () => {
  window.location.href =
    `trip.html?trip=${encodeURIComponent(currentTrip.tripName)}`;
});

/* ================= INIT ================= */
loadTrip();