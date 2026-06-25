import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { predictionsAPI } from '../api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 text-xs">
      <p className="text-surface-300 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">{p.name}: {Math.round(p.value * 10) / 10}</p>
      ))}
    </div>
  );
};

const trendIcon = (t) => t === 'improving' ? '📈' : t === 'declining' ? '📉' : '➡️';
const trendColor = (t) => t === 'improving' ? 'text-vitalis-green' : t === 'declining' ? 'text-vitalis-red' : 'text-surface-400';

export default function PredictionsPage() {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => { fetchPredictions(); }, []);

  const fetchPredictions = async () => {
    try {
      const { data } = await predictionsAPI.getPredictions();
      setPrediction(data.prediction);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { data } = await predictionsAPI.generate();
      setPrediction(data.prediction);
      toast.success('Predictions generated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate predictions');
    } finally { setGenerating(false); }
  };

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_,i)=><div key={i} className="skeleton h-48" />)}</div>;

  const p = prediction?.predictions;
  const charts = prediction?.chartData;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">AI Predictions</h1>
          <p className="text-surface-400 mt-1">AI-powered forecasts based on your health data</p>
        </div>
        <button onClick={handleGenerate} disabled={generating} className="btn-primary">
          {generating ? '⏳ Generating...' : '🔮 Generate Predictions'}
        </button>
      </div>

      {!prediction ? (
        <div className="glass-card p-12 text-center">
          <p className="text-5xl mb-4">🔮</p>
          <p className="text-surface-400 mb-4">No predictions yet. Generate your first AI prediction!</p>
          <button onClick={handleGenerate} disabled={generating} className="btn-primary">Generate Now</button>
        </div>
      ) : (
        <>
          {/* Prediction cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: 'Weight (30d)', value: p?.weight30Days ? `${p.weight30Days} kg` : 'N/A', icon: '⚖️' },
              { label: 'Fitness Trend', value: p?.fitnessTrend, icon: trendIcon(p?.fitnessTrend), className: trendColor(p?.fitnessTrend) },
              { label: 'Sleep Trend', value: p?.sleepQualityTrend, icon: trendIcon(p?.sleepQualityTrend), className: trendColor(p?.sleepQualityTrend) },
              { label: 'Unhealthy Risk', value: `${p?.unhealthyHabitRisk || 0}%`, icon: '⚠️' },
              { label: 'Health Score (30d)', value: p?.estimatedHealthScore30Days, icon: '🎯' },
            ].map((card, i) => (
              <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} className="glass-card p-5 text-center">
                <p className="text-3xl mb-2">{card.icon}</p>
                <p className={`text-xl font-bold text-white ${card.className || ''}`}>{card.value}</p>
                <p className="text-xs text-surface-400 mt-1">{card.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Projection charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[
              { title: 'Health Score Projection', data: charts?.healthScoreProjection, color: '#3b82f6' },
              { title: 'Weight Projection', data: charts?.weightProjection, color: '#06b6d4' },
              { title: 'Fitness Projection', data: charts?.fitnessProjection, color: '#10b981' },
            ].map((chart, i) => chart.data?.length > 0 && (
              <motion.div key={chart.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }} className="chart-container">
                <h3 className="text-lg font-semibold text-white mb-4">{chart.title}</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={chart.data.map((d) => ({
                    ...d, date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="value" stroke={chart.color} strokeWidth={2} dot={false}
                      strokeDasharray="5 5" name={chart.title} />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            ))}
          </div>

          {/* Recommendations */}
          {prediction?.recommendations?.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">💡 AI Recommendations</h3>
              <div className="space-y-4">
                {prediction.recommendations.map((rec, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <p className="text-sm text-white font-medium">{rec.text}</p>
                      <span className="badge-success whitespace-nowrap">{rec.impact}</span>
                    </div>
                    <details className="group">
                      <summary className="text-xs text-primary-400 cursor-pointer hover:text-primary-300">
                        🧠 Why this recommendation?
                      </summary>
                      <p className="text-xs text-surface-400 mt-2 pl-4 border-l-2 border-primary-500/30">
                        {rec.reasoning}
                      </p>
                    </details>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
