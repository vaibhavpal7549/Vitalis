const { simpleMovingAverage, exponentialMovingAverage } = require('../utils/movingAverage');
const { linearRegression } = require('../utils/linearRegression');

/**
 * Trend Analysis Engine
 * Analyzes health metrics over time to detect patterns and trends.
 */

class TrendAnalysisEngine {
  /**
   * Analyze trends for a specific metric across health logs.
   * @param {Array} logs - Sorted health logs (oldest to newest)
   * @param {string} metric - Metric name (e.g., 'sleep', 'steps', 'healthScore')
   * @returns {Object} Trend analysis results
   */
  static analyzeTrend(logs, metric) {
    const values = logs.map((log) => log[metric]).filter((v) => v != null);
    if (values.length < 3) {
      return {
        direction: 'insufficient_data',
        average: values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0,
        sma7: [],
        sma30: [],
        rateOfChange: 0,
      };
    }

    // Moving averages
    const sma7 = simpleMovingAverage(values, Math.min(7, values.length));
    const sma30 = simpleMovingAverage(values, Math.min(30, values.length));
    const ema = exponentialMovingAverage(values, 0.3);

    // Linear regression for trend direction
    const regressionData = values.map((v, i) => ({ x: i, y: v }));
    const regression = linearRegression(regressionData);

    // Rate of change (per day)
    const rateOfChange = regression.slope;

    // Determine direction
    let direction;
    const threshold = 0.05 * (values.reduce((a, b) => a + b, 0) / values.length);
    if (Math.abs(rateOfChange) < threshold) {
      direction = 'stable';
    } else {
      direction = rateOfChange > 0 ? 'improving' : 'declining';
    }

    // For metrics where lower is better (like heartRate in resting), invert
    if (metric === 'heartRate') {
      direction = direction === 'improving' ? 'declining' : direction === 'declining' ? 'improving' : 'stable';
    }

    // Anomaly detection: values outside 2 standard deviations
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length);
    const anomalies = values
      .map((v, i) => ({ index: i, value: v, date: logs[i]?.date }))
      .filter((item) => Math.abs(item.value - mean) > 2 * stdDev);

    return {
      direction,
      average: Math.round(mean * 100) / 100,
      current: values[values.length - 1],
      min: Math.min(...values),
      max: Math.max(...values),
      sma7,
      sma30,
      ema,
      rateOfChange: Math.round(rateOfChange * 1000) / 1000,
      regression: {
        slope: regression.slope,
        intercept: regression.intercept,
        r2: regression.r2,
      },
      anomalies,
      dataPoints: values.length,
    };
  }

  /**
   * Analyze all metrics for a user's logs.
   */
  static analyzeAll(logs) {
    const metrics = ['sleep', 'waterIntake', 'steps', 'calories', 'exerciseDuration', 'weight', 'heartRate', 'mood', 'healthScore'];
    const analysis = {};

    for (const metric of metrics) {
      analysis[metric] = this.analyzeTrend(logs, metric);
    }

    return analysis;
  }

  /**
   * Get a summary of all trends.
   */
  static getSummary(logs) {
    const analysis = this.analyzeAll(logs);
    const improving = [];
    const declining = [];
    const stable = [];

    for (const [metric, data] of Object.entries(analysis)) {
      if (data.direction === 'improving') improving.push(metric);
      else if (data.direction === 'declining') declining.push(metric);
      else if (data.direction === 'stable') stable.push(metric);
    }

    return { analysis, improving, declining, stable };
  }
}

module.exports = TrendAnalysisEngine;
