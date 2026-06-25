const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getWeeklyReport } = require('../controllers/reportController');

router.use(auth);

router.get('/weekly', getWeeklyReport);

module.exports = router;
