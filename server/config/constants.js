module.exports = {
  // Health Score Weights
  HEALTH_SCORE_WEIGHTS: {
    sleep: 0.25,
    activity: 0.25,
    nutrition: 0.20,
    hydration: 0.10,
    heartRate: 0.10,
    mood: 0.10,
  },

  // Optimal ranges for scoring
  OPTIMAL_RANGES: {
    sleep: { min: 7, max: 9, unit: 'hours' },
    steps: { min: 7500, max: 12000, unit: 'steps' },
    calories: { min: 1800, max: 2500, unit: 'kcal' },
    waterIntake: { min: 2.5, max: 3.5, unit: 'liters' },
    exerciseDuration: { min: 30, max: 90, unit: 'minutes' },
    heartRate: { min: 60, max: 100, unit: 'bpm' },
    mood: { min: 7, max: 10, unit: 'score' },
  },

  // Achievement definitions
  ACHIEVEMENTS: {
    streak_7: {
      key: 'streak_7',
      name: '7 Day Streak',
      description: 'Logged health data for 7 consecutive days',
      icon: '🔥',
      category: 'streak',
      requirement: { type: 'streak', value: 7 },
    },
    streak_30: {
      key: 'streak_30',
      name: '30 Day Streak',
      description: 'Logged health data for 30 consecutive days',
      icon: '⚡',
      category: 'streak',
      requirement: { type: 'streak', value: 30 },
    },
    streak_100: {
      key: 'streak_100',
      name: '100 Day Streak',
      description: 'Logged health data for 100 consecutive days',
      icon: '💎',
      category: 'streak',
      requirement: { type: 'streak', value: 100 },
    },
    health_warrior: {
      key: 'health_warrior',
      name: 'Health Warrior',
      description: 'Achieved a health score of 80+ for 7 consecutive days',
      icon: '🛡️',
      category: 'fitness',
      requirement: { type: 'healthScore', value: 80, days: 7 },
    },
    fitness_master: {
      key: 'fitness_master',
      name: 'Fitness Master',
      description: 'Completed 10,000+ steps for 14 consecutive days',
      icon: '🏆',
      category: 'fitness',
      requirement: { type: 'steps', value: 10000, days: 14 },
    },
    hydration_hero: {
      key: 'hydration_hero',
      name: 'Hydration Hero',
      description: 'Drank 3+ liters of water for 7 consecutive days',
      icon: '💧',
      category: 'nutrition',
      requirement: { type: 'waterIntake', value: 3, days: 7 },
    },
    sleep_champion: {
      key: 'sleep_champion',
      name: 'Sleep Champion',
      description: 'Slept 7-9 hours for 14 consecutive days',
      icon: '🌙',
      category: 'consistency',
      requirement: { type: 'sleep', value: 7, days: 14 },
    },
    mood_master: {
      key: 'mood_master',
      name: 'Mood Master',
      description: 'Maintained mood score 8+ for 7 consecutive days',
      icon: '😊',
      category: 'consistency',
      requirement: { type: 'mood', value: 8, days: 7 },
    },
    first_log: {
      key: 'first_log',
      name: 'First Step',
      description: 'Logged your first health entry',
      icon: '🌟',
      category: 'streak',
      requirement: { type: 'totalLogs', value: 1 },
    },
    level_5: {
      key: 'level_5',
      name: 'Rising Star',
      description: 'Reached Level 5',
      icon: '⭐',
      category: 'consistency',
      requirement: { type: 'level', value: 5 },
    },
  },

  // Leveling system
  LEVEL_THRESHOLDS: [
    0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 3800,
    4700, 5700, 6800, 8000, 9300, 10700, 12200, 13800, 15500, 17300,
  ],

  XP_PER_LOG: 25,
  XP_PER_STREAK_DAY: 10,
  XP_PER_ACHIEVEMENT: 50,

  // Risk thresholds
  RISK_THRESHOLDS: {
    burnout: { sleepBelow: 5, exerciseAbove: 120, moodBelow: 4 },
    dehydration: { waterBelow: 1.5 },
    sedentary: { stepsBelow: 3000 },
    overtraining: { exerciseAbove: 150, consecutiveDays: 5 },
  },
};
