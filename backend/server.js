const express = require('express');
const cors = require('cors');

const tripsRoutes = require('./routes/trips.routes');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use('/api/trips', tripsRoutes);

app.get('/', (req, res) => {
  res.send('Travel Planner API running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});