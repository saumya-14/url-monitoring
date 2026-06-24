const express = require('express');
const router = express.Router();

// @route   GET /health
// @desc    Get health status of the API
// @access  Public
router.get('/', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

module.exports = router;
