const HealthLog = require('../models/HealthLog');
const DigitalTwin = require('../models/DigitalTwin');
const TrendAnalysisEngine = require('../services/trendAnalysisEngine');
const RecommendationGenerator = require('../services/recommendationGenerator');

// @desc    Get weekly AI health report
// @route   GET /api/reports/weekly
exports.getWeeklyReport = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get last 7 days of logs
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const logs = await HealthLog.find({
      userId,
      date: { $gte: sevenDaysAgo },
    }).sort({ date: 1 });

    if (logs.length === 0) {
      return res.json({
        report: null,
        message: 'No data available for the past week.',
      });
    }

    // Get previous week for comparison
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const prevWeekLogs = await HealthLog.find({
      userId,
      date: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo },
    }).sort({ date: 1 });

    // Current week averages
    const currentAvg = _calculateAverages(logs);
    const prevAvg = prevWeekLogs.length > 0 ? _calculateAverages(prevWeekLogs) : null;

    // Trend analysis
    const trends = TrendAnalysisEngine.getSummary(logs);

    // Recommendations
    const twin = await DigitalTwin.findOne({ userId });
    const recommendations = RecommendationGenerator.generate(logs, twin);

    // Build report
    const report = {
      period: {
        start: sevenDaysAgo,
        end: new Date(),
        daysLogged: logs.length,
      },
      currentWeek: currentAvg,
      previousWeek: prevAvg,
      comparison: prevAvg
        ? {
            sleep: _compareMetric(currentAvg.sleep, prevAvg.sleep),
            steps: _compareMetric(currentAvg.steps, prevAvg.steps),
            calories: _compareMetric(currentAvg.calories, prevAvg.calories),
            waterIntake: _compareMetric(currentAvg.waterIntake, prevAvg.waterIntake),
            exerciseDuration: _compareMetric(currentAvg.exerciseDuration, prevAvg.exerciseDuration),
            healthScore: _compareMetric(currentAvg.healthScore, prevAvg.healthScore),
            mood: _compareMetric(currentAvg.mood, prevAvg.mood),
          }
        : null,
      trends: {
        improving: trends.improving,
        declining: trends.declining,
        stable: trends.stable,
      },
      highlights: _generateHighlights(logs, currentAvg, prevAvg),
      recommendations: recommendations.slice(0, 5),
      riskFactors: twin?.riskFactors || [],
    };

    res.json({ report });
  } catch (error) {
    next(error);
  }
};

function _calculateAverages(logs) {
  const n = logs.length;
  return {
    sleep: Math.round((logs.reduce((s, l) => s + l.sleep, 0) / n) * 10) / 10,
    steps: Math.round(logs.reduce((s, l) => s + l.steps, 0) / n),
    calories: Math.round(logs.reduce((s, l) => s + l.calories, 0) / n),
    waterIntake: Math.round((logs.reduce((s, l) => s + l.waterIntake, 0) / n) * 10) / 10,
    exerciseDuration: Math.round(logs.reduce((s, l) => s + l.exerciseDuration, 0) / n),
    weight: Math.round((logs.filter((l) => l.weight).reduce((s, l) => s + l.weight, 0) / (logs.filter((l) => l.weight).length || 1)) * 10) / 10,
    heartRate: Math.round(logs.reduce((s, l) => s + l.heartRate, 0) / n),
    mood: Math.round((logs.reduce((s, l) => s + l.mood, 0) / n) * 10) / 10,
    healthScore: Math.round(logs.reduce((s, l) => s + l.healthScore, 0) / n),
  };
}

function _compareMetric(current, previous) {
  if (!previous) return { change: 0, direction: 'stable' };
  const change = Math.round((current - previous) * 100) / 100;
  const percentChange = previous !== 0 ? Math.round((change / previous) * 1000) / 10 : 0;
  return {
    current,
    previous,
    change,
    percentChange,
    direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
  };
}

function _generateHighlights(logs, currentAvg, prevAvg) {
  const highlights = [];

  // Best day
  const bestDay = logs.reduce((best, log) =>
    log.healthScore > (best?.healthScore || 0) ? log : best, logs[0]
  );
  highlights.push({
    type: 'best_day',
    text: `Your best day was ${new Date(bestDay.date).toLocaleDateString()} with a health score of ${bestDay.healthScore}`,
    icon: '🏆',
  });

  // Step champion
  const maxSteps = Math.max(...logs.map((l) => l.steps));
  if (maxSteps >= 10000) {
    highlights.push({
      type: 'step_champion',
      text: `You hit ${maxSteps.toLocaleString()} steps in a single day!`,
      icon: '🚶',
    });
  }

  // Improvement highlight
  if (prevAvg && currentAvg.healthScore > prevAvg.healthScore) {
    highlights.push({
      type: 'improvement',
      text: `Your health score improved by ${Math.round(currentAvg.healthScore - prevAvg.healthScore)} points compared to last week!`,
      icon: '📈',
    });
  }

  // Consistency
  if (logs.length === 7) {
    highlights.push({
      type: 'consistency',
      text: 'You logged health data every day this week! Great consistency.',
      icon: '⭐',
    });
  }

  return highlights;
}
