const jwt = require('jsonwebtoken');

function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
}

function generateRefreshToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d',
  });
}

function normalizeDate(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getDaysBetween(date1, date2) {
  const d1 = normalizeDate(date1);
  const d2 = normalizeDate(date2);
  return Math.round(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

module.exports = {
  generateToken,
  generateRefreshToken,
  normalizeDate,
  getDaysBetween,
  clamp,
  lerp,
};
