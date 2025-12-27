const express = require('express');
const router = express.Router();

const {
  getAllTrips,
  createTrip,
  getTripById
} = require('../controllers/trips_controller');

router.get('/', getAllTrips);
router.post('/', createTrip);
router.get('/:id', getTripById);

module.exports = router;