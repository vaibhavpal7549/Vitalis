require('dotenv').config();

// Configure DNS to use Google DNS for SRV record resolution (MongoDB Atlas)
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const HealthLog = require('../models/HealthLog');
const Achievement = require('../models/Achievement');
const DigitalTwin = require('../models/DigitalTwin');
const HealthScoreCalculator = require('../services/healthScoreCalculator');
const { normalizeDate } = require('../utils/helpers');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vitalis';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      HealthLog.deleteMany({}),
      Achievement.deleteMany({}),
      DigitalTwin.deleteMany({}),
    ]);
    console.log('Cleared existing data.');

    // Create demo user
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('demo123456', salt);

    const demoUser = await User.create({
      name: 'Alex Johnson',
      email: 'demo@vitalis.ai',
      password: hashedPassword,
      role: 'user',
      profile: {
        age: 28,
        gender: 'male',
        height: 178,
        targetWeight: 75,
        activityLevel: 'moderate',
      },
      streak: { current: 0, longest: 0 },
      level: { current: 1, xp: 0 },
    });

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123456', salt);
    await User.create({
      name: 'Admin',
      email: 'admin@vitalis.ai',
      password: adminPassword,
      role: 'admin',
      profile: { age: 30, gender: 'male', height: 180, activityLevel: 'active' },
      streak: { current: 0, longest: 0 },
      level: { current: 1, xp: 0 },
    });

    console.log('Created demo user (demo@vitalis.ai / demo123456)');
    console.log('Created admin user (admin@vitalis.ai / admin123456)');

    // Generate 30 days of health logs
    const logs = [];
    const today = new Date();
    let baseWeight = 82;

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      // Simulate realistic variation
      const sleep = Math.round((6.5 + Math.random() * 2.5 + (isWeekend ? 0.5 : 0)) * 10) / 10;
      const steps = Math.round(4000 + Math.random() * 8000 + (isWeekend ? -1000 : 1000));
      const calories = Math.round(1600 + Math.random() * 1000 + (isWeekend ? 200 : 0));
      const waterIntake = Math.round((1.5 + Math.random() * 2.5) * 10) / 10;
      const exerciseDuration = Math.round(isWeekend ? 20 + Math.random() * 40 : 10 + Math.random() * 60);
      const heartRate = Math.round(60 + Math.random() * 30);
      const mood = Math.round(4 + Math.random() * 6);

      // Gradual weight trend
      baseWeight -= 0.03 + Math.random() * 0.04;
      const weight = Math.round(baseWeight * 10) / 10;

      const logData = { sleep, steps, calories, waterIntake, exerciseDuration, weight, heartRate, mood };
      const scoreResult = HealthScoreCalculator.calculate(logData);

      logs.push({
        userId: demoUser._id,
        date: normalizeDate(date),
        ...logData,
        healthScore: scoreResult.healthScore,
      });
    }

    await HealthLog.insertMany(logs);
    console.log(`Created ${logs.length} health log entries.`);

    // Update user streak
    demoUser.streak.current = 30;
    demoUser.streak.longest = 30;
    demoUser.streak.lastLogDate = normalizeDate(today);
    demoUser.level.xp = 30 * 25 + 29 * 10; // XP_PER_LOG * 30 + XP_PER_STREAK_DAY * 29
    demoUser.level.current = 4;
    await demoUser.save();

    // Create achievements
    await Achievement.create({
      userId: demoUser._id,
      achievements: [
        {
          key: 'first_log',
          name: 'First Step',
          description: 'Logged your first health entry',
          icon: '🌟',
          category: 'streak',
          unlockedAt: new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000),
        },
        {
          key: 'streak_7',
          name: '7 Day Streak',
          description: 'Logged health data for 7 consecutive days',
          icon: '🔥',
          category: 'streak',
          unlockedAt: new Date(today.getTime() - 22 * 24 * 60 * 60 * 1000),
        },
        {
          key: 'streak_30',
          name: '30 Day Streak',
          description: 'Logged health data for 30 consecutive days',
          icon: '⚡',
          category: 'streak',
          unlockedAt: today,
        },
      ],
    });

    // Create digital twin
    const DigitalTwinBuilder = require('../services/digitalTwinBuilder');
    await DigitalTwinBuilder.buildTwin(demoUser._id);

    console.log('Created achievements and digital twin.');
    console.log('\n✅ Seeding complete!');
    console.log('\n📋 Login credentials:');
    console.log('   User:  demo@vitalis.ai / demo123456');
    console.log('   Admin: admin@vitalis.ai / admin123456\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
