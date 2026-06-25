import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { achievementsAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';

export default function AchievementsPage() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState({ totalUnlocked: 0, totalAvailable: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAchievements(); }, []);

  const fetchAchievements = async () => {
    try {
      const { data } = await achievementsAPI.getAchievements();
      setAchievements(data.achievements);
      setStats({ totalUnlocked: data.totalUnlocked, totalAvailable: data.totalAvailable });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[...Array(8)].map((_,i)=><div key={i} className="skeleton h-40" />)}</div>;

  const levelProgress = user?.level ? ((user.level.xp % 500) / 500) * 100 : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Achievements</h1>
        <p className="text-surface-400 mt-1">Track your milestones and earn badges</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 text-center">
          <p className="text-4xl mb-2">🔥</p>
          <p className="text-3xl font-bold text-white">{user?.streak?.current || 0}</p>
          <p className="text-sm text-surface-400">Current Streak</p>
          <p className="text-xs text-surface-500 mt-1">Longest: {user?.streak?.longest || 0} days</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 text-center">
          <p className="text-4xl mb-2">⭐</p>
          <p className="text-3xl font-bold text-white">Level {user?.level?.current || 1}</p>
          <p className="text-sm text-surface-400">{user?.level?.xp || 0} XP</p>
          <div className="progress-bar mt-3">
            <motion.div className="progress-bar-fill bg-gradient-to-r from-vitalis-orange to-vitalis-pink"
              initial={{ width: 0 }} animate={{ width: `${levelProgress}%` }} transition={{ duration: 1 }} />
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 text-center">
          <p className="text-4xl mb-2">🏆</p>
          <p className="text-3xl font-bold text-white">{stats.totalUnlocked}/{stats.totalAvailable}</p>
          <p className="text-sm text-surface-400">Achievements Unlocked</p>
        </motion.div>
      </div>

      {/* Achievement grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {achievements.map((ach, i) => (
          <motion.div
            key={ach.key}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className={`achievement-card ${ach.unlocked ? 'unlocked' : 'locked'}`}
          >
            <motion.div
              className="text-4xl mb-3"
              animate={ach.unlocked ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              {ach.icon}
            </motion.div>
            <h4 className="text-sm font-semibold text-white mb-1">{ach.name}</h4>
            <p className="text-xs text-surface-400">{ach.description}</p>
            {ach.unlocked && ach.unlockedAt && (
              <p className="text-[10px] text-vitalis-green mt-2">
                ✅ {new Date(ach.unlockedAt).toLocaleDateString()}
              </p>
            )}
            {!ach.unlocked && (
              <p className="text-[10px] text-surface-500 mt-2">🔒 Locked</p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
