const DigitalTwinBuilder = require('../services/digitalTwinBuilder');
const DigitalTwin = require('../models/DigitalTwin');

// @desc    Get user's digital twin
// @route   GET /api/twin
exports.getTwin = async (req, res, next) => {
  try {
    let twin = await DigitalTwin.findOne({ userId: req.user._id });

    if (!twin) {
      twin = await DigitalTwinBuilder.buildTwin(req.user._id);
    }

    res.json({ twin });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh/recalculate digital twin
// @route   POST /api/twin/refresh
exports.refreshTwin = async (req, res, next) => {
  try {
    const twin = await DigitalTwinBuilder.buildTwin(req.user._id);
    res.json({ message: 'Digital twin updated', twin });
  } catch (error) {
    next(error);
  }
};

// @desc    Get twin score history
// @route   GET /api/twin/history
exports.getTwinHistory = async (req, res, next) => {
  try {
    const twin = await DigitalTwin.findOne({ userId: req.user._id });

    if (!twin) {
      return res.json({ history: [] });
    }

    res.json({ history: twin.history });
  } catch (error) {
    next(error);
  }
};
