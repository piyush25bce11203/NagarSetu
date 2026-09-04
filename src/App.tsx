import React, { useState, useEffect, useCallback } from 'react';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { LoadingScreen } from './components/LoadingScreen';
import { PostLocationLoadingScreen } from './components/PostLocationLoadingScreen';
import { OnboardingScreen } from './components/OnboardingScreen';
import { LoginScreen } from './components/LoginScreen';
import { RegisterScreen } from './components/RegisterScreen';
import type { RegisterData } from './components/RegisterScreen';
import { HomeScreen } from './components/HomeScreen';
import { ReportScreen } from './components/ReportScreen';
import { LeafletMapScreen } from './components/LeafletMapScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { AnalyticsScreen } from './components/AnalyticsScreen';
import { LeaderboardScreen } from './components/LeaderboardScreen';
import { AdminPortal } from './components/AdminPortal';
import { StaffPortal } from './components/StaffPortal';
import { BottomNavigation } from './components/BottomNavigation';
import DesktopMobileNotice from './components/DesktopMobileNotice';
import SVHBackground from './components/SVHBackground';
import { translations, Language, getT } from './components/translations';
import { allCityReports } from './data/mockReports';
import { UserStore, SessionStore, ReportStore } from './lib/storage';
import type { Report, Comment } from './types';

// Re-export so components that do `import { Report } from '../App'` still work
export type { Report, MediaItem, Comment } from './types';

export interface User {
  id: string;
  name: string;
  email: string;
  district: string;
  coordinates: { lat: number; lng: number };
  language: Language;
  isOnline: boolean;
}

export type Screen = 'onboarding' | 'home' | 'report' | 'map' | 'profile' | 'analytics' | 'leaderboard';
type AuthScreen = 'login' | 'register';
type PortalMode = 'none' | 'admin' | 'staff';

export default function App() {
  const [isLoading, setIsLoading]                         = useState(true);
  const [isPostLocationLoading, setIsPostLocationLoading] = useState(false);
  const [currentScreen, setCurrentScreen]                 = useState<Screen>('onboarding');
  const [authScreen, setAuthScreen]                       = useState<AuthScreen>('login');
  const [isAuthenticated, setIsAuthenticated]             = useState(false);
  const [portalMode, setPortalMode]                       = useState<PortalMode>('none');
  const [loginError, setLoginError]                       = useState('');
  const [registerError, setRegisterError]                 = useState('');

  const [user, setUser] = useState<User>({
    id: '', name: '', email: '',
    district: 'Indore',
    coordinates: { lat: 22.7196, lng: 75.8577 },
    language: 'english', isOnline: true,
  });
  const [reports, setReports]               = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  // ── bootstrap ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const persisted = ReportStore.seedIfEmpty(allCityReports);
    setReports(persisted);

    const session = SessionStore.get();
    if (session) {
      // Validate language — fall back to english if stored value is invalid
      const validLanguages = ['english', 'hindi', 'bengali', 'santhali', 'nagpuri'];
      const lang = validLanguages.includes(session.language) ? session.language : 'english';
      setUser({
        id: session.userId, name: session.name, email: session.email,
        district: session.district, coordinates: session.coordinates,
        language: lang as Language, isOnline: session.isOnline,
      });
      setIsAuthenticated(true);
      setHasCompletedOnboarding(true);
      setCurrentScreen('home');
    }

    const t = setTimeout(() => setIsLoading(false), 2500);
    return () => clearTimeout(t);
  }, []);

  const persistAndSet = useCallback((updated: Report[]) => {
    ReportStore.save(updated);
    setReports(updated);
  }, []);

  // ── auth ──────────────────────────────────────────────────────────────────
  const handleLogin = (email: string, password: string) => {
    setLoginError('');
    const stored = UserStore.authenticate(email, password);
    if (!stored) { setLoginError('Invalid email or password. Please try again.'); return; }
    const session = {
      userId: stored.id, email: stored.email, name: stored.name,
      district: user.district, language: user.language,
      isOnline: true, coordinates: user.coordinates,
      loggedInAt: new Date().toISOString(),
    };
    SessionStore.save(session);
    setUser(prev => ({ ...prev, id: stored.id, name: stored.name, email: stored.email }));
    setIsAuthenticated(true);
  };

  const handleRegister = (data: RegisterData) => {
    setRegisterError('');
    if (UserStore.exists(data.email)) {
      setRegisterError('An account with this email already exists. Please sign in.');
      return;
    }
    const stored = UserStore.register(data);
    const session = {
      userId: stored.id, email: stored.email, name: stored.name,
      district: user.district, language: user.language,
      isOnline: true, coordinates: user.coordinates,
      loggedInAt: new Date().toISOString(),
    };
    SessionStore.save(session);
    setUser(prev => ({ ...prev, id: stored.id, name: stored.name, email: stored.email }));
    toast.success(`Welcome, ${stored.name}! Account created successfully.`);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    SessionStore.clear();
    setIsAuthenticated(false);
    setHasCompletedOnboarding(false);
    setCurrentScreen('onboarding');
    setUser({ id: '', name: '', email: '', district: 'Indore', coordinates: { lat: 22.7196, lng: 75.8577 }, language: 'english', isOnline: true });    setAuthScreen('login');
    setLoginError('');
  };

  // ── onboarding ────────────────────────────────────────────────────────────
  const handleCompleteOnboarding = (selectedDistrict: string, coords: { lat: number; lng: number }, language: Language) => {
    setUser(prev => ({ ...prev, district: selectedDistrict, coordinates: coords, language }));
    SessionStore.update({ district: selectedDistrict, coordinates: coords, language });
    setIsPostLocationLoading(true);
    setTimeout(() => {
      setIsPostLocationLoading(false);
      setHasCompletedOnboarding(true);
      setCurrentScreen('home');
    }, 2500);
  };

  // ── reports ───────────────────────────────────────────────────────────────
  const handleAddReport = (newReport: Omit<Report, 'id' | 'timestamp' | 'upvotes' | 'comments' | 'distance' | 'hasUserUpvoted'>) => {
    const report: Report = {
      ...newReport,
      id: `r_${Date.now()}`,
      timestamp: new Date(),
      upvotes: 0, comments: [],
      distance: parseFloat((Math.random() * 3).toFixed(1)),
      hasUserUpvoted: false,
      userId: user.id || user.email || 'guest',
    };
    const updated = ReportStore.add(report);
    setReports(updated);
    if (user.isOnline) {
      toast.success(
        `🎉 ${getT(user.language).reportSubmitted} #${report.id.slice(-4)}`,
        { description: `Routed to ${getDeptName(report.type)} for processing`, duration: 4000 },
      );
    } else {
      toast.info(getT(user.language).savedOffline);
    }
    setCurrentScreen('home');
  };

  const handleUpvote = (reportId: string) => {
    persistAndSet(reports.map(r => {
      if (r.id !== reportId) return r;
      return { ...r, upvotes: r.hasUserUpvoted ? r.upvotes - 1 : r.upvotes + 1, hasUserUpvoted: !r.hasUserUpvoted };
    }));
  };

  const handleAddComment = (reportId: string, commentText: string) => {
    const newComment: Comment = { id: `c_${Date.now()}`, text: commentText, timestamp: new Date(), author: user.name || 'Citizen' };
    persistAndSet(reports.map(r => {
      if (r.id !== reportId) return r;
      const updated = { ...r, comments: [...r.comments, newComment] };
      if (selectedReport?.id === reportId) setSelectedReport(updated);
      return updated;
    }));
  };

  const handleAssignDept = (reportId: string, dept: string) => {
    const updated = ReportStore.update(reportId, { assignedDept: dept, status: 'acknowledged' });
    setReports(updated);
  };

  const handleStaffStatusUpdate = (reportId: string, status: Report['status']) => {
    const updated = ReportStore.update(reportId, { status });
    setReports(updated);
  };

  const handleLanguageChange = (language: Language) => {
    setUser(prev => ({ ...prev, language }));
    SessionStore.update({ language });
  };

  const handleToggleOnline = () => {
    setUser(prev => {
      const next = { ...prev, isOnline: !prev.isOnline };
      SessionStore.update({ isOnline: next.isOnline });
      return next;
    });
  };

  const getDeptName = (type: string) => {
    const m: Record<string, string> = { road:'PWD', garbage:'MSWM', streetlight:'USLD', water:'MVB', drainage:'MSWM' };
    return m[type.toLowerCase()] ?? 'Municipal Corporation';
  };

  // ── render ────────────────────────────────────────────────────────────────
  if (portalMode === 'admin') {
    return (
      <>
        <SVHBackground />
        <AdminPortal allReports={reports} onAssignDept={handleAssignDept} onClose={() => setPortalMode('none')} />
      </>
    );
  }

  if (portalMode === 'staff') {
    return (
      <>
        <SVHBackground />
        <StaffPortal allReports={reports} onStatusUpdate={handleStaffStatusUpdate} onClose={() => setPortalMode('none')} />
      </>
    );
  }

  if (isLoading) return (<><SVHBackground /><LoadingScreen /></>);
  if (isPostLocationLoading) return (<><SVHBackground /><PostLocationLoadingScreen detectedLocation={user.district} /></>);

  if (!isAuthenticated) {
    return (
      <>
        <SVHBackground />
        <div className="min-h-screen bg-background w-full mx-auto relative mobile-container">
          {authScreen === 'login' ? (
            <LoginScreen
              onLogin={handleLogin}
              onGoToRegister={() => { setAuthScreen('register'); setLoginError(''); }}
              onOpenAdmin={() => setPortalMode('admin')}
              onOpenStaff={() => setPortalMode('staff')}
              error={loginError}
            />
          ) : (
            <RegisterScreen
              onRegister={handleRegister}
              onGoToLogin={() => { setAuthScreen('login'); setRegisterError(''); }}
              error={registerError}
            />
          )}
          <Toaster />
        </div>
      </>
    );
  }

  if (!hasCompletedOnboarding) {
    return (
      <>
        <SVHBackground />
        <div className="min-h-screen bg-background w-full mx-auto relative mobile-container">
          <OnboardingScreen onComplete={handleCompleteOnboarding} currentLanguage={user.language} onLanguageChange={handleLanguageChange} />
          <Toaster />
        </div>
      </>
    );
  }

  const districtReports = reports.filter(r => r.district === user.district);
  const myReports       = reports.filter(r => r.userId === (user.id || user.email || 'guest'));

  return (
    <>
      <SVHBackground />
      <div className="min-h-screen bg-background w-full mx-auto relative mobile-container">
        <DesktopMobileNotice />
        {currentScreen !== 'map' && (
          <div className="pb-20">
            {currentScreen === 'home'        && <HomeScreen reports={districtReports} user={user} onReportSelect={setSelectedReport} onUpvote={handleUpvote} onAddComment={handleAddComment} selectedReport={selectedReport} onCloseModal={() => setSelectedReport(null)} onReportAgain={() => setCurrentScreen('report')} />}
            {currentScreen === 'analytics'   && <AnalyticsScreen reports={districtReports} user={user} />}
            {currentScreen === 'leaderboard' && <LeaderboardScreen reports={reports} user={user} />}
            {currentScreen === 'report'      && <ReportScreen user={user} onSubmit={handleAddReport} onCancel={() => setCurrentScreen('home')} />}
            {currentScreen === 'profile'     && <ProfileScreen reports={myReports} user={user} onLanguageChange={handleLanguageChange} onToggleOnline={handleToggleOnline} onReportAgain={() => setCurrentScreen('report')} onOpenAdmin={() => setPortalMode('admin')} onLogout={handleLogout} />}
          </div>
        )}
        {currentScreen === 'map' && <LeafletMapScreen reports={districtReports} user={user} onReportSelect={setSelectedReport} onUpvote={handleUpvote} />}
        <BottomNavigation currentScreen={currentScreen} onScreenChange={setCurrentScreen} language={user.language} />
        <Toaster />
      </div>
    </>
  );
}
