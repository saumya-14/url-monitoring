const axios = require('axios');
const HealthCheck = require('../models/HealthCheck');

/**
 * Checks the status, response time, and availability of a URL.
 * 
 * @param {string} url - The URL to check.
 * @returns {Promise<{statusCode: number|null, responseTime: number|null, isUp: boolean}>}
 */
async function checkUrl(url) {
  const startTime = Date.now();
  try {
    const response = await axios.get(url, {
      timeout: 10000, // 10 seconds timeout
      validateStatus: () => true // Resolve the promise for any HTTP status code
    });

    const responseTime = Date.now() - startTime;
    const isUp = response.status >= 200 && response.status < 300;

    return {
      statusCode: response.status,
      responseTime,
      isUp
    };
  } catch (error) {
    return {
      statusCode: null,
      responseTime: null,
      isUp: false
    };
  }
}

/**
 * Checks a URL and stores the health check result in MongoDB.
 * 
 * @param {object} urlDocument - The MongoDB Url document.
 * @returns {Promise<object>} The created HealthCheck document.
 */
async function checkAndStoreUrl(urlDocument) {
  const result = await checkUrl(urlDocument.url);
  
  const healthCheck = new HealthCheck({
    urlId: urlDocument._id,
    statusCode: result.statusCode,
    responseTime: result.responseTime,
    isUp: result.isUp,
    checkedAt: new Date()
  });

  return await healthCheck.save();
}

module.exports = {
  checkUrl,
  checkAndStoreUrl
};
