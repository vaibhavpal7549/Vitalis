const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const {
  getAllUsers,
  getAnalytics,
  getActiveUsers,
  getHealthStats,
} = require('../controllers/adminController');

router.use(auth);
router.use(admin);

router.get('/users', getAllUsers);
router.get('/analytics', getAnalytics);
router.get('/active-users', getActiveUsers);
router.get('/health-stats', getHealthStats);

module.exports = router;
