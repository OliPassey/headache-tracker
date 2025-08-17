import sqlite3 from 'sqlite3';
import { HeadacheEntry } from '@/types/headache';
import path from 'path';
import fs from 'fs';

// Ensure the data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'headache_tracker.db');

class DatabaseService {
  private db: sqlite3.Database;

  constructor() {
    this.db = new (sqlite3.verbose()).Database(dbPath);
    this.initializeDatabase();
  }

  private initializeDatabase(): void {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS headache_entries (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        type TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT,
        duration INTEGER,
        pain_level INTEGER NOT NULL,
        location TEXT,
        triggers TEXT,
        symptoms TEXT,
        medications TEXT,
        notes TEXT,
        relief TEXT,
        weather TEXT,
        
        -- Migraine specific fields
        aura_present BOOLEAN,
        aura_type TEXT,
        aura_duration INTEGER,
        prodrome_present BOOLEAN,
        prodrome_symptoms TEXT,
        prodrome_duration INTEGER,
        postdrome_present BOOLEAN,
        postdrome_symptoms TEXT,
        postdrome_duration INTEGER,
        
        -- Cluster headache specific fields
        cluster_in_period BOOLEAN,
        cluster_period_start TEXT,
        cluster_expected_end TEXT,
        eye_symptoms TEXT,
        restlessness BOOLEAN,
        
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    this.db.run(createTableSQL, (err) => {
      if (err) {
        console.error('Error creating table:', err);
      } else {
        console.log('Database initialized successfully');
      }
    });
  }

  async createEntry(entry: Omit<HeadacheEntry, 'id'>): Promise<HeadacheEntry> {
    return new Promise((resolve, reject) => {
      const id = Date.now().toString();
      const insertSQL = `
        INSERT INTO headache_entries (
          id, date, type, start_time, end_time, duration, pain_level, location, triggers, 
          symptoms, medications, notes, relief, weather, aura_present, aura_type, aura_duration,
          prodrome_present, prodrome_symptoms, prodrome_duration, postdrome_present,
          postdrome_symptoms, postdrome_duration, cluster_in_period, cluster_period_start,
          cluster_expected_end, eye_symptoms, restlessness
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        id,
        entry.date.toISOString(),
        entry.type,
        entry.startTime,
        entry.endTime || null,
        entry.duration || null,
        entry.painLevel,
        JSON.stringify(entry.location),
        JSON.stringify(entry.triggers),
        JSON.stringify(entry.symptoms),
        JSON.stringify(entry.medications),
        entry.notes || null,
        JSON.stringify(entry.relief),
        entry.weather ? JSON.stringify(entry.weather) : null,
        entry.aura?.present || false,
        entry.aura?.type ? JSON.stringify(entry.aura.type) : null,
        entry.aura?.duration || null,
        entry.prodrome?.present || false,
        entry.prodrome?.symptoms ? JSON.stringify(entry.prodrome.symptoms) : null,
        entry.prodrome?.duration || null,
        entry.postdrome?.present || false,
        entry.postdrome?.symptoms ? JSON.stringify(entry.postdrome.symptoms) : null,
        entry.postdrome?.duration || null,
        entry.clusterPeriod?.inPeriod || false,
        entry.clusterPeriod?.periodStart ? entry.clusterPeriod.periodStart.toISOString() : null,
        entry.clusterPeriod?.expectedEnd ? entry.clusterPeriod.expectedEnd.toISOString() : null,
        entry.eyeSymptoms ? JSON.stringify(entry.eyeSymptoms) : null,
        entry.restlessness || false,
      ];

      this.db.run(insertSQL, values, function(err) {
        if (err) {
          reject(err);
          return;
        }

        resolve({ ...entry, id });
      });
    });
  }

  async getAllEntries(): Promise<HeadacheEntry[]> {
    return new Promise((resolve, reject) => {
      const selectSQL = `
        SELECT * FROM headache_entries 
        ORDER BY date DESC, start_time DESC
      `;

      this.db.all(selectSQL, [], (err, rows: any[]) => {
        if (err) {
          reject(err);
          return;
        }

        const entries: HeadacheEntry[] = rows.map(row => ({
          id: row.id,
          date: new Date(row.date),
          type: row.type,
          startTime: row.start_time,
          endTime: row.end_time,
          duration: row.duration,
          painLevel: row.pain_level,
          location: JSON.parse(row.location || '[]'),
          triggers: JSON.parse(row.triggers || '[]'),
          symptoms: JSON.parse(row.symptoms || '[]'),
          medications: JSON.parse(row.medications || '[]'),
          notes: row.notes,
          relief: JSON.parse(row.relief || '[]'),
          weather: row.weather ? JSON.parse(row.weather) : undefined,
          aura: row.aura_present ? {
            present: row.aura_present,
            type: row.aura_type ? JSON.parse(row.aura_type) : [],
            duration: row.aura_duration
          } : undefined,
          prodrome: row.prodrome_present ? {
            present: row.prodrome_present,
            symptoms: row.prodrome_symptoms ? JSON.parse(row.prodrome_symptoms) : [],
            duration: row.prodrome_duration
          } : undefined,
          postdrome: row.postdrome_present ? {
            present: row.postdrome_present,
            symptoms: row.postdrome_symptoms ? JSON.parse(row.postdrome_symptoms) : [],
            duration: row.postdrome_duration
          } : undefined,
          clusterPeriod: row.cluster_in_period ? {
            inPeriod: row.cluster_in_period,
            periodStart: row.cluster_period_start ? new Date(row.cluster_period_start) : undefined,
            expectedEnd: row.cluster_expected_end ? new Date(row.cluster_expected_end) : undefined
          } : undefined,
          eyeSymptoms: row.eye_symptoms ? JSON.parse(row.eye_symptoms) : [],
          restlessness: row.restlessness || false
        }));

        resolve(entries);
      });
    });
  }

  async updateEntry(id: string, entry: Partial<HeadacheEntry>): Promise<HeadacheEntry | null> {
    return new Promise((resolve, reject) => {
      const updateSQL = `
        UPDATE headache_entries SET
          date = COALESCE(?, date),
          type = COALESCE(?, type),
          start_time = COALESCE(?, start_time),
          end_time = COALESCE(?, end_time),
          duration = COALESCE(?, duration),
          pain_level = COALESCE(?, pain_level),
          location = COALESCE(?, location),
          triggers = COALESCE(?, triggers),
          symptoms = COALESCE(?, symptoms),
          medications = COALESCE(?, medications),
          notes = COALESCE(?, notes),
          relief = COALESCE(?, relief),
          weather = COALESCE(?, weather),
          aura_present = COALESCE(?, aura_present),
          aura_type = COALESCE(?, aura_type),
          aura_duration = COALESCE(?, aura_duration),
          prodrome_present = COALESCE(?, prodrome_present),
          prodrome_symptoms = COALESCE(?, prodrome_symptoms),
          prodrome_duration = COALESCE(?, prodrome_duration),
          postdrome_present = COALESCE(?, postdrome_present),
          postdrome_symptoms = COALESCE(?, postdrome_symptoms),
          postdrome_duration = COALESCE(?, postdrome_duration),
          cluster_in_period = COALESCE(?, cluster_in_period),
          cluster_period_start = COALESCE(?, cluster_period_start),
          cluster_expected_end = COALESCE(?, cluster_expected_end),
          eye_symptoms = COALESCE(?, eye_symptoms),
          restlessness = COALESCE(?, restlessness),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      const values = [
        entry.date ? entry.date.toISOString() : null,
        entry.type || null,
        entry.startTime || null,
        entry.endTime || null,
        entry.duration || null,
        entry.painLevel || null,
        entry.location ? JSON.stringify(entry.location) : null,
        entry.triggers ? JSON.stringify(entry.triggers) : null,
        entry.symptoms ? JSON.stringify(entry.symptoms) : null,
        entry.medications ? JSON.stringify(entry.medications) : null,
        entry.notes || null,
        entry.relief ? JSON.stringify(entry.relief) : null,
        entry.weather ? JSON.stringify(entry.weather) : null,
        entry.aura?.present || null,
        entry.aura?.type ? JSON.stringify(entry.aura.type) : null,
        entry.aura?.duration || null,
        entry.prodrome?.present || null,
        entry.prodrome?.symptoms ? JSON.stringify(entry.prodrome.symptoms) : null,
        entry.prodrome?.duration || null,
        entry.postdrome?.present || null,
        entry.postdrome?.symptoms ? JSON.stringify(entry.postdrome.symptoms) : null,
        entry.postdrome?.duration || null,
        entry.clusterPeriod?.inPeriod || null,
        entry.clusterPeriod?.periodStart ? entry.clusterPeriod.periodStart.toISOString() : null,
        entry.clusterPeriod?.expectedEnd ? entry.clusterPeriod.expectedEnd.toISOString() : null,
        entry.eyeSymptoms ? JSON.stringify(entry.eyeSymptoms) : null,
        entry.restlessness || null,
        id
      ];

      this.db.run(updateSQL, values, function(err) {
        if (err) {
          reject(err);
          return;
        }

        if (this.changes === 0) {
          resolve(null); // Entry not found
          return;
        }

        // Fetch the updated entry
        databaseService.getEntryById(id).then(resolve).catch(reject);
      });
    });
  }

  async deleteEntry(id: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const deleteSQL = 'DELETE FROM headache_entries WHERE id = ?';
      
      this.db.run(deleteSQL, [id], function(err) {
        if (err) {
          reject(err);
          return;
        }

        resolve(this.changes > 0);
      });
    });
  }

  async getEntryById(id: string): Promise<HeadacheEntry | null> {
    return new Promise((resolve, reject) => {
      const selectSQL = 'SELECT * FROM headache_entries WHERE id = ?';
      
      this.db.get(selectSQL, [id], (err, row: any) => {
        if (err) {
          reject(err);
          return;
        }

        if (!row) {
          resolve(null);
          return;
        }

        const entry: HeadacheEntry = {
          id: row.id,
          date: new Date(row.date),
          type: row.type,
          startTime: row.start_time,
          endTime: row.end_time,
          duration: row.duration,
          painLevel: row.pain_level,
          location: JSON.parse(row.location || '[]'),
          triggers: JSON.parse(row.triggers || '[]'),
          symptoms: JSON.parse(row.symptoms || '[]'),
          medications: JSON.parse(row.medications || '[]'),
          notes: row.notes,
          relief: JSON.parse(row.relief || '[]'),
          weather: row.weather ? JSON.parse(row.weather) : undefined,
          aura: row.aura_present ? {
            present: row.aura_present,
            type: row.aura_type ? JSON.parse(row.aura_type) : [],
            duration: row.aura_duration
          } : undefined,
          prodrome: row.prodrome_present ? {
            present: row.prodrome_present,
            symptoms: row.prodrome_symptoms ? JSON.parse(row.prodrome_symptoms) : [],
            duration: row.prodrome_duration
          } : undefined,
          postdrome: row.postdrome_present ? {
            present: row.postdrome_present,
            symptoms: row.postdrome_symptoms ? JSON.parse(row.postdrome_symptoms) : [],
            duration: row.postdrome_duration
          } : undefined,
          clusterPeriod: row.cluster_in_period ? {
            inPeriod: row.cluster_in_period,
            periodStart: row.cluster_period_start ? new Date(row.cluster_period_start) : undefined,
            expectedEnd: row.cluster_expected_end ? new Date(row.cluster_expected_end) : undefined
          } : undefined,
          eyeSymptoms: row.eye_symptoms ? JSON.parse(row.eye_symptoms) : [],
          restlessness: row.restlessness || false
        };

        resolve(entry);
      });
    });
  }

  close(): void {
    this.db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      } else {
        console.log('Database connection closed');
      }
    });
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
export default databaseService;
