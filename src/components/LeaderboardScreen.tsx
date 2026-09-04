import React, { useState } from 'react';
import { Trophy, Medal, Star, TrendingUp, MapPin, Crown, Award, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Report, User } from '../App';

interface LeaderboardScreenProps {
  reports: Report[];
  user: User;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  district: string;
  points: number;
  complaints: number;
  resolvedCount: number;
  badge: 'gold' | 'silver' | 'bronze' | 'regular';
  isCurrentUser?: boolean;
  avatarColor: string;
}

const POINTS_PER_COMPLAINT = 100;

// City-wide leaderboard data — MP cities
const cityLeaderboardData: Omit<LeaderboardEntry, 'rank'>[] = [
  { name: 'Anjali Sharma',   district: 'Indore', complaints: 18, resolvedCount: 14, points: 1800, badge: 'gold',    avatarColor: 'bg-purple-500' },
  { name: 'Ravi Gupta',      district: 'Indore', complaints: 15, resolvedCount: 11, points: 1500, badge: 'silver',  avatarColor: 'bg-blue-500'   },
  { name: 'Meera Devi',      district: 'Bhopal', complaints: 13, resolvedCount: 10, points: 1300, badge: 'bronze',  avatarColor: 'bg-pink-500'   },
  { name: 'Suresh Mahato',   district: 'Indore', complaints: 11, resolvedCount: 8,  points: 1100, badge: 'regular', avatarColor: 'bg-green-500'  },
  { name: 'Priya Singh',     district: 'Ujjain', complaints: 10, resolvedCount: 9,  points: 1000, badge: 'regular', avatarColor: 'bg-yellow-500' },
  { name: 'Amit Kumar',      district: 'Bhopal', complaints: 9,  resolvedCount: 7,  points: 900,  badge: 'regular', avatarColor: 'bg-red-500'    },
  { name: 'Sunita Roy',      district: 'Ujjain', complaints: 8,  resolvedCount: 6,  points: 800,  badge: 'regular', avatarColor: 'bg-indigo-500' },
  { name: 'Demo User',       district: 'Indore', complaints: 4,  resolvedCount: 2,  points: 400,  badge: 'regular', avatarColor: 'bg-teal-500',  isCurrentUser: true },
  { name: 'Rajesh Tiwari',   district: 'Bhopal', complaints: 3,  resolvedCount: 2,  points: 300,  badge: 'regular', avatarColor: 'bg-orange-500' },
  { name: 'Kavita Das',      district: 'Ujjain', complaints: 2,  resolvedCount: 1,  points: 200,  badge: 'regular', avatarColor: 'bg-cyan-500'   },
];

const allDistricts = ['All Cities', 'Indore', 'Ujjain', 'Bhopal'];

const rankBadgeConfig = {
  gold: { bg: 'bg-yellow-400', text: 'text-yellow-900', icon: Crown, label: 'Gold' },
  silver: { bg: 'bg-gray-300', text: 'text-gray-800', icon: Medal, label: 'Silver' },
  bronze: { bg: 'bg-amber-600', text: 'text-white', icon: Award, label: 'Bronze' },
  regular: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Star, label: 'Active' },
};

export function LeaderboardScreen({ reports, user }: LeaderboardScreenProps) {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All Cities');

  // Build ranked entries filtered by district
  const ranked: LeaderboardEntry[] = cityLeaderboardData
    .filter(e => selectedDistrict === 'All Cities' || e.district === selectedDistrict)
    .sort((a, b) => b.points - a.points)
    .map((entry, i) => ({ ...entry, rank: i + 1 }));

  const currentUser = ranked.find(e => e.isCurrentUser);
  const top3 = ranked.slice(0, 3);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-4 h-4 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-4 h-4 text-gray-400" />;
    if (rank === 3) return <Award className="w-4 h-4 text-amber-600" />;
    return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
  };

  const getPodiumHeight = (rank: number) => {
    if (rank === 1) return 'h-24';
    if (rank === 2) return 'h-16';
    return 'h-12';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="p-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h1 className="text-xl font-bold text-primary">Leaderboard</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Each complaint earns <span className="font-semibold text-green-600">100 pts</span> · NagarSetu SVH 2026
          </p>
        </div>
      </div>

      <div className="p-4 space-y-4">

        {/* Points info banner */}
        <motion.div
          className="bg-gradient-to-r from-green-500 to-teal-500 rounded-xl p-4 text-white"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-full p-2">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm">How points work</p>
              <p className="text-xs text-white/90">
                Submit a complaint → earn <strong>100 pts</strong> instantly. Resolved complaints earn a <strong>bonus 50 pts</strong>.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Current user's rank card */}
        {currentUser && (
          <motion.div
            className="bg-primary/5 border border-primary/20 rounded-xl p-4"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Your Standing</p>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`w-12 h-12 ${currentUser.avatarColor} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                  {currentUser.name.charAt(0)}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {currentUser.rank}
                </div>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{currentUser.name} <span className="text-primary">(You)</span></p>
                <p className="text-xs text-muted-foreground">{currentUser.district} · {currentUser.complaints} complaints</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{currentUser.points.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">points</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* District filter */}
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="flex gap-2 pb-1 w-max">
            {allDistricts.map(district => (
              <button
                key={district}
                onClick={() => setSelectedDistrict(district)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedDistrict === district
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {district}
              </button>
            ))}
          </div>
        </div>

        {/* Podium — top 3 */}
        {top3.length >= 3 && (
          <motion.div
            className="bg-white rounded-xl border p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center mb-4">Top 3 Citizens</p>
            <div className="flex items-end justify-center gap-3">
              {/* 2nd place */}
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className={`w-10 h-10 ${top3[1].avatarColor} rounded-full flex items-center justify-center text-white font-bold`}>
                  {top3[1].name.charAt(0)}
                </div>
                <p className="text-xs font-medium text-center truncate w-full text-center">{top3[1].name.split(' ')[0]}</p>
                <p className="text-xs text-muted-foreground">{top3[1].points} pts</p>
                <div className={`w-full ${getPodiumHeight(2)} bg-gray-200 rounded-t-lg flex items-start justify-center pt-1`}>
                  <span className="text-xs font-bold text-gray-600">2</span>
                </div>
              </div>
              {/* 1st place */}
              <div className="flex flex-col items-center gap-1 flex-1">
                <Crown className="w-4 h-4 text-yellow-500" />
                <div className={`w-12 h-12 ${top3[0].avatarColor} rounded-full flex items-center justify-center text-white font-bold text-lg ring-2 ring-yellow-400`}>
                  {top3[0].name.charAt(0)}
                </div>
                <p className="text-xs font-semibold text-center truncate w-full text-center">{top3[0].name.split(' ')[0]}</p>
                <p className="text-xs font-bold text-yellow-600">{top3[0].points} pts</p>
                <div className={`w-full ${getPodiumHeight(1)} bg-yellow-400 rounded-t-lg flex items-start justify-center pt-1`}>
                  <span className="text-xs font-bold text-yellow-900">1</span>
                </div>
              </div>
              {/* 3rd place */}
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className={`w-10 h-10 ${top3[2].avatarColor} rounded-full flex items-center justify-center text-white font-bold`}>
                  {top3[2].name.charAt(0)}
                </div>
                <p className="text-xs font-medium text-center truncate w-full text-center">{top3[2].name.split(' ')[0]}</p>
                <p className="text-xs text-muted-foreground">{top3[2].points} pts</p>
                <div className={`w-full ${getPodiumHeight(3)} bg-amber-300 rounded-t-lg flex items-start justify-center pt-1`}>
                  <span className="text-xs font-bold text-amber-900">3</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Full ranked list */}
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <span>Citizen</span>
              <div className="flex gap-6">
                <span>Complaints</span>
                <span>Points</span>
              </div>
            </div>
          </div>

          <div className="divide-y">
            {ranked.map((entry, index) => {
              const badgeCfg = rankBadgeConfig[entry.badge];
              const BadgeIcon = badgeCfg.icon;
              return (
                <motion.div
                  key={entry.name}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    entry.isCurrentUser ? 'bg-primary/5 border-l-4 border-l-primary' : 'hover:bg-gray-50'
                  }`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                >
                  {/* Rank */}
                  <div className="w-7 flex items-center justify-center flex-shrink-0">
                    {getRankIcon(entry.rank)}
                  </div>

                  {/* Avatar */}
                  <div className={`w-9 h-9 ${entry.avatarColor} rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                    {entry.name.charAt(0)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className={`text-sm font-medium truncate ${entry.isCurrentUser ? 'text-primary' : ''}`}>
                        {entry.name}
                        {entry.isCurrentUser && <span className="text-xs text-primary ml-1">(You)</span>}
                      </p>
                      <div className={`${badgeCfg.bg} ${badgeCfg.text} rounded-full p-0.5`}>
                        <BadgeIcon className="w-2.5 h-2.5" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>{entry.district}</span>
                      <span>·</span>
                      <span className="text-green-600">{entry.resolvedCount} resolved</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 flex-shrink-0 text-right">
                    <div>
                      <p className="text-sm font-semibold">{entry.complaints}</p>
                      <p className="text-xs text-muted-foreground">filed</p>
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${entry.isCurrentUser ? 'text-primary' : 'text-gray-800'}`}>
                        {entry.points.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">pts</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {ranked.length === 0 && (
              <div className="py-10 text-center text-muted-foreground text-sm">
                No entries for this city yet.
              </div>
            )}
          </div>
        </div>

        {/* Points legend */}
        <Card className="p-4 bg-gray-50 border-dashed">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Points System</p>
          <div className="space-y-2">
            {[
              { label: 'Submit a complaint', pts: '+100 pts', color: 'text-green-600' },
              { label: 'Complaint resolved', pts: '+50 pts bonus', color: 'text-blue-600' },
              { label: 'Complaint upvoted by others', pts: '+10 pts each', color: 'text-purple-600' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{item.label}</span>
                <span className={`font-bold ${item.color}`}>{item.pts}</span>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </div>
  );
}
