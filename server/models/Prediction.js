const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    predictions: {
      weight30Days: Number,
      fitnessTrend: {
        type: String,
        enum: ['improving', 'stable', 'declining'],
      },
      sleepQualityTrend: {
        type: String,
        enum: ['improving', 'stable', 'declining'],
      },
      unhealthyHabitRisk: {
        type: Number,
        min: 0,
        max: 100,
      },
      estimatedHealthScore30Days: Number,
    },
    chartData: {
      weightProjection: [
        {
          date: Date,
          value: Number,
        },
      ],
      healthScoreProjection: [
        {
          date: Date,
          value: Number,
        },
      ],
      fitnessProjection: [
        {
          date: Date,
          value: Number,
        },
      ],
    },
    recommendations: [
      {
        text: String,
        impact: String,
        category: {
          type: String,
          enum: ['sleep', 'activity', 'nutrition', 'hydration', 'heartRate', 'mood'],
        },
        reasoning: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

predictionSchema.index({ userId: 1, generatedAt: -1 });

module.exports = mongoose.model('Prediction', predictionSchema);
