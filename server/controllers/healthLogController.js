const HealthLog = require('../models/HealthLog');
const User = require('../models/User');
const HealthScoreCalculator = require('../services/healthScoreCalculator');
const DigitalTwinBuilder = require('../services/digitalTwinBuilder');
const { normalizeDate, getDaysBetween } = require('../utils/helpers');
const { XP_PER_LOG, XP_PER_STREAK_DAY, LEVEL_THRESHOLDS } = require('../config/constants');

// @desc    Create or update daily health log
// @route   POST /api/health/log
exports.createLog = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const logDate = normalizeDate(req.body.date || new Date());

    const logData = {
      sleep: req.body.sleep,
      waterIntake: req.body.waterIntake,
      steps: req.body.steps,
      calories: req.body.calories,
      exerciseDuration: req.body.exerciseDuration,
      weight: req.body.weight,
      heartRate: req.body.heartRate,
      mood: req.body.mood,
    };

    // Calculate health score
    const scoreResult = HealthScoreCalculator.calculate(logData);
    logData.healthScore = scoreResult.healthScore;

    // Upsert log
    const log = await HealthLog.findOneAndUpdate(
      { userId, date: logDate },
      { ...logData, userId, date: logDate },
      { upsert: true, new: true, runValidators: true }
    );

    // Update streak
    await this._updateStreak(userId, logDate);

    // Update XP
    await this._updateXP(userId);

    // Rebuild digital twin in background
    DigitalTwinBuilder.buildTwin(userId).catch(console.error);

    res.status(201).json({
      message: 'Health log saved',
      log,
      scoreBreakdown: scoreResult.breakdown,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get health logs with filters
// @route   GET /api/health/logs
exports.getLogs = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate, limit = 30, page = 1 } = req.query;

    const query = { userId };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = normalizeDate(startDate);
      if (endDate) query.date.$lte = normalizeDate(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [logs, total] = await Promise.all([
      HealthLog.find(query).sort({ date: -1 }).limit(parseInt(limit)).skip(skip),
      HealthLog.countDocuments(query),
    ]);

    res.json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get today's log
// @route   GET /api/health/logs/today
exports.getTodayLog = async (req, res, next) => {
  try {
    const today = normalizeDate(new Date());
    const log = await HealthLog.findOne({ userId: req.user._id, date: today });

    res.json({ log: log || null });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logs in date range
// @route   GET /api/health/logs/range
exports.getLogsInRange = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'startDate and endDate are required' });
    }

    const logs = await HealthLog.find({
      userId: req.user._id,
      date: {
        $gte: normalizeDate(startDate),
        $lte: normalizeDate(endDate),
      },
    }).sort({ date: 1 });

    res.json({ logs });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a log entry
// @route   DELETE /api/health/logs/:id
exports.deleteLog = async (req, res, next) => {
  try {
    const log = await HealthLog.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!log) {
      return res.status(404).json({ message: 'Log entry not found' });
    }

    res.json({ message: 'Log entry deleted' });
  } catch (error) {
    next(error);
  }
};

// Helper: Update user streak
exports._updateStreak = async function (userId, logDate) {
  const user = await User.findById(userId);
  const today = normalizeDate(logDate);
  const lastLog = user.streak.lastLogDate ? normalizeDate(user.streak.lastLogDate) : null;

  if (!lastLog) {
    user.streak.current = 1;
    user.streak.longest = 1;
  } else {
    const daysDiff = getDaysBetween(lastLog, today);
    if (daysDiff === 1) {
      user.streak.current += 1;
    } else if (daysDiff === 0) {
      // Same day, no change
    } else {
      user.streak.current = 1;
    }
    user.streak.longest = Math.max(user.streak.longest, user.streak.current);
  }

  user.streak.lastLogDate = today;
  await user.save();
};

// Helper: Update XP and level
exports._updateXP = async function (userId) {
  const user = await User.findById(userId);
  user.level.xp += XP_PER_LOG + (user.streak.current > 1 ? XP_PER_STREAK_DAY : 0);

  // Level up check
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (user.level.xp >= LEVEL_THRESHOLDS[i]) {
      user.level.current = i + 1;
      break;
    }
  }

  await user.save();
};
