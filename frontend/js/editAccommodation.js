console.log('EDIT ACCOMMODATION JS LOADED');
import { updateItem } from './api.js';

/* ================= HELPERS ================= */

const params = new URLSearchParams(window.location.search);

const tripName = params.get('trip');
const versionId = params.get('version');
const itemId = params.get('item'); // null = new accommodation

/* ================= FORM ================= */

const form = document.getElementById('accommodationForm');

const fields = {
  name: document.getElementById('accName'),
  city: document.getElementById('accCity'),
  checkInDate: document.getElementById('accCheckIn'),
  checkOutDate: document.getElementById('accCheckOut'),
  cost: document.getElementById('accCost'),
  currencyCode: document.getElementById('accCurrency'),
  bookingCode: document.getElementById('accBookingCode'),
  bookingUrl: document.getElementById('accBookingUrl')
};


/* ================= LOAD (EDIT MODE) ================= */

if (itemId) {
  // El objeto se pasa desde editTrip vía sessionStorage
  const item = JSON.parse(sessionStorage.getItem('editingAccommodation'));

  if (item) {
    fields.name.value = item.name || '';
    fields.city.value = item.city || '';
    fields.checkInDate.value = item.checkInDate || '';
    fields.checkOutDate.value = item.checkOutDate || '';
    fields.cost.value = item.cost || '';
    fields.currencyCode.value = item.currencyCode || '';
    fields.bookingCode.value = item.bookingCode || '';
    fields.bookingUrl.value = item.bookingUrl || '';
  }
}

/* ================= SAVE ================= */

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    name: fields.name.value,
    city: fields.city.value,
    checkInDate: fields.checkInDate.value,
    checkOutDate: fields.checkOutDate.value,
    cost: Number(fields.cost.value),
    currencyCode: fields.currencyCode.value,
    bookingCode: fields.bookingCode.value,
    bookingUrl: fields.bookingUrl.value
  };
  
    await updateItem({
      tripName,
      versionId,
      itemType: 'accommodations',
      itemId,
      updates: payload
    });
  

  window.location.href = `editTrip.html?trip=${tripName}`;
});

/* ================= CANCEL ================= */

document.getElementById('cancel').onclick = () => {
  window.history.back();
};