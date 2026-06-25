import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { healthAPI } from '../api';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const periods = [
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 text-xs">
      <p className="text-surface-300 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: {typeof p.value === 'number' ? Math.round(p.value * 10) / 10 : p.value}
        </p>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const [logs, setLogs] = useState([]);
  const [period, setPeriod] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, [period]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - period * 24 * 60 * 60 * 1000).toISOString();
      const { data } = await healthAPI.getLogsInRange(startDate, endDate);
      const formatted = data.logs.map((l) => ({
        ...l,
        date: new Date(l.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      }));
      setLogs(formatted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const charts = [
    { title: 'Health Score', key: 'healthScore', color: '#3b82f6', gradient: ['#3b82f6', '#3b82f644'] },
    { title: 'Sleep Trend', key: 'sleep', color: '#8b5cf6', gradient: ['#8b5cf6', '#8b5cf644'] },
    { title: 'Weight Trend', key: 'weight', color: '#06b6d4', gradient: ['#06b6d4', '#06b6d444'] },
    { title: 'Steps Trend', key: 'steps', color: '#10b981', gradient: ['#10b981', '#10b98144'] },
    { title: 'Mood Trend', key: 'mood', color: '#f59e0b', gradient: ['#f59e0b', '#f59e0b44'] },
    { title: 'Heart Rate', key: 'heartRate', color: '#ef4444', gradient: ['#ef4444', '#ef444444'] },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Analytics</h1>
          <p className="text-surface-400 mt-1">Visualize your health trends over time</p>
        </div>
        <div className="flex gap-2">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                period === p.value
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                  : 'bg-white/[0.05] text-surface-400 border border-white/[0.06] hover:bg-white/[0.08]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-72" />)}
        </div>
      ) : logs.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-4xl mb-4">📊</p>
          <p className="text-surface-400">No data available for this period. Start logging to see trends!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {charts.map((chart, index) => (
            <motion.div
              key={chart.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="chart-container"
            >
              <h3 className="text-lg font-semibold text-white mb-4">{chart.title}</h3>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={logs}>
                  <defs>
                    <linearGradient id={`gradient-${chart.key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chart.gradient[0]} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={chart.gradient[1]} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey={chart.key}
                    stroke={chart.color}
                    strokeWidth={2}
                    fill={`url(#gradient-${chart.key})`}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 2, stroke: chart.color, fill: '#0f172a' }}
                    name={chart.title}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
