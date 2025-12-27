const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/trips.json');

const readTrips = () => {
  const data = fs.readFileSync(dataPath, 'utf-8');
  return JSON.parse(data);
};

const writeTrips = (trips) => {
  fs.writeFileSync(dataPath, JSON.stringify(trips, null, 2));
};

exports.getAllTrips = (req, res) => {
  res.json(readTrips());
};

exports.searchTripsByName = (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ error: 'Search term is required' });
  }

  const trips = readTrips();

  const results = trips.filter(trip =>
    trip.tripName.toLowerCase().includes(name.toLowerCase())
    );
  res.json(results);
};

exports.createTrip = (req, res) => {
  const trips = readTrips();

  const newTrip = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date()
  };

  trips.push(newTrip);
  writeTrips(trips);

  res.status(201).json(newTrip);
};

