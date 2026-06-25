const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getPredictions, generatePredictions, getPredictionHistory } = require('../controllers/predictionController');

router.use(auth);

router.get('/', getPredictions);
router.post('/generate', generatePredictions);
router.get('/history', getPredictionHistory);

module.exports = router;
