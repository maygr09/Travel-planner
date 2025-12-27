const express = require('express');
const cors = require('cors');

const tripsRoutes = require('./routes/trips_routes');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use('/api/trips', tripsRoutes);

app.get('/', (req, res) => {
  res.send('Travel Planner API running');
});

app.listen(3001, () => {
  console.log(`Server running on port ${PORT}`);
});