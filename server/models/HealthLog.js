const mongoose = require('mongoose');

const healthLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
    },
    sleep: {
      type: Number,
      min: 0,
      max: 24,
      default: 0,
    },
    waterIntake: {
      type: Number,
      min: 0,
      max: 20,
      default: 0,
    },
    steps: {
      type: Number,
      min: 0,
      max: 100000,
      default: 0,
    },
    calories: {
      type: Number,
      min: 0,
      max: 10000,
      default: 0,
    },
    exerciseDuration: {
      type: Number,
      min: 0,
      max: 600,
      default: 0,
    },
    weight: {
      type: Number,
      min: 20,
      max: 500,
    },
    heartRate: {
      type: Number,
      min: 30,
      max: 250,
      default: 72,
    },
    mood: {
      type: Number,
      min: 1,
      max: 10,
      default: 5,
    },
    healthScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: one log per user per day
healthLogSchema.index({ userId: 1, date: -1 }, { unique: true });

module.exports = mongoose.model('HealthLog', healthLogSchema);
