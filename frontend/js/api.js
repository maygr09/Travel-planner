const API_URL = 'http://localhost:3001/api/trips';

export const createTrip = async (data) => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const searchTrips = async (name) => {
  const res = await fetch(`${API_URL}/search?name=${name}`);
  return res.json();
};

export const updateTrip = async (data) => {
  const res = await fetch(API_URL, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const deleteTrip = async (tripName) => {
  const res = await fetch(API_URL, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tripName })
  });
  return res.json();
};
