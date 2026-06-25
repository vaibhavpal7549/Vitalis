const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getTwin, refreshTwin, getTwinHistory } = require('../controllers/digitalTwinController');

router.use(auth);

router.get('/', getTwin);
router.post('/refresh', refreshTwin);
router.get('/history', getTwinHistory);

module.exports = router;
