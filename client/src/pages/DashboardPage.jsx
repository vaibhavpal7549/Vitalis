import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { healthAPI, twinAPI } from '../api';
import {
  HiOutlineMoon, HiOutlineFire, HiOutlineHeart,
  HiOutlineScale, HiOutlineEmojiHappy, HiOutlineTrendingUp,
} from 'react-icons/hi';
import { GiWaterDrop, GiRunningShoe } from 'react-icons/gi';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function ScoreRing({ score, size = 120, strokeWidth = 8, color = '#3b82f6' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} fill="none" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={strokeWidth}
          fill="none" strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          strokeDasharray={circumference}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-3xl font-bold text-white"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {score}
        </motion.span>
        <span className="text-[10px] text-surface-400 uppercase tracking-wider">Score</span>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, unit, color, gradient, progress }) {
  return (
    <motion.div variants={item} className="metric-card group">
      <div className={`absolute top-0 left-0 w-full h-1 ${gradient}`} />
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        {progress !== undefined && (
          <span className="text-xs text-surface-400">{Math.round(progress)}%</span>
        )}
      </div>
      <motion.p
        className="text-2xl font-bold text-white mb-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {value !== null && value !== undefined ? value : '--'}
        {unit && <span className="text-sm font-normal text-surface-400 ml-1">{unit}</span>}
      </motion.p>
      <p className="text-sm text-surface-400">{label}</p>
      {progress !== undefined && (
        <div className="progress-bar mt-3">
          <motion.div
            className={`progress-bar-fill ${gradient}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
          />
        </div>
      )}
    </motion.div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [todayLog, setTodayLog] = useState(null);
  const [twin, setTwin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [logRes, twinRes] = await Promise.all([
          healthAPI.getTodayLog(),
          twinAPI.getTwin(),
        ]);
        setTodayLog(logRes.data.log);
        setTwin(twinRes.data.twin);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton h-40" />
          ))}
        </div>
      </div>
    );
  }

  const log = todayLog || {};

  const metrics = [
    {
      icon: HiOutlineMoon, label: 'Sleep', value: log.sleep, unit: 'hrs',
      color: 'bg-vitalis-purple/20 text-vitalis-purple',
      gradient: 'bg-gradient-to-r from-vitalis-purple to-primary-500',
      progress: log.sleep ? (log.sleep / 9) * 100 : 0,
    },
    {
      icon: GiRunningShoe, label: 'Steps', value: log.steps?.toLocaleString(), unit: '',
      color: 'bg-vitalis-green/20 text-vitalis-green',
      gradient: 'bg-gradient-to-r from-vitalis-green to-accent-400',
      progress: log.steps ? (log.steps / 10000) * 100 : 0,
    },
    {
      icon: HiOutlineFire, label: 'Calories', value: log.calories, unit: 'kcal',
      color: 'bg-vitalis-orange/20 text-vitalis-orange',
      gradient: 'bg-gradient-to-r from-vitalis-orange to-vitalis-pink',
      progress: log.calories ? (log.calories / 2500) * 100 : 0,
    },
    {
      icon: GiWaterDrop, label: 'Water', value: log.waterIntake, unit: 'L',
      color: 'bg-vitalis-cyan/20 text-vitalis-cyan',
      gradient: 'bg-gradient-to-r from-vitalis-cyan to-vitalis-blue',
      progress: log.waterIntake ? (log.waterIntake / 3) * 100 : 0,
    },
    {
      icon: HiOutlineTrendingUp, label: 'Exercise', value: log.exerciseDuration, unit: 'min',
      color: 'bg-vitalis-pink/20 text-vitalis-pink',
      gradient: 'bg-gradient-to-r from-vitalis-pink to-vitalis-purple',
      progress: log.exerciseDuration ? (log.exerciseDuration / 60) * 100 : 0,
    },
    {
      icon: HiOutlineScale, label: 'Weight', value: log.weight, unit: 'kg',
      color: 'bg-surface-400/20 text-surface-300',
      gradient: 'bg-gradient-to-r from-surface-400 to-surface-500',
    },
    {
      icon: HiOutlineHeart, label: 'Heart Rate', value: log.heartRate, unit: 'bpm',
      color: 'bg-vitalis-red/20 text-vitalis-red',
      gradient: 'bg-gradient-to-r from-vitalis-red to-vitalis-pink',
    },
    {
      icon: HiOutlineEmojiHappy, label: 'Mood', value: log.mood, unit: '/10',
      color: 'bg-vitalis-orange/20 text-vitalis-orange',
      gradient: 'bg-gradient-to-r from-vitalis-orange to-vitalis-green',
      progress: log.mood ? (log.mood / 10) * 100 : 0,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl md:text-3xl font-bold text-white"
          >
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
            <span className="gradient-text">{user?.name?.split(' ')[0]}</span>
          </motion.h1>
          <p className="text-surface-400 mt-1">
            {todayLog ? 'Here\'s your health summary for today' : 'No data logged today. Start by logging your health!'}
          </p>
        </div>

        {/* Streak & Level */}
        <div className="flex gap-3">
          <div className="glass-card px-4 py-2 flex items-center gap-2">
            <span className="text-lg">🔥</span>
            <div>
              <p className="text-lg font-bold text-white">{user?.streak?.current || 0}</p>
              <p className="text-[10px] text-surface-400 uppercase">Streak</p>
            </div>
          </div>
          <div className="glass-card px-4 py-2 flex items-center gap-2">
            <span className="text-lg">⭐</span>
            <div>
              <p className="text-lg font-bold text-white">Lv.{user?.level?.current || 1}</p>
              <p className="text-[10px] text-surface-400 uppercase">Level</p>
            </div>
          </div>
        </div>
      </div>

      {/* Health Score + Twin Scores */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="glass-card p-8 flex flex-col items-center justify-center"
        >
          <p className="text-sm text-surface-400 mb-4 uppercase tracking-wider">Health Score</p>
          <ScoreRing score={twin?.healthScore || 0} size={140} color="#3b82f6" />
          <p className="text-xs text-surface-400 mt-4">
            {twin?.healthScore >= 80 ? '🌟 Excellent!' : twin?.healthScore >= 60 ? '👍 Good' : twin?.healthScore >= 40 ? '⚠️ Needs Improvement' : '🔴 Critical'}
          </p>
        </motion.div>

        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Fitness', score: twin?.fitnessScore || 0, color: '#10b981' },
            { label: 'Sleep', score: twin?.sleepScore || 0, color: '#8b5cf6' },
            { label: 'Nutrition', score: twin?.nutritionScore || 0, color: '#f59e0b' },
            { label: 'Consistency', score: twin?.consistencyScore || 0, color: '#06b6d4' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="glass-card p-4 flex flex-col items-center"
            >
              <ScoreRing score={s.score} size={80} strokeWidth={6} color={s.color} />
              <p className="text-xs text-surface-400 mt-2">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Metric cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {metrics.map((m) => (
          <MetricCard key={m.label} {...m} />
        ))}
      </motion.div>

      {/* Risk Alerts */}
      {twin?.riskFactors?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            ⚠️ Risk Alerts
          </h3>
          <div className="space-y-3">
            {twin.riskFactors.map((risk, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-xl ${
                  risk.severity === 'high' ? 'bg-vitalis-red/10 border border-vitalis-red/20' :
                  risk.severity === 'medium' ? 'bg-vitalis-orange/10 border border-vitalis-orange/20' :
                  'bg-vitalis-blue/10 border border-vitalis-blue/20'
                }`}
              >
                <span className={`badge ${
                  risk.severity === 'high' ? 'badge-danger' : risk.severity === 'medium' ? 'badge-warning' : 'badge-info'
                }`}>
                  {risk.severity}
                </span>
                <p className="text-sm text-surface-300">{risk.description}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
