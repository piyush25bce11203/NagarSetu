import React, { useState, useMemo } from 'react';
import logoSVH from '../images/logoSVH.png';
import {
  Shield, LogIn, Lock, Mail, Eye, EyeOff, LogOut,
  BarChart3, MapPin, Clock, CheckCircle, AlertCircle,
  Filter, Search, X, TrendingUp, FileText, RefreshCw, Download, Send,
  Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ADMIN_ACCOUNTS, DEPARTMENTS } from '../data/mockReports';
import type { Report } from '../App';

const statusConfig: Record<Report['status'], { label: string; color: string; dot: string }> = {
  pending:      { label: 'Pending',      color: 'bg-red-100 text-red-800',       dot: 'bg-red-500'    },
  acknowledged: { label: 'Acknowledged', color: 'bg-blue-100 text-blue-800',     dot: 'bg-blue-500'   },
  submitted:    { label: 'In Progress',  color: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-500' },
  resolved:     { label: 'Resolved',     color: 'bg-green-100 text-green-800',   dot: 'bg-green-500'  },
};

const priorityConfig: Record<string, { color: string }> = {
  high:   { color: 'bg-red-50 text-red-700 border border-red-200'    },
  medium: { color: 'bg-yellow-50 text-yellow-700 border border-yellow-200' },
  low:    { color: 'bg-green-50 text-green-700 border border-green-200'  },
};

function fmt(ts: Date) {
  const d = Date.now() - ts.getTime(), m = Math.floor(d/60000), h = Math.floor(d/3600000), dy = Math.floor(d/86400000);
  return m < 60 ? `${m}m ago` : h < 24 ? `${h}h ago` : `${dy}d ago`;
}

// ── Login ─────────────────────────────────────────────────────────────────────
function AdminLogin({ onLogin }: { onLogin: (email: string, city: string, name: string) => void }) {
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

      {/* ── Hero top section ──────────────────────────────────────────────── */}
      <div className="relative w-full flex flex-col items-center pt-12 pb-10 px-6 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-[-60px] left-[-60px] w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-[-30px] right-[-40px] w-48 h-48 bg-teal-400/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-72 h-24 bg-emerald-600/10 rounded-full blur-2xl pointer-events-none" />

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative mb-5"
        >
          {/* Glowing ring behind logo */}
          <div className="absolute inset-0 rounded-full bg-emerald-500/30 blur-xl scale-125 pointer-events-none" />
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-emerald-400/40 shadow-2xl shadow-emerald-900/50">
            <img src={logoSVH} alt="NagarSetu" className="w-full h-full object-cover" />
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
            Nagar<span className="text-emerald-400">Setu</span>
          </h1>
          <p className="text-emerald-300/80 text-sm mt-1 font-medium">City Administration Portal</p>
          <p className="text-slate-500 text-xs mt-1">SVH 2026 · Government of Madhya Pradesh</p>
        </motion.div>

        {/* City chips */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex gap-2 mt-5"
        >
          {['Indore', 'Ujjain', 'Bhopal'].map(city => (
            <span key={city} className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-medium">
              <Building2 className="w-3 h-3" />{city}
            </span>
          ))}
        </motion.div>

        {/* Thin divider line with shimmer */}
        <div className="mt-8 w-full max-w-sm h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
      </div>

      {/* ── Login card ────────────────────────────────────────────────────── */}
      <motion.div className="w-full max-w-sm px-6 pb-10" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}>
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
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 z-10" />
                <Input value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="admin.indore@nagarsetu.gov.in"
                  className="pl-10 bg-white border-white/30 text-slate-900 placeholder:text-slate-400 focus-visible:ring-emerald-400" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-slate-300 text-sm">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 z-10" />
                <Input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10 bg-white border-white/30 text-slate-900 placeholder:text-slate-400 focus-visible:ring-emerald-400" />
                <button type="button" onClick={() => setShowPw(v=>!v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && <motion.p className="text-red-400 text-xs flex items-center gap-1" initial={{ opacity:0 }} animate={{ opacity:1 }}><AlertCircle className="w-3 h-3" />{error}</motion.p>}
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white" disabled={loading}>
              {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Signing in...</span>
                       : <span className="flex items-center gap-2"><LogIn className="w-4 h-4"/>Sign In</span>}
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
  adminName, adminCity, allReports, onAssignDept, onLogout,
}: {
  adminName: string; adminCity: string;
  allReports: Report[];
  onAssignDept: (id: string, dept: string) => void;
  onLogout: () => void;
}) {
  // Admin only sees their city's complaints
  const cityReports = useMemo(
    () => allReports.filter(r => r.district === adminCity),
    [allReports, adminCity]
  );

  const [search, setSearch]               = useState('');
  const [statusFilter, setStatusFilter]   = useState('all');
  const [typeFilter, setTypeFilter]       = useState('all');
  const [detail, setDetail]               = useState<Report | null>(null);
  const [assigning, setAssigning]         = useState<string | null>(null);

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
      // update detail drawer if open
      setDetail(prev => prev?.id === reportId ? { ...prev, assignedDept: dept, status: 'acknowledged' } : prev);
    }, 400);
  };

  const handleExportCSV = () => {
    const rows = [
      ['ID','Title','Ward','Type','Status','Priority','Assigned Dept','Upvotes','Date'],
      ...filtered.map(r => [r.id,`"${r.title}"`,`"${r.ward}"`,r.type,r.status,r.priority??'',r.assignedDept??'Unassigned',r.upvotes,new Date(r.timestamp).toLocaleDateString()]),
    ];
    const blob = new Blob([rows.map(r=>r.join(',')).join('\n')], { type:'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download=`${adminCity}-complaints.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-x-hidden">
      {/* top bar */}
      <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
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

      <div className="p-4 space-y-4 max-w-5xl mx-auto">

        {/* stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label:'Total',       v:stats.total,      color:'text-slate-700', bg:'bg-white',       icon:FileText     },
            { label:'Pending',     v:stats.pending,    color:'text-red-600',   bg:'bg-red-50',      icon:AlertCircle  },
            { label:'In Progress', v:stats.inProgress, color:'text-yellow-600',bg:'bg-yellow-50',   icon:RefreshCw    },
            { label:'Resolved',    v:stats.resolved,   color:'text-green-600', bg:'bg-green-50',    icon:CheckCircle  },
            { label:'Unassigned',  v:stats.unassigned, color:'text-orange-600',bg:'bg-orange-50',   icon:TrendingUp   },
          ].map(s=>(
            <motion.div key={s.label} className={`${s.bg} rounded-xl border p-3 flex flex-col gap-1`} whileHover={{ scale:1.02 }}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <p className={`text-2xl font-bold ${s.color}`}>{s.v}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* dept overview */}
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-sm text-gray-900">Department Workload — {adminCity}</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {DEPARTMENTS.map(dept => {
              const deptReports = cityReports.filter(r => r.assignedDept === dept.id);
              const pending     = deptReports.filter(r => r.status !== 'resolved').length;
              return (
                <div key={dept.id} className="border rounded-xl p-3 text-center">
                  <p className="text-xs font-semibold text-muted-foreground">{dept.id}</p>
                  <p className="text-lg font-bold text-gray-800 mt-1">{deptReports.length}</p>
                  <p className="text-xs text-muted-foreground">{dept.fullName.split(' ').slice(0,2).join(' ')}</p>
                  {pending > 0 && <p className="text-xs text-orange-600 font-medium mt-1">{pending} pending</p>}
                </div>
              );
            })}
          </div>
        </div>

        {/* filters */}
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
            <Input placeholder="Search complaints..." value={search} onChange={e=>setSearch(e.target.value)} className="pl-9" />
            {search && <button onClick={()=>setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"><X className="w-4 h-4" /></button>}
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
                <SelectItem value="road" className="text-xs">Road</SelectItem>
                <SelectItem value="garbage" className="text-xs">Garbage</SelectItem>
                <SelectItem value="water" className="text-xs">Water</SelectItem>
                <SelectItem value="streetlight" className="text-xs">Streetlight</SelectItem>
                <SelectItem value="drainage" className="text-xs">Drainage</SelectItem>
              </SelectContent>
            </Select>
            {(statusFilter!=='all'||typeFilter!=='all'||search) && (
              <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground"
                onClick={()=>{setStatusFilter('all');setTypeFilter('all');setSearch('');}}>
                <X className="w-3 h-3 mr-1"/>Clear
              </Button>
            )}
          </div>
        </div>

        {/* complaint list */}
        <div className="space-y-2">
          {filtered.length === 0 && (
            <div className="bg-white rounded-xl border p-10 text-center text-muted-foreground text-sm">No complaints match filters.</div>
          )}
          {filtered.map((report, i) => {
            const sc = statusConfig[report.status];
            const dept = DEPARTMENTS.find(d => d.id === report.assignedDept);
            return (
              <motion.div key={report.id} className="bg-white rounded-xl border hover:shadow-md transition-all"
                initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.03 }}>
                <div className="p-4 cursor-pointer" onClick={()=>setDetail(report)}>
                  <div className="flex-1 min-w-0">
                    {/* title + status */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-sm font-semibold text-gray-900 leading-tight">{report.title}</h3>
                      <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${sc.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}/>{sc.label}
                      </span>
                    </div>

                    {/* meta row */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap mb-1.5">
                      <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3"/>{report.ward}</span>
                      <span>·</span>
                      <span className="capitalize">{report.type}</span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5"><Clock className="w-3 h-3"/>{fmt(report.timestamp)}</span>
                      {report.priority && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${priorityConfig[report.priority]?.color}`}>
                          {report.priority}
                        </span>
                      )}
                    </div>

                    {/* description */}
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">{report.description}</p>

                    {/* stats row */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>▲ {report.upvotes} upvotes</span>
                      <span>💬 {report.comments.length} comments</span>
                      <span>Severity: {report.severity}/10</span>
                    </div>

                    {/* dept badge */}
                    {dept && (
                      <div className="mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${dept.color}`}>
                          → {dept.id}: {dept.fullName}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* assign row */}
                <div className="px-4 pb-4 pt-0 border-t mt-2 pt-3 flex items-center gap-2 flex-wrap" onClick={e=>e.stopPropagation()}>
                  <span className="text-xs text-muted-foreground font-medium whitespace-nowrap flex items-center gap-1">
                    <Send className="w-3 h-3"/>Assign to:
                  </span>
                  {DEPARTMENTS.map(d => (
                    <button key={d.id}
                      disabled={assigning === report.id}
                      onClick={() => handleAssign(report.id, d.id)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all font-medium ${
                        report.assignedDept === d.id
                          ? `${d.color} cursor-default ring-1 ring-current`
                          : 'border-gray-200 text-gray-500 hover:border-primary hover:text-primary bg-white'
                      } ${assigning===report.id?'opacity-50':''}`}>
                      {assigning===report.id && report.assignedDept!==d.id
                        ? <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 border border-current border-t-transparent rounded-full animate-spin"/>{d.id}</span>
                        : d.id}
                    </button>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
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
                <button onClick={()=>setDetail(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-muted-foreground"><X className="w-4 h-4"/></button>
              </div>
              <div className="p-4 space-y-4">
                {/* no image — text-only record */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-1">
                  <h4 className="font-semibold text-gray-900">{detail.title}</h4>
                  <p className="text-xs text-muted-foreground">{detail.ward} · {detail.street}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full font-medium ${statusConfig[detail.status].color}`}>
                    <span className={`w-2 h-2 rounded-full ${statusConfig[detail.status].dot}`}/>{statusConfig[detail.status].label}
                  </span>
                  {detail.priority && <span className={`text-xs px-3 py-1 rounded-full font-medium ${priorityConfig[detail.priority]?.color}`}>{detail.priority} priority</span>}
                  {detail.assignedDept && (
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${DEPARTMENTS.find(d=>d.id===detail.assignedDept)?.color}`}>
                      {detail.assignedDept}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[['Ward',detail.ward],['Street',detail.street],['Reported',fmt(detail.timestamp)],['Severity',`${detail.severity}/10`],['AI Tag',detail.aiTag],['Upvotes',String(detail.upvotes)]].map(([l,v])=>(
                    <div key={l} className="bg-gray-50 rounded-lg p-2"><p className="text-muted-foreground">{l}</p><p className="font-medium truncate">{v}</p></div>
                  ))}
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Description</p>
                  <p className="text-sm text-gray-700">{detail.description}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Assign Department</p>
                  <div className="grid grid-cols-2 gap-2">
                    {DEPARTMENTS.map(d=>(
                      <button key={d.id}
                        onClick={()=>handleAssign(detail.id, d.id)}
                        className={`text-xs py-2.5 px-3 rounded-lg border transition-all font-medium text-left ${
                          detail.assignedDept===d.id
                            ? `${d.color} ring-1 ring-current cursor-default`
                            : 'border-gray-200 hover:border-primary hover:bg-primary/5 text-gray-600'
                        }`}>
                        <p className="font-semibold">{d.id}</p>
                        <p className="text-xs opacity-75">{d.fullName}</p>
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
interface AdminPortalProps {
  allReports: Report[];
  onAssignDept: (reportId: string, dept: string) => void;
  onClose: () => void;
}

export function AdminPortal({ allReports, onAssignDept, onClose }: AdminPortalProps) {
  const [session, setSession] = useState<{ email: string; city: string; name: string } | null>(null);

  return (
    <div className="min-h-screen bg-background w-full mx-auto relative mobile-container overflow-y-auto">
      {session
        ? <AdminDashboard adminName={session.name} adminCity={session.city} allReports={allReports} onAssignDept={onAssignDept} onLogout={() => setSession(null)} />
        : <AdminLogin onLogin={(email, city, name) => setSession({ email, city, name })} />}
    </div>
  );
}
