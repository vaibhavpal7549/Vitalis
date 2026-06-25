import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { twinAPI } from '../api';

function ScoreRing({ score, size = 100, strokeWidth = 6, color = '#3b82f6', label }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={size/2} cy={size/2} r={radius} stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} fill="none" />
          <motion.circle cx={size/2} cy={size/2} r={radius} stroke={color} strokeWidth={strokeWidth}
            fill="none" strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            strokeDasharray={circumference}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-white">{score}</span>
        </div>
      </div>
      {label && <span className="text-xs text-surface-400 mt-2">{label}</span>}
    </div>
  );
}

function AvatarVisualization({ twin }) {
  const hs = twin?.healthScore || 50;
  const color = hs >= 80 ? '#10b981' : hs >= 60 ? '#3b82f6' : hs >= 40 ? '#f59e0b' : '#ef4444';
  const glowIntensity = hs / 100;

  return (
    <div className="relative flex items-center justify-center py-8">
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="relative"
      >
        {/* Outer glow */}
        <div
          className="absolute inset-0 rounded-full blur-2xl"
          style={{ background: color, opacity: glowIntensity * 0.3, transform: 'scale(1.5)' }}
        />
        {/* Avatar body */}
        <div className="relative w-48 h-48 rounded-full flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${color}33, ${color}11)`, border: `2px solid ${color}44` }}>
          <div className="text-7xl">
            {hs >= 80 ? '😄' : hs >= 60 ? '🙂' : hs >= 40 ? '😐' : '😟'}
          </div>
        </div>
        {/* Health indicator ring */}
        <svg className="absolute inset-0 w-48 h-48 transform -rotate-90" viewBox="0 0 192 192">
          <circle cx="96" cy="96" r="90" stroke="rgba(255,255,255,0.05)" strokeWidth="4" fill="none" />
          <motion.circle cx="96" cy="96" r="90" stroke={color} strokeWidth="4" fill="none"
            strokeLinecap="round" strokeDasharray={2 * Math.PI * 90}
            initial={{ strokeDashoffset: 2 * Math.PI * 90 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 90 * (1 - hs / 100) }}
            transition={{ duration: 2, ease: 'easeOut' }}
          />
        </svg>
      </motion.div>
    </div>
  );
}

export default function DigitalTwinPage() {
  const [twin, setTwin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTwin();
  }, []);

  const fetchTwin = async () => {
    try {
      const { data } = await twinAPI.getTwin();
      setTwin(data.twin);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const { data } = await twinAPI.refreshTwin();
      setTwin(data.twin);
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) return <div className="space-y-4">{[...Array(4)].map((_,i) => <div key={i} className="skeleton h-32" />)}</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Your Digital Twin</h1>
          <p className="text-surface-400 mt-1">AI-powered model of your health profile</p>
        </div>
        <button onClick={handleRefresh} disabled={refreshing} className="btn-ghost text-sm">
          {refreshing ? '⏳ Updating...' : '🔄 Refresh'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Avatar */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8">
          <h3 className="text-lg font-semibold text-white text-center mb-2">Health Avatar</h3>
          <AvatarVisualization twin={twin} />
          <p className="text-center text-surface-400 text-sm">
            Your avatar reflects your overall health state
          </p>
        </motion.div>

        {/* Score breakdown */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="glass-card p-8">
          <h3 className="text-lg font-semibold text-white text-center mb-6">Twin Scores</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 justify-items-center">
            <ScoreRing score={twin?.healthScore || 0} color="#3b82f6" label="Health" />
            <ScoreRing score={twin?.fitnessScore || 0} color="#10b981" label="Fitness" />
            <ScoreRing score={twin?.sleepScore || 0} color="#8b5cf6" label="Sleep" />
            <ScoreRing score={twin?.nutritionScore || 0} color="#f59e0b" label="Nutrition" />
            <ScoreRing score={twin?.consistencyScore || 0} color="#06b6d4" label="Consistency" />
          </div>
        </motion.div>
      </div>

      {/* Risk factors */}
      {twin?.riskFactors?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">⚠️ Detected Risk Factors</h3>
          <div className="space-y-3">
            {twin.riskFactors.map((risk, i) => (
              <div key={i} className={`p-4 rounded-xl border ${
                risk.severity === 'high' ? 'bg-vitalis-red/5 border-vitalis-red/20' :
                risk.severity === 'medium' ? 'bg-vitalis-orange/5 border-vitalis-orange/20' :
                'bg-vitalis-blue/5 border-vitalis-blue/20'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`badge ${risk.severity === 'high' ? 'badge-danger' : risk.severity === 'medium' ? 'badge-warning' : 'badge-info'}`}>
                    {risk.severity}
                  </span>
                  <span className="text-sm font-medium text-white capitalize">{risk.type.replace('_', ' ')}</span>
                </div>
                <p className="text-sm text-surface-300">{risk.description}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
