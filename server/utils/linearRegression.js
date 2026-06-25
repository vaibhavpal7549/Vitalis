/**
 * Linear Regression utility for trend prediction.
 * Uses the Least Squares method.
 */

function linearRegression(data) {
  const n = data.length;
  if (n < 2) return { slope: 0, intercept: data[0]?.y || 0, predict: (x) => data[0]?.y || 0 };

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

  for (let i = 0; i < n; i++) {
    const x = data[i].x;
    const y = data[i].y;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  }

  const denominator = n * sumX2 - sumX * sumX;
  if (denominator === 0) {
    return { slope: 0, intercept: sumY / n, predict: () => sumY / n };
  }

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  return {
    slope,
    intercept,
    predict: (x) => slope * x + intercept,
    r2: calculateR2(data, slope, intercept),
  };
}

function calculateR2(data, slope, intercept) {
  const n = data.length;
  const meanY = data.reduce((sum, d) => sum + d.y, 0) / n;
  let ssRes = 0, ssTot = 0;

  for (const d of data) {
    const predicted = slope * d.x + intercept;
    ssRes += (d.y - predicted) ** 2;
    ssTot += (d.y - meanY) ** 2;
  }

  return ssTot === 0 ? 1 : 1 - ssRes / ssTot;
}

module.exports = { linearRegression };
