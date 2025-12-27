const express = require('express');
const router = express.Router();

const {
  getAllTrips,
  createTrip,
  searchTripsByName,
  updateTrip,
  deleteTrip,
  createVersion,
  duplicateVersion,
  activateVersion,
  updateItem,
  deleteItem,
  recalculateTrip
} = require('../controllers/trips_controller');

router.get('/', getAllTrips);
router.get('/search', searchTripsByName);
router.post('/', createTrip);
router.put('/', updateTrip);
router.post('/version', createVersion);
router.post('/version/duplicate', duplicateVersion);
router.put('/version/activate', activateVersion);
router.put('/item', updateItem);
router.delete('/item', deleteItem);
router.post('/recalculate', recalculateTrip);
router.delete('/:id', deleteTrip);

module.exports = router;