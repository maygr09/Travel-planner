const express = require('express');
const router = express.Router();

const {
  getAllTrips,
  createTrip,
  searchTripsByName,
  updateTrip,
  recalculateTrip,
  deleteTrip
} = require('../controllers/trips_controller');

router.get('/', getAllTrips);
router.get('/search', searchTripsByName);
router.post('/', createTrip);
router.put('/', updateTrip);
router.post('/recalculate', recalculateTrip);
router.delete('/:id', deleteTrip);

module.exports = router;