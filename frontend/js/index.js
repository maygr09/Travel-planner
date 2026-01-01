document.getElementById('searchBtn')
  .addEventListener('click', () => {
    const name = document.getElementById('searchTrip').value.trim();
    if (!name) return;

    window.location.href =
      `pages/trip.html?trip=${encodeURIComponent(name)}`;
  });

document.getElementById('createBtn')
  .addEventListener('click', () => {
    window.location.href = 'pages/createTrip.html';
  });
