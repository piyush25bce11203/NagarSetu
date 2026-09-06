import React, { useState, useMemo, useRef, useEffect } from 'react';
import logoSVH from '../images/logoSVH.png';
import { MiniMap } from './MiniMap';
import {
  HardHat, LogIn, Eye, EyeOff, LogOut,
  CheckCircle, AlertCircle, Clock, MapPin, RefreshCw, X, Search, Filter, FileText, Wrench,
  Trophy, Crown, Medal, Award, Star, Timer, ImagePlus, Camera, Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { STAFF_ACCOUNTS, DEPARTMENTS, CITY_LIST } from '../data/mockReports';
import type { Report } from '../App';

const statusConfig: Record<Report['status'], { label: string; color: string; dot: string }> = {
  pending:      { label: 'Pending',      color: 'bg-red-100 text-red-800',       dot: 'bg-red-500'    },
  acknowledged: { label: 'Assigned',     color: 'bg-blue-100 text-blue-800',     dot: 'bg-blue-500'   },
  submitted:    { label: 'In Progress',  color: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-500' },
  resolved:     { label: 'Resolved',     color: 'bg-green-100 text-green-800',   dot: 'bg-green-500'  },
};

function fmt(ts: Date) {
  const d = Date.now() - ts.getTime(), m = Math.floor(d/60000), h = Math.floor(d/3600000), dy = Math.floor(d/86400000);
  return m < 60 ? `${m}m ago` : h < 24 ? `${h}h ago` : `${dy}d ago`;
}

// ── Staff City Ranking ────────────────────────────────────────────────────────
function StaffCityRanking({ allReports, myCity }: { allReports: Report[]; myCity: string }) {
  const cityStats = useMemo(() => {
    return CITY_LIST.map(city => {
      const cityR    = allReports.filter(r => r.district === city);
      const total    = cityR.length;
      const resolved = cityR.filter(r => r.status === 'resolved').length;
      const overdue  = cityR.filter(r => r.deadline && new Date(r.deadline) < new Date() && r.status !== 'resolved').length;
      const score    = total > 0 ? Math.max(0, Math.round((resolved / total) * 100) - overdue * 5) : 0;
      return { city, total, resolved, overdue, score };
    }).sort((a, b) => b.score - a.score);
  }, [allReports]);

  const medals      = [Crown, Medal, Award];
  const medalColors = ['text-yellow-500', 'text-gray-400', 'text-amber-600'];
  const bgColors    = ['bg-yellow-50 border-yellow-200', 'bg-gray-50 border-gray-200', 'bg-amber-50 border-amber-200'];

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl p-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Trophy className="w-5 h-5 text-yellow-300" />
          <h2 className="font-bold text-base">City Ranking</h2>
        </div>
        <p className="text-xs text-white/80">Score = (Resolved ÷ Total) × 100 − (Overdue × 5 pts)</p>
      </div>

      {cityStats.map((s, i) => {
        const MedalIcon = medals[i] || Star;
        const isMyCity  = s.city === myCity;
        return (
          <motion.div key={s.city}
            className={`rounded-xl border p-4 ${bgColors[i] || 'bg-white border-gray-200'} ${isMyCity ? 'ring-2 ring-teal-500' : ''}`}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MedalIcon className={`w-5 h-5 ${medalColors[i] || 'text-slate-400'}`} />
                <span className="font-bold text-gray-900 text-base">
                  #{i + 1} {s.city}
                  {isMyCity && <span className="ml-1.5 text-xs font-semibold text-teal-600 bg-teal-100 px-2 py-0.5 rounded-full">Your City</span>}
                </span>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold ${i === 0 ? 'text-yellow-600' : i === 1 ? 'text-gray-600' : 'text-amber-700'}`}>{s.score}</p>
                <p className="text-xs text-gray-500">pts</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div className={`h-2 rounded-full ${i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-500' : 'bg-amber-500'}`}
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
      <Card className="p-4 bg-teal-50 border-teal-200">
        <p className="text-xs font-semibold text-teal-800 mb-2">Improve Your City's Ranking</p>
        <div className="space-y-1 text-xs text-teal-700">
          <p>✅ Resolve your assigned complaints faster</p>
          <p>⏰ Don't miss deadlines — each miss costs 5 pts</p>
          <p>📈 More resolutions = higher city score</p>
        </div>
      </Card>
    </div>
  );
}

// ── Login ─────────────────────────────────────────────────────────────────────
function StaffLogin({ onLogin, onBackToApp }: { onLogin: (email: string, city: string, dept: string, name: string) => void; onBackToApp: () => void }) {
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
      const acct = STAFF_ACCOUNTS[email.toLowerCase().trim()];
      if (acct && acct.password === password) {
        onLogin(email, acct.city, acct.dept, acct.name);
      } else {
        setError('Invalid email or password. Use staff credentials.');
      }
    }, 700);
  };

  const deptColors: Record<string, string> = {
    PWD:'bg-blue-100 text-blue-800', MSWM:'bg-green-100 text-green-800',
    MVB:'bg-cyan-100 text-cyan-800', USLD:'bg-yellow-100 text-yellow-800',
    DRAIN:'bg-purple-100 text-purple-800', ELECT:'bg-orange-100 text-orange-800',
    FIRE:'bg-red-100 text-red-800', SEWAGE:'bg-amber-100 text-amber-800',
    ANIMAL:'bg-lime-100 text-lime-800',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-0 overflow-hidden">
      {/* Back to App button */}
      <motion.button
        onClick={onBackToApp}
        className="absolute top-4 left-4 z-50 flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-full px-3 py-1.5 transition-all active:scale-95"
        initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
        whileTap={{ scale: 0.92 }}
      >
        ← Back
      </motion.button>

      {/* ── Hero top section ──────────────────────────────────────────────── */}
      <div className="relative w-full flex flex-col items-center pt-50 pb-10 px-6 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-[-60px] left-[-40px] w-56 h-56 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-[-20px] right-[-50px] w-48 h-48 bg-emerald-400/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-72 h-20 bg-teal-600/10 rounded-full blur-2xl pointer-events-none" />

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative mb-5"
        >
          <div className="absolute inset-0 rounded-full bg-teal-500/30 blur-xl scale-125 pointer-events-none" />
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-teal-400/40 shadow-2xl shadow-teal-900/50">
            <img src={logoSVH} alt="NagarSetu" className="w-full h-full object-cover" />
          </div>
          {/* HardHat badge */}
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center border-2 border-slate-900 shadow-lg">
            <HardHat className="w-4 h-4 text-white" />
          </div>
        </motion.div>

        {/* App name */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-center"
        >
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Nagar<span className="text-teal-400">Setu</span>
          </h1>
          <p className="text-teal-300/80 text-sm mt-1 font-medium">Department Staff Portal</p>
          <p className="text-slate-500 text-xs mt-1">Municipal Field Operations</p>
        </motion.div>

        {/* Department chips */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex gap-1.5 mt-5 flex-wrap justify-center max-w-xs"
        >
          {DEPARTMENTS.map(dept => (
            <span key={dept.id} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-300 text-xs font-medium">
              <Wrench className="w-3 h-3" />{dept.id}
            </span>
          ))}
        </motion.div>

        {/* Shimmer divider */}
        <div className="mt-8 w-full max-w-sm h-px bg-gradient-to-r from-transparent via-teal-500/40 to-transparent" />
      </div>

      {/* ── Login card ────────────────────────────────────────────────────── */}
      <motion.div className="w-full max-w-sm px-6 pb-10" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}>
        <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm shadow-2xl">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 bg-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <HardHat className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-base font-semibold text-white">Staff Sign In</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1">
              <Label className="text-slate-300 text-sm">Staff Email</Label>
              <Input value={email} onChange={e=>setEmail(e.target.value)}
                placeholder="pwd.indore@nagarsetu.gov.in"
                className="bg-white border-white/30 text-slate-900 placeholder:text-slate-400 focus-visible:ring-teal-400" />
            </div>
            <div className="space-y-1">
              <Label className="text-slate-300 text-sm">Password</Label>
              <div className="relative">
                <Input type={showPw?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)}
                  placeholder="staff123"
                  className="pr-10 bg-white border-white/30 text-slate-900 placeholder:text-slate-400 focus-visible:ring-teal-400" />
                <button type="button" onClick={()=>setShowPw(v=>!v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800">
                  {showPw ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                </button>
              </div>
            </div>
            {error && <motion.p className="text-red-400 text-xs flex items-center gap-1" initial={{ opacity:0 }} animate={{ opacity:1 }}><AlertCircle className="w-3 h-3"/>{error}</motion.p>}
            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-500 text-white" disabled={loading}>
              {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Signing in...</span>
                       : <span className="flex items-center gap-2"><LogIn className="w-4 h-4"/>Sign In</span>}
            </Button>
          </form>

          {/* credentials hint */}
          <div className="mt-4 p-3 bg-white/5 rounded-lg text-xs text-slate-400 space-y-1.5">
            <p className="font-medium text-slate-300">Staff credentials (password: staff123)</p>
            <p className="text-slate-400 text-xs">Format: dept.city@nagarsetu.gov.in</p>
            <div className="grid grid-cols-2 gap-1 mt-1">
              {['Indore','Ujjain','Bhopal'].map(city => (
                <div key={city} className="bg-white/5 rounded p-1.5">
                  <p className="text-teal-300 font-medium text-xs mb-0.5">{city}</p>
                  {DEPARTMENTS.slice(0,5).map(dept => {
                    const prefix = dept.id.toLowerCase();
                    const emailKey = `${prefix}.${city.toLowerCase()}@nagarsetu.gov.in`;
                    const acct = STAFF_ACCOUNTS[emailKey];
                    if (!acct) return null;
                    return (
                      <p key={dept.id} className="text-xs leading-tight text-slate-400">
                        <span className={`inline-block px-1 rounded text-xs mr-1 ${deptColors[acct.dept] || 'bg-gray-100 text-gray-700'}`}>{acct.dept}</span>
                        {prefix}.{city.toLowerCase()}@nagarsetu.gov.in
                      </p>
                    );
                  })}
                  <p className="text-xs text-slate-500 italic mt-0.5">+ {DEPARTMENTS.length - 5} more depts…</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function StaffDashboard({
  staffName, staffCity, staffDept,
  allReports, onStatusUpdate, onResolveWithProof, onLogout,
}: {
  staffName: string; staffCity: string; staffDept: string;
  allReports: Report[];
  onStatusUpdate: (id: string, status: Report['status']) => void;
  onResolveWithProof: (id: string, proofUrl: string) => void;
  onLogout: () => void;
}) {
  const deptInfo = DEPARTMENTS.find(d => d.id === staffDept);

  // Staff only sees complaints in their city AND assigned to their dept
  const myReports = useMemo(
    () => allReports
      .filter(r => r.district === staffCity && r.assignedDept === staffDept)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
    [allReports, staffCity, staffDept]
  );

  const [tab, setTab]           = useState<'complaints' | 'ranking'>('complaints');
  const [search, setSearch]     = useState('');
  const [statusFilter, setStatus] = useState('all');
  const [detail, setDetail]     = useState<Report | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  // Proof image state for resolving
  const [proofPreview, setProofPreview]   = useState<string>('');
  const [, setShowProofUpload] = useState(false);
  const proofInputRef  = useRef<HTMLInputElement>(null);
  const proofCameraInputRef = useRef<HTMLInputElement>(null);
  // Keep a ref to always-current detail so handlers never read stale closure
  const detailRef      = useRef<Report | null>(null);
  const proofPreviewRef = useRef<string>('');

  // Keep refs in sync
  useEffect(() => { detailRef.current = detail; }, [detail]);
  useEffect(() => { proofPreviewRef.current = proofPreview; }, [proofPreview]);

  const stats = useMemo(() => ({
    total:      myReports.length,
    pending:    myReports.filter(r => r.status === 'pending' || r.status === 'acknowledged').length,
    inProgress: myReports.filter(r => r.status === 'submitted').length,
    resolved:   myReports.filter(r => r.status === 'resolved').length,
  }), [myReports]);

  const filtered = useMemo(() => myReports.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (search && !`${r.title} ${r.ward} ${r.street}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [myReports, statusFilter, search]);

  const handleStatusUpdate = (id: string, status: Report['status']) => {
    setUpdating(id);
    setTimeout(() => {
      onStatusUpdate(id, status);
      setDetail(prev => prev?.id === id ? { ...prev, status } : prev);
      setUpdating(null);
    }, 400);
  };

  const handleProofImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => setProofPreview(String(reader.result));
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSubmitWithProof = () => {
    // Read from refs — avoids stale closure issue entirely
    const currentDetail = detailRef.current;
    const currentProof  = proofPreviewRef.current;
    if (!currentDetail || !currentProof) return;

    const reportId = currentDetail.id;
    // Persist to App storage
    onResolveWithProof(reportId, currentProof);
    // Update drawer to show resolved state immediately
    const resolved = { ...currentDetail, status: 'resolved' as const, resolutionProofUrl: currentProof };
    detailRef.current = resolved;
    setDetail(resolved);
    setProofPreview('');
    setShowProofUpload(false);
    setUpdating(null);
  };

  const nextStatus = (current: Report['status']): Report['status'] | null => {
    if (current === 'pending')      return 'acknowledged';
    if (current === 'acknowledged') return 'submitted';
    if (current === 'submitted')    return 'resolved';
    return null;
  };
  const nextLabel = (current: Report['status']) => {
    const n = nextStatus(current);
    if (!n) return null;
    if (n === 'acknowledged') return 'Mark Assigned';
    if (n === 'submitted')    return 'Start Work';
    if (n === 'resolved')     return 'Mark Resolved';
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-x-hidden">
      {/* top bar */}
      <div className="bg-slate-800 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <HardHat className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm leading-none" style={{ color: '#5eead4' }}>{staffDept} — {staffCity}</p>
            <p className="text-xs mt-0.5" style={{ color: '#cbd5e1' }}>{deptInfo?.fullName} · {staffName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded-full hidden sm:inline-block ${deptInfo?.color}`}>{myReports.length} assigned</span>
          <Button variant="ghost" size="sm" onClick={onLogout} className="text-slate-400 hover:text-white hover:bg-white/10 gap-1.5">
            <LogOut className="w-4 h-4"/><span className="text-xs hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="bg-white border-b sticky top-14 z-20">
        <div className="flex max-w-4xl mx-auto">
          {([
            { id: 'complaints', label: 'My Work',     icon: FileText },
            { id: 'ranking',    label: 'City Ranking', icon: Trophy   },
          ] as const).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold border-b-2 transition-colors ${
                tab === t.id ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              <t.icon className="w-3.5 h-3.5" />{t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-4xl mx-auto">

        {/* ── CITY RANKING TAB ──────────────────────────────────────────── */}
        {tab === 'ranking' && (
          <StaffCityRanking allReports={allReports} myCity={staffCity} />
        )}

        {/* ── COMPLAINTS TAB ────────────────────────────────────────────── */}
        {tab === 'complaints' && (
          <>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label:'Assigned',    v:stats.total,      color:'text-slate-700', bg:'bg-white',      icon:FileText    },
            { label:'Pending',     v:stats.pending,    color:'text-red-600',   bg:'bg-red-50',     icon:AlertCircle },
            { label:'In Progress', v:stats.inProgress, color:'text-yellow-600',bg:'bg-yellow-50',  icon:RefreshCw   },
            { label:'Resolved',    v:stats.resolved,   color:'text-green-600', bg:'bg-green-50',   icon:CheckCircle },
          ].map(s=>(
            <motion.div key={s.label} className={`${s.bg} rounded-xl border p-3 flex flex-col gap-1`} whileHover={{ scale:1.02 }}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <p className={`text-xl font-bold ${s.color}`}>{s.v}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* no assignments yet */}
        {myReports.length === 0 && (
          <div className="bg-white rounded-xl border p-10 text-center">
            <HardHat className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium text-gray-700">No complaints assigned yet</p>
            <p className="text-sm text-muted-foreground mt-1">The city admin will assign {staffDept} complaints from {staffCity} here.</p>
          </div>
        )}

        {myReports.length > 0 && (
          <>
            {/* filters */}
            <div className="bg-white rounded-xl border p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-gray-900">My Complaints</span>
                <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-full">{filtered.length} shown</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                <div className="relative flex-1 min-w-[160px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} className="pl-9 h-8 text-xs" />
                </div>
                {(['all','pending','acknowledged','submitted','resolved'] as const).map(s => (
                  <button key={s} onClick={()=>setStatus(s)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                      statusFilter===s ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600 hover:border-primary'}`}>
                    {s==='all'?'All':statusConfig[s as Report['status']]?.label}
                  </button>
                ))}
              </div>
            </div>

            {/* list */}
            <div className="space-y-3">
              {filtered.map((report, i) => {
                const sc = statusConfig[report.status];
                const nl = nextLabel(report.status);
                const imgSrc = report.media?.[0]?.url || report.imageUrl;
                return (
                  <motion.div key={report.id} className="bg-white rounded-xl border hover:shadow-md transition-all"
                    initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04 }}>
                    <div className="p-4 cursor-pointer" onClick={()=>setDetail(report)}>
                      <div className="flex gap-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                          <img src={imgSrc} alt={report.title} className="w-full h-full object-cover"
                            onError={e=>{(e.target as HTMLImageElement).src='https://placehold.co/64x64?text=N/A';}} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{report.title}</h3>
                            <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${sc.color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}/>{sc.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3"/>{report.ward}</span>
                            <span>·</span>
                            <span className="flex items-center gap-0.5"><Clock className="w-3 h-3"/>{fmt(report.timestamp)}</span>
                            {report.deadline && (() => {
                              const diff = new Date(report.deadline).getTime() - Date.now();
                              const overdue = diff < 0;
                              const h = Math.floor(diff / 3600000);
                              const dy = Math.floor(diff / 86400000);
                              return (
                                <span className={`flex items-center gap-0.5 text-xs font-medium ${overdue ? 'text-red-600' : h < 24 ? 'text-orange-500' : 'text-blue-500'}`}>
                                  <Timer className="w-3 h-3"/>
                                  {overdue ? 'OVERDUE' : h < 24 ? `${h}h left` : `${dy}d left`}
                                </span>
                              );
                            })()}
                          </div>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-1">{report.description}</p>
                        </div>
                      </div>
                    </div>

                    {/* action row */}
                    {nl && (
                      <div className="px-4 pb-4 pt-2 border-t flex items-center justify-between gap-2" onClick={e=>e.stopPropagation()}>
                        <span className="text-xs text-muted-foreground">Update progress:</span>
                        <Button size="sm"
                          disabled={updating===report.id}
                          onClick={() => {
                            // "Mark Resolved" opens drawer to upload proof
                            if (nextStatus(report.status) === 'resolved') {
                              setDetail(report);
                            } else {
                              handleStatusUpdate(report.id, nextStatus(report.status)!);
                            }
                          }}
                          className={`text-xs gap-1.5 ${report.status==='submitted'?'bg-green-600 hover:bg-green-500':''}`}>
                          {updating===report.id
                            ? <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"/>Working...</>
                            : <><CheckCircle className="w-3 h-3"/>{nl}</>}
                        </Button>
                      </div>
                    )}
                    {report.status === 'resolved' && (
                      <div className="px-4 pb-3 pt-2 border-t">
                        <span className="text-xs text-green-600 font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3"/>Complaint resolved</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
          </>
        )}
      </div>

      {/* detail drawer */}
      <AnimatePresence>
        {detail && (
          <>
            <motion.div
              className="absolute inset-0 bg-black/40 z-40"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setDetail(null); setProofPreview(''); setShowProofUpload(false); }}
            />
            <motion.div
              className="absolute right-0 top-0 bottom-0 w-full bg-white z-50 shadow-2xl overflow-y-auto"
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 400 }}
            >
              <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between z-10">
                <div>
                  <h3 className="font-semibold text-sm line-clamp-1">{detail.title}</h3>
                  <p className="text-xs text-muted-foreground">#{detail.id} · {detail.district}</p>
                </div>
                <button onClick={()=>{ setDetail(null); setProofPreview(''); setShowProofUpload(false); }} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-4 h-4"/></button>
              </div>
              <div className="p-4 space-y-4">
                <div className="aspect-video rounded-xl overflow-hidden bg-gray-100">
                  <img src={detail.media?.[0]?.url || detail.imageUrl} alt={detail.title} className="w-full h-full object-cover"
                    onError={e=>{(e.target as HTMLImageElement).src='https://placehold.co/400x225?text=No+Image';}}/>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full font-medium ${statusConfig[detail.status].color}`}>
                    <span className={`w-2 h-2 rounded-full ${statusConfig[detail.status].dot}`}/>{statusConfig[detail.status].label}
                  </span>
                  {detail.priority && <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600">{detail.priority} priority</span>}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[['Ward',detail.ward],['Street',detail.street],['Reported',fmt(detail.timestamp)],['Severity',`${detail.severity}/10`],['Upvotes',String(detail.upvotes)],['Comments',String(detail.comments.length)]].map(([l,v])=>(
                    <div key={l} className="bg-gray-50 rounded-lg p-2"><p className="text-muted-foreground">{l}</p><p className="font-medium truncate">{v}</p></div>
                  ))}
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Description</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{detail.description}</p>
                </div>

                {/* ── Location map ─────────────────────────────────────── */}
                {detail.coordinates?.lat && detail.coordinates?.lng && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Complaint Location
                    </p>
                    <MiniMap
                      lat={detail.coordinates.lat}
                      lng={detail.coordinates.lng}
                      label={detail.ward}
                      className="w-full h-44"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {detail.coordinates.lat.toFixed(5)}, {detail.coordinates.lng.toFixed(5)}
                      {detail.street ? ` · ${detail.street}` : ''}
                    </p>
                  </div>
                )}

                {/* ── Resolution proof photo (required before marking resolved) ── */}
                {detail.status !== 'resolved' && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-green-700" />
                      <p className="text-sm font-semibold text-green-900">Resolution Proof Photo</p>
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Required to resolve</span>
                    </div>
                    <p className="text-xs text-green-700">Upload a photo showing the issue has been fixed. This will be visible to the citizen in their report.</p>

                    {/* hidden file input */}
                    <input ref={proofInputRef} type="file" accept="image/*" className="hidden" onChange={handleProofImageChange} />
                    <input ref={proofCameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleProofImageChange} />

                    {proofPreview ? (
                      <div className="space-y-2">
                        <div className="rounded-lg overflow-hidden bg-gray-100 w-full" style={{ maxHeight: '200px' }}>
                          <img src={proofPreview} alt="Proof" className="w-full object-contain" style={{ maxHeight: '200px' }} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <button onClick={() => proofCameraInputRef.current?.click()}
                            className="text-xs border border-green-400 text-green-700 rounded-lg py-2 hover:bg-green-100 flex items-center justify-center gap-1">
                            <Camera className="w-3 h-3" /> Retake Photo
                          </button>
                          <button onClick={() => proofInputRef.current?.click()}
                            className="text-xs border border-green-400 text-green-700 rounded-lg py-2 hover:bg-green-100 flex items-center justify-center gap-1">
                            <Upload className="w-3 h-3" />Change Photo
                          </button>
                        </div>
                        <button onClick={() => setProofPreview('')}
                          className="w-full text-xs border border-red-300 text-red-600 rounded-lg py-2 hover:bg-red-50 flex items-center justify-center gap-1">
                          <X className="w-3 h-3" /> Remove Photo
                        </button>
                        <Button
                          className="w-full bg-green-600 hover:bg-green-500 text-white gap-2"
                          disabled={false}
                          onClick={handleSubmitWithProof}>
                          <CheckCircle className="w-4 h-4" />Submit Proof &amp; Mark Resolved
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-2">
                          <button onClick={() => proofCameraInputRef.current?.click()}
                            className="border-2 border-dashed border-green-400 rounded-lg py-5 flex flex-col items-center gap-2 text-green-700 hover:bg-green-100 transition-all">
                            <Camera className="w-7 h-7" />
                            <span className="text-xs font-medium">Take Photo</span>
                          </button>
                          <button onClick={() => proofInputRef.current?.click()}
                            className="border-2 border-dashed border-green-400 rounded-lg py-5 flex flex-col items-center gap-2 text-green-700 hover:bg-green-100 transition-all">
                            <ImagePlus className="w-7 h-7" />
                            <span className="text-xs font-medium">Choose Photo</span>
                          </button>
                        </div>
                        <p className="text-xs text-center text-green-500">A photo of completed work is required</p>
                      </>
                    )}
                  </div>
                )}

                {/* Show proof if already resolved */}
                {detail.status === 'resolved' && detail.resolutionProofUrl && (
                  <div className="bg-green-50 border border-green-200 rounded-xl overflow-hidden">
                    <div className="px-3 py-2 flex items-center gap-2 bg-green-100 border-b border-green-200">
                      <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                      <span className="text-xs font-semibold text-green-800">Resolution Proof Photo</span>
                    </div>
                    <div style={{ maxHeight: '200px' }} className="flex items-center justify-center bg-gray-50">
                      <img src={detail.resolutionProofUrl} alt="Resolution proof"
                        className="w-full object-contain" style={{ maxHeight: '200px' }}
                        onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x200?text=No+Proof'; }} />
                    </div>
                  </div>
                )}

                {/* status progression — only for non-resolved steps, resolved requires proof above */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Update Status</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(['acknowledged','submitted'] as Report['status'][]).map(s => (
                      <button key={s}
                        disabled={detail.status===s || updating===detail.id}
                        onClick={()=>handleStatusUpdate(detail.id, s)}
                        className={`text-xs py-2 px-3 rounded-lg border transition-all font-medium ${
                          detail.status===s ? `${statusConfig[s].color} cursor-default` : 'border-gray-200 hover:border-primary hover:bg-primary hover:text-white text-gray-600'
                        }`}>
                        {statusConfig[s].label}
                      </button>
                    ))}
                    {/* Resolved — opens proof capture or submits once proof is ready */}
                    <button
                      disabled={detail.status === 'resolved'}
                      onClick={() => proofPreview ? handleSubmitWithProof() : proofCameraInputRef.current?.click()}
                      className={`text-xs py-2 px-3 rounded-lg border font-medium transition-all ${
                        detail.status === 'resolved'
                          ? `${statusConfig['resolved'].color} cursor-default`
                          : proofPreview
                          ? 'border-green-500 bg-green-50 text-green-700 hover:bg-green-100'
                          : 'border-green-300 text-green-700 hover:bg-green-50'
                      }`}>
                      {detail.status === 'resolved' ? '✓ Resolved' : proofPreview ? 'Mark Resolved' : 'Add Proof & Resolve'}
                    </button>
                  </div>
                </div>
                {detail.comments.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Citizen Comments ({detail.comments.length})</p>
                    <div className="space-y-2">
                      {detail.comments.map(c=>(
                        <div key={c.id} className="bg-gray-50 rounded-lg p-3 text-xs">
                          <div className="flex justify-between mb-1"><span className="font-medium">{c.author}</span><span className="text-muted-foreground">{fmt(c.timestamp)}</span></div>
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
interface StaffPortalProps {
  allReports: Report[];
  onStatusUpdate: (reportId: string, status: Report['status']) => void;
  onResolveWithProof: (reportId: string, proofUrl: string) => void;
  onClose: () => void;
}

export function StaffPortal({ allReports, onStatusUpdate, onResolveWithProof, onClose }: StaffPortalProps) {
  const [session, setSession] = useState<{ email: string; city: string; dept: string; name: string } | null>(null);

  return (
    <div className="min-h-screen bg-background w-full relative overflow-y-auto">
      {session
        ? <StaffDashboard staffName={session.name} staffCity={session.city} staffDept={session.dept}
            allReports={allReports} onStatusUpdate={onStatusUpdate} onResolveWithProof={onResolveWithProof}
            onLogout={() => setSession(null)} />
        : <StaffLogin onLogin={(email, city, dept, name) => setSession({ email, city, dept, name })} onBackToApp={onClose} />}
    </div>
  );
}
