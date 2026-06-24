const express = require('express');
const router = express.Router();
const { createUrl, getUrls } = require('../controllers/urlController');

router.post('/', createUrl);
router.get('/', getUrls);

module.exports = router;
