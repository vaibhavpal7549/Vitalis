/**
 * Moving Average calculations for trend smoothing.
 */

function simpleMovingAverage(data, windowSize) {
  if (data.length < windowSize) return data;

  const result = [];
  for (let i = windowSize - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < windowSize; j++) {
      sum += data[i - j];
    }
    result.push(sum / windowSize);
  }
  return result;
}

function exponentialMovingAverage(data, alpha = 0.3) {
  if (data.length === 0) return [];

  const result = [data[0]];
  for (let i = 1; i < data.length; i++) {
    result.push(alpha * data[i] + (1 - alpha) * result[i - 1]);
  }
  return result;
}

function weightedMovingAverage(data, windowSize) {
  if (data.length < windowSize) return data;

  const result = [];
  const weightSum = (windowSize * (windowSize + 1)) / 2;

  for (let i = windowSize - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < windowSize; j++) {
      sum += data[i - j] * (windowSize - j);
    }
    result.push(sum / weightSum);
  }
  return result;
}

module.exports = {
  simpleMovingAverage,
  exponentialMovingAverage,
  weightedMovingAverage,
};
