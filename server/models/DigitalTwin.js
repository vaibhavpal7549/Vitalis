const mongoose = require('mongoose');

const digitalTwinSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    healthScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 50,
    },
    fitnessScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 50,
    },
    sleepScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 50,
    },
    nutritionScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 50,
    },
    consistencyScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    riskFactors: [
      {
        type: {
          type: String,
          enum: ['burnout', 'dehydration', 'sedentary', 'overtraining', 'poor_sleep', 'low_mood'],
        },
        severity: {
          type: String,
          enum: ['low', 'medium', 'high'],
        },
        description: String,
      },
    ],
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    history: [
      {
        date: { type: Date, default: Date.now },
        healthScore: Number,
        fitnessScore: Number,
        sleepScore: Number,
        nutritionScore: Number,
        consistencyScore: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Note: userId index created by unique:true in field definition

module.exports = mongoose.model('DigitalTwin', digitalTwinSchema);
