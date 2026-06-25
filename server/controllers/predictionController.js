const HealthLog = require('../models/HealthLog');
const Prediction = require('../models/Prediction');
const DigitalTwin = require('../models/DigitalTwin');
const TrendAnalysisEngine = require('../services/trendAnalysisEngine');
const RecommendationGenerator = require('../services/recommendationGenerator');
const { linearRegression } = require('../utils/linearRegression');

// @desc    Get latest predictions
// @route   GET /api/predictions
exports.getPredictions = async (req, res, next) => {
  try {
    const prediction = await Prediction.findOne({ userId: req.user._id })
      .sort({ generatedAt: -1 });

    if (!prediction) {
      return res.json({ prediction: null, message: 'No predictions yet. Generate one first.' });
    }

    res.json({ prediction });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate new predictions
// @route   POST /api/predictions/generate
exports.generatePredictions = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Fetch last 90 days of logs
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const logs = await HealthLog.find({
      userId,
      date: { $gte: ninetyDaysAgo },
    }).sort({ date: 1 });

    if (logs.length < 3) {
      return res.status(400).json({
        message: 'At least 3 days of health data are required to generate predictions.',
      });
    }

    // Trend analysis
    const trendSummary = TrendAnalysisEngine.getSummary(logs);

    // Weight prediction (30 days)
    const weightLogs = logs.filter((l) => l.weight);
    let weight30Days = null;
    const weightProjection = [];

    if (weightLogs.length >= 2) {
      const weightData = weightLogs.map((l, i) => ({ x: i, y: l.weight }));
      const regression = linearRegression(weightData);
      weight30Days = Math.round(regression.predict(weightLogs.length + 30) * 10) / 10;

      for (let i = 1; i <= 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        weightProjection.push({
          date,
          value: Math.round(regression.predict(weightLogs.length + i) * 10) / 10,
        });
      }
    }

    // Health score projection
    const healthScoreData = logs.map((l, i) => ({ x: i, y: l.healthScore }));
    const healthRegression = linearRegression(healthScoreData);
    const estimatedHealthScore30Days = Math.round(
      Math.max(0, Math.min(100, healthRegression.predict(logs.length + 30)))
    );

    const healthScoreProjection = [];
    for (let i = 1; i <= 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      healthScoreProjection.push({
        date,
        value: Math.round(Math.max(0, Math.min(100, healthRegression.predict(logs.length + i)))),
      });
    }

    // Fitness projection
    const fitnessData = logs.map((l, i) => ({
      x: i,
      y: (l.steps / 10000) * 60 + Math.min((l.exerciseDuration / 60) * 40, 40),
    }));
    const fitnessRegression = linearRegression(fitnessData);

    const fitnessProjection = [];
    for (let i = 1; i <= 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      fitnessProjection.push({
        date,
        value: Math.round(Math.max(0, Math.min(100, fitnessRegression.predict(fitnessData.length + i)))),
      });
    }

    // Unhealthy habit risk
    const declineCount = trendSummary.declining.length;
    const unhealthyHabitRisk = Math.min(declineCount * 15 + (declineCount > 3 ? 20 : 0), 100);

    // Generate recommendations
    const twin = await DigitalTwin.findOne({ userId });
    const recentLogs = logs.slice(-7);
    const recommendations = RecommendationGenerator.generate(recentLogs, twin);

    // Save prediction
    const prediction = await Prediction.create({
      userId,
      generatedAt: new Date(),
      predictions: {
        weight30Days,
        fitnessTrend: trendSummary.analysis.steps?.direction || 'stable',
        sleepQualityTrend: trendSummary.analysis.sleep?.direction || 'stable',
        unhealthyHabitRisk,
        estimatedHealthScore30Days,
      },
      chartData: {
        weightProjection,
        healthScoreProjection,
        fitnessProjection,
      },
      recommendations,
    });

    res.json({ prediction });
  } catch (error) {
    next(error);
  }
};

// @desc    Get prediction history
// @route   GET /api/predictions/history
exports.getPredictionHistory = async (req, res, next) => {
  try {
    const predictions = await Prediction.find({ userId: req.user._id })
      .sort({ generatedAt: -1 })
      .limit(10)
      .select('generatedAt predictions');

    res.json({ predictions });
  } catch (error) {
    next(error);
  }
};
