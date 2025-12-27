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

exports.getTripById = (req, res) => {
  const trips = readTrips();
  const trip = trips.find(t => t.id === req.params.id);

  if (!trip) {
    return res.status(404).json({ message: 'Trip not found' });
  }

  res.json(trip);
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

