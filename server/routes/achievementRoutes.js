const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getAchievements, checkAchievements } = require('../controllers/achievementController');

router.use(auth);

router.get('/', getAchievements);
router.post('/check', checkAchievements);

module.exports = router;
