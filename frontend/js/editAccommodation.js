console.log('EDIT ACCOMMODATION JS LOADED');

import { addItem, updateItem } from './api.js';

/* ================= INIT ================= */
document.addEventListener('DOMContentLoaded', () => {

  /* ================= PARAMS ================= */
  const params = new URLSearchParams(window.location.search);
  const tripName = params.get('trip');
  const versionId = params.get('version');
  const itemId = params.get('item'); // null = new

  /* ================= FIELDS ================= */
  const fields = {
    name: document.getElementById('accName'),
    city: document.getElementById('accCity'),
    checkInDate: document.getElementById('accCheckInDate'),
    checkInTime: document.getElementById('accCheckInTime'),
    checkOutDate: document.getElementById('accCheckOutDate'),
    checkOutTime: document.getElementById('accCheckOutTime'),
    cost: document.getElementById('accCost'),
    currency: document.getElementById('accCurrency'),
    bookingCode: document.getElementById('accBookingCode'),
    bookingUrl: document.getElementById('accBookingUrl')
  };

  const form = document.getElementById('editForm');
  const cancelBtn = document.getElementById('cancelAccommodation');

  /* ================= LOAD (EDIT MODE) ================= */
  if (itemId) {
    const item = JSON.parse(
      sessionStorage.getItem('editingAccommodation')
    );

    if (item) {
      fields.name.value = item.name || '';
      fields.city.value = item.city || '';
      fields.checkInDate.value = item.checkInDate || '';
      fields.checkInTime.value = item.checkInTime || '';
      fields.checkOutDate.value = item.checkOutDate || '';
      fields.checkOutTime.value = item.checkOutTime || '';
      fields.cost.value = item.cost || '';
      fields.currency.value = item.currencyCode || '';
      fields.bookingCode.value = item.bookingCode || '';
      fields.bookingUrl.value = item.bookingUrl || '';
    }
  }

  /* ================= SAVE ================= */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const item = {
      name: fields.name.value.trim(),
      city: fields.city.value.trim(),
      checkInDate: fields.checkInDate.value,
      checkInTime: fields.checkInTime.value,
      checkOutDate: fields.checkOutDate.value,
      checkOutTime: fields.checkOutTime.value,
      cost: Number(fields.cost.value),
      currencyCode: fields.currency.value.trim(),
      bookingCode: fields.bookingCode.value.trim(),
      bookingUrl: fields.bookingUrl.value.trim()
    };

    if (itemId) {
      await updateItem({
        tripName,
        versionId,
        itemType: 'accommodations',
        itemId,
        updates: item
      });
    } else {
      await addItem({
        tripName,
        versionId,
        itemType: 'accommodations',
        item
      });
    }

    window.location.href =
      `editTrip.html?trip=${encodeURIComponent(tripName)}`;
  });

  /* ================= CANCEL ================= */
  cancelBtn.addEventListener('click', () => {
    window.location.href =
      `editTrip.html?trip=${encodeURIComponent(tripName)}`;
  });

});
