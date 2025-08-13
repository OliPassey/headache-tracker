'use client';

import { HeadacheEntry, DashboardStats } from '@/types/headache';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Calendar, TrendingUp, Activity, Clock, Target, AlertTriangle } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';

interface DashboardProps {
  entries: HeadacheEntry[];
}

export default function Dashboard({ entries }: DashboardProps) {
  const stats = calculateStats(entries);

  const painLevelColors = [
    '#10B981', '#34D399', '#6EE7B7', '#FDE047', '#FACC15',
    '#FB923C', '#F97316', '#EF4444', '#DC2626', '#B91C1C'
  ];

  const chartColors = {
    migraine: '#EC4899',
    cluster: '#3B82F6',
    background: '#F3F4F6'
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Headache Analytics Dashboard</h1>
        <div className="text-sm text-gray-600">
          <Calendar className="inline w-4 h-4 mr-1" />
          {entries.length} total entries
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Episodes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEntries}</p>
            </div>
            <Activity className="h-8 w-8 text-primary-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Pain Level</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averagePainLevel.toFixed(1)}</p>
            </div>
            <Target className="h-8 w-8 text-secondary-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Duration</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round(stats.durationStats.averageDuration)}h</p>
            </div>
            <Clock className="h-8 w-8 text-primary-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {entries.filter(e => 
                  e.date >= startOfMonth(new Date()) && e.date <= endOfMonth(new Date())
                ).length}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-danger-600" />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="migraines" 
                stroke={chartColors.migraine}
                strokeWidth={2}
                name="Migraines"
              />
              <Line 
                type="monotone" 
                dataKey="clusters" 
                stroke={chartColors.cluster}
                strokeWidth={2}
                name="Cluster Headaches"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pain Level Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pain Level Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.painLevelDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="level" />
              <YAxis />
              <Tooltip />
              <Bar 
                dataKey="count" 
                fill={chartColors.migraine}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Type Distribution and Top Triggers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Headache Type Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Headache Types</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Migraines', value: stats.migraineCount, color: chartColors.migraine },
                    { name: 'Cluster Headaches', value: stats.clusterCount, color: chartColors.cluster }
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({name, value, percent}) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                >
                  <Cell fill={chartColors.migraine} />
                  <Cell fill={chartColors.cluster} />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Triggers */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Common Triggers</h3>
          <div className="space-y-3">
            {stats.mostCommonTriggers.slice(0, 8).map((trigger, index) => (
              <div key={trigger.trigger} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: painLevelColors[index] }} />
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {trigger.trigger.replace('-', ' ')}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full" 
                      style={{ 
                        width: `${(trigger.count / stats.totalEntries) * 100}%`,
                        backgroundColor: painLevelColors[index]
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8 text-right">{trigger.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights and Patterns */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-amber-600" />
          Key Insights & Patterns
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Frequency Pattern</h4>
            <p className="text-sm text-blue-800">
              You average {(stats.totalEntries / 12).toFixed(1)} headaches per month
              {stats.totalEntries > 0 && stats.migraineCount > stats.clusterCount 
                ? ', with migraines being more common'
                : stats.clusterCount > stats.migraineCount 
                ? ', with cluster headaches being more common'
                : ', with equal distribution between types'
              }.
            </p>
          </div>

          <div className="p-4 bg-amber-50 rounded-lg">
            <h4 className="font-medium text-amber-900 mb-2">Pain Intensity</h4>
            <p className="text-sm text-amber-800">
              Average pain level is {stats.averagePainLevel.toFixed(1)}/10. 
              {stats.averagePainLevel >= 7 
                ? ' This indicates severe episodes requiring close monitoring.'
                : stats.averagePainLevel >= 5
                ? ' This indicates moderate pain levels.'
                : ' This indicates relatively mild episodes.'
              }
            </p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Duration Insights</h4>
            <p className="text-sm text-green-800">
              Episodes last {Math.round(stats.durationStats.averageDuration)} hours on average. 
              Shortest: {Math.round(stats.durationStats.shortestDuration)}h, 
              Longest: {Math.round(stats.durationStats.longestDuration)}h.
            </p>
          </div>

          {stats.mostCommonTriggers.length > 0 && (
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">Top Trigger</h4>
              <p className="text-sm text-purple-800">
                Your most common trigger is <strong>{stats.mostCommonTriggers[0].trigger.replace('-', ' ')}</strong>, 
                occurring in {stats.mostCommonTriggers[0].count} episodes 
                ({Math.round((stats.mostCommonTriggers[0].count / stats.totalEntries) * 100)}%).
              </p>
            </div>
          )}

          {stats.mostCommonSymptoms.length > 0 && (
            <div className="p-4 bg-pink-50 rounded-lg">
              <h4 className="font-medium text-pink-900 mb-2">Common Symptom</h4>
              <p className="text-sm text-pink-800">
                Your most frequent symptom is <strong>{stats.mostCommonSymptoms[0].symptom.replace('-', ' ')}</strong>, 
                present in {stats.mostCommonSymptoms[0].count} episodes.
              </p>
            </div>
          )}

          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Tracking Progress</h4>
            <p className="text-sm text-gray-800">
              You've logged {stats.totalEntries} episodes. Consistent tracking helps identify patterns 
              and triggers to better manage your headaches.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function calculateStats(entries: HeadacheEntry[]): DashboardStats {
  if (entries.length === 0) {
    return {
      totalEntries: 0,
      migraineCount: 0,
      clusterCount: 0,
      averagePainLevel: 0,
      mostCommonTriggers: [],
      mostCommonSymptoms: [],
      monthlyTrends: [],
      painLevelDistribution: [],
      durationStats: {
        averageDuration: 0,
        shortestDuration: 0,
        longestDuration: 0
      }
    };
  }

  const migraineCount = entries.filter(e => e.type === 'migraine').length;
  const clusterCount = entries.filter(e => e.type === 'cluster').length;
  const averagePainLevel = entries.reduce((sum, e) => sum + e.painLevel, 0) / entries.length;

  // Calculate trigger frequencies
  const triggerCounts: Record<string, number> = {};
  entries.forEach(entry => {
    entry.triggers.forEach(trigger => {
      triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
    });
  });

  const mostCommonTriggers = Object.entries(triggerCounts)
    .map(([trigger, count]) => ({ trigger, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Calculate symptom frequencies
  const symptomCounts: Record<string, number> = {};
  entries.forEach(entry => {
    entry.symptoms.forEach(symptom => {
      symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
    });
  });

  const mostCommonSymptoms = Object.entries(symptomCounts)
    .map(([symptom, count]) => ({ symptom, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Calculate monthly trends
  const now = new Date();
  const sixMonthsAgo = subMonths(now, 5);
  const months = eachMonthOfInterval({ start: sixMonthsAgo, end: now });
  
  const monthlyTrends = months.map(month => {
    const monthEntries = entries.filter(entry => 
      entry.date >= startOfMonth(month) && entry.date <= endOfMonth(month)
    );
    return {
      month: format(month, 'MMM yyyy'),
      migraines: monthEntries.filter(e => e.type === 'migraine').length,
      clusters: monthEntries.filter(e => e.type === 'cluster').length
    };
  });

  // Calculate pain level distribution
  const painLevelCounts: Record<number, number> = {};
  entries.forEach(entry => {
    painLevelCounts[entry.painLevel] = (painLevelCounts[entry.painLevel] || 0) + 1;
  });

  const painLevelDistribution = Array.from({ length: 10 }, (_, i) => ({
    level: i + 1,
    count: painLevelCounts[i + 1] || 0
  }));

  // Calculate duration stats
  const durationsInHours = entries
    .filter(e => e.duration)
    .map(e => e.duration! / 60); // Convert minutes to hours

  const durationStats = {
    averageDuration: durationsInHours.length > 0 
      ? durationsInHours.reduce((sum, d) => sum + d, 0) / durationsInHours.length 
      : 0,
    shortestDuration: durationsInHours.length > 0 ? Math.min(...durationsInHours) : 0,
    longestDuration: durationsInHours.length > 0 ? Math.max(...durationsInHours) : 0
  };

  return {
    totalEntries: entries.length,
    migraineCount,
    clusterCount,
    averagePainLevel,
    mostCommonTriggers,
    mostCommonSymptoms,
    monthlyTrends,
    painLevelDistribution,
    durationStats
  };
}
