import { useState } from 'react';
import { motion } from 'framer-motion';
import { simulatorAPI } from '../api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import toast from 'react-hot-toast';

const simFields = [
  { key: 'sleep', label: 'Sleep (hours)', min: 4, max: 12, step: 0.5, default: 8 },
  { key: 'steps', label: 'Daily Steps', min: 1000, max: 25000, step: 500, default: 10000 },
  { key: 'waterIntake', label: 'Water (liters)', min: 0.5, max: 5, step: 0.1, default: 3 },
  { key: 'calories', label: 'Calories', min: 1000, max: 4000, step: 50, default: 2200 },
  { key: 'exerciseDuration', label: 'Exercise (min)', min: 0, max: 180, step: 5, default: 45 },
  { key: 'mood', label: 'Mood (1-10)', min: 1, max: 10, step: 1, default: 8 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 text-xs">
      <p className="text-surface-300 mb-1">Day {label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">{p.name}: {Math.round(p.value)}</p>
      ))}
    </div>
  );
};

export default function SimulatorPage() {
  const [params, setParams] = useState(simFields.reduce((a, f) => ({ ...a, [f.key]: f.default }), {}));
  const [days, setDays] = useState(30);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const { data } = await simulatorAPI.simulate(params, days);
      setResult(data.simulation);
      toast.success('Simulation complete!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Simulation failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">AI Future Simulator</h1>
        <p className="text-surface-400 mt-1">What happens if you change your habits? Find out.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6 lg:col-span-1">
          <h3 className="text-lg font-semibold text-white mb-4">🎛️ Simulation Parameters</h3>
          <div className="space-y-5">
            {simFields.map((f) => (
              <div key={f.key}>
                <div className="flex justify-between mb-1">
                  <label className="text-sm text-surface-300">{f.label}</label>
                  <span className="text-sm font-bold text-white">{params[f.key]}</span>
                </div>
                <input type="range" min={f.min} max={f.max} step={f.step} value={params[f.key]}
                  onChange={(e) => setParams((p) => ({ ...p, [f.key]: parseFloat(e.target.value) }))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/[0.05] accent-primary-500
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-glow-blue" />
              </div>
            ))}
            <div>
              <label className="text-sm text-surface-300 mb-1 block">Projection Days</label>
              <select value={days} onChange={(e) => setDays(Number(e.target.value))}
                className="input-field text-sm">
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
                <option value={60}>60 days</option>
                <option value={90}>90 days</option>
              </select>
            </div>
            <button onClick={handleSimulate} disabled={loading} className="btn-accent w-full">
              {loading ? '⏳ Simulating...' : '🚀 Run Simulation'}
            </button>
          </div>
        </motion.div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          {!result ? (
            <div className="glass-card p-12 text-center">
              <p className="text-5xl mb-4">🧪</p>
              <p className="text-surface-400">Adjust parameters and run a simulation to see projected results</p>
            </div>
          ) : (
            <>
              {/* Score comparison */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="glass-card p-5 text-center">
                  <p className="text-sm text-surface-400 mb-1">Current Score</p>
                  <p className="text-3xl font-bold text-white">{result.current?.healthScore}</p>
                </div>
                <div className="glass-card p-5 text-center border border-primary-500/20">
                  <p className="text-sm text-surface-400 mb-1">Projected Score</p>
                  <p className="text-3xl font-bold gradient-text">{result.projected?.healthScore}</p>
                </div>
                <div className="glass-card p-5 text-center">
                  <p className="text-sm text-surface-400 mb-1">Change</p>
                  <p className={`text-3xl font-bold ${result.improvement?.healthScore > 0 ? 'text-vitalis-green' : result.improvement?.healthScore < 0 ? 'text-vitalis-red' : 'text-surface-400'}`}>
                    {result.improvement?.healthScore > 0 ? '+' : ''}{result.improvement?.healthScore}
                  </p>
                </div>
              </motion.div>

              {/* Projection chart */}
              {result.projections?.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="chart-container">
                  <h3 className="text-lg font-semibold text-white mb-4">Health Score Projection</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={result.projections}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: 'Day', position: 'insideBottom', offset: -5, fill: '#64748b' }} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="healthScore" stroke="#3b82f6" strokeWidth={2} dot={false} name="Projected Score" />
                    </LineChart>
                  </ResponsiveContainer>
                </motion.div>
              )}

              {/* Breakdown comparison */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Score Breakdown Changes</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {Object.entries(result.improvement?.breakdown || {}).map(([key, val]) => (
                    <div key={key} className="text-center p-3 rounded-xl bg-white/[0.03]">
                      <p className={`text-lg font-bold ${val > 0 ? 'text-vitalis-green' : val < 0 ? 'text-vitalis-red' : 'text-surface-400'}`}>
                        {val > 0 ? '+' : ''}{val}
                      </p>
                      <p className="text-xs text-surface-400 capitalize mt-1">{key}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
