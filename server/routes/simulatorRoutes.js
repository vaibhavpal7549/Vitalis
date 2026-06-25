const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { simulationValidation } = require('../utils/validators');
const { simulate } = require('../controllers/simulatorController');

router.use(auth);

router.post('/simulate', simulationValidation, validate, simulate);

module.exports = router;
