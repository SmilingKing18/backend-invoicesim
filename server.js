require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const apiRoutes = require('./routes/api');

const app = express();
app.use(cors());
app.use(express.json());

// API
app.use('/api', apiRoutes);

// Serve frontend static when in prod
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('../frontend/build'));
  const path = require('path');
  app.get('*', (req, res) => res.sendFile(path.resolve(__dirname, '../frontend', 'build', 'index.html')));
}

// Start
connectDB();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));