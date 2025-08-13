export interface HeadacheEntry {
  id: string;
  date: Date;
  type: 'migraine' | 'cluster';
  startTime: string;
  endTime?: string;
  duration?: number; // in minutes
  painLevel: number; // 1-10 scale
  location: string[];
  symptoms: string[];
  triggers: string[];
  medications: string[];
  relief: string[];
  weather?: {
    temperature: number;
    humidity: number;
    pressure: number;
    condition: string;
  };
  notes?: string;
  
  // Migraine-specific fields
  aura?: {
    present: boolean;
    type?: string[];
    duration?: number;
  };
  prodrome?: {
    present: boolean;
    symptoms?: string[];
    duration?: number;
  };
  postdrome?: {
    present: boolean;
    symptoms?: string[];
    duration?: number;
  };
  
  // Cluster-specific fields
  clusterPeriod?: {
    inPeriod: boolean;
    periodStart?: Date;
    expectedEnd?: Date;
  };
  eyeSymptoms?: string[];
  restlessness?: boolean;
}

export interface TriggerOption {
  id: string;
  name: string;
  category: 'food' | 'environmental' | 'hormonal' | 'lifestyle' | 'emotional' | 'physical' | 'medication';
}

export interface SymptomOption {
  id: string;
  name: string;
  category: 'pain' | 'neurological' | 'gastrointestinal' | 'autonomic' | 'visual' | 'sensory';
}

export interface MedicationOption {
  id: string;
  name: string;
  type: 'preventive' | 'acute' | 'rescue';
  dosage?: string;
}

export interface LocationOption {
  id: string;
  name: string;
  side: 'left' | 'right' | 'bilateral' | 'varies';
}

export interface ReliefOption {
  id: string;
  name: string;
  category: 'medication' | 'therapy' | 'environmental' | 'physical';
}

export interface DashboardStats {
  totalEntries: number;
  migraineCount: number;
  clusterCount: number;
  averagePainLevel: number;
  mostCommonTriggers: { trigger: string; count: number }[];
  mostCommonSymptoms: { symptom: string; count: number }[];
  monthlyTrends: { month: string; migraines: number; clusters: number }[];
  painLevelDistribution: { level: number; count: number }[];
  durationStats: {
    averageDuration: number;
    shortestDuration: number;
    longestDuration: number;
  };
}
