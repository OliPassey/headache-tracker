import { HeadacheEntry } from '@/types/headache';

const API_BASE = '/api/headaches';

export class HeadacheDataService {
  async getAllEntries(): Promise<HeadacheEntry[]> {
    try {
      const response = await fetch(API_BASE);
      if (!response.ok) {
        throw new Error('Failed to fetch entries');
      }
      const entries = await response.json();
      
      // Convert date strings back to Date objects
      return entries.map((entry: any) => ({
        ...entry,
        date: new Date(entry.date),
        clusterPeriod: entry.clusterPeriod ? {
          ...entry.clusterPeriod,
          periodStart: entry.clusterPeriod.periodStart ? new Date(entry.clusterPeriod.periodStart) : undefined,
          expectedEnd: entry.clusterPeriod.expectedEnd ? new Date(entry.clusterPeriod.expectedEnd) : undefined
        } : undefined
      }));
    } catch (error) {
      console.error('Error fetching entries:', error);
      throw error;
    }
  }

  async createEntry(entry: Omit<HeadacheEntry, 'id'>): Promise<HeadacheEntry> {
    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });

      if (!response.ok) {
        throw new Error('Failed to create entry');
      }

      const newEntry = await response.json();
      
      // Convert date strings back to Date objects
      return {
        ...newEntry,
        date: new Date(newEntry.date),
        clusterPeriod: newEntry.clusterPeriod ? {
          ...newEntry.clusterPeriod,
          periodStart: newEntry.clusterPeriod.periodStart ? new Date(newEntry.clusterPeriod.periodStart) : undefined,
          expectedEnd: newEntry.clusterPeriod.expectedEnd ? new Date(newEntry.clusterPeriod.expectedEnd) : undefined
        } : undefined
      };
    } catch (error) {
      console.error('Error creating entry:', error);
      throw error;
    }
  }

  async updateEntry(id: string, entry: Omit<HeadacheEntry, 'id'>): Promise<HeadacheEntry> {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });

      if (!response.ok) {
        throw new Error('Failed to update entry');
      }

      const updatedEntry = await response.json();
      
      // Convert date strings back to Date objects
      return {
        ...updatedEntry,
        date: new Date(updatedEntry.date),
        clusterPeriod: updatedEntry.clusterPeriod ? {
          ...updatedEntry.clusterPeriod,
          periodStart: updatedEntry.clusterPeriod.periodStart ? new Date(updatedEntry.clusterPeriod.periodStart) : undefined,
          expectedEnd: updatedEntry.clusterPeriod.expectedEnd ? new Date(updatedEntry.clusterPeriod.expectedEnd) : undefined
        } : undefined
      };
    } catch (error) {
      console.error('Error updating entry:', error);
      throw error;
    }
  }

  async deleteEntry(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete entry');
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      throw error;
    }
  }

  // Migration function to move localStorage data to database
  async migrateLocalStorageData(): Promise<number> {
    try {
      const storedEntries = localStorage.getItem('headache-entries');
      if (!storedEntries) {
        return 0;
      }

      const localEntries = JSON.parse(storedEntries).map((entry: any) => ({
        ...entry,
        date: new Date(entry.date),
        clusterPeriod: entry.clusterPeriod ? {
          ...entry.clusterPeriod,
          periodStart: entry.clusterPeriod.periodStart ? new Date(entry.clusterPeriod.periodStart) : undefined,
          expectedEnd: entry.clusterPeriod.expectedEnd ? new Date(entry.clusterPeriod.expectedEnd) : undefined
        } : undefined
      }));

      let migratedCount = 0;
      for (const entry of localEntries) {
        try {
          await this.createEntry(entry);
          migratedCount++;
        } catch (error) {
          console.error('Error migrating entry:', entry, error);
        }
      }

      // Backup localStorage data before clearing
      localStorage.setItem('headache-entries-migrated-backup', storedEntries);
      localStorage.setItem('headache-entries-migration-date', new Date().toISOString());
      
      // Clear localStorage after successful migration
      localStorage.removeItem('headache-entries');
      
      return migratedCount;
    } catch (error) {
      console.error('Error during migration:', error);
      throw error;
    }
  }

  // Export data for backup
  async exportAllData(): Promise<HeadacheEntry[]> {
    return this.getAllEntries();
  }

  // Import data from backup
  async importData(entries: HeadacheEntry[], replaceExisting: boolean = false): Promise<number> {
    try {
      if (replaceExisting) {
        // This would require a clear all endpoint
        console.warn('Replace existing not implemented yet');
      }

      let importedCount = 0;
      for (const entry of entries) {
        try {
          const { id, ...entryWithoutId } = entry;
          await this.createEntry(entryWithoutId);
          importedCount++;
        } catch (error) {
          console.error('Error importing entry:', entry, error);
        }
      }

      return importedCount;
    } catch (error) {
      console.error('Error during import:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const headacheDataService = new HeadacheDataService();
export default headacheDataService;
