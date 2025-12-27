const fs = require('fs');
const path = require('path');
const { calculateVersionSummary } = require('../utils/calculations');

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

  const baseVersion = {
    id: 'v1',
    name: 'Base version',
    isActive: true,
    transports: [],
    activities: [],
    meals: [],
    summary: {}
  };

  const newTrip = {
    id: Date.now().toString(),
    createdAt: new Date(),
    ...req.body,
    versions: [baseVersion]
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

exports.createVersion = (req, res) => {
  const trips = readTrips();
  const { tripName, name } = req.body;

  const trip = trips.find(t =>
    t.tripName.toLowerCase() === tripName.toLowerCase()
  );

  if (!trip) {
    return res.status(404).json({ error: 'Trip not found' });
  }

  const newVersion = {
    id: `v${trip.versions.length + 1}`,
    name: name || `Version ${trip.versions.length + 1}`,
    isActive: false,
    transports: [],
    activities: [],
    meals: [],
    summary: {}
  };

  trip.versions.push(newVersion);
  writeTrips(trips);

  res.status(201).json(newVersion);
};

exports.duplicateVersion = (req, res) => {
  const trips = readTrips();
  const { tripName, versionId, newName } = req.body;

  const trip = trips.find(t =>
    t.tripName.toLowerCase() === tripName.toLowerCase()
  );

  if (!trip) {
    return res.status(404).json({ error: 'Trip not found' });
  }

  const version = trip.versions.find(v => v.id === versionId);
  if (!version) {
    return res.status(404).json({ error: 'Version not found' });
  }

  const duplicated = {
    ...JSON.parse(JSON.stringify(version)),
    id: `v${trip.versions.length + 1}`,
    name: newName || `${version.name} copy`,
    isActive: false
  };

  duplicated.summary = calculateVersionSummary(duplicated, trip);

  trip.versions.push(duplicated);
  writeTrips(trips);

  res.json(duplicated);
};

exports.activateVersion = (req, res) => {
  const trips = readTrips();
  const { tripName, versionId } = req.body;

  const trip = trips.find(t =>
    t.tripName.toLowerCase() === tripName.toLowerCase()
  );

  if (!trip) {
    return res.status(404).json({ error: 'Trip not found' });
  }

  trip.versions.forEach(v => {
    v.isActive = v.id === versionId;
  });

  writeTrips(trips);
  res.json({ message: 'Version activated' });
};

exports.updateItem = (req, res) => {
  const trips = readTrips();
  const { tripName, versionId, itemType, itemId, updates } = req.body;

  if (!tripName || !versionId || !itemType || !itemId || !updates) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const trip = trips.find(t =>
    t.tripName.toLowerCase() === tripName.toLowerCase()
  );
  if (!trip) return res.status(404).json({ error: 'Trip not found' });

  const version = trip.versions.find(v => v.id === versionId);
  if (!version) return res.status(404).json({ error: 'Version not found' });

  const items = version[itemType];
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Invalid item type' });
  }

  const index = items.findIndex(i => i.id === itemId);
  if (index === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }

  items[index] = {
    ...items[index],
    ...updates
  };

  version.summary = calculateVersionSummary(version, trip);
  writeTrips(trips);

  res.json(version);
};

exports.deleteItem = (req, res) => {
  const trips = readTrips();
  const { tripName, versionId, itemType, itemId } = req.body;

  if (!tripName || !versionId || !itemType || !itemId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const trip = trips.find(t =>
    t.tripName.toLowerCase() === tripName.toLowerCase()
  );
  if (!trip) return res.status(404).json({ error: 'Trip not found' });

  const version = trip.versions.find(v => v.id === versionId);
  if (!version) return res.status(404).json({ error: 'Version not found' });

  const items = version[itemType];
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Invalid item type' });
  }

  const filtered = items.filter(i => i.id !== itemId);
  if (filtered.length === items.length) {
    return res.status(404).json({ error: 'Item not found' });
  }

  version[itemType] = filtered;
  version.summary = calculateVersionSummary(version, trip);

  writeTrips(trips);
  res.json(version);
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