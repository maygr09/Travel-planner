const express = require('express');
const router = express.Router();

const {
  getAllTrips,
  createTrip,
  searchTripsByName
} = require('../controllers/trips_controller');

router.get('/', getAllTrips);
router.get('/search', searchTripsByName);
router.post('/', createTrip);

module.exports = router;