import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../api';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    age: user?.profile?.age || '',
    gender: user?.profile?.gender || '',
    height: user?.profile?.height || '',
    targetWeight: user?.profile?.targetWeight || '',
    activityLevel: user?.profile?.activityLevel || '',
  });
  const [notifs, setNotifs] = useState({
    water: user?.notificationPrefs?.water ?? true,
    exercise: user?.notificationPrefs?.exercise ?? true,
    sleep: user?.notificationPrefs?.sleep ?? true,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await authAPI.updateProfile({
        name: form.name,
        profile: {
          age: form.age ? Number(form.age) : undefined,
          gender: form.gender,
          height: form.height ? Number(form.height) : undefined,
          targetWeight: form.targetWeight ? Number(form.targetWeight) : undefined,
          activityLevel: form.activityLevel,
        },
        notificationPrefs: notifs,
      });
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Settings</h1>
        <p className="text-surface-400 mt-1">Manage your profile and preferences</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 space-y-5">
        <h3 className="text-lg font-semibold text-white">Profile</h3>
        {[
          { key: 'name', label: 'Name', type: 'text' },
          { key: 'age', label: 'Age', type: 'number' },
          { key: 'height', label: 'Height (cm)', type: 'number' },
          { key: 'targetWeight', label: 'Target Weight (kg)', type: 'number' },
        ].map((f) => (
          <div key={f.key}>
            <label className="block text-sm text-surface-300 mb-1">{f.label}</label>
            <input type={f.type} value={form[f.key]} onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
              className="input-field" />
          </div>
        ))}
        <div>
          <label className="block text-sm text-surface-300 mb-1">Gender</label>
          <select value={form.gender} onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))} className="input-field">
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-surface-300 mb-1">Activity Level</label>
          <select value={form.activityLevel} onChange={(e) => setForm((p) => ({ ...p, activityLevel: e.target.value }))} className="input-field">
            <option value="">Select</option>
            <option value="sedentary">Sedentary</option>
            <option value="light">Light</option>
            <option value="moderate">Moderate</option>
            <option value="active">Active</option>
          </select>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white">Notification Preferences</h3>
        {[
          { key: 'water', label: '💧 Water reminders' },
          { key: 'exercise', label: '🏃 Exercise reminders' },
          { key: 'sleep', label: '🌙 Sleep reminders' },
        ].map((n) => (
          <label key={n.key} className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-surface-300">{n.label}</span>
            <div className="relative">
              <input type="checkbox" checked={notifs[n.key]} onChange={(e) => setNotifs((p) => ({ ...p, [n.key]: e.target.checked }))}
                className="sr-only peer" />
              <div className="w-11 h-6 bg-white/[0.1] peer-checked:bg-primary-500 rounded-full transition-colors
                after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white
                after:rounded-full after:h-5 after:w-5 after:transition-transform peer-checked:after:translate-x-5" />
            </div>
          </label>
        ))}
      </motion.div>

      <button onClick={handleSave} disabled={saving} className="btn-primary">
        {saving ? 'Saving...' : '💾 Save Changes'}
      </button>
    </div>
  );
}
