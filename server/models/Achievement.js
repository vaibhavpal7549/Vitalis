const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    achievements: [
      {
        key: {
          type: String,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        description: String,
        icon: String,
        unlockedAt: {
          type: Date,
          default: Date.now,
        },
        category: {
          type: String,
          enum: ['streak', 'fitness', 'nutrition', 'consistency'],
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Note: userId index created by unique:true in field definition

module.exports = mongoose.model('Achievement', achievementSchema);
