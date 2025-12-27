const express = require('express');
const router = express.Router();

const {
  getAllTrips,
  createTrip,
  searchTripsByName,
  deleteTrip,
  createVersion,
  duplicateVersion,
  activateVersion,
  updateItem,
  deleteItem
} = require('../controllers/tripsController');

router.get('/', getAllTrips);
router.get('/search', searchTripsByName);
router.post('/', createTrip);
router.delete('/', deleteTrip);

router.post('/version', createVersion);
router.post('/version/duplicate', duplicateVersion);
router.put('/version/activate', activateVersion);

router.put('/item', updateItem);
router.delete('/item', deleteItem);

module.exports = router;