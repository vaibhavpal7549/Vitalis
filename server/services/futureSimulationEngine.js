const { linearRegression } = require('../utils/linearRegression');
const HealthScoreCalculator = require('./healthScoreCalculator');

/**
 * Future Simulation Engine
 * Allows users to simulate "what-if" scenarios and projects future health outcomes.
 */

class FutureSimulationEngine {
  /**
   * Simulate future outcomes based on modified habits.
   * @param {Array} historicalLogs - Past health logs (sorted oldest to newest)
   * @param {Object} params - Simulated daily parameters (e.g., { sleep: 8, steps: 10000 })
   * @param {number} days - Number of days to project (default: 30)
   * @returns {Object} Simulation results with projections
   */
  static simulate(historicalLogs, params, days = 30) {
    if (!historicalLogs || historicalLogs.length === 0) {
      return { error: 'Insufficient data for simulation' };
    }

    // Calculate current averages
    const recentLogs = historicalLogs.slice(-7);
    const currentAverages = this._calculateAverages(recentLogs);

    // Merge with simulation params (user overrides)
    const simulatedDaily = { ...currentAverages, ...params };

    // Calculate projected health score with simulated values
    const currentScoreData = HealthScoreCalculator.calculate(currentAverages);
    const projectedScoreData = HealthScoreCalculator.calculate(simulatedDaily);

    // Generate day-by-day projections
    const projections = this._generateProjections(
      historicalLogs,
      simulatedDaily,
      currentAverages,
      days
    );

    // Weight projection using linear regression from history + modification
    const weightProjection = this._projectWeight(historicalLogs, simulatedDaily, days);

    return {
      current: {
        healthScore: currentScoreData.healthScore,
        breakdown: currentScoreData.breakdown,
        averages: currentAverages,
      },
      projected: {
        healthScore: projectedScoreData.healthScore,
        breakdown: projectedScoreData.breakdown,
        params: simulatedDaily,
      },
      improvement: {
        healthScore: projectedScoreData.healthScore - currentScoreData.healthScore,
        breakdown: {
          sleep: projectedScoreData.breakdown.sleep - currentScoreData.breakdown.sleep,
          activity: projectedScoreData.breakdown.activity - currentScoreData.breakdown.activity,
          nutrition: projectedScoreData.breakdown.nutrition - currentScoreData.breakdown.nutrition,
          hydration: projectedScoreData.breakdown.hydration - currentScoreData.breakdown.hydration,
          heartRate: projectedScoreData.breakdown.heartRate - currentScoreData.breakdown.heartRate,
          mood: projectedScoreData.breakdown.mood - currentScoreData.breakdown.mood,
        },
      },
      projections,
      weightProjection,
      days,
    };
  }

  static _calculateAverages(logs) {
    const n = logs.length;
    if (n === 0) return {};
    return {
      sleep: logs.reduce((s, l) => s + (l.sleep || 0), 0) / n,
      steps: logs.reduce((s, l) => s + (l.steps || 0), 0) / n,
      calories: logs.reduce((s, l) => s + (l.calories || 0), 0) / n,
      waterIntake: logs.reduce((s, l) => s + (l.waterIntake || 0), 0) / n,
      exerciseDuration: logs.reduce((s, l) => s + (l.exerciseDuration || 0), 0) / n,
      mood: logs.reduce((s, l) => s + (l.mood || 5), 0) / n,
      heartRate: logs.reduce((s, l) => s + (l.heartRate || 72), 0) / n,
      weight: logs.filter((l) => l.weight).reduce((s, l) => s + l.weight, 0) / (logs.filter((l) => l.weight).length || 1),
    };
  }

  static _generateProjections(historicalLogs, simulatedDaily, currentAverages, days) {
    const projections = [];
    const today = new Date();

    // Gradual transition from current to projected over 7 days
    for (let i = 1; i <= days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);

      const transitionFactor = Math.min(i / 7, 1);

      const dailyValues = {};
      for (const key of Object.keys(simulatedDaily)) {
        if (currentAverages[key] != null && simulatedDaily[key] != null) {
          dailyValues[key] = currentAverages[key] + (simulatedDaily[key] - currentAverages[key]) * transitionFactor;
        }
      }

      // Add some variance for realism
      const variance = 0.95 + Math.random() * 0.1;
      const score = HealthScoreCalculator.calculate({
        ...dailyValues,
        mood: dailyValues.mood ? Math.round(dailyValues.mood * variance) : 5,
      });

      projections.push({
        date,
        day: i,
        healthScore: Math.round(score.healthScore * variance),
        breakdown: score.breakdown,
      });
    }

    return projections;
  }

  static _projectWeight(historicalLogs, simulatedDaily, days) {
    const weightLogs = historicalLogs.filter((l) => l.weight);
    if (weightLogs.length < 2) return [];

    const regressionData = weightLogs.map((l, i) => ({ x: i, y: l.weight }));
    const regression = linearRegression(regressionData);

    // Adjust trend based on calorie intake vs baseline
    const avgCalories = simulatedDaily.calories || 2000;
    const avgExercise = simulatedDaily.exerciseDuration || 30;
    const calorieAdjustment = (2000 - avgCalories) * 0.001;
    const exerciseAdjustment = avgExercise * 0.002;
    const dailyWeightChange = regression.slope + calorieAdjustment + exerciseAdjustment;

    const projections = [];
    const today = new Date();
    const lastWeight = weightLogs[weightLogs.length - 1].weight;

    for (let i = 1; i <= days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      projections.push({
        date,
        day: i,
        value: Math.round((lastWeight + dailyWeightChange * i) * 10) / 10,
      });
    }

    return projections;
  }
}

module.exports = FutureSimulationEngine;
