'use client';

import React, { useMemo } from 'react';
import { HeadacheEntry } from '@/types/headache';
import { format, startOfYear, endOfYear, eachDayOfInterval, getDay, getMonth, getDate, subDays, addDays, startOfWeek, endOfWeek } from 'date-fns';

interface HeadacheHeatmapProps {
  entries: HeadacheEntry[];
}

interface DayData {
  date: Date;
  headaches: HeadacheEntry[];
  maxPainLevel: number;
  count: number;
}

const HeadacheHeatmap: React.FC<HeadacheHeatmapProps> = ({ entries }) => {
  const heatmapData = useMemo(() => {
    const today = new Date();
    const oneYearAgo = subDays(today, 365);
    
    // Get all days in the last year
    const days = eachDayOfInterval({
      start: oneYearAgo,
      end: today
    });

    // Create a map of date strings to headache data
    const dayMap = new Map<string, DayData>();
    
    // Initialize all days with empty data
    days.forEach(date => {
      const dateKey = format(date, 'yyyy-MM-dd');
      dayMap.set(dateKey, {
        date,
        headaches: [],
        maxPainLevel: 0,
        count: 0
      });
    });

    // Populate with headache data
    entries.forEach(entry => {
      const dateKey = format(entry.date, 'yyyy-MM-dd');
      const dayData = dayMap.get(dateKey);
      
      if (dayData) {
        dayData.headaches.push(entry);
        dayData.maxPainLevel = Math.max(dayData.maxPainLevel, entry.painLevel);
        dayData.count = dayData.headaches.length;
      }
    });

    return Array.from(dayMap.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [entries]);

  const weeks = useMemo(() => {
    // Group days into weeks (starting from Sunday)
    const weekGroups: DayData[][] = [];
    let currentWeek: DayData[] = [];
    
    // Start from the Sunday before our first day
    const firstDay = heatmapData[0]?.date;
    if (!firstDay) return [];
    
    const startSunday = startOfWeek(firstDay);
    const endSaturday = endOfWeek(heatmapData[heatmapData.length - 1]?.date || new Date());
    
    // Get all days from Sunday to Saturday to create complete weeks
    const allDays = eachDayOfInterval({
      start: startSunday,
      end: endSaturday
    });
    
    allDays.forEach((date, index) => {
      const dateKey = format(date, 'yyyy-MM-dd');
      const dayData = heatmapData.find(d => format(d.date, 'yyyy-MM-dd') === dateKey) || {
        date,
        headaches: [],
        maxPainLevel: 0,
        count: 0
      };
      
      currentWeek.push(dayData);
      
      if (currentWeek.length === 7) {
        weekGroups.push(currentWeek);
        currentWeek = [];
      }
    });
    
    if (currentWeek.length > 0) {
      weekGroups.push(currentWeek);
    }
    
    return weekGroups;
  }, [heatmapData]);

  const getIntensityColor = (painLevel: number, count: number): string => {
    if (count === 0) return 'bg-gray-100 border-gray-200';
    
    if (painLevel >= 8) return 'bg-red-600 border-red-700'; // Severe
    if (painLevel >= 6) return 'bg-red-400 border-red-500'; // High
    if (painLevel >= 4) return 'bg-orange-400 border-orange-500'; // Moderate
    if (painLevel >= 2) return 'bg-yellow-300 border-yellow-400'; // Mild
    return 'bg-green-200 border-green-300'; // Very mild
  };

  const getTooltipText = (dayData: DayData): string => {
    const dateStr = format(dayData.date, 'MMM d, yyyy');
    
    if (dayData.count === 0) {
      return `${dateStr}\nNo headaches`;
    }
    
    if (dayData.count === 1) {
      return `${dateStr}\n1 headache (Pain level: ${dayData.maxPainLevel})`;
    }
    
    return `${dateStr}\n${dayData.count} headaches (Max pain: ${dayData.maxPainLevel})`;
  };

  const monthLabels = useMemo(() => {
    const labels: { month: string; startCol: number }[] = [];
    const today = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const weekIndex = weeks.findIndex(week => 
        week.some(day => 
          getMonth(day.date) === getMonth(date) && 
          day.date.getTime() >= date.getTime()
        )
      );
      
      if (weekIndex !== -1) {
        labels.push({
          month: format(date, 'MMM'),
          startCol: weekIndex
        });
      }
    }
    
    return labels;
  }, [weeks]);

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Headache Activity (Last 365 Days)
        </h3>
        <p className="text-sm text-gray-600">
          Each square represents a day. Color intensity shows maximum pain level.
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Month labels */}
          <div className="flex mb-2">
            <div className="w-8"></div> {/* Space for day labels */}
            <div className="flex gap-1">
              {monthLabels.map(({ month, startCol }, index) => (
                <div
                  key={`${month}-${index}`}
                  className="text-xs text-gray-600 font-medium"
                  style={{
                    marginLeft: index === 0 ? `${startCol * 14}px` : '0',
                    width: '42px'
                  }}
                >
                  {month}
                </div>
              ))}
            </div>
          </div>

          {/* Calendar grid */}
          <div className="flex">
            {/* Day labels */}
            <div className="flex flex-col gap-1 mr-2">
              {dayLabels.map((day, index) => (
                <div
                  key={day}
                  className="h-3 flex items-center text-xs text-gray-600 font-medium"
                  style={{ opacity: index % 2 === 1 ? 1 : 0 }} // Show only Mon, Wed, Fri, Sun
                >
                  <span className="w-6 text-right">{index % 2 === 1 ? day : ''}</span>
                </div>
              ))}
            </div>

            {/* Heatmap squares */}
            <div className="flex gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((dayData, dayIndex) => (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className={`
                        w-3 h-3 border rounded-sm cursor-pointer transition-all duration-200 hover:scale-110
                        ${getIntensityColor(dayData.maxPainLevel, dayData.count)}
                      `}
                      title={getTooltipText(dayData)}
                      onClick={() => {
                        if (dayData.count > 0) {
                          // Could open a modal or navigate to detailed view
                          console.log('Day clicked:', dayData);
                        }
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between mt-4 text-xs text-gray-600">
            <span>Less</span>
            <div className="flex gap-1 mx-2">
              <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded-sm"></div>
              <div className="w-3 h-3 bg-green-200 border border-green-300 rounded-sm"></div>
              <div className="w-3 h-3 bg-yellow-300 border border-yellow-400 rounded-sm"></div>
              <div className="w-3 h-3 bg-orange-400 border border-orange-500 rounded-sm"></div>
              <div className="w-3 h-3 bg-red-400 border border-red-500 rounded-sm"></div>
              <div className="w-3 h-3 bg-red-600 border border-red-700 rounded-sm"></div>
            </div>
            <span>More</span>
          </div>

          {/* Summary stats */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-gray-900">
                {heatmapData.filter(d => d.count > 0).length}
              </div>
              <div className="text-gray-600">Days with headaches</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">
                {heatmapData.reduce((sum, d) => sum + d.count, 0)}
              </div>
              <div className="text-gray-600">Total headaches</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">
                {heatmapData.filter(d => d.maxPainLevel >= 7).length}
              </div>
              <div className="text-gray-600">Severe days</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">
                {Math.round((heatmapData.filter(d => d.count > 0).length / 365) * 100)}%
              </div>
              <div className="text-gray-600">Days affected</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeadacheHeatmap;
