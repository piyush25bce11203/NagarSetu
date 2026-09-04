import React, { useState, useMemo } from 'react';
import logoSVH from '../images/logoSVH.png';
import { MiniMap } from './MiniMap';
import {
  HardHat, LogIn, Lock, Mail, Eye, EyeOff, LogOut,
  CheckCircle, AlertCircle, Clock, MapPin, RefreshCw, X, Search, Filter, FileText, Wrench
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { STAFF_ACCOUNTS, DEPARTMENTS } from '../data/mockReports';
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

// ── Login ─────────────────────────────────────────────────────────────────────
function StaffLogin({ onLogin }: { onLogin: (email: string, city: string, dept: string, name: string) => void }) {
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

  const deptColors: Record<string, string> = { PWD:'bg-blue-100 text-blue-800', MSWM:'bg-green-100 text-green-800', MVB:'bg-cyan-100 text-cyan-800', USLD:'bg-yellow-100 text-yellow-800' };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-0 overflow-hidden">

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
          <p className="text-slate-500 text-xs mt-1">SVH 2026 · Municipal Field Operations</p>
        </motion.div>

        {/* Department chips */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex gap-2 mt-5 flex-wrap justify-center"
        >
          {['PWD', 'MSWM', 'MVB', 'USLD'].map(dept => (
            <span key={dept} className="flex items-center gap-1 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-300 text-xs font-medium">
              <Wrench className="w-3 h-3" />{dept}
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
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 z-10" />
                <Input value={email} onChange={e=>setEmail(e.target.value)}
                  placeholder="pwd.indore@nagarsetu.gov.in"
                  className="pl-9 bg-white border-white/30 text-slate-900 placeholder:text-slate-400 focus-visible:ring-teal-400" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-slate-300 text-sm">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 z-10" />
                <Input type={showPw?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)}
                  placeholder="staff123"
                  className="pl-9 pr-10 bg-white border-white/30 text-slate-900 placeholder:text-slate-400 focus-visible:ring-teal-400" />
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
            {['Indore','Ujjain','Bhopal'].map(city => (
              <div key={city}>
                <p className="text-slate-300 font-medium mt-1">{city}</p>
                {['pwd','mswm','water','lights'].map(prefix => {
                  const email = `${prefix}.${city.toLowerCase()}@nagarsetu.gov.in`;
                  const acct  = STAFF_ACCOUNTS[email];
                  return (
                    <p key={prefix} className="text-xs">
                      <span className={`inline-block px-1.5 rounded text-xs mr-1 ${deptColors[acct?.dept] || ''}`}>{acct?.dept}</span>
                      {email}
                    </p>
                  );
                })}
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function StaffDashboard({
  staffName, staffCity, staffDept,
  allReports, onStatusUpdate, onLogout,
}: {
  staffName: string; staffCity: string; staffDept: string;
  allReports: Report[];
  onStatusUpdate: (id: string, status: Report['status']) => void;
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

  const [search, setSearch]     = useState('');
  const [statusFilter, setStatus] = useState('all');
  const [detail, setDetail]     = useState<Report | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

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

      <div className="p-4 space-y-4 max-w-4xl mx-auto">

        {/* stats */}
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
                return (
                  <motion.div key={report.id} className="bg-white rounded-xl border hover:shadow-md transition-all"
                    initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04 }}>
                    <div className="p-4 cursor-pointer" onClick={()=>setDetail(report)}>
                      <div className="flex gap-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                          <img src={report.imageUrl} alt={report.title} className="w-full h-full object-cover"
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
                          onClick={()=>handleStatusUpdate(report.id, nextStatus(report.status)!)}
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
      </div>

      {/* detail drawer */}
      <AnimatePresence>
        {detail && (
          <>
            <motion.div
              className="absolute inset-0 bg-black/40 z-40"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDetail(null)}
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
                <button onClick={()=>setDetail(null)} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-4 h-4"/></button>
              </div>
              <div className="p-4 space-y-4">
                <div className="aspect-video rounded-xl overflow-hidden bg-gray-100">
                  <img src={detail.imageUrl} alt={detail.title} className="w-full h-full object-cover"
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

                {/* status progression */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Update Status</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(['acknowledged','submitted','resolved'] as Report['status'][]).map(s => (
                      <button key={s}
                        disabled={detail.status===s||updating===detail.id}
                        onClick={()=>handleStatusUpdate(detail.id,s)}
                        className={`text-xs py-2 px-3 rounded-lg border transition-all font-medium ${
                          detail.status===s ? `${statusConfig[s].color} cursor-default` : 'border-gray-200 hover:border-primary hover:bg-primary hover:text-white text-gray-600'
                        }`}>
                        {statusConfig[s].label}
                      </button>
                    ))}
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
  onClose: () => void;
}

export function StaffPortal({ allReports, onStatusUpdate }: StaffPortalProps) {
  const [session, setSession] = useState<{ email: string; city: string; dept: string; name: string } | null>(null);

  return (
    <div className="min-h-screen bg-background w-full mx-auto relative mobile-container overflow-y-auto">
      {session
        ? <StaffDashboard staffName={session.name} staffCity={session.city} staffDept={session.dept}
            allReports={allReports} onStatusUpdate={onStatusUpdate} onLogout={() => setSession(null)} />
        : <StaffLogin onLogin={(email, city, dept, name) => setSession({ email, city, dept, name })} />}
    </div>
  );
}
