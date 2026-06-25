const DigitalTwin = require('../models/DigitalTwin');
const HealthLog = require('../models/HealthLog');
const HealthScoreCalculator = require('./healthScoreCalculator');
const TrendAnalysisEngine = require('./trendAnalysisEngine');
const RiskDetectionEngine = require('./riskDetectionEngine');
const { getDaysBetween } = require('../utils/helpers');

/**
 * Digital Twin Builder
 * Creates and maintains a digital twin profile based on user health history.
 */

class DigitalTwinBuilder {
  /**
   * Build or update the digital twin for a user.
   * @param {string} userId
   * @returns {Object} Updated digital twin
   */
  static async buildTwin(userId) {
    // Fetch last 90 days of logs
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const logs = await HealthLog.find({
      userId,
      date: { $gte: ninetyDaysAgo },
    }).sort({ date: 1 });

    if (logs.length === 0) {
      return this._getDefaultTwin(userId);
    }

    // Calculate individual scores
    const healthScore = this._calculateAvgHealthScore(logs);
    const fitnessScore = this._calculateFitnessScore(logs);
    const sleepScore = this._calculateSleepScore(logs);
    const nutritionScore = this._calculateNutritionScore(logs);
    const consistencyScore = this._calculateConsistencyScore(logs);

    // Detect risks
    const recentLogs = logs.slice(-14);
    const riskFactors = RiskDetectionEngine.detectRisks(recentLogs);

    // Update or create twin
    const twin = await DigitalTwin.findOneAndUpdate(
      { userId },
      {
        healthScore,
        fitnessScore,
        sleepScore,
        nutritionScore,
        consistencyScore,
        riskFactors,
        lastUpdated: new Date(),
        $push: {
          history: {
            $each: [
              {
                date: new Date(),
                healthScore,
                fitnessScore,
                sleepScore,
                nutritionScore,
                consistencyScore,
              },
            ],
            $slice: -90, // Keep last 90 entries
          },
        },
      },
      { upsert: true, new: true }
    );

    return twin;
  }

  static _calculateAvgHealthScore(logs) {
    const recentLogs = logs.slice(-7);
    const scores = recentLogs.map((log) => {
      const result = HealthScoreCalculator.calculate(log);
      return result.healthScore;
    });
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }

  static _calculateFitnessScore(logs) {
    const recent = logs.slice(-14);
    let score = 50;

    const avgSteps = recent.reduce((s, l) => s + l.steps, 0) / recent.length;
    const avgExercise = recent.reduce((s, l) => s + l.exerciseDuration, 0) / recent.length;

    // Steps contribution (0-60)
    score = Math.min((avgSteps / 10000) * 60, 60);
    // Exercise contribution (0-40)
    score += Math.min((avgExercise / 60) * 40, 40);

    return Math.round(Math.min(score, 100));
  }

  static _calculateSleepScore(logs) {
    const recent = logs.slice(-7);
    const avgSleep = recent.reduce((s, l) => s + l.sleep, 0) / recent.length;

    // Consistency bonus
    const sleepVariance = recent.reduce((s, l) => s + Math.abs(l.sleep - avgSleep), 0) / recent.length;
    const consistencyBonus = Math.max(0, 20 - sleepVariance * 10);

    let score = HealthScoreCalculator.calculateSleepScore(avgSleep);
    score = Math.min(score * 0.8 + consistencyBonus, 100);

    return Math.round(score);
  }

  static _calculateNutritionScore(logs) {
    const recent = logs.slice(-7);
    const avgCalories = recent.reduce((s, l) => s + l.calories, 0) / recent.length;
    const avgWater = recent.reduce((s, l) => s + l.waterIntake, 0) / recent.length;

    const calorieScore = HealthScoreCalculator.calculateNutritionScore(avgCalories);
    const hydrationScore = HealthScoreCalculator.calculateHydrationScore(avgWater);

    return Math.round(calorieScore * 0.6 + hydrationScore * 0.4);
  }

  static _calculateConsistencyScore(logs) {
    if (logs.length < 2) return 0;

    // Count consecutive days with logs
    let maxStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < logs.length; i++) {
      const daysBetween = getDaysBetween(logs[i - 1].date, logs[i].date);
      if (daysBetween <= 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    // Score based on logging frequency and streak
    const frequencyScore = Math.min((logs.length / 90) * 100, 100);
    const streakScore = Math.min((maxStreak / 30) * 100, 100);

    return Math.round(frequencyScore * 0.4 + streakScore * 0.6);
  }

  static async _getDefaultTwin(userId) {
    const twin = await DigitalTwin.findOneAndUpdate(
      { userId },
      {
        healthScore: 50,
        fitnessScore: 50,
        sleepScore: 50,
        nutritionScore: 50,
        consistencyScore: 0,
        riskFactors: [],
        lastUpdated: new Date(),
      },
      { upsert: true, new: true }
    );
    return twin;
  }
}

module.exports = DigitalTwinBuilder;
