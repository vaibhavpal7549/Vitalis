import { useState } from 'react';
import { motion } from 'framer-motion';
import { healthAPI, achievementsAPI } from '../api';
import toast from 'react-hot-toast';
import { HiOutlineMoon, HiOutlineFire, HiOutlineHeart, HiOutlineScale, HiOutlineEmojiHappy, HiOutlineTrendingUp } from 'react-icons/hi';
import { GiWaterDrop, GiRunningShoe } from 'react-icons/gi';

const fields = [
  { key: 'sleep', label: 'Sleep Hours', icon: HiOutlineMoon, min: 0, max: 24, step: 0.5, unit: 'hours', color: 'from-vitalis-purple to-primary-500', defaultVal: 7 },
  { key: 'waterIntake', label: 'Water Intake', icon: GiWaterDrop, min: 0, max: 10, step: 0.1, unit: 'liters', color: 'from-vitalis-cyan to-vitalis-blue', defaultVal: 2 },
  { key: 'steps', label: 'Daily Steps', icon: GiRunningShoe, min: 0, max: 50000, step: 100, unit: 'steps', color: 'from-vitalis-green to-accent-400', defaultVal: 5000 },
  { key: 'calories', label: 'Calories Consumed', icon: HiOutlineFire, min: 0, max: 5000, step: 50, unit: 'kcal', color: 'from-vitalis-orange to-vitalis-pink', defaultVal: 2000 },
  { key: 'exerciseDuration', label: 'Exercise Duration', icon: HiOutlineTrendingUp, min: 0, max: 300, step: 5, unit: 'minutes', color: 'from-vitalis-pink to-vitalis-purple', defaultVal: 30 },
  { key: 'weight', label: 'Weight', icon: HiOutlineScale, min: 30, max: 300, step: 0.1, unit: 'kg', color: 'from-surface-400 to-surface-500', defaultVal: 70 },
  { key: 'heartRate', label: 'Heart Rate', icon: HiOutlineHeart, min: 40, max: 200, step: 1, unit: 'bpm', color: 'from-vitalis-red to-vitalis-pink', defaultVal: 72 },
  { key: 'mood', label: 'Mood Score', icon: HiOutlineEmojiHappy, min: 1, max: 10, step: 1, unit: '/10', color: 'from-vitalis-orange to-vitalis-green', defaultVal: 7 },
];

export default function HealthLoggerPage() {
  const [formData, setFormData] = useState(
    fields.reduce((acc, f) => ({ ...acc, [f.key]: f.defaultVal }), {})
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: parseFloat(value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data } = await healthAPI.createLog({ ...formData, date: new Date().toISOString() });
      setResult(data);
      toast.success(`Health score: ${data.log.healthScore}/100 ✨`);

      // Check achievements
      try {
        const achData = await achievementsAPI.checkAchievements();
        if (achData.data.newlyUnlocked?.length > 0) {
          achData.data.newlyUnlocked.forEach((ach) => {
            toast.success(`🏆 Achievement Unlocked: ${ach.name}!`, { duration: 5000 });
          });
        }
      } catch {}
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save log');
    } finally {
      setIsSubmitting(false);
    }
  };

  const moodEmojis = ['😫', '😢', '😕', '😐', '🙂', '😊', '😄', '😁', '🤩', '🥳'];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Log Your Health</h1>
        <p className="text-surface-400 mt-1">Record today's health metrics to build your digital twin</p>
      </div>

      <form onSubmit={handleSubmit}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {fields.map((field, index) => {
            const Icon = field.icon;
            return (
              <motion.div
                key={field.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card p-5"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-r ${field.color} flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium text-white">{field.label}</label>
                    <p className="text-xs text-surface-500">{field.unit}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-white">{formData[field.key]}</span>
                    {field.key === 'mood' && (
                      <span className="ml-2 text-xl">{moodEmojis[formData[field.key] - 1]}</span>
                    )}
                  </div>
                </div>

                <input
                  type="range"
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  value={formData[field.key]}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer
                    bg-white/[0.05] accent-primary-500
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-white
                    [&::-webkit-slider-thumb]:shadow-glow-blue
                    [&::-webkit-slider-thumb]:cursor-pointer"
                  id={`slider-${field.key}`}
                />

                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-surface-500">{field.min}</span>
                  <span className="text-[10px] text-surface-500">{field.max}</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full md:w-auto px-12 text-lg"
            id="submit-health-log"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              '💾 Save Today\'s Log'
            )}
          </button>
        </motion.div>
      </form>

      {/* Score result */}
      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-6 border border-vitalis-green/20"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            ✅ Log Saved — Health Score Breakdown
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.entries(result.scoreBreakdown || {}).map(([key, value]) => (
              <div key={key} className="text-center p-3 rounded-xl bg-white/[0.03]">
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-surface-400 capitalize mt-1">{key}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <p className="text-3xl font-bold gradient-text">{result.log.healthScore}/100</p>
            <p className="text-sm text-surface-400 mt-1">Overall Health Score</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
