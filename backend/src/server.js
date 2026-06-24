require('dotenv').config();
const Url = require("./models/Url");
const HealthCheck = require("./models/HealthCheck");
const app = require('./app');
const connectDB = require('./config/db');
const { startMonitoringJob } = require('./jobs/cronJob');


const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Start Monitoring Cron Job
startMonitoringJob();

// Start Server
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});