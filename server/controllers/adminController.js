const User = require('../models/User');
const HealthLog = require('../models/HealthLog');

// @desc    Get all users (admin)
// @route   GET /api/admin/users
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = { role: 'user' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      User.countDocuments(query),
    ]);

    res.json({
      users,
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

// @desc    Get platform analytics
// @route   GET /api/admin/analytics
exports.getAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalLogs = await HealthLog.countDocuments();

    // Users who logged in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activeUsers = await HealthLog.distinct('userId', {
      date: { $gte: sevenDaysAgo },
    });

    // Average health score across all users (last 7 days)
    const avgHealthScore = await HealthLog.aggregate([
      { $match: { date: { $gte: sevenDaysAgo } } },
      { $group: { _id: null, avg: { $avg: '$healthScore' } } },
    ]);

    // New users this week
    const newUsersThisWeek = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
      role: 'user',
    });

    // Registrations by day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const registrationsByDay = await User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo }, role: 'user' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      totalUsers,
      totalLogs,
      activeUsersCount: activeUsers.length,
      avgHealthScore: avgHealthScore[0]?.avg ? Math.round(avgHealthScore[0].avg) : 0,
      newUsersThisWeek,
      registrationsByDay,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active users
// @route   GET /api/admin/active-users
exports.getActiveUsers = async (req, res, next) => {
  try {
    const { days = 7 } = req.query;
    const since = new Date();
    since.setDate(since.getDate() - parseInt(days));

    const activeUserIds = await HealthLog.distinct('userId', {
      date: { $gte: since },
    });

    const users = await User.find({ _id: { $in: activeUserIds } })
      .select('name email avatar streak level createdAt');

    res.json({
      activeUsers: users,
      count: users.length,
      period: `Last ${days} days`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get aggregate health statistics
// @route   GET /api/admin/health-stats
exports.getHealthStats = async (req, res, next) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const stats = await HealthLog.aggregate([
      { $match: { date: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: null,
          avgSleep: { $avg: '$sleep' },
          avgSteps: { $avg: '$steps' },
          avgCalories: { $avg: '$calories' },
          avgWater: { $avg: '$waterIntake' },
          avgExercise: { $avg: '$exerciseDuration' },
          avgHeartRate: { $avg: '$heartRate' },
          avgMood: { $avg: '$mood' },
          avgHealthScore: { $avg: '$healthScore' },
          totalEntries: { $sum: 1 },
        },
      },
    ]);

    const result = stats[0] || {};

    res.json({
      averages: {
        sleep: Math.round((result.avgSleep || 0) * 10) / 10,
        steps: Math.round(result.avgSteps || 0),
        calories: Math.round(result.avgCalories || 0),
        waterIntake: Math.round((result.avgWater || 0) * 10) / 10,
        exerciseDuration: Math.round(result.avgExercise || 0),
        heartRate: Math.round(result.avgHeartRate || 0),
        mood: Math.round((result.avgMood || 0) * 10) / 10,
        healthScore: Math.round(result.avgHealthScore || 0),
      },
      totalEntries: result.totalEntries || 0,
      period: 'Last 7 days',
    });
  } catch (error) {
    next(error);
  }
};
