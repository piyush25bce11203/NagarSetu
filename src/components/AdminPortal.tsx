import React, { useState, useMemo } from 'react';
import logoSVH from '../images/logoSVH.png';
import {
  Shield, LogIn, Eye, EyeOff, LogOut,
  BarChart3, MapPin, Clock, CheckCircle, AlertCircle,
  Filter, Search, X, TrendingUp, FileText, RefreshCw, Download, Send,
  Building2, Calendar, Trophy, Star, Crown, Medal, Award,
  PieChart, LineChart, Users, Target, Timer
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ADMIN_ACCOUNTS, DEPARTMENTS, CITY_LIST } from '../data/mockReports';
import type { Report } from '../App';

const statusConfig: Record<Report['status'], { label: string; color: string; dot: string }> = {
  pending:      { label: 'Pending',      color: 'bg-red-100 text-red-800',       dot: 'bg-red-500'    },
  acknowledged: { label: 'Acknowledged', color: 'bg-blue-100 text-blue-800',     dot: 'bg-blue-500'   },
  submitted:    { label: 'In Progress',  color: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-500' },
  resolved:     { label: 'Resolved',     color: 'bg-green-100 text-green-800',   dot: 'bg-green-500'  },
};

const priorityConfig: Record<string, { color: string }> = {
  high:   { color: 'bg-red-50 text-red-700 border border-red-200'         },
  medium: { color: 'bg-yellow-50 text-yellow-700 border border-yellow-200' },
  low:    { color: 'bg-green-50 text-green-700 border border-green-200'    },
};

function fmt(ts: Date) {
  const d = Date.now() - ts.getTime(), m = Math.floor(d / 60000), h = Math.floor(d / 3600000), dy = Math.floor(d / 86400000);
  return m < 60 ? `${m}m ago` : h < 24 ? `${h}h ago` : `${dy}d ago`;
}

function fmtDeadline(iso: string) {
  const d = new Date(iso);
  const diff = d.getTime() - Date.now();
  if (diff < 0) return { label: 'OVERDUE', color: 'text-red-600 font-bold', overdue: true };
  const h = Math.floor(diff / 3600000);
  const dy = Math.floor(diff / 86400000);
  if (h < 24) return { label: `${h}h left`, color: 'text-orange-600 font-semibold', overdue: false };
  return { label: `${dy}d left`, color: 'text-blue-600', overdue: false };
}

// ── City Ranking ──────────────────────────────────────────────────────────────
function CityRankingPanel({ allReports }: { allReports: Report[] }) {
  const cityStats = useMemo(() => {
    return CITY_LIST.map(city => {
      const cityR = allReports.filter(r => r.district === city);
      const total    = cityR.length;
      const resolved = cityR.filter(r => r.status === 'resolved').length;
      const overdue  = cityR.filter(r => r.deadline && new Date(r.deadline) < new Date() && r.status !== 'resolved').length;
      const score    = total > 0 ? Math.max(0, Math.round((resolved / total) * 100) - overdue * 5) : 0;
      return { city, total, resolved, overdue, score };
    }).sort((a, b) => b.score - a.score);
  }, [allReports]);

  const medals = [Crown, Medal, Award];
  const medalColors = ['text-yellow-500', 'text-gray-400', 'text-amber-600'];
  const bgColors = ['bg-yellow-50 border-yellow-200', 'bg-gray-50 border-gray-200', 'bg-amber-50 border-amber-200'];

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Trophy className="w-5 h-5 text-yellow-300" />
          <h2 className="font-bold text-base">City Ranking</h2>
        </div>
        <p className="text-xs text-white/80">Score = (Resolved / Total) × 100 − (Overdue × 5 pts)</p>
      </div>

      {cityStats.map((s, i) => {
        const MedalIcon = medals[i] || Star;
        return (
          <motion.div key={s.city}
            className={`rounded-xl border p-4 ${bgColors[i] || 'bg-white border-gray-200'}`}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MedalIcon className={`w-5 h-5 ${medalColors[i] || 'text-slate-400'}`} />
                <span className="font-bold text-gray-900 text-base">#{i + 1} {s.city}</span>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold ${i === 0 ? 'text-yellow-600' : i === 1 ? 'text-gray-600' : 'text-amber-700'}`}>{s.score}</p>
                <p className="text-xs text-gray-500">pts</p>
              </div>
            </div>
            {/* Score bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div className={`h-2 rounded-full transition-all ${i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-500' : 'bg-amber-500'}`}
                style={{ width: `${s.score}%` }} />
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-white rounded-lg p-2">
                <p className="font-bold text-gray-800">{s.total}</p>
                <p className="text-gray-500">Total</p>
              </div>
              <div className="bg-white rounded-lg p-2">
                <p className="font-bold text-green-600">{s.resolved}</p>
                <p className="text-gray-500">Resolved</p>
              </div>
              <div className="bg-white rounded-lg p-2">
                <p className={`font-bold ${s.overdue > 0 ? 'text-red-600' : 'text-gray-400'}`}>{s.overdue}</p>
                <p className="text-gray-500">Overdue</p>
              </div>
            </div>
          </motion.div>
        );
      })}

      <Card className="p-4 bg-blue-50 border-blue-200">
        <p className="text-xs font-semibold text-blue-800 mb-2">How City Points Work</p>
        <div className="space-y-1 text-xs text-blue-700">
          <p>✅ Each resolved complaint adds to your score</p>
          <p>⏰ Each overdue (deadline missed) complaint deducts 5 points</p>
          <p>📊 Score = (Resolved ÷ Total) × 100 − Overdue penalties</p>
        </div>
      </Card>
    </div>
  );
}

// ── Analytics / Charts ────────────────────────────────────────────────────────
function AnalyticsPanel({ cityReports, adminCity }: { cityReports: Report[]; adminCity: string }) {
  const total    = cityReports.length;
  const resolved = cityReports.filter(r => r.status === 'resolved').length;
  const pending  = cityReports.filter(r => r.status === 'pending').length;
  const inProg   = cityReports.filter(r => r.status === 'submitted' || r.status === 'acknowledged').length;
  const resRate  = total > 0 ? Math.round((resolved / total) * 100) : 0;

  // Complaint status donut data
  const statusData = [
    { label: 'Pending',     value: pending,                                                                color: 'bg-red-500',    textColor: 'text-red-700'    },
    { label: 'Assigned',    value: cityReports.filter(r => r.status === 'acknowledged').length,            color: 'bg-blue-500',   textColor: 'text-blue-700'   },
    { label: 'In Progress', value: cityReports.filter(r => r.status === 'submitted').length,               color: 'bg-yellow-500', textColor: 'text-yellow-700' },
    { label: 'Resolved',    value: resolved,                                                               color: 'bg-green-500',  textColor: 'text-green-700'  },
  ].filter(d => d.value > 0);

  // Category bar data
  const categoryData = DEPARTMENTS.map(dept => {
    const count    = cityReports.filter(r => r.type === dept.type || r.assignedDept === dept.id).length;
    const deptResolved = cityReports.filter(r => (r.type === dept.type || r.assignedDept === dept.id) && r.status === 'resolved').length;
    return { label: dept.id, count, resolved: deptResolved };
  }).filter(d => d.count > 0).sort((a, b) => b.count - a.count);

  const maxCount = Math.max(...categoryData.map(d => d.count), 1);

  // Priority distribution
  const priorityData = [
    { label: 'High',   value: cityReports.filter(r => r.priority === 'high').length,   color: 'bg-red-500'    },
    { label: 'Medium', value: cityReports.filter(r => r.priority === 'medium').length, color: 'bg-yellow-500' },
    { label: 'Low',    value: cityReports.filter(r => r.priority === 'low').length,    color: 'bg-green-500'  },
  ].filter(d => d.value > 0);

  const totalPriority = priorityData.reduce((s, d) => s + d.value, 0) || 1;

  // Last 7 days trend
  const dayLabels = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString('en-IN', { weekday: 'short' });
  });
  const dayCounts = Array.from({ length: 7 }, (_, i) => {
    const start = new Date(); start.setDate(start.getDate() - (6 - i)); start.setHours(0, 0, 0, 0);
    const end   = new Date(start); end.setHours(23, 59, 59, 999);
    return cityReports.filter(r => r.timestamp >= start && r.timestamp <= end).length;
  });
  const maxDay = Math.max(...dayCounts, 1);

  // Staff performance
  const staffPerf = DEPARTMENTS.map(dept => {
    const assigned = cityReports.filter(r => r.assignedDept === dept.id).length;
    const res      = cityReports.filter(r => r.assignedDept === dept.id && r.status === 'resolved').length;
    return { dept: dept.id, assigned, resolved: res };
  }).filter(d => d.assigned > 0);
  const maxAssigned = Math.max(...staffPerf.map(s => s.assigned), 1);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 className="w-5 h-5 text-emerald-400" />
          <h2 className="font-bold">Analytics Dashboard — {adminCity}</h2>
        </div>
        <p className="text-xs text-slate-300">Visual overview of complaint data</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Total Complaints', value: total,   icon: FileText,  color: 'text-slate-700', bg: 'bg-white'      },
          { label: 'Resolution Rate',  value: `${resRate}%`, icon: Target,   color: 'text-green-600', bg: 'bg-green-50'   },
          { label: 'In Progress',      value: inProg,  icon: RefreshCw, color: 'text-yellow-600', bg: 'bg-yellow-50'  },
          { label: 'Resolved',         value: resolved, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50'  },
        ].map(k => (
          <div key={k.label} className={`${k.bg} rounded-xl border p-3 flex items-center gap-3`}>
            <k.icon className={`w-5 h-5 ${k.color} flex-shrink-0`} />
            <div>
              <p className={`text-xl font-bold ${k.color}`}>{k.value}</p>
              <p className="text-xs text-muted-foreground">{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Resolution Rate Ring */}
      <div className="bg-white rounded-xl border p-4">
        <div className="flex items-center gap-2 mb-3">
          <PieChart className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">Resolution Rate</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3.8" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#22c55e" strokeWidth="3.8"
                strokeDasharray={`${resRate} ${100 - resRate}`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-xl font-bold text-green-600">{resRate}%</p>
              <p className="text-xs text-gray-400">resolved</p>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            {[
              { label: 'Resolved',    v: resolved, color: 'bg-green-500' },
              { label: 'In Progress', v: inProg,   color: 'bg-yellow-500'},
              { label: 'Pending',     v: pending,  color: 'bg-red-500'   },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-2 text-xs">
                <span className={`w-2.5 h-2.5 rounded-full ${s.color} flex-shrink-0`} />
                <span className="text-gray-600 flex-1">{s.label}</span>
                <span className="font-medium">{s.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Complaint Status Donut */}
      <div className="bg-white rounded-xl border p-4">
        <div className="flex items-center gap-2 mb-3">
          <PieChart className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">Complaint Status Distribution</h3>
        </div>
        <div className="space-y-2">
          {statusData.map(s => (
            <div key={s.label} className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${s.color} flex-shrink-0`} />
              <span className="text-xs text-gray-600 w-24">{s.label}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                <motion.div className={`h-full ${s.color} rounded-full`}
                  initial={{ width: 0 }} animate={{ width: `${total > 0 ? (s.value / total) * 100 : 0}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }} />
              </div>
              <span className={`text-xs font-bold w-6 text-right ${s.textColor}`}>{s.value}</span>
            </div>
          ))}
          {statusData.length === 0 && <p className="text-xs text-center text-gray-400 py-4">No data yet</p>}
        </div>
      </div>

      {/* Complaints Over Time — 7-day bar graph */}
      <div className="bg-white rounded-xl border p-4">
        <div className="flex items-center gap-2 mb-4">
          <LineChart className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">Complaints Over Time (Last 7 Days)</h3>
        </div>
        <div className="flex items-end gap-1 h-24">
          {dayCounts.map((count, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-gray-500">{count}</span>
              <motion.div className="w-full bg-blue-500 rounded-t"
                initial={{ height: 0 }}
                animate={{ height: `${maxDay > 0 ? (count / maxDay) * 64 : 0}px` }}
                transition={{ duration: 0.6, delay: i * 0.05 }} />
              <span className="text-xs text-gray-400">{dayLabels[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Complaints by Category / Department */}
      {categoryData.length > 0 && (
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm">Complaints by Department</h3>
          </div>
          <div className="space-y-2">
            {categoryData.map(d => (
              <div key={d.label} className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-700 w-16 flex-shrink-0">{d.label}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden relative">
                  <motion.div className="h-full bg-indigo-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(d.count / maxCount) * 100}%` }}
                    transition={{ duration: 0.7, ease: 'easeOut' }} />
                  {d.resolved > 0 && (
                    <motion.div className="absolute top-0 left-0 h-full bg-green-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(d.resolved / maxCount) * 100}%` }}
                      transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }} />
                  )}
                </div>
                <span className="text-xs text-gray-500 w-14 text-right">
                  {d.count} total · <span className="text-green-600">{d.resolved} ✓</span>
                </span>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500" />Total</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" />Resolved</span>
          </div>
        </div>
      )}

      {/* Priority Distribution */}
      <div className="bg-white rounded-xl border p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">Priority Distribution</h3>
        </div>
        {priorityData.length > 0 ? (
          <>
            <div className="flex h-6 rounded-full overflow-hidden gap-0.5 mb-3">
              {priorityData.map(p => (
                <motion.div key={p.label} className={`${p.color} h-full`}
                  initial={{ flex: 0 }}
                  animate={{ flex: p.value / totalPriority }}
                  transition={{ duration: 0.8 }} />
              ))}
            </div>
            <div className="flex gap-4 flex-wrap">
              {priorityData.map(p => (
                <div key={p.label} className="flex items-center gap-1.5 text-xs">
                  <span className={`w-2.5 h-2.5 rounded-full ${p.color}`} />
                  <span className="text-gray-600">{p.label}</span>
                  <span className="font-bold">{p.value}</span>
                  <span className="text-gray-400">({Math.round((p.value / totalPriority) * 100)}%)</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-xs text-center text-gray-400 py-4">No data yet</p>
        )}
      </div>

      {/* Staff Performance */}
      {staffPerf.length > 0 && (
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm">Staff Performance (Assigned vs Resolved)</h3>
          </div>
          <div className="space-y-3">
            {staffPerf.map(s => (
              <div key={s.dept}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-gray-700">{s.dept}</span>
                  <span className="text-gray-500">{s.resolved}/{s.assigned} resolved</span>
                </div>
                <div className="relative w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div className="absolute top-0 left-0 h-full bg-blue-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(s.assigned / maxAssigned) * 100}%` }}
                    transition={{ duration: 0.7 }} />
                  <motion.div className="absolute top-0 left-0 h-full bg-green-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(s.resolved / maxAssigned) * 100}%` }}
                    transition={{ duration: 0.7, delay: 0.2 }} />
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400" />Assigned</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" />Resolved</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Login ─────────────────────────────────────────────────────────────────────
function AdminLogin({ onLogin, onBackToApp }: { onLogin: (email: string, city: string, name: string) => void; onBackToApp: () => void }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Both fields are required.'); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const acct = ADMIN_ACCOUNTS[email.toLowerCase().trim()];
      if (acct && acct.password === password) {
        onLogin(email, acct.city, acct.name);
      } else {
        setError('Invalid email or password.');
      }
    }, 700);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-0 overflow-hidden">
      {/* Back to App button — top-left inside the screen */}
      <motion.button
        onClick={onBackToApp}
        className="absolute top-4 left-4 z-50 flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-full px-3 py-1.5 transition-all active:scale-95"
        initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
        whileTap={{ scale: 0.92 }}
      >
        ← Back
      </motion.button>
      <div className="relative w-full flex flex-col items-center pt-12 pb-10 px-6 overflow-hidden">
        <div className="absolute top-[-60px] left-[-60px] w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-[-30px] right-[-40px] w-48 h-48 bg-teal-400/15 rounded-full blur-2xl pointer-events-none" />
        <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="relative mb-5">
          <div className="absolute inset-0 rounded-full bg-emerald-500/30 blur-xl scale-125 pointer-events-none" />
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-emerald-400/40 shadow-2xl shadow-emerald-900/50">
            <img src={logoSVH} alt="NagarSetu" className="w-full h-full object-cover" />
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="text-center">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Nagar<span className="text-emerald-400">Setu</span></h1>
          <p className="text-emerald-300/80 text-sm mt-1 font-medium">City Administration Portal</p>
          <p className="text-slate-500 text-xs mt-1">Government of Madhya Pradesh</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="flex gap-2 mt-5">
          {['Indore', 'Ujjain', 'Bhopal'].map(city => (
            <span key={city} className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-medium">
              <Building2 className="w-3 h-3" />{city}
            </span>
          ))}
        </motion.div>
        <div className="mt-8 w-full max-w-sm h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
      </div>

      <motion.div className="w-full max-w-sm px-6 pb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm shadow-2xl">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-base font-semibold text-white">Administrator Sign In</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1">
              <Label className="text-slate-300 text-sm">Official Email</Label>
              <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="admin.indore@nagarsetu.gov.in"
                className="bg-white border-white/30 text-slate-900 placeholder:text-slate-400 focus-visible:ring-emerald-400" />
            </div>
            <div className="space-y-1">
              <Label className="text-slate-300 text-sm">Password</Label>
              <div className="relative">
                <Input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                  className="pr-10 bg-white border-white/30 text-slate-900 placeholder:text-slate-400 focus-visible:ring-emerald-400" />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && <motion.p className="text-red-400 text-xs flex items-center gap-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><AlertCircle className="w-3 h-3" />{error}</motion.p>}
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white" disabled={loading}>
              {loading
                ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Signing in...</span>
                : <span className="flex items-center gap-2"><LogIn className="w-4 h-4" />Sign In</span>}
            </Button>
          </form>
          <div className="mt-4 p-3 bg-white/5 rounded-lg text-xs text-slate-400 space-y-1">
            <p className="font-medium text-slate-300">Demo credentials:</p>
            <p>admin.indore@nagarsetu.gov.in · admin123</p>
            <p>admin.ujjain@nagarsetu.gov.in · admin123</p>
            <p>admin.bhopal@nagarsetu.gov.in · admin123</p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function AdminDashboard({
  adminName, adminCity, allReports, onAssignDept, onSetDeadline, onLogout, onBackToApp,
}: {
  adminName: string; adminCity: string;
  allReports: Report[];
  onAssignDept: (id: string, dept: string) => void;
  onSetDeadline: (id: string, deadline: string) => void;
  onLogout: () => void;
  onBackToApp: () => void;
}) {
  const cityReports = useMemo(
    () => allReports.filter(r => r.district === adminCity),
    [allReports, adminCity]
  );

  const [tab, setTab]                     = useState<'complaints' | 'analytics' | 'ranking'>('complaints');
  const [search, setSearch]               = useState('');
  const [statusFilter, setStatusFilter]   = useState('all');
  const [typeFilter, setTypeFilter]       = useState('all');
  const [detail, setDetail]               = useState<Report | null>(null);
  const [assigning, setAssigning]         = useState<string | null>(null);
  const [deadlineInput, setDeadlineInput] = useState('');
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);

  const stats = useMemo(() => ({
    total:      cityReports.length,
    pending:    cityReports.filter(r => r.status === 'pending').length,
    inProgress: cityReports.filter(r => r.status === 'submitted' || r.status === 'acknowledged').length,
    resolved:   cityReports.filter(r => r.status === 'resolved').length,
    unassigned: cityReports.filter(r => !r.assignedDept).length,
  }), [cityReports]);

  const filtered = useMemo(() => cityReports.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (typeFilter   !== 'all' && r.type.toLowerCase() !== typeFilter) return false;
    if (search && !`${r.title} ${r.ward} ${r.street}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()), [cityReports, statusFilter, typeFilter, search]);

  const handleAssign = (reportId: string, dept: string) => {
    setAssigning(reportId);
    setTimeout(() => {
      onAssignDept(reportId, dept);
      setAssigning(null);
      setDetail(prev => prev?.id === reportId ? { ...prev, assignedDept: dept, status: 'acknowledged' } : prev);
    }, 400);
  };

  const handleDeadlineSave = () => {
    if (!detail || !deadlineInput) return;
    const iso = new Date(deadlineInput).toISOString();
    onSetDeadline(detail.id, iso);
    setDetail(prev => prev ? { ...prev, deadline: iso } : prev);
    setShowDeadlinePicker(false);
    setDeadlineInput('');
  };

  const handleExportCSV = () => {
    const rows = [
      ['ID', 'Title', 'Ward', 'Type', 'Status', 'Priority', 'Assigned Dept', 'Upvotes', 'Deadline', 'Date'],
      ...filtered.map(r => [r.id, `"${r.title}"`, `"${r.ward}"`, r.type, r.status, r.priority ?? '', r.assignedDept ?? 'Unassigned', r.upvotes, r.deadline ? new Date(r.deadline).toLocaleDateString() : '', new Date(r.timestamp).toLocaleDateString()]),
    ];
    const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${adminCity}-complaints.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const typeOptions = useMemo(() => {
    const types = Array.from(new Set(cityReports.map(r => r.type)));
    return types.sort();
  }, [cityReports]);

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-x-hidden">
      {/* Top bar */}
      <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-lg">
        <div className="flex items-center gap-2">
          {/* Back to App */}
          <button
            onClick={onBackToApp}
            className="flex items-center gap-1 text-xs text-emerald-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-full px-2.5 py-1.5 transition-all active:scale-95 flex-shrink-0"
          >
            ←
          </button>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm leading-none" style={{ color: '#6ee7b7' }}>{adminCity} Admin Portal</p>
            <p className="text-xs mt-0.5" style={{ color: '#cbd5e1' }}>admin.nagarsetu.gov.in · {adminName}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onLogout} className="text-slate-400 hover:text-white hover:bg-white/10 gap-1.5">
          <LogOut className="w-4 h-4" /><span className="text-xs hidden sm:inline">Sign Out</span>
        </Button>
      </div>

      {/* Tab navigation */}
      <div className="bg-white border-b sticky top-14 z-20">
        <div className="flex max-w-5xl mx-auto">
          {([
            { id: 'complaints', label: 'Complaints',  icon: FileText  },
            { id: 'analytics',  label: 'Analytics',   icon: BarChart3  },
            { id: 'ranking',    label: 'City Ranking', icon: Trophy    },
          ] as const).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold border-b-2 transition-colors ${
                tab === t.id ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              <t.icon className="w-3.5 h-3.5" />{t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-5xl mx-auto">

        {/* ── ANALYTICS TAB ─────────────────────────────────────────────── */}
        {tab === 'analytics' && (
          <AnalyticsPanel cityReports={cityReports} adminCity={adminCity} />
        )}

        {/* ── CITY RANKING TAB ──────────────────────────────────────────── */}
        {tab === 'ranking' && (
          <CityRankingPanel allReports={allReports} />
        )}

        {/* ── COMPLAINTS TAB ────────────────────────────────────────────── */}
        {tab === 'complaints' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: 'Total',       v: stats.total,      color: 'text-slate-700', bg: 'bg-white',      icon: FileText    },
                { label: 'Pending',     v: stats.pending,    color: 'text-red-600',   bg: 'bg-red-50',     icon: AlertCircle },
                { label: 'In Progress', v: stats.inProgress, color: 'text-yellow-600',bg: 'bg-yellow-50',  icon: RefreshCw   },
                { label: 'Resolved',    v: stats.resolved,   color: 'text-green-600', bg: 'bg-green-50',   icon: CheckCircle },
                { label: 'Unassigned',  v: stats.unassigned, color: 'text-orange-600',bg: 'bg-orange-50',  icon: TrendingUp  },
              ].map(s => (
                <motion.div key={s.label} className={`${s.bg} rounded-xl border p-3 flex flex-col gap-1`} whileHover={{ scale: 1.02 }}>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                  <p className={`text-2xl font-bold ${s.color}`}>{s.v}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Dept overview */}
            <div className="bg-white rounded-xl border p-4">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-primary" />
                <h2 className="font-semibold text-sm text-gray-900">Department Workload — {adminCity}</h2>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {DEPARTMENTS.map(dept => {
                  const deptReports = cityReports.filter(r => r.assignedDept === dept.id);
                  const pending     = deptReports.filter(r => r.status !== 'resolved').length;
                  return (
                    <div key={dept.id} className="border rounded-xl p-2 text-center">
                      <p className="text-xs font-semibold text-muted-foreground">{dept.id}</p>
                      <p className="text-lg font-bold text-gray-800 mt-1">{deptReports.length}</p>
                      {pending > 0 && <p className="text-xs text-orange-600 font-medium mt-0.5">{pending} pending</p>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-gray-900">All Complaints — {adminCity}</span>
                  <Badge variant="outline" className="text-xs">{filtered.length}</Badge>
                </div>
                <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5 text-xs">
                  <Download className="w-3 h-3" />Export
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search complaints..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
                {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"><X className="w-4 h-4" /></button>}
              </div>
              <div className="flex gap-2 flex-wrap">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-auto text-xs h-8"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">All Statuses</SelectItem>
                    <SelectItem value="pending" className="text-xs">Pending</SelectItem>
                    <SelectItem value="acknowledged" className="text-xs">Acknowledged</SelectItem>
                    <SelectItem value="submitted" className="text-xs">In Progress</SelectItem>
                    <SelectItem value="resolved" className="text-xs">Resolved</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-auto text-xs h-8"><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">All Types</SelectItem>
                    {typeOptions.map(t => (
                      <SelectItem key={t} value={t} className="text-xs capitalize">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(statusFilter !== 'all' || typeFilter !== 'all' || search) && (
                  <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground"
                    onClick={() => { setStatusFilter('all'); setTypeFilter('all'); setSearch(''); }}>
                    <X className="w-3 h-3 mr-1" />Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Complaint list */}
            <div className="space-y-2">
              {filtered.length === 0 && (
                <div className="bg-white rounded-xl border p-10 text-center text-muted-foreground text-sm">No complaints match filters.</div>
              )}
              {filtered.map((report, i) => {
                const sc   = statusConfig[report.status];
                const dept = DEPARTMENTS.find(d => d.id === report.assignedDept);
                const dl   = report.deadline ? fmtDeadline(report.deadline) : null;
                return (
                  <motion.div key={report.id} className="bg-white rounded-xl border hover:shadow-md transition-all overflow-hidden"
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <div className="p-4 cursor-pointer" onClick={() => setDetail(report)}>
                      {/* thumbnail + title row */}
                      <div className="flex gap-3 mb-2">
                        {(report.media?.[0]?.url || report.imageUrl) && (
                          <div className="w-14 h-14 min-w-[56px] max-w-[56px] rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                            <img src={report.media?.[0]?.url || report.imageUrl} alt={report.title}
                              className="w-full h-full object-cover"
                              onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/56x56?text=N/A'; }} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="text-sm font-semibold text-gray-900 leading-tight">{report.title}</h3>
                            <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${sc.color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{sc.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{report.ward}</span>
                            <span>·</span>
                            <span className="capitalize">{report.type}</span>
                            <span>·</span>
                            <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{fmt(report.timestamp)}</span>
                            {report.priority && (
                              <span className={`text-xs px-2 py-0.5 rounded-full ${priorityConfig[report.priority]?.color}`}>{report.priority}</span>
                            )}
                            {dl && (
                              <span className={`flex items-center gap-0.5 text-xs ${dl.color}`}>
                                <Timer className="w-3 h-3" />{dl.label}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-gray-600 line-clamp-1 mb-2">{report.description}</p>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>▲ {report.upvotes} upvotes</span>
                        <span>💬 {report.comments.length}</span>
                        <span>Severity: {report.severity}/10</span>
                        {report.aiSuggestedDept && (
                          <span className="text-blue-600 flex items-center gap-0.5">
                            🤖 AI: {report.aiSuggestedDept}
                          </span>
                        )}
                      </div>
                      {dept && (
                        <div className="mt-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${dept.color}`}>→ {dept.id}: {dept.fullName}</span>
                        </div>
                      )}
                    </div>

                    {/* Assign row */}
                    <div className="px-4 pb-4 pt-0 border-t mt-0 pt-3 flex items-center gap-2 flex-wrap" onClick={e => e.stopPropagation()}>
                      <span className="text-xs text-muted-foreground font-medium whitespace-nowrap flex items-center gap-1">
                        <Send className="w-3 h-3" />Assign:
                      </span>
                      <div className="flex gap-1 flex-wrap">
                        {DEPARTMENTS.map(d => (
                          <button key={d.id} disabled={assigning === report.id}
                            onClick={() => handleAssign(report.id, d.id)}
                            className={`text-xs px-2 py-1 rounded-lg border transition-all font-medium ${
                              report.assignedDept === d.id
                                ? `${d.color} ring-1 ring-current`
                                : 'border-gray-200 text-gray-500 hover:border-primary hover:text-primary bg-white'
                            } ${assigning === report.id ? 'opacity-50' : ''}`}>
                            {d.id}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Detail drawer */}
      <AnimatePresence>
        {detail && (
          <>
            <motion.div className="absolute inset-0 bg-black/40 z-40"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setDetail(null); setShowDeadlinePicker(false); }} />
            <motion.div
              className="absolute right-0 top-0 bottom-0 w-full bg-white z-50 shadow-2xl overflow-y-auto"
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 400 }}>
              <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between z-10">
                <div>
                  <h3 className="font-semibold text-sm line-clamp-1">{detail.title}</h3>
                  <p className="text-xs text-muted-foreground">#{detail.id} · {detail.district}</p>
                </div>
                <button onClick={() => { setDetail(null); setShowDeadlinePicker(false); }}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-muted-foreground"><X className="w-4 h-4" /></button>
              </div>

              <div className="p-4 space-y-4">
                {/* Complaint image */}
                {(detail.media?.[0]?.url || detail.imageUrl) && (
                  <div className="rounded-xl overflow-hidden bg-gray-100 w-full"
                    style={{ maxHeight: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img
                      src={detail.media?.[0]?.url || detail.imageUrl}
                      alt={detail.title}
                      className="w-full object-contain"
                      style={{ maxHeight: '220px' }}
                      onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x220?text=No+Image'; }}
                    />
                  </div>
                )}
                {/* Resolution proof image (if staff submitted one) */}
                {detail.resolutionProofUrl && (
                  <div className="rounded-xl overflow-hidden bg-green-50 border border-green-200 w-full">
                    <div className="px-3 py-2 flex items-center gap-2 bg-green-100 border-b border-green-200">
                      <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                      <span className="text-xs font-semibold text-green-800">Resolution Proof Photo</span>
                    </div>
                    <div className="flex items-center justify-center" style={{ maxHeight: '220px' }}>
                      <img
                        src={detail.resolutionProofUrl}
                        alt="Resolution proof"
                        className="w-full object-contain"
                        style={{ maxHeight: '220px' }}
                        onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x225?text=No+Proof'; }}
                      />
                    </div>
                  </div>
                )}

                {/* AI badge */}
                {detail.aiSuggestedDept && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2 text-xs">
                    <span className="text-blue-600">🤖</span>
                    <span className="text-blue-800 font-medium">AI Suggested Department:</span>
                    <span className="font-bold text-blue-700">{detail.aiSuggestedDept}</span>
                    <span className="text-blue-500 ml-auto">{detail.aiConfidence}% confidence</span>
                  </div>
                )}

                {/* Status + priority badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full font-medium ${statusConfig[detail.status].color}`}>
                    <span className={`w-2 h-2 rounded-full ${statusConfig[detail.status].dot}`} />{statusConfig[detail.status].label}
                  </span>
                  {detail.priority && (
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${priorityConfig[detail.priority]?.color}`}>{detail.priority} priority</span>
                  )}
                  {detail.assignedDept && (
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${DEPARTMENTS.find(d => d.id === detail.assignedDept)?.color}`}>
                      {detail.assignedDept}
                    </span>
                  )}
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    ['Ward', detail.ward],
                    ['Street', detail.street],
                    ['Reported', fmt(detail.timestamp)],
                    ['Severity', `${detail.severity}/10`],
                    ['AI Tag', detail.aiTag],
                    ['Upvotes', String(detail.upvotes)],
                  ].map(([l, v]) => (
                    <div key={l} className="bg-gray-50 rounded-lg p-2">
                      <p className="text-muted-foreground">{l}</p>
                      <p className="font-medium truncate">{v}</p>
                    </div>
                  ))}
                </div>

                {/* Description */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Description</p>
                  <p className="text-sm text-gray-700">{detail.description}</p>
                </div>

                {/* ── Deadline section ───────────────────────────────────── */}
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Timer className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-semibold text-orange-900">Set Deadline</span>
                    </div>
                    {detail.deadline && (() => {
                      const dl = fmtDeadline(detail.deadline);
                      return (
                        <span className={`text-xs font-bold px-2 py-1 rounded-full bg-white ${dl.color}`}>
                          {dl.overdue ? '⚠️ OVERDUE' : `⏰ ${dl.label}`}
                        </span>
                      );
                    })()}
                  </div>
                  {detail.deadline && (
                    <p className="text-xs text-orange-700">
                      Deadline: {new Date(detail.deadline).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                  <p className="text-xs text-orange-600">Missing a deadline deducts 5 pts from city ranking.</p>
                  {showDeadlinePicker ? (
                    <div className="flex gap-2 items-center">
                      <input type="datetime-local" value={deadlineInput} onChange={e => setDeadlineInput(e.target.value)}
                        className="flex-1 text-xs border border-orange-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white" />
                      <Button size="sm" className="bg-orange-600 hover:bg-orange-500 text-white text-xs" onClick={handleDeadlineSave} disabled={!deadlineInput}>
                        Save
                      </Button>
                      <button onClick={() => setShowDeadlinePicker(false)} className="text-orange-600 hover:text-orange-800 text-xs">Cancel</button>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" className="border-orange-400 text-orange-700 hover:bg-orange-100 text-xs gap-1.5"
                      onClick={() => { setShowDeadlinePicker(true); setDeadlineInput(''); }}>
                      <Calendar className="w-3.5 h-3.5" />{detail.deadline ? 'Change Deadline' : 'Set Deadline'}
                    </Button>
                  )}
                </div>

                {/* Assign / Re-assign department — always editable */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {detail.assignedDept ? 'Re-assign Department' : 'Assign Department'}
                    </p>
                    {detail.assignedDept && (
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        Current: <strong>{detail.assignedDept}</strong>
                      </span>
                    )}
                  </div>
                  {detail.aiSuggestedDept && detail.aiSuggestedDept !== detail.assignedDept && (
                    <p className="text-xs text-blue-500 mb-2 flex items-center gap-1">
                      🤖 AI recommends: <strong>{detail.aiSuggestedDept}</strong> — tap to apply or choose any dept below
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    {DEPARTMENTS.map(d => (
                      <button key={d.id}
                        onClick={() => handleAssign(detail.id, d.id)}
                        className={`text-xs py-2.5 px-3 rounded-lg border transition-all font-medium text-left ${
                          detail.assignedDept === d.id
                            ? `${d.color} ring-2 ring-current`
                            : 'border-gray-200 hover:border-primary hover:bg-primary/5 text-gray-600'
                        }`}>
                        <div className="flex items-center justify-between">
                          <p className="font-semibold">{d.id}</p>
                          {detail.assignedDept === d.id && <span className="text-xs">✓</span>}
                        </div>
                        <p className="text-xs opacity-75 truncate">{d.fullName}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comments */}
                {detail.comments.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Citizen Comments ({detail.comments.length})</p>
                    <div className="space-y-2">
                      {detail.comments.map(c => (
                        <div key={c.id} className="bg-gray-50 rounded-lg p-3 text-xs">
                          <div className="flex justify-between mb-1">
                            <span className="font-medium">{c.author}</span>
                            <span className="text-muted-foreground">{fmt(c.timestamp)}</span>
                          </div>
                          <p className="text-gray-700">{c.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Root export ───────────────────────────────────────────────────────────────
interface AdminPortalProps {
  allReports: Report[];
  onAssignDept: (reportId: string, dept: string) => void;
  onSetDeadline: (reportId: string, deadline: string) => void;
  onClose: () => void;
}

export function AdminPortal({ allReports, onAssignDept, onSetDeadline, onClose }: AdminPortalProps) {
  const [session, setSession] = useState<{ email: string; city: string; name: string } | null>(null);

  return (
    <div className="min-h-screen bg-background w-full relative overflow-y-auto">
      {session
        ? <AdminDashboard adminName={session.name} adminCity={session.city} allReports={allReports}
            onAssignDept={onAssignDept} onSetDeadline={onSetDeadline}
            onLogout={() => setSession(null)} onBackToApp={onClose} />
        : <AdminLogin onLogin={(_email, city, name) => setSession({ email: _email, city, name })} onBackToApp={onClose} />}
    </div>
  );
}
