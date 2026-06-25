const { HEALTH_SCORE_WEIGHTS, OPTIMAL_RANGES } = require('../config/constants');
const { clamp } = require('../utils/helpers');

/**
 * Health Score Calculator
 * Calculates a composite health score (0-100) from daily metrics.
 */

class HealthScoreCalculator {
  /**
   * Calculate overall health score from a health log entry.
   */
  static calculate(log) {
    const sleepScore = this.calculateSleepScore(log.sleep);
    const activityScore = this.calculateActivityScore(log.steps, log.exerciseDuration);
    const nutritionScore = this.calculateNutritionScore(log.calories);
    const hydrationScore = this.calculateHydrationScore(log.waterIntake);
    const heartRateScore = this.calculateHeartRateScore(log.heartRate);
    const moodScore = this.calculateMoodScore(log.mood);

    const healthScore = Math.round(
      sleepScore * HEALTH_SCORE_WEIGHTS.sleep +
      activityScore * HEALTH_SCORE_WEIGHTS.activity +
      nutritionScore * HEALTH_SCORE_WEIGHTS.nutrition +
      hydrationScore * HEALTH_SCORE_WEIGHTS.hydration +
      heartRateScore * HEALTH_SCORE_WEIGHTS.heartRate +
      moodScore * HEALTH_SCORE_WEIGHTS.mood
    );

    return {
      healthScore: clamp(healthScore, 0, 100),
      breakdown: {
        sleep: Math.round(sleepScore),
        activity: Math.round(activityScore),
        nutrition: Math.round(nutritionScore),
        hydration: Math.round(hydrationScore),
        heartRate: Math.round(heartRateScore),
        mood: Math.round(moodScore),
      },
    };
  }

  static calculateSleepScore(hours) {
    if (!hours || hours <= 0) return 0;
    const { min, max } = OPTIMAL_RANGES.sleep;
    if (hours >= min && hours <= max) return 100;
    if (hours < min) {
      return clamp((hours / min) * 100, 0, 100);
    }
    // Oversleeping penalty
    const overSleep = hours - max;
    return clamp(100 - overSleep * 15, 0, 100);
  }

  static calculateActivityScore(steps = 0, exerciseMinutes = 0) {
    const stepsScore = this._rangeScore(steps, 0, OPTIMAL_RANGES.steps.min, OPTIMAL_RANGES.steps.max);
    const exerciseScore = this._rangeScore(
      exerciseMinutes, 0,
      OPTIMAL_RANGES.exerciseDuration.min,
      OPTIMAL_RANGES.exerciseDuration.max
    );
    return stepsScore * 0.6 + exerciseScore * 0.4;
  }

  static calculateNutritionScore(calories) {
    if (!calories || calories <= 0) return 0;
    const { min, max } = OPTIMAL_RANGES.calories;
    if (calories >= min && calories <= max) return 100;
    if (calories < min) {
      return clamp((calories / min) * 100, 0, 100);
    }
    const over = calories - max;
    return clamp(100 - (over / max) * 100, 0, 100);
  }

  static calculateHydrationScore(liters) {
    if (!liters || liters <= 0) return 0;
    const { min, max } = OPTIMAL_RANGES.waterIntake;
    if (liters >= min) return 100;
    return clamp((liters / min) * 100, 0, 100);
  }

  static calculateHeartRateScore(bpm) {
    if (!bpm) return 50; // neutral if not provided
    const { min, max } = OPTIMAL_RANGES.heartRate;
    if (bpm >= min && bpm <= max) {
      // Lower resting HR is better (within range)
      const midpoint = (min + max) / 2;
      if (bpm <= midpoint) return 100;
      return clamp(100 - ((bpm - midpoint) / (max - midpoint)) * 20, 80, 100);
    }
    if (bpm < min) return clamp(60 + (bpm / min) * 40, 0, 100);
    return clamp(100 - ((bpm - max) / max) * 100, 0, 100);
  }

  static calculateMoodScore(mood) {
    if (!mood) return 50;
    return clamp((mood / 10) * 100, 0, 100);
  }

  static _rangeScore(value, floor, target, ceiling) {
    if (!value || value <= floor) return 0;
    if (value >= target && value <= ceiling) return 100;
    if (value < target) return clamp((value / target) * 100, 0, 100);
    const over = value - ceiling;
    return clamp(100 - (over / ceiling) * 50, 50, 100);
  }
}

module.exports = HealthScoreCalculator;
