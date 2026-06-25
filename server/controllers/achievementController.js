const Achievement = require('../models/Achievement');
const User = require('../models/User');
const HealthLog = require('../models/HealthLog');
const { ACHIEVEMENTS, XP_PER_ACHIEVEMENT } = require('../config/constants');

// @desc    Get user's achievements
// @route   GET /api/achievements
exports.getAchievements = async (req, res, next) => {
  try {
    let record = await Achievement.findOne({ userId: req.user._id });

    if (!record) {
      record = await Achievement.create({ userId: req.user._id, achievements: [] });
    }

    // Return all achievements with locked/unlocked status
    const allAchievements = Object.values(ACHIEVEMENTS).map((ach) => {
      const unlocked = record.achievements.find((a) => a.key === ach.key);
      return {
        ...ach,
        unlocked: !!unlocked,
        unlockedAt: unlocked?.unlockedAt || null,
      };
    });

    res.json({
      achievements: allAchievements,
      totalUnlocked: record.achievements.length,
      totalAvailable: Object.keys(ACHIEVEMENTS).length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check and unlock new achievements
// @route   POST /api/achievements/check
exports.checkAchievements = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    let record = await Achievement.findOne({ userId });

    if (!record) {
      record = await Achievement.create({ userId, achievements: [] });
    }

    const unlockedKeys = record.achievements.map((a) => a.key);
    const newlyUnlocked = [];

    // Check each achievement
    for (const [key, ach] of Object.entries(ACHIEVEMENTS)) {
      if (unlockedKeys.includes(key)) continue;

      const { requirement } = ach;
      let earned = false;

      switch (requirement.type) {
        case 'streak':
          earned = user.streak.current >= requirement.value || user.streak.longest >= requirement.value;
          break;

        case 'totalLogs': {
          const count = await HealthLog.countDocuments({ userId });
          earned = count >= requirement.value;
          break;
        }

        case 'level':
          earned = user.level.current >= requirement.value;
          break;

        case 'healthScore':
        case 'steps':
        case 'waterIntake':
        case 'sleep':
        case 'mood': {
          const recentLogs = await HealthLog.find({ userId })
            .sort({ date: -1 })
            .limit(requirement.days);

          if (recentLogs.length >= requirement.days) {
            const metric = requirement.type === 'healthScore' ? 'healthScore' : requirement.type;
            earned = recentLogs.every((log) => {
              if (requirement.type === 'sleep') {
                return log[metric] >= requirement.value && log[metric] <= 9;
              }
              return log[metric] >= requirement.value;
            });
          }
          break;
        }
      }

      if (earned) {
        const achievement = {
          key: ach.key,
          name: ach.name,
          description: ach.description,
          icon: ach.icon,
          category: ach.category,
          unlockedAt: new Date(),
        };
        record.achievements.push(achievement);
        newlyUnlocked.push(achievement);

        // Award XP
        user.level.xp += XP_PER_ACHIEVEMENT;
      }
    }

    if (newlyUnlocked.length > 0) {
      await record.save();
      await user.save();
    }

    res.json({
      newlyUnlocked,
      totalUnlocked: record.achievements.length,
    });
  } catch (error) {
    next(error);
  }
};
