const fs = require('fs');
const path = require('path');
const { calculateSummary } = require('../utils/calculations');

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

  const baseTrip = {
    id: Date.now().toString(),
    createdAt: new Date(),
    ...req.body
  };

  const summary = calculateSummary(baseTrip);
  
  const newTrip = {
    ...baseTrip,
    summary
  };

  trips.push(newTrip);
  writeTrips(trips);

  res.status(201).json(newTrip);
};

exports.updateTrip = (req, res) => {
  const trips = readTrips();
  const { tripName, updates } = req.body;

  if (!tripName || !updates) {
    return res.status(400).json({
      error: 'tripName and updates are required'
    });
  }

  const index = trips.findIndex(trip =>
    trip.tripName.toLowerCase() === tripName.toLowerCase()
  );

  if (index === -1) {
    return res.status(404).json({ error: 'Trip not found' });
  }

  const updatedTrip = {
    ...trips[index],
    ...updates,
    updatedAt: new Date()
  };

  updatedTrip.summary = calculateSummary(updatedTrip);

  trips[index] = updatedTrip;
  writeTrips(trips);

  res.json(updatedTrip);
};

exports.recalculateTrip = (req, res) => {
  const trips = readTrips();
  const { tripName } = req.body;

  if (!tripName) {
    return res.status(400).json({ error: 'tripName is required' });
  }

  const index = trips.findIndex(trip =>
    trip.tripName.toLowerCase() === tripName.toLowerCase()
  );

  if (!tripName) {
    return res.status(400).json({ error: 'tripName is required' });
  }

  const trip = trips.find(t =>
    t.tripName.toLowerCase() === tripName.toLowerCase()
  );

  if (!trip) {
    return res.status(404).json({ error: 'Trip not found' });
  }

  trip.summary = calculateSummary(trip);
  writeTrips(trips);

  res.json(trip.summary);
};

exports.deleteTrip = (req, res) => {
  const trips = readTrips();
  const { tripName } = req.body;

    if (!tripName) {
        return res.status(400).json({ error: 'tripName is required' });
    }

  const filteredTrips = trips.filter(trip =>
    trip.tripName.toLowerCase() === tripName.toLowerCase()
  );

  if (filteredTrips.length === trips.length) {  
    return res.status(404).json({ error: 'Trip not found' });
  }

   writeTrips(filteredTrips);

  res.json ({ message: 'Trip deleted successfully' });
};