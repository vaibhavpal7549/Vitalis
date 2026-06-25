import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminAPI } from '../api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 text-xs">
      <p className="text-surface-300">{label}</p>
      <p className="text-primary-400 font-medium">{payload[0].value} users</p>
    </div>
  );
};

export default function AdminPage() {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [healthStats, setHealthStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [analyticsRes, usersRes, statsRes] = await Promise.all([
        adminAPI.getAnalytics(),
        adminAPI.getUsers({ limit: 50 }),
        adminAPI.getHealthStats(),
      ]);
      setAnalytics(analyticsRes.data);
      setUsers(usersRes.data.users);
      setHealthStats(statsRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="space-y-4">{[...Array(4)].map((_,i)=><div key={i} className="skeleton h-32" />)}</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Admin Panel</h1>
        <p className="text-surface-400 mt-1">Platform overview and user management</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Users', value: analytics?.totalUsers || 0, icon: '👥' },
          { label: 'Active Users (7d)', value: analytics?.activeUsersCount || 0, icon: '🟢' },
          { label: 'Total Logs', value: analytics?.totalLogs || 0, icon: '📝' },
          { label: 'Avg Health Score', value: analytics?.avgHealthScore || 0, icon: '❤️' },
          { label: 'New This Week', value: analytics?.newUsersThisWeek || 0, icon: '🆕' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }} className="glass-card p-5 text-center">
            <p className="text-2xl mb-2">{s.icon}</p>
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-surface-400">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Registration chart */}
      {analytics?.registrationsByDay?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="chart-container">
          <h3 className="text-lg font-semibold text-white mb-4">📊 New Registrations (30 days)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={analytics.registrationsByDay.map((d) => ({
              date: new Date(d._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              count: d.count,
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Platform health stats */}
      {healthStats && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">🏥 Platform Health Averages (7d)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(healthStats.averages || {}).map(([key, val]) => (
              <div key={key} className="text-center p-3 rounded-xl bg-white/[0.03]">
                <p className="text-lg font-bold text-white">{val}</p>
                <p className="text-xs text-surface-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Users table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">👥 Users</h3>
          <input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="input-field w-64 text-sm py-2" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-surface-400 text-left border-b border-white/[0.06]">
                <th className="pb-3 px-2">User</th>
                <th className="pb-3 px-2">Email</th>
                <th className="pb-3 px-2">Streak</th>
                <th className="pb-3 px-2">Level</th>
                <th className="pb-3 px-2">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u._id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold">
                        {u.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="text-white">{u.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-surface-400">{u.email}</td>
                  <td className="py-3 px-2 text-white">🔥 {u.streak?.current || 0}</td>
                  <td className="py-3 px-2 text-white">Lv.{u.level?.current || 1}</td>
                  <td className="py-3 px-2 text-surface-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
