const { RISK_THRESHOLDS } = require('../config/constants');

/**
 * Risk Detection Engine
 * Identifies health risks based on patterns in user data.
 */

class RiskDetectionEngine {
  /**
   * Detect all risks from recent health logs.
   * @param {Array} logs - Recent health logs (last 7-14 days), newest first
   * @returns {Array} Detected risk factors
   */
  static detectRisks(logs) {
    if (!logs || logs.length === 0) return [];

    const risks = [];

    risks.push(...this.detectBurnoutRisk(logs));
    risks.push(...this.detectDehydrationRisk(logs));
    risks.push(...this.detectSedentaryRisk(logs));
    risks.push(...this.detectOvertTrainingRisk(logs));
    risks.push(...this.detectPoorSleepRisk(logs));
    risks.push(...this.detectLowMoodRisk(logs));

    return risks;
  }

  static detectBurnoutRisk(logs) {
    const risks = [];
    const recent = logs.slice(0, 7);
    const { burnout } = RISK_THRESHOLDS;

    const lowSleepDays = recent.filter((l) => l.sleep < burnout.sleepBelow).length;
    const highExerciseDays = recent.filter((l) => l.exerciseDuration > burnout.exerciseAbove).length;
    const lowMoodDays = recent.filter((l) => l.mood < burnout.moodBelow).length;

    if (lowSleepDays >= 3 && lowMoodDays >= 3) {
      risks.push({
        type: 'burnout',
        severity: lowSleepDays >= 5 && lowMoodDays >= 5 ? 'high' : 'medium',
        description: `Burnout risk detected: ${lowSleepDays} days of low sleep and ${lowMoodDays} days of low mood in the past week. Consider reducing workload and prioritizing rest.`,
      });
    }

    if (lowSleepDays >= 3 && highExerciseDays >= 3) {
      risks.push({
        type: 'burnout',
        severity: 'medium',
        description: `You're exercising intensely (${highExerciseDays} days over ${burnout.exerciseAbove} min) while sleeping poorly (${lowSleepDays} days under ${burnout.sleepBelow}h). This pattern increases burnout risk.`,
      });
    }

    return risks;
  }

  static detectDehydrationRisk(logs) {
    const risks = [];
    const recent = logs.slice(0, 7);
    const { dehydration } = RISK_THRESHOLDS;

    const lowWaterDays = recent.filter((l) => l.waterIntake < dehydration.waterBelow).length;

    if (lowWaterDays >= 4) {
      risks.push({
        type: 'dehydration',
        severity: lowWaterDays >= 6 ? 'high' : 'medium',
        description: `Dehydration risk: You've had low water intake (under ${dehydration.waterBelow}L) for ${lowWaterDays} of the past 7 days. Aim for at least 2.5L daily.`,
      });
    }

    return risks;
  }

  static detectSedentaryRisk(logs) {
    const risks = [];
    const recent = logs.slice(0, 7);
    const { sedentary } = RISK_THRESHOLDS;

    const lowStepDays = recent.filter((l) => l.steps < sedentary.stepsBelow).length;

    if (lowStepDays >= 5) {
      risks.push({
        type: 'sedentary',
        severity: lowStepDays === 7 ? 'high' : 'medium',
        description: `Sedentary lifestyle detected: ${lowStepDays} of 7 days with under ${sedentary.stepsBelow} steps. Try to incorporate more movement into your routine.`,
      });
    }

    return risks;
  }

  static detectOvertTrainingRisk(logs) {
    const risks = [];
    const recent = logs.slice(0, 7);
    const { overtraining } = RISK_THRESHOLDS;

    const highExerciseDays = recent.filter(
      (l) => l.exerciseDuration > overtraining.exerciseAbove
    ).length;

    if (highExerciseDays >= overtraining.consecutiveDays) {
      risks.push({
        type: 'overtraining',
        severity: highExerciseDays >= 6 ? 'high' : 'medium',
        description: `Overtraining risk: ${highExerciseDays} days of intense exercise (${overtraining.exerciseAbove}+ minutes) without adequate rest. Include recovery days.`,
      });
    }

    return risks;
  }

  static detectPoorSleepRisk(logs) {
    const risks = [];
    const recent = logs.slice(0, 7);

    const poorSleepDays = recent.filter((l) => l.sleep < 6).length;
    const avgSleep = recent.reduce((sum, l) => sum + l.sleep, 0) / recent.length;

    if (poorSleepDays >= 5 || avgSleep < 5.5) {
      risks.push({
        type: 'poor_sleep',
        severity: avgSleep < 5 ? 'high' : 'medium',
        description: `Chronic sleep deficit detected: Average ${avgSleep.toFixed(1)} hours over the past week. This impacts recovery, mood, and cognitive function.`,
      });
    }

    return risks;
  }

  static detectLowMoodRisk(logs) {
    const risks = [];
    const recent = logs.slice(0, 7);

    const lowMoodDays = recent.filter((l) => l.mood <= 3).length;
    const avgMood = recent.reduce((sum, l) => sum + l.mood, 0) / recent.length;

    if (lowMoodDays >= 4 || avgMood < 3.5) {
      risks.push({
        type: 'low_mood',
        severity: avgMood < 3 ? 'high' : 'medium',
        description: `Persistent low mood detected: Average mood ${avgMood.toFixed(1)}/10 over the past week. Consider engaging in activities you enjoy or seeking support.`,
      });
    }

    return risks;
  }

  /**
   * Calculate overall risk level.
   */
  static getOverallRiskLevel(risks) {
    if (risks.some((r) => r.severity === 'high')) return 'high';
    if (risks.some((r) => r.severity === 'medium')) return 'medium';
    if (risks.length > 0) return 'low';
    return 'none';
  }
}

module.exports = RiskDetectionEngine;
