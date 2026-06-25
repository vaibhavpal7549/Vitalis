const HealthLog = require('../models/HealthLog');
const FutureSimulationEngine = require('../services/futureSimulationEngine');

// @desc    Run a what-if simulation
// @route   POST /api/simulator/simulate
exports.simulate = async (req, res, next) => {
  try {
    const { params, days = 30 } = req.body;

    // Fetch historical logs
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const logs = await HealthLog.find({
      userId: req.user._id,
      date: { $gte: ninetyDaysAgo },
    }).sort({ date: 1 });

    if (logs.length < 3) {
      return res.status(400).json({
        message: 'At least 3 days of health data are required for simulation.',
      });
    }

    const results = FutureSimulationEngine.simulate(logs, params, days);

    res.json({ simulation: results });
  } catch (error) {
    next(error);
  }
};
