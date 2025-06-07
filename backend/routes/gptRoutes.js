const express = require('express');
const { getCourseRecommendation } = require('../controllers/gptController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Only students can ask for course advice
router.post('/recommend', protect, getCourseRecommendation);

module.exports = router;
