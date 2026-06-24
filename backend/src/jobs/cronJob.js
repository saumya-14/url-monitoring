const cron = require('node-cron');
const Url = require('../models/Url');
const { checkAndStoreUrl } = require('../services/monitorService');

/**
 * Starts the uptime monitoring cron job.
 * Runs every minute to fetch all URLs and perform health checks concurrently.
 */
function startMonitoringJob() {
  // Cron schedule: Run every minute
  cron.schedule('* * * * *', async () => {
    const timestamp = new Date().toISOString();
    
    try {
      const urls = await Url.find({});
      
      console.log(`[${timestamp}] Cron Job Executed: Checking ${urls.length} URL(s)...`);
      
      if (urls.length === 0) {
        return;
      }

      // Check and store all URLs concurrently
      await Promise.all(urls.map(urlDoc => checkAndStoreUrl(urlDoc)));
      
      console.log(`[${timestamp}] Cron Job Completed: Checked ${urls.length} URL(s).`);
    } catch (error) {
      console.error(`[${timestamp}] Cron Job Error:`, error);
    }
  });
}

module.exports = {
  startMonitoringJob
};
