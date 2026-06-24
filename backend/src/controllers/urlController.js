const Url = require('../models/Url');

// @desc    Register a new URL for monitoring
// @route   POST /api/urls
// @access  Public
const createUrl = async (req, res) => {
  try {
    const { url } = req.body;

    // Validate URL exists in request
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid URL format. Please include protocol (e.g. http:// or https://)' });
    }

    // Check if URL is already registered
    const existingUrl = await Url.findOne({ url });
    if (existingUrl) {
      return res.status(400).json({ error: 'URL is already registered' });
    }

    const newUrl = new Url({ url });
    const savedUrl = await newUrl.save();

    res.status(201).json(savedUrl);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get all monitored URLs
// @route   GET /api/urls
// @access  Public
const getUrls = async (req, res) => {
  try {
    const urls = await Url.find();
    res.status(200).json(urls);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createUrl,
  getUrls
};
