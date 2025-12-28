const API_URL = 'http://localhost:3001/api/trips';

/* ================= HELPER ================= */
const request = async (url, options = {}) => {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'API error');
  }

  return res.json();
};

/* ================= TRIPS ================= */

export const searchTrips = (name) => {
  return request(
    `${API_URL}/search?name=${encodeURIComponent(name)}`
  );
};

export const createTrip = (data) => {
  return request(API_URL, {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

export const updateTrip = (data) => {
  return request(API_URL, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
};

export const deleteTrip = (tripName) => {
  return request(API_URL, {
    method: 'DELETE',
    body: JSON.stringify({ tripName })
  });
};

/* ================= ITEMS ================= */

export const addItem = (data) => {
  return request(`${API_URL}/item`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

export const updateItem = (data) => {
  return request(`${API_URL}/item`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
};

export const deleteItem = (data) => {
  return request(`${API_URL}/item`, {
    method: 'DELETE',
    body: JSON.stringify(data)
  });
};