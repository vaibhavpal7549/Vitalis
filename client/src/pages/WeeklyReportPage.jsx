import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { reportsAPI } from '../api';
import toast from 'react-hot-toast';

export default function WeeklyReportPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const reportRef = useRef(null);

  useEffect(() => { fetchReport(); }, []);

  const fetchReport = async () => {
    try {
      const { data } = await reportsAPI.getWeeklyReport();
      setReport(data.report);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleExportPDF = async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const element = reportRef.current;
      const canvas = await html2canvas(element, { backgroundColor: '#0f172a', scale: 2 });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`vitalis-weekly-report-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Report exported as PDF!');
    } catch (err) {
      toast.error('Failed to export PDF');
    }
  };

  if (loading) return <div className="space-y-4">{[...Array(4)].map((_,i)=><div key={i} className="skeleton h-32" />)}</div>;

  if (!report) return (
    <div className="glass-card p-12 text-center">
      <p className="text-5xl mb-4">📋</p>
      <p className="text-surface-400">No data available for a weekly report. Keep logging!</p>
    </div>
  );

  const r = report;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Weekly Health Report</h1>
          <p className="text-surface-400 mt-1">
            {new Date(r.period.start).toLocaleDateString()} — {new Date(r.period.end).toLocaleDateString()}
          </p>
        </div>
        <button onClick={handleExportPDF} className="btn-primary">📄 Export PDF</button>
      </div>

      <div ref={reportRef} className="space-y-6">
        {/* Summary */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">📊 Weekly Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Health Score', value: r.currentWeek.healthScore, icon: '🎯' },
              { label: 'Avg Sleep', value: `${r.currentWeek.sleep}h`, icon: '🌙' },
              { label: 'Avg Steps', value: r.currentWeek.steps?.toLocaleString(), icon: '🚶' },
              { label: 'Days Logged', value: `${r.period.daysLogged}/7`, icon: '📝' },
              { label: 'Avg Calories', value: r.currentWeek.calories, icon: '🔥' },
              { label: 'Avg Water', value: `${r.currentWeek.waterIntake}L`, icon: '💧' },
              { label: 'Avg Mood', value: `${r.currentWeek.mood}/10`, icon: '😊' },
              { label: 'Avg HR', value: `${r.currentWeek.heartRate} bpm`, icon: '❤️' },
            ].map((item, i) => (
              <div key={i} className="text-center p-3 rounded-xl bg-white/[0.03]">
                <p className="text-2xl mb-1">{item.icon}</p>
                <p className="text-lg font-bold text-white">{item.value}</p>
                <p className="text-xs text-surface-400">{item.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Week comparison */}
        {r.comparison && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">📈 Week-over-Week Changes</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(r.comparison).map(([key, data]) => (
                <div key={key} className="text-center p-3 rounded-xl bg-white/[0.03]">
                  <p className={`text-lg font-bold ${data.direction === 'up' ? 'text-vitalis-green' : data.direction === 'down' ? 'text-vitalis-red' : 'text-surface-400'}`}>
                    {data.direction === 'up' ? '↑' : data.direction === 'down' ? '↓' : '→'} {Math.abs(data.percentChange)}%
                  </p>
                  <p className="text-xs text-surface-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Highlights */}
        {r.highlights?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">✨ Highlights</h3>
            <div className="space-y-3">
              {r.highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]">
                  <span className="text-2xl">{h.icon}</span>
                  <p className="text-sm text-surface-300">{h.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recommendations */}
        {r.recommendations?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">💡 Recommendations</h3>
            <div className="space-y-3">
              {r.recommendations.map((rec, i) => (
                <div key={i} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-sm text-white">{rec.text}</p>
                  <span className="badge-success text-[10px] mt-2 inline-block">{rec.impact}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
