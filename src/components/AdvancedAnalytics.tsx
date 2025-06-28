import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Clock, Code, GitBranch, Activity, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface AnalyticsData {
  overview: {
    totalProjects: number;
    activeUsers: number;
    codeLines: number;
    deployments: number;
  };
  productivity: {
    commitsPerDay: Array<{ date: string; commits: number }>;
    linesPerDay: Array<{ date: string; lines: number }>;
    activeHours: Array<{ hour: number; activity: number }>;
  };
  codeQuality: {
    qualityScore: number;
    testCoverage: number;
    codeReviews: number;
    bugs: number;
  };
  teamMetrics: {
    members: Array<{
      name: string;
      commits: number;
      linesAdded: number;
      reviewsGiven: number;
      productivity: number;
    }>;
  };
  projectHealth: Array<{
    name: string;
    health: number;
    lastActivity: Date;
    contributors: number;
    issues: number;
  }>;
}

export function AdvancedAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [selectedTab, setSelectedTab] = useState<'overview' | 'productivity' | 'quality' | 'team' | 'projects'>('overview');

  useEffect(() => {
    // Simulate loading analytics data
    const loadAnalytics = () => {
      const data: AnalyticsData = {
        overview: {
          totalProjects: 24,
          activeUsers: 12,
          codeLines: 145230,
          deployments: 89
        },
        productivity: {
          commitsPerDay: Array.from({ length: 7 }, (_, i) => ({
            date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            commits: Math.floor(Math.random() * 20) + 5
          })),
          linesPerDay: Array.from({ length: 7 }, (_, i) => ({
            date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            lines: Math.floor(Math.random() * 500) + 100
          })),
          activeHours: Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            activity: Math.floor(Math.random() * 100)
          }))
        },
        codeQuality: {
          qualityScore: 87,
          testCoverage: 78,
          codeReviews: 156,
          bugs: 23
        },
        teamMetrics: {
          members: [
            { name: 'John Doe', commits: 45, linesAdded: 2340, reviewsGiven: 12, productivity: 92 },
            { name: 'Jane Smith', commits: 38, linesAdded: 1890, reviewsGiven: 18, productivity: 88 },
            { name: 'Mike Johnson', commits: 29, linesAdded: 1456, reviewsGiven: 8, productivity: 75 },
            { name: 'Sarah Wilson', commits: 22, linesAdded: 1123, reviewsGiven: 15, productivity: 82 }
          ]
        },
        projectHealth: [
          { name: 'Main App', health: 95, lastActivity: new Date(), contributors: 8, issues: 3 },
          { name: 'API Service', health: 88, lastActivity: new Date(Date.now() - 3600000), contributors: 5, issues: 7 },
          { name: 'Mobile App', health: 76, lastActivity: new Date(Date.now() - 7200000), contributors: 3, issues: 12 },
          { name: 'Admin Panel', health: 92, lastActivity: new Date(Date.now() - 1800000), contributors: 4, issues: 2 }
        ]
      };
      setAnalyticsData(data);
    };

    loadAnalytics();
  }, [selectedTimeRange]);

  const getHealthColor = (health: number) => {
    if (health >= 90) return 'text-green-500';
    if (health >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatLastActivity = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

  if (!analyticsData) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-white">Advanced Analytics</h2>
          </div>
          
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-600 rounded text-white"
          >
            <option value="1d">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'productivity', label: 'Productivity', icon: TrendingUp },
            { id: 'quality', label: 'Code Quality', icon: Code },
            { id: 'team', label: 'Team', icon: Users },
            { id: 'projects', label: 'Projects', icon: GitBranch }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                selectedTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Projects', value: analyticsData.overview.totalProjects, icon: GitBranch, color: 'blue' },
                { label: 'Active Users', value: analyticsData.overview.activeUsers, icon: Users, color: 'green' },
                { label: 'Lines of Code', value: analyticsData.overview.codeLines.toLocaleString(), icon: Code, color: 'purple' },
                { label: 'Deployments', value: analyticsData.overview.deployments, icon: Activity, color: 'orange' }
              ].map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800 p-6 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <metric.icon className={`h-6 w-6 text-${metric.color}-500`} />
                    <span className="text-sm text-gray-400">{selectedTimeRange}</span>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{metric.value}</div>
                  <div className="text-sm text-gray-400">{metric.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Commits Chart */}
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="font-semibold text-white mb-4">Daily Commits</h3>
                <div className="h-48 flex items-end space-x-2">
                  {analyticsData.productivity.commitsPerDay.map((day, index) => (
                    <div key={day.date} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-blue-500 rounded-t"
                        style={{ height: `${(day.commits / 25) * 100}%` }}
                      ></div>
                      <div className="text-xs text-gray-400 mt-2">{formatDate(day.date)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Code Quality Chart */}
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="font-semibold text-white mb-4">Code Quality</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="inline-block relative">
                      <svg className="w-24 h-24" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="16" fill="none" stroke="#374151" strokeWidth="2"></circle>
                        <circle
                          cx="18"
                          cy="18"
                          r="16"
                          fill="none"
                          stroke="#3B82F6"
                          strokeWidth="2"
                          strokeDasharray={`${analyticsData.codeQuality.qualityScore} 100`}
                          strokeLinecap="round"
                          transform="rotate(-90 18 18)"
                        ></circle>
                        <text x="18" y="18" textAnchor="middle" dominantBaseline="middle" className="text-white text-lg font-bold">
                          {analyticsData.codeQuality.qualityScore}%
                        </text>
                      </svg>
                    </div>
                    <div className="text-sm text-gray-400 mt-2">Quality Score</div>
                  </div>
                  <div className="text-center">
                    <div className="inline-block relative">
                      <svg className="w-24 h-24" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="16" fill="none" stroke="#374151" strokeWidth="2"></circle>
                        <circle
                          cx="18"
                          cy="18"
                          r="16"
                          fill="none"
                          stroke="#10B981"
                          strokeWidth="2"
                          strokeDasharray={`${analyticsData.codeQuality.testCoverage} 100`}
                          strokeLinecap="round"
                          transform="rotate(-90 18 18)"
                        ></circle>
                        <text x="18" y="18" textAnchor="middle" dominantBaseline="middle" className="text-white text-lg font-bold">
                          {analyticsData.codeQuality.testCoverage}%
                        </text>
                      </svg>
                    </div>
                    <div className="text-sm text-gray-400 mt-2">Test Coverage</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Health */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="font-semibold text-white mb-4">Project Health</h3>
              <div className="space-y-3">
                {analyticsData.projectHealth.map((project) => (
                  <div key={project.name} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div>
                      <div className="font-medium text-white">{project.name}</div>
                      <div className="text-sm text-gray-400">
                        {project.contributors} contributors • {project.issues} issues
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-400">
                        {formatLastActivity(project.lastActivity)}
                      </div>
                      <div className={`text-lg font-bold ${getHealthColor(project.health)}`}>
                        {project.health}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'productivity' && (
          <div className="space-y-6">
            {/* Productivity Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="font-semibold text-white mb-4">Commits</h3>
                <div className="text-3xl font-bold text-white">
                  {analyticsData.productivity.commitsPerDay.reduce((sum, day) => sum + day.commits, 0)}
                </div>
                <div className="text-sm text-gray-400">Total commits</div>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="font-semibold text-white mb-4">Lines Changed</h3>
                <div className="text-3xl font-bold text-white">
                  {analyticsData.productivity.linesPerDay.reduce((sum, day) => sum + day.lines, 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Total lines changed</div>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="font-semibold text-white mb-4">Active Hours</h3>
                <div className="text-3xl font-bold text-white">
                  {analyticsData.productivity.activeHours.filter(h => h.activity > 20).length}
                </div>
                <div className="text-sm text-gray-400">Hours with activity</div>
              </div>
            </div>

            {/* Activity by Hour */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Activity by Hour</h3>
                <Clock className="h-5 w-5 text-gray-400" />
              </div>
              
              <div className="h-48 flex items-end space-x-1">
                {analyticsData.productivity.activeHours.map((hour) => (
                  <div key={hour.hour} className="flex-1 flex flex-col items-center">
                    <div
                      className={`w-full rounded-t ${
                        hour.activity > 70 ? 'bg-green-500' :
                        hour.activity > 40 ? 'bg-blue-500' :
                        hour.activity > 10 ? 'bg-gray-500' : 'bg-gray-700'
                      }`}
                      style={{ height: `${hour.activity}%` }}
                    ></div>
                    {hour.hour % 3 === 0 && (
                      <div className="text-xs text-gray-400 mt-2">{hour.hour}:00</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Commits by Day */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Commits by Day</h3>
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              
              <div className="h-48 flex items-end space-x-4">
                {analyticsData.productivity.commitsPerDay.map((day) => (
                  <div key={day.date} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-blue-500 rounded-t"
                      style={{ height: `${(day.commits / 25) * 100}%` }}
                    ></div>
                    <div className="text-xs text-gray-400 mt-2">{formatDate(day.date)}</div>
                    <div className="text-xs font-medium text-white">{day.commits}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'team' && (
          <div className="space-y-6">
            <h3 className="font-semibold text-white mb-4">Team Performance</h3>
            
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-400 border-b border-gray-700">
                      <th className="pb-3">Member</th>
                      <th className="pb-3">Commits</th>
                      <th className="pb-3">Lines Added</th>
                      <th className="pb-3">Reviews</th>
                      <th className="pb-3">Productivity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.teamMetrics.members.map((member) => (
                      <tr key={member.name} className="border-b border-gray-700">
                        <td className="py-3 font-medium text-white">{member.name}</td>
                        <td className="py-3 text-gray-300">{member.commits}</td>
                        <td className="py-3 text-gray-300">{member.linesAdded.toLocaleString()}</td>
                        <td className="py-3 text-gray-300">{member.reviewsGiven}</td>
                        <td className="py-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-gray-700 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  member.productivity >= 90 ? 'bg-green-500' :
                                  member.productivity >= 70 ? 'bg-blue-500' :
                                  'bg-yellow-500'
                                }`}
                                style={{ width: `${member.productivity}%` }}
                              ></div>
                            </div>
                            <span className="text-gray-300">{member.productivity}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}