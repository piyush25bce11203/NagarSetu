import React, { useState, useEffect, useCallback } from 'react';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'motion/react';
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
import { ThemeToggle } from './components/ThemeToggle';
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

// ── Screen order for slide direction ──────────────────────────────────────────
const SCREEN_ORDER: Screen[] = ['home', 'analytics', 'report', 'leaderboard', 'profile'];

function getDirection(from: Screen, to: Screen): 1 | -1 {
  const fi = SCREEN_ORDER.indexOf(from);
  const ti = SCREEN_ORDER.indexOf(to);
  if (fi === -1 || ti === -1) return 1;
  return ti > fi ? 1 : -1;
}

// ── Animated screen wrapper ───────────────────────────────────────────────────
function ScreenTransition({
  screenKey,
  direction,
  children,
}: {
  screenKey: string;
  direction: 1 | -1;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      key={screenKey}
      initial={{ opacity: 0, x: direction * 28, y: 8, scale: 0.985, filter: 'blur(4px)' }}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{    opacity: 0, x: direction * -28, y: -6, scale: 0.985, filter: 'blur(4px)' }}
      transition={{
        duration:   0.42,
        delay:      0.04,
        ease:       [0.32, 0, 0.18, 1], // smooth iOS-like curve
        opacity:    { duration: 0.25 },
        scale:      { duration: 0.35 },
      }}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const [isLoading, setIsLoading]                         = useState(true);
  const [isPostLocationLoading, setIsPostLocationLoading] = useState(false);
  const [currentScreen, setCurrentScreen]                 = useState<Screen>('onboarding');
  const [prevScreen, setPrevScreen]                       = useState<Screen>('home');
  const [authScreen, setAuthScreen]                       = useState<AuthScreen>('login');
  const [isAuthenticated, setIsAuthenticated]             = useState(false);
  const [portalMode, setPortalMode]                       = useState<PortalMode>('none');
  const [loginError, setLoginError]                       = useState('');
  const [registerError, setRegisterError]                 = useState('');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('nagarsetu-theme') === 'dark';
  });

  // Wrap screen change so we always track direction
  const navigateTo = useCallback((screen: Screen) => {
    setPrevScreen(currentScreen);
    setCurrentScreen(screen);
  }, [currentScreen]);
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

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('nagarsetu-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const themeToggle = (
    <ThemeToggle isDarkMode={isDarkMode} onToggle={() => setIsDarkMode(prev => !prev)} />
  );

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
    setPrevScreen('home');
    setUser({ id: '', name: '', email: '', district: 'Indore', coordinates: { lat: 22.7196, lng: 75.8577 }, language: 'english', isOnline: true });
    setAuthScreen('login');
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
    navigateTo('home');
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
    const report = reports.find(r => r.id === reportId);
    if (!report || report.status === 'ignored') return;
    const updated = ReportStore.update(reportId, { assignedDept: dept, status: 'acknowledged' });
    setReports(updated);
  };

  const handleIgnoreReport = (reportId: string) => {
    const updated = ReportStore.update(reportId, {
      status: 'ignored', assignedDept: undefined, deadline: undefined,
    });
    setReports(updated);
  };

  const handleSetDeadline = (reportId: string, deadline: string) => {
    const updated = ReportStore.update(reportId, { deadline });
    setReports(updated);
  };

  const handleStaffStatusUpdate = (reportId: string, status: Report['status']) => {
    const updated = ReportStore.update(reportId, { status });
    setReports(updated);
  };

  const handleStaffResolveWithProof = (reportId: string, proofUrl: string) => {
    const updated = ReportStore.update(reportId, { status: 'resolved', resolutionProofUrl: proofUrl });
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
    const m: Record<string, string> = {
      road:        'PWD',
      garbage:     'MSWM',
      streetlight: 'USLD',
      water:       'MVB',
      drainage:    'DRAIN',
      electricity: 'ELECT',
      fire:        'FIRE',
      sewage:      'SEWAGE',
      animal:      'ANIMAL',
    };
    return m[type.toLowerCase()] ?? 'Municipal Corporation';
  };

  // ── render ────────────────────────────────────────────────────────────────
  if (portalMode === 'admin') {
    return (
      <>
        <SVHBackground />
        <div className="min-h-screen bg-background w-full mx-auto relative mobile-container overflow-y-auto">
          {/* Back button — lives inside the mobile container, sticky at top */}
          <motion.button
            onClick={() => setPortalMode('none')}
            className="sticky top-5 left-3 z-[9999] flex items-center gap-1.5 text-xs bg-white/95 backdrop-blur border shadow-md rounded-full px-3 py-1.5 text-gray-700 hover:bg-white active:scale-95 transition-all ml-3 mt-5"
            style={{ width: 'fit-content' }}
            initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}
            whileTap={{ scale: 0.92 }}
          >
            ← Back to App
          </motion.button>
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, delay: 0.08, ease: [0.32, 0, 0.18, 1] }}
          >
            <AdminPortal allReports={reports} onAssignDept={handleAssignDept} onIgnoreReport={handleIgnoreReport} onSetDeadline={handleSetDeadline}
              isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode(prev => !prev)} onClose={() => setPortalMode('none')} />
          </motion.div>
        </div>
      </>
    );
  }

  if (portalMode === 'staff') {
    return (
      <>
        <SVHBackground />
        <div className="min-h-screen bg-background w-full mx-auto relative mobile-container overflow-y-auto">
          {/* Back button — lives inside the mobile container, sticky at top */}
          <motion.button
            onClick={() => setPortalMode('none')}
            className="sticky top-5 left-3 z-[9999] flex items-center gap-1.5 text-xs bg-white/95 backdrop-blur border shadow-md rounded-full px-3 py-1.5 text-gray-700 hover:bg-white active:scale-95 transition-all ml-3 mt-5"
            style={{ width: 'fit-content' }}
            initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}
            whileTap={{ scale: 0.92 }}
          >
            ← Back to App
          </motion.button>
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, delay: 0.08, ease: [0.32, 0, 0.18, 1] }}
          >
            <StaffPortal allReports={reports} onStatusUpdate={handleStaffStatusUpdate} onResolveWithProof={handleStaffResolveWithProof}
              isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode(prev => !prev)} onClose={() => setPortalMode('none')} />
          </motion.div>
        </div>
      </>
    );
  }

  if (isLoading) return (<><SVHBackground />{themeToggle}<LoadingScreen /></>);
  if (isPostLocationLoading) return (<><SVHBackground />{themeToggle}<PostLocationLoadingScreen detectedLocation={user.district} /></>);

  if (!isAuthenticated) {
    return (
      <>
        <SVHBackground />
        <div className="min-h-screen bg-background w-full mx-auto relative mobile-container overflow-hidden">
          {themeToggle}
          <AnimatePresence mode="wait" initial={false}>
            {authScreen === 'login' ? (
              <motion.div key="login"
                initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.32, delay: 0.06, ease: [0.32, 0, 0.18, 1] }}>
                <LoginScreen
                  onLogin={handleLogin}
                  onGoToRegister={() => { setAuthScreen('register'); setLoginError(''); }}
                  onOpenAdmin={() => setPortalMode('admin')}
                  onOpenStaff={() => setPortalMode('staff')}
                  error={loginError}
                />
              </motion.div>
            ) : (
              <motion.div key="register"
                initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.32, delay: 0.06, ease: [0.32, 0, 0.18, 1] }}>
                <RegisterScreen
                  onRegister={handleRegister}
                  onGoToLogin={() => { setAuthScreen('login'); setRegisterError(''); }}
                  error={registerError}
                />
              </motion.div>
            )}
          </AnimatePresence>
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
          {themeToggle}
          <OnboardingScreen onComplete={handleCompleteOnboarding} currentLanguage={user.language} onLanguageChange={handleLanguageChange} />
          <Toaster />
        </div>
      </>
    );
  }

  const districtReports = reports.filter(r => r.district === user.district && r.status !== 'ignored');
  const myReports       = reports.filter(r => r.userId === (user.id || user.email || 'guest') && r.status !== 'ignored');
  const direction       = getDirection(prevScreen, currentScreen);

  return (
    <>
      <SVHBackground />
      <div className="min-h-screen bg-background w-full mx-auto relative mobile-container overflow-hidden">
        {themeToggle}
        <DesktopMobileNotice />
        {currentScreen !== 'map' && (
          <div className="pb-20">
            <AnimatePresence mode="wait" initial={false}>
              {currentScreen === 'home' && (
                <ScreenTransition screenKey="home" direction={direction}>
                  <HomeScreen reports={districtReports} user={user} onReportSelect={setSelectedReport} onUpvote={handleUpvote} onAddComment={handleAddComment} selectedReport={selectedReport} onCloseModal={() => setSelectedReport(null)} onReportAgain={() => navigateTo('report')} />
                </ScreenTransition>
              )}
              {currentScreen === 'analytics' && (
                <ScreenTransition screenKey="analytics" direction={direction}>
                  <AnalyticsScreen reports={districtReports} user={user} />
                </ScreenTransition>
              )}
              {currentScreen === 'leaderboard' && (
                <ScreenTransition screenKey="leaderboard" direction={direction}>
                  <LeaderboardScreen reports={reports} user={user} />
                </ScreenTransition>
              )}
              {currentScreen === 'report' && (
                <ScreenTransition screenKey="report" direction={direction}>
                  <ReportScreen user={user} onSubmit={handleAddReport} onCancel={() => navigateTo('home')} />
                </ScreenTransition>
              )}
              {currentScreen === 'profile' && (
                <ScreenTransition screenKey="profile" direction={direction}>
                  <ProfileScreen reports={myReports} user={user} onLanguageChange={handleLanguageChange} onToggleOnline={handleToggleOnline} onReportAgain={() => navigateTo('report')} onOpenAdmin={() => setPortalMode('admin')} onLogout={handleLogout} />
                </ScreenTransition>
              )}
            </AnimatePresence>
          </div>
        )}
        {currentScreen === 'map' && (
          <motion.div
            key="map"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3, delay: 0.08 }}
          >
            <LeafletMapScreen reports={districtReports} user={user} onReportSelect={setSelectedReport} onUpvote={handleUpvote} />
          </motion.div>
        )}
        <BottomNavigation currentScreen={currentScreen} onScreenChange={navigateTo} language={user.language} />
        <Toaster />
      </div>
    </>
  );
}
