import { HeadacheEntry } from '@/types/headache';

// Storage utilities for backup and recovery
export const dataStorage = {
  // Export data to JSON file
  exportData: (entries: HeadacheEntry[]) => {
    const dataStr = JSON.stringify(entries, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `headache-data-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  // Import data from JSON file
  importData: (file: File): Promise<HeadacheEntry[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const result = e.target?.result as string;
          const data = JSON.parse(result);
          
          // Validate and convert dates
          const entries = data.map((entry: any) => ({
            ...entry,
            date: new Date(entry.date),
            clusterPeriod: entry.clusterPeriod ? {
              ...entry.clusterPeriod,
              periodStart: entry.clusterPeriod.periodStart ? new Date(entry.clusterPeriod.periodStart) : undefined,
              expectedEnd: entry.clusterPeriod.expectedEnd ? new Date(entry.clusterPeriod.expectedEnd) : undefined
            } : undefined
          }));
          
          resolve(entries);
        } catch (error) {
          reject(new Error('Invalid file format'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  },

  // Get current storage usage
  getStorageInfo: () => {
    const entries = localStorage.getItem('headache-entries');
    const sizeInBytes = entries ? new Blob([entries]).size : 0;
    const entryCount = entries ? JSON.parse(entries).length : 0;
    
    return {
      entryCount,
      sizeInBytes,
      sizeInKB: Math.round(sizeInBytes / 1024 * 100) / 100,
      lastSaved: localStorage.getItem('headache-entries-last-saved') || 'Never'
    };
  },

  // Create automatic backup to localStorage with timestamp
  createAutoBackup: (entries: HeadacheEntry[]) => {
    const backup = {
      timestamp: new Date().toISOString(),
      entries: entries
    };
    localStorage.setItem('headache-entries-backup', JSON.stringify(backup));
    localStorage.setItem('headache-entries-last-saved', new Date().toISOString());
  },

  // Restore from automatic backup
  restoreFromBackup: (): HeadacheEntry[] | null => {
    try {
      const backup = localStorage.getItem('headache-entries-backup');
      if (!backup) return null;
      
      const parsed = JSON.parse(backup);
      return parsed.entries.map((entry: any) => ({
        ...entry,
        date: new Date(entry.date),
        clusterPeriod: entry.clusterPeriod ? {
          ...entry.clusterPeriod,
          periodStart: entry.clusterPeriod.periodStart ? new Date(entry.clusterPeriod.periodStart) : undefined,
          expectedEnd: entry.clusterPeriod.expectedEnd ? new Date(entry.clusterPeriod.expectedEnd) : undefined
        } : undefined
      }));
    } catch {
      return null;
    }
  },

  // Clear all data (with confirmation)
  clearAllData: () => {
    localStorage.removeItem('headache-entries');
    localStorage.removeItem('headache-entries-backup');
    localStorage.removeItem('headache-entries-last-saved');
  }
};
