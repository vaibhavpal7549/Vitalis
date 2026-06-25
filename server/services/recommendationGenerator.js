const { OPTIMAL_RANGES } = require('../config/constants');
const HealthScoreCalculator = require('./healthScoreCalculator');

/**
 * Recommendation Generator
 * Generates personalized, quantified health recommendations with explainable AI.
 */

class RecommendationGenerator {
  /**
   * Generate recommendations based on user's recent health data.
   * @param {Array} recentLogs - Last 7 days of health logs
   * @param {Object} twinScores - Digital twin scores
   * @returns {Array} Prioritized recommendations
   */
  static generate(recentLogs, twinScores) {
    if (!recentLogs || recentLogs.length === 0) return [];

    const recommendations = [];
    const averages = this._calculateAverages(recentLogs);

    recommendations.push(...this._sleepRecommendations(averages, twinScores));
    recommendations.push(...this._activityRecommendations(averages, twinScores));
    recommendations.push(...this._nutritionRecommendations(averages, twinScores));
    recommendations.push(...this._hydrationRecommendations(averages, twinScores));
    recommendations.push(...this._moodRecommendations(averages, twinScores));
    recommendations.push(...this._heartRateRecommendations(averages, twinScores));

    // Sort by estimated impact (descending)
    recommendations.sort((a, b) => b.impactValue - a.impactValue);

    return recommendations.slice(0, 8);
  }

  static _calculateAverages(logs) {
    const n = logs.length;
    return {
      sleep: logs.reduce((s, l) => s + l.sleep, 0) / n,
      steps: logs.reduce((s, l) => s + l.steps, 0) / n,
      calories: logs.reduce((s, l) => s + l.calories, 0) / n,
      waterIntake: logs.reduce((s, l) => s + l.waterIntake, 0) / n,
      exerciseDuration: logs.reduce((s, l) => s + l.exerciseDuration, 0) / n,
      mood: logs.reduce((s, l) => s + l.mood, 0) / n,
      heartRate: logs.reduce((s, l) => s + l.heartRate, 0) / n,
      weight: logs.filter((l) => l.weight).reduce((s, l) => s + l.weight, 0) / (logs.filter((l) => l.weight).length || 1),
    };
  }

  static _sleepRecommendations(avg, scores) {
    const recs = [];
    const { min: optMin } = OPTIMAL_RANGES.sleep;

    if (avg.sleep < optMin) {
      const deficit = optMin - avg.sleep;
      const improvementHours = Math.min(deficit, 2);
      const currentScore = HealthScoreCalculator.calculateSleepScore(avg.sleep);
      const projectedScore = HealthScoreCalculator.calculateSleepScore(avg.sleep + improvementHours);
      const impact = Math.round((projectedScore - currentScore) * 0.25);

      recs.push({
        text: `Increase your sleep by ${improvementHours.toFixed(1)} hour${improvementHours > 1 ? 's' : ''} to reach the optimal ${optMin} hours. Your health score may improve by ~${impact}%.`,
        impact: `+${impact}% health score`,
        impactValue: impact,
        category: 'sleep',
        reasoning: `Your average sleep is ${avg.sleep.toFixed(1)}h, which is ${deficit.toFixed(1)}h below the recommended minimum of ${optMin}h. Sleep contributes 25% to your overall health score. Improving sleep quality boosts recovery, mood, and cognitive performance.`,
      });
    }

    if (avg.sleep > OPTIMAL_RANGES.sleep.max + 1) {
      recs.push({
        text: `You're averaging ${avg.sleep.toFixed(1)} hours of sleep. Try to target 7-9 hours — excessive sleep can indicate underlying health issues.`,
        impact: 'Better energy levels',
        impactValue: 5,
        category: 'sleep',
        reasoning: `Sleeping more than ${OPTIMAL_RANGES.sleep.max + 1} hours regularly is associated with lethargy and may indicate sleep quality issues. Consistent 7-9 hour sleep is ideal.`,
      });
    }

    return recs;
  }

  static _activityRecommendations(avg, scores) {
    const recs = [];
    const { min: stepTarget } = OPTIMAL_RANGES.steps;
    const { min: exerciseTarget } = OPTIMAL_RANGES.exerciseDuration;

    if (avg.steps < stepTarget) {
      const deficit = stepTarget - avg.steps;
      const addSteps = Math.min(deficit, 3000);
      const impact = Math.round((addSteps / stepTarget) * 25 * 0.6);

      recs.push({
        text: `Walking ${addSteps.toLocaleString()} more steps daily can improve your fitness score by ~${impact}%.`,
        impact: `+${impact}% fitness score`,
        impactValue: impact,
        category: 'activity',
        reasoning: `Your average daily steps (${Math.round(avg.steps).toLocaleString()}) are ${Math.round(deficit).toLocaleString()} below the target of ${stepTarget.toLocaleString()}. Steps contribute 60% of your activity score, which makes up 25% of your total health score.`,
      });
    }

    if (avg.exerciseDuration < exerciseTarget) {
      const deficit = exerciseTarget - avg.exerciseDuration;
      const impact = Math.round((deficit / exerciseTarget) * 25 * 0.4);

      recs.push({
        text: `Add ${Math.round(deficit)} more minutes of exercise daily to reach the ${exerciseTarget}-minute target.`,
        impact: `+${impact}% activity score`,
        impactValue: impact,
        category: 'activity',
        reasoning: `You're averaging ${Math.round(avg.exerciseDuration)} minutes of exercise, ${Math.round(deficit)} minutes short of the ${exerciseTarget}-minute daily target. Regular exercise improves cardiovascular health and energy levels.`,
      });
    }

    return recs;
  }

  static _nutritionRecommendations(avg, scores) {
    const recs = [];
    const { min, max } = OPTIMAL_RANGES.calories;

    if (avg.calories < min) {
      recs.push({
        text: `You're consuming ${Math.round(avg.calories)} kcal on average. Aim for ${min}-${max} kcal for optimal energy and recovery.`,
        impact: '+5-10% nutrition score',
        impactValue: 7,
        category: 'nutrition',
        reasoning: `Under-eating (${Math.round(avg.calories)} kcal vs. minimum ${min} kcal) can lead to muscle loss, fatigue, and nutrient deficiencies. Nutrition accounts for 20% of your health score.`,
      });
    } else if (avg.calories > max) {
      const excess = avg.calories - max;
      recs.push({
        text: `Reduce daily calorie intake by ~${Math.round(excess)} kcal to stay within the optimal range of ${min}-${max} kcal.`,
        impact: 'Better weight management',
        impactValue: 6,
        category: 'nutrition',
        reasoning: `Your average intake of ${Math.round(avg.calories)} kcal exceeds the recommended maximum by ${Math.round(excess)} kcal. This could lead to gradual weight gain over time.`,
      });
    }

    return recs;
  }

  static _hydrationRecommendations(avg, scores) {
    const recs = [];
    const { min } = OPTIMAL_RANGES.waterIntake;

    if (avg.waterIntake < min) {
      const deficit = min - avg.waterIntake;
      const impact = Math.round((deficit / min) * 10);

      recs.push({
        text: `Drink ${deficit.toFixed(1)}L more water daily to improve recovery and energy. Current: ${avg.waterIntake.toFixed(1)}L, Target: ${min}L.`,
        impact: `+${impact}% hydration score`,
        impactValue: impact,
        category: 'hydration',
        reasoning: `Your average water intake (${avg.waterIntake.toFixed(1)}L) is ${deficit.toFixed(1)}L below the recommended ${min}L. Dehydration affects cognitive function, energy, and exercise performance. Hydration contributes 10% to your health score.`,
      });
    }

    return recs;
  }

  static _moodRecommendations(avg, scores) {
    const recs = [];

    if (avg.mood < 5) {
      recs.push({
        text: 'Your mood has been consistently low. Try incorporating a 20-minute walk, meditation, or a hobby into your daily routine.',
        impact: '+5-8% mood score',
        impactValue: 6,
        category: 'mood',
        reasoning: `Your average mood score is ${avg.mood.toFixed(1)}/10, which is below the midpoint. Low mood correlates with reduced motivation for healthy behaviors, creating a negative feedback loop. Physical activity and social connection are evidence-based mood boosters.`,
      });
    }

    return recs;
  }

  static _heartRateRecommendations(avg, scores) {
    const recs = [];

    if (avg.heartRate > OPTIMAL_RANGES.heartRate.max) {
      recs.push({
        text: `Your average resting heart rate (${Math.round(avg.heartRate)} bpm) is elevated. Regular cardio exercise can lower it by 5-10 bpm over time.`,
        impact: 'Better cardiovascular health',
        impactValue: 5,
        category: 'heartRate',
        reasoning: `A resting heart rate above ${OPTIMAL_RANGES.heartRate.max} bpm may indicate cardiovascular stress or deconditioning. Regular aerobic exercise strengthens the heart, enabling it to pump more blood per beat at a lower rate.`,
      });
    }

    return recs;
  }
}

module.exports = RecommendationGenerator;
