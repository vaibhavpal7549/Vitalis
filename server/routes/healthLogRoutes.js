const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { healthLogValidation } = require('../utils/validators');
const {
  createLog,
  getLogs,
  getTodayLog,
  getLogsInRange,
  deleteLog,
} = require('../controllers/healthLogController');

router.use(auth);

router.post('/log', healthLogValidation, validate, createLog);
router.get('/logs', getLogs);
router.get('/logs/today', getTodayLog);
router.get('/logs/range', getLogsInRange);
router.delete('/logs/:id', deleteLog);

module.exports = router;
