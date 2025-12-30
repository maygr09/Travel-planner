const fs = require('fs');
const path = require('path');
const { calculateVersionSummary } = require('../utils/calculations');

const dataPath = path.join(__dirname, '../data/trips.json');

/* ================= HELPERS ================= */

const readTrips = () => {
  const data = fs.readFileSync(dataPath, 'utf-8');
  return JSON.parse(data);
};

const writeTrips = (trips) => {
  fs.writeFileSync(dataPath, JSON.stringify(trips, null, 2));
};

/* ================= TRIPS ================= */

exports.getAllTrips = (req, res) => {
  res.json(readTrips());
};

exports.searchTripsByName = (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ error: 'Search term is required' });
  }

  const trips = readTrips().filter(trip =>
    trip.tripName.toLowerCase().includes(name.toLowerCase())
  );

  res.json(trips);
};

exports.createTrip = (req, res) => {
  const trips = readTrips();

  const newTrip = {
    id: Date.now().toString(),
    createdAt: new Date(),
    tripName: req.body.tripName,
    peopleCount: req.body.peopleCount || 1,
    currencies: req.body.currencies || [],
    versions: [
      {
        id: 'v1',
        name: 'Base version',
        isActive: true,
        transports: [],
        activities: [],
        meals: [],
        accommodations: [], // ✅ CLAVE
        summary: {}
      }
    ]
  };

  trips.push(newTrip);
  writeTrips(trips);

  res.status(201).json(newTrip);
};

exports.updateTrip = (req, res) => {
  const { tripName, updates } = req.body;

  if (!tripName || !updates) {
    return res.status(400).json({ error: 'tripName and updates are required' });
  }

  const trips = readTrips();
  const trip = trips.find(
    t => t.tripName.toLowerCase() === tripName.toLowerCase()
  );

  if (!trip) {
    return res.status(404).json({ error: 'Trip not found' });
  }

  Object.assign(trip, updates);
  trip.updatedAt = new Date();

  const activeVersion = trip.versions.find(v => v.isActive);
  if (activeVersion) {
    activeVersion.summary = calculateVersionSummary(activeVersion, trip);
  }

  writeTrips(trips);
  res.json(trip);
};

exports.deleteTrip = (req, res) => {
  const { tripName } = req.body;

  if (!tripName) {
    return res.status(400).json({ error: 'tripName is required' });
  }

  const trips = readTrips();
  const filteredTrips = trips.filter(
    trip => trip.tripName.toLowerCase() !== tripName.toLowerCase()
  );

  if (filteredTrips.length === trips.length) {
    return res.status(404).json({ error: 'Trip not found' });
  }

  writeTrips(filteredTrips);
  res.json({ message: 'Trip deleted successfully' });
};

/* ================= VERSIONS ================= */

exports.duplicateVersion = (req, res) => {
  const { tripName, versionId, newName } = req.body;
  const trips = readTrips();

  const trip = trips.find(t => t.tripName === tripName);
  if (!trip) {
    return res.status(404).json({ error: 'Trip not found' });
  }

  const version = trip.versions.find(v => v.id === versionId);
  if (!version) {
    return res.status(404).json({ error: 'Version not found' });
  }

  const copy = JSON.parse(JSON.stringify(version));

  copy.id = `v${trip.versions.length + 1}`;
  copy.name = newName || `${version.name} copy`;
  copy.isActive = false;

  // Garantías defensivas
  copy.transports = copy.transports || [];
  copy.activities = copy.activities || [];
  copy.meals = copy.meals || [];
  copy.accommodations = copy.accommodations || [];

  copy.summary = calculateVersionSummary(copy, trip);

  trip.versions.push(copy);
  writeTrips(trips);

  res.json(copy);
};

exports.activateVersion = (req, res) => {
  const { tripName, versionId } = req.body;
  const trips = readTrips();

  const trip = trips.find(t => t.tripName === tripName);
  if (!trip) {
    return res.status(404).json({ error: 'Trip not found' });
  }

  trip.versions.forEach(v => {
    v.isActive = v.id === versionId;
  });

  writeTrips(trips);
  res.json({ message: 'Version activated' });
};

/* ================= ITEMS ================= */

exports.addItem = (req, res) => {
  const { tripName, versionId, itemType, item } = req.body;

  if (!tripName || !versionId || !itemType || !item) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const trips = readTrips();
  const trip = trips.find(t => t.tripName === tripName);
  if (!trip) {
    return res.status(404).json({ error: 'Trip not found' });
  }

  const version = trip.versions.find(v => v.id === versionId);
  if (!version) {
    return res.status(404).json({ error: 'Version not found' });
  }

  if (!Array.isArray(version[itemType])) {
    return res.status(400).json({ error: 'Invalid item type' });
  }

  const newItem = {
    id: `i${Date.now()}`,
    ...item
  };

  version[itemType].push(newItem);
  version.summary = calculateVersionSummary(version, trip);

  writeTrips(trips);
  res.status(201).json(version);
};

exports.updateItem = (req, res) => {
  const { tripName, versionId, itemType, itemId, updates } = req.body;

  const trips = readTrips();
  const trip = trips.find(t => t.tripName === tripName);
  if (!trip) {
    return res.status(404).json({ error: 'Trip not found' });
  }

  const version = trip.versions.find(v => v.id === versionId);
  if (!version) {
    return res.status(404).json({ error: 'Version not found' });
  }

  if (!Array.isArray(version[itemType])) {
    return res.status(400).json({ error: 'Invalid item type' });
  }

  const index = version[itemType].findIndex(i => i.id === itemId);
  if (index === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }

  version[itemType][index] = {
    ...version[itemType][index],
    ...updates
  };

  version.summary = calculateVersionSummary(version, trip);
  writeTrips(trips);

  res.json(version);
};

exports.deleteItem = (req, res) => {
  const { tripName, versionId, itemType, itemId } = req.body;

  const trips = readTrips();
  const trip = trips.find(t => t.tripName === tripName);
  if (!trip) {
    return res.status(404).json({ error: 'Trip not found' });
  }

  const version = trip.versions.find(v => v.id === versionId);
  if (!version) {
    return res.status(404).json({ error: 'Version not found' });
  }

  if (!Array.isArray(version[itemType])) {
    return res.status(400).json({ error: 'Invalid item type' });
  }

  version[itemType] = version[itemType].filter(i => i.id !== itemId);
  version.summary = calculateVersionSummary(version, trip);

  writeTrips(trips);
  res.json(version);
};