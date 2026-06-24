const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/health');
const urlRoutes = require('./routes/urlRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// Configure CORS
app.use(cors());

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Mount Routes
app.use('/health', healthRoutes);
app.use('/api/urls', urlRoutes);
app.use('/api/dashboard', dashboardRoutes);

module.exports = app;
