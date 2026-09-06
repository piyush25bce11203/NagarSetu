import { BarChart3, TrendingUp, TrendingDown, Minus, MapPin, Clock, Users, CheckCircle, Activity, ArrowUpRight } from 'lucide-react';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { motion } from 'motion/react';
import { Report, User } from '../App';
import { generateInsights } from '../utils/aiClassification';

interface AnalyticsScreenProps {
  reports: Report[];
  user: User;
}

export function AnalyticsScreen({ reports, user }: AnalyticsScreenProps) {
  const insights = generateInsights(reports);
  const districtReports = reports.filter(report => report.district === user.district);

  const trendData = Array.from({ length: 7 }, (_, index) => {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - (6 - index));
    const nextDay = new Date(day);
    nextDay.setDate(nextDay.getDate() + 1);
    return {
      label: day.toLocaleDateString('en-IN', { weekday: 'short' }),
      count: districtReports.filter(report => report.timestamp >= day && report.timestamp < nextDay).length,
    };
  });
  const maxTrend = Math.max(...trendData.map(day => day.count), 1);
  const trendPoints = trendData.map((day, index) => `${index * 50 + 10},${92 - (day.count / maxTrend) * 68}`).join(' ');
  const statusBreakdown = [
    { label: 'Resolved', count: districtReports.filter(report => report.status === 'resolved').length, color: '#10b981' },
    { label: 'In progress', count: districtReports.filter(report => report.status === 'submitted' || report.status === 'acknowledged').length, color: '#0ea5e9' },
    { label: 'Pending', count: districtReports.filter(report => report.status === 'pending').length, color: '#f59e0b' },
  ];
  const maxStatus = Math.max(...statusBreakdown.map(status => status.count), 1);

  const statsCards = [
    {
      title: 'Total Reports',
      value: insights.totalReports,
      icon: BarChart3,
      color: 'bg-blue-50 text-blue-700',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Resolution Rate',
      value: `${insights.resolvedPercentage}%`,
      icon: CheckCircle,
      color: 'bg-green-50 text-green-700',
      iconColor: 'text-green-600'
    },
    {
      title: 'Avg. Resolution',
      value: insights.averageResolutionTime,
      icon: Clock,
      color: 'bg-purple-50 text-purple-700',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Active Citizens',
      value: Math.floor(insights.totalReports * 0.7),
      icon: Users,
      color: 'bg-orange-50 text-orange-700',
      iconColor: 'text-orange-600'
    }
  ];

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-red-500" />;
      case 'down': return <TrendingDown className="w-3 h-3 text-green-500" />;
      default: return <Minus className="w-3 h-3 text-gray-500" />;
    }
  };

  const recentActivity = reports
    .filter(r => r.district === user.district)
    .slice(0, 5)
    .map(report => ({
      ...report,
      timeAgo: Math.floor((Date.now() - report.timestamp.getTime()) / (1000 * 60))
    }));

  return (
    <div className="analytics-screen min-h-screen bg-background">
      {/* Header */}
      <div className="analytics-header bg-white border-b sticky top-0 z-40">
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="analytics-eyebrow">Civic pulse · last 7 days</p>
              <h1 className="text-xl mb-1 text-primary">Analytics Dashboard</h1>
              <p className="text-sm text-muted-foreground">{user.district} District</p>
            </div>
            <div className="analytics-header-icon">
              <Activity className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`analytics-kpi p-4 ${stat.color}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium opacity-70">{stat.title}</p>
                    <p className="text-xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card className="analytics-card analytics-trend-card p-4">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                <h3 className="font-semibold">Report activity</h3>
              </div>
              <p className="text-xs text-muted-foreground mt-1">New reports submitted across {user.district}</p>
            </div>
            <span className="analytics-period">7D <ArrowUpRight className="w-3 h-3" /></span>
          </div>
          <div className="analytics-chart-wrap">
            <svg viewBox="0 0 310 112" role="img" aria-label="Seven day report activity trend" className="analytics-line-chart">
              {[24, 58, 92].map(y => <line key={y} x1="10" x2="300" y1={y} y2={y} className="analytics-grid-line" />)}
              <polyline points={trendPoints} fill="none" className="analytics-trend-line" />
              {trendData.map((day, index) => {
                const x = index * 50 + 10;
                const y = 92 - (day.count / maxTrend) * 68;
                return <circle key={day.label} cx={x} cy={y} r="3.5" className="analytics-trend-dot" />;
              })}
            </svg>
            <div className="analytics-chart-labels">
              {trendData.map(day => <span key={day.label}>{day.label}</span>)}
            </div>
          </div>
        </Card>

        <Card className="analytics-card p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Resolution pipeline</h3>
              <p className="text-xs text-muted-foreground mt-1">Where active reports stand today</p>
            </div>
            <span className="analytics-rate-badge">{insights.resolvedPercentage}% resolved</span>
          </div>
          <div className="space-y-3">
            {statusBreakdown.map(status => (
              <div key={status.label} className="analytics-status-row">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium">{status.label}</span>
                  <span className="text-muted-foreground">{status.count}</span>
                </div>
                <div className="analytics-status-track">
                  <motion.div
                    className="analytics-status-fill"
                    style={{ backgroundColor: status.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(status.count / maxStatus) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Issue Types */}
        <Card className="analytics-card p-4">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Top Issue Types
          </h3>
          <div className="space-y-3">
            {insights.topIssueTypes.map((issue, index) => (
              <div key={issue.type} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium capitalize">{issue.type}</p>
                    <p className="text-xs text-muted-foreground">{issue.count} reports</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getTrendIcon(issue.trend)}
                  <Badge variant="secondary" className="text-xs">
                    {Math.floor((issue.count / insights.totalReports) * 100)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Critical Areas */}
        <Card className="analytics-card p-4">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Critical Areas
          </h3>
          <div className="space-y-3">
            {insights.criticalAreas.map((area, index) => (
              <div key={area.ward} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    index === 0 ? 'bg-red-500' : 
                    index === 1 ? 'bg-orange-500' : 'bg-yellow-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium">{area.ward}</p>
                    <p className="text-xs text-muted-foreground">Needs attention</p>
                  </div>
                </div>
                <Badge variant={index === 0 ? "destructive" : index === 1 ? "default" : "secondary"}>
                  {area.issueCount} issues
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="analytics-card p-4">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.status === 'resolved' ? 'bg-green-500' :
                  activity.status === 'submitted' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">{activity.ward}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={`text-xs ${
                      activity.priority === 'high' ? 'bg-red-100 text-red-800' :
                      activity.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {activity.priority}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {activity.timeAgo}m ago
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Performance Metrics */}
        <Card className="analytics-card p-4">
          <h3 className="font-medium mb-4">Performance Insights</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">AI Classification Accuracy</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-gray-200 rounded-full">
                  <div className="w-[91%] h-2 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium">91%</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Response Time (Target: 2 days)</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-gray-200 rounded-full">
                  <div className="w-[85%] h-2 bg-blue-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium">1.7d avg</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Citizen Satisfaction</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-gray-200 rounded-full">
                  <div className="w-[88%] h-2 bg-purple-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium">4.4/5</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}