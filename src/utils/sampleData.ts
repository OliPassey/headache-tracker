import { HeadacheEntry } from '@/types/headache';

// Generate sample headache data for testing the heatmap
export function generateSampleHeadacheData(): HeadacheEntry[] {
  const entries: HeadacheEntry[] = [];
  const today = new Date();
  
  // Generate entries for the last year with realistic patterns
  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Skip some days to make it realistic (not every day has a headache)
    const hasHeadache = Math.random() < 0.15; // 15% chance of headache on any given day
    
    if (hasHeadache) {
      // Higher chance of headaches on certain days of week (stress patterns)
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isMonday = dayOfWeek === 1;
      
      let painMultiplier = 1;
      if (isMonday) painMultiplier = 1.3; // Monday stress
      if (isWeekend) painMultiplier = 0.8; // Relaxing weekends
      
      // Seasonal patterns (more headaches in winter/spring)
      const month = date.getMonth();
      if (month >= 1 && month <= 4) painMultiplier *= 1.2; // Feb-May
      
      // Generate 1-3 headaches per day when there are headaches
      const numHeadaches = Math.random() < 0.7 ? 1 : Math.random() < 0.9 ? 2 : 3;
      
      for (let j = 0; j < numHeadaches; j++) {
        const basePain = Math.floor(Math.random() * 8) + 1; // 1-8 base pain
        const painLevel = Math.min(10, Math.max(1, Math.floor(basePain * painMultiplier)));
        
        const entry: HeadacheEntry = {
          id: `sample-${i}-${j}-${Date.now()}`,
          date: new Date(date),
          type: Math.random() < 0.8 ? 'migraine' : 'cluster',
          startTime: `${String(Math.floor(Math.random() * 12) + 6).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
          painLevel,
          location: ['forehead', 'temples'],
          symptoms: painLevel > 6 ? ['nausea', 'light sensitivity'] : ['pressure'],
          triggers: ['stress', 'lack of sleep'],
          medications: painLevel > 5 ? ['ibuprofen'] : [],
          relief: ['rest'],
          weather: {
            temperature: Math.floor(Math.random() * 30) + 5, // 5-35°C
            humidity: Math.floor(Math.random() * 80) + 20, // 20-100%
            pressure: Math.floor(Math.random() * 50) + 980, // 980-1030 hPa
            condition: ['sunny', 'cloudy', 'rainy', 'partly cloudy'][Math.floor(Math.random() * 4)]
          }
        };
        
        entries.push(entry);
      }
    }
  }
  
  return entries.sort((a, b) => b.date.getTime() - a.date.getTime());
}

// Generate sample data for development/testing
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  console.log('Sample headache data generator loaded');
}
