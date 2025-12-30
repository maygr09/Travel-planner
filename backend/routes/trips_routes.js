const express = require('express');
const router = express.Router();

const {
  getAllTrips,
  createTrip,
  updateTrip,
  searchTripsByName,
  deleteTrip,
  duplicateVersion,
  activateVersion,
  addItem,
  updateItem,
  deleteItem
} = require('../controllers/trips_controller');

router.get('/', getAllTrips);
router.get('/search', searchTripsByName);
router.put('/', updateTrip);
router.post('/', createTrip);
router.delete('/', deleteTrip);

router.post('/version/duplicate', duplicateVersion);
router.put('/version/activate', activateVersion);
router.post('/item', addItem); 
router.put('/item', updateItem);
router.delete('/item', deleteItem);

module.exports = router;