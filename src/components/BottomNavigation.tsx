import { Home, Plus, User, BarChart3, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import { Screen } from '../App';
import { translations, Language } from './translations';

interface BottomNavigationProps {
  currentScreen: Screen;
  onScreenChange: (screen: Screen) => void;
  language: Language;
}

export function BottomNavigation({ currentScreen, onScreenChange, language }: BottomNavigationProps) {
  const t = translations[language] ?? translations.english;

  const navItems = [
    { id: 'home' as Screen, icon: Home, label: t.home },
    { id: 'analytics' as Screen, icon: BarChart3, label: 'Analytics' },
    { id: 'report' as Screen, icon: Plus, label: t.report, isCenter: true },
    { id: 'leaderboard' as Screen, icon: Trophy, label: 'Ranks' },
    { id: 'profile' as Screen, icon: User, label: t.profile },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-sm mx-auto bg-white border-t border-gray-200 px-4 py-2 safe-area-pb z-[9999] shadow-lg pointer-events-auto">
      <div className="flex items-center justify-around pointer-events-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          
          return (
            <motion.button
              key={item.id}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors ${
                item.isCenter
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => onScreenChange(item.id)}
              whileTap={{ scale: 0.88 }}
              whileHover={{ scale: item.isCenter ? 1.08 : 1.04 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <motion.div
                animate={isActive && !item.isCenter ? { y: -2 } : { y: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <Icon className={`${item.isCenter ? 'w-6 h-6' : 'w-5 h-5'}`} />
              </motion.div>
              <span className={`text-xs mt-1 ${item.isCenter ? 'hidden' : ''}`}>
                {item.label}
              </span>
              {/* Active indicator dot */}
              {isActive && !item.isCenter && (
                <motion.div
                  layoutId="nav-dot"
                  className="w-1 h-1 rounded-full bg-primary mt-0.5"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}