'use client';

import { useState } from 'react';
import { HeadacheEntry } from '@/types/headache';
import { TRIGGER_OPTIONS, SYMPTOM_OPTIONS, LOCATION_OPTIONS, MEDICATION_OPTIONS, RELIEF_OPTIONS } from '@/data/options';
import { Calendar, Clock, MapPin, Zap, Pill, Heart, Thermometer, StickyNote } from 'lucide-react';

interface HeadacheFormProps {
  onSubmit: (entry: Omit<HeadacheEntry, 'id'>) => void;
  onCancel: () => void;
  initialData?: HeadacheEntry;
}

export default function HeadacheForm({ onSubmit, onCancel, initialData }: HeadacheFormProps) {
  const [formData, setFormData] = useState({
    type: (initialData?.type || 'migraine') as 'migraine' | 'cluster',
    date: initialData?.date ? initialData.date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    startTime: initialData?.startTime || new Date().toTimeString().slice(0, 5),
    endTime: initialData?.endTime || '',
    painLevel: initialData?.painLevel || 5,
    location: initialData?.location || [] as string[],
    symptoms: initialData?.symptoms || [] as string[],
    triggers: initialData?.triggers || [] as string[],
    medications: initialData?.medications || [] as string[],
    relief: initialData?.relief || [] as string[],
    auraPresent: initialData?.aura?.present || false,
    auraType: initialData?.aura?.type || [] as string[],
    auraDuration: initialData?.aura?.duration?.toString() || '',
    prodromePresent: initialData?.prodrome?.present || false,
    prodromeSymptoms: initialData?.prodrome?.symptoms || [] as string[],
    prodromeDuration: initialData?.prodrome?.duration?.toString() || '',
    postdromePresent: initialData?.postdrome?.present || false,
    postdromeSymptoms: initialData?.postdrome?.symptoms || [] as string[],
    postdromeDuration: initialData?.postdrome?.duration?.toString() || '',
    inClusterPeriod: initialData?.clusterPeriod?.inPeriod || false,
    clusterPeriodStart: initialData?.clusterPeriod?.periodStart ? initialData.clusterPeriod.periodStart.toISOString().split('T')[0] : '',
    expectedClusterEnd: initialData?.clusterPeriod?.expectedEnd ? initialData.clusterPeriod.expectedEnd.toISOString().split('T')[0] : '',
    eyeSymptoms: initialData?.eyeSymptoms || [] as string[],
    restlessness: initialData?.restlessness || false,
    weather: {
      temperature: initialData?.weather?.temperature?.toString() || '',
      humidity: initialData?.weather?.humidity?.toString() || '',
      pressure: initialData?.weather?.pressure?.toString() || '',
      condition: initialData?.weather?.condition || ''
    },
    notes: initialData?.notes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const entry: Omit<HeadacheEntry, 'id'> = {
      type: formData.type,
      date: new Date(formData.date),
      startTime: formData.startTime,
      endTime: formData.endTime || undefined,
      duration: formData.endTime ? 
        (new Date(`1970-01-01T${formData.endTime}:00`).getTime() - 
         new Date(`1970-01-01T${formData.startTime}:00`).getTime()) / (1000 * 60) : undefined,
      painLevel: formData.painLevel,
      location: formData.location,
      symptoms: formData.symptoms,
      triggers: formData.triggers,
      medications: formData.medications,
      relief: formData.relief,
      notes: formData.notes || undefined,
      weather: formData.weather.temperature ? {
        temperature: parseFloat(formData.weather.temperature),
        humidity: parseFloat(formData.weather.humidity),
        pressure: parseFloat(formData.weather.pressure),
        condition: formData.weather.condition
      } : undefined,
    };

    if (formData.type === 'migraine') {
      entry.aura = formData.auraPresent ? {
        present: true,
        type: formData.auraType,
        duration: formData.auraDuration ? parseFloat(formData.auraDuration) : undefined
      } : { present: false };
      
      entry.prodrome = formData.prodromePresent ? {
        present: true,
        symptoms: formData.prodromeSymptoms,
        duration: formData.prodromeDuration ? parseFloat(formData.prodromeDuration) : undefined
      } : { present: false };
      
      entry.postdrome = formData.postdromePresent ? {
        present: true,
        symptoms: formData.postdromeSymptoms,
        duration: formData.postdromeDuration ? parseFloat(formData.postdromeDuration) : undefined
      } : { present: false };
    }

    if (formData.type === 'cluster') {
      entry.clusterPeriod = {
        inPeriod: formData.inClusterPeriod,
        periodStart: formData.clusterPeriodStart ? new Date(formData.clusterPeriodStart) : undefined,
        expectedEnd: formData.expectedClusterEnd ? new Date(formData.expectedClusterEnd) : undefined
      };
      entry.eyeSymptoms = formData.eyeSymptoms;
      entry.restlessness = formData.restlessness;
    }

    onSubmit(entry);
  };

  const handleArrayFieldChange = (field: string, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...(prev[field as keyof typeof prev] as string[]), value]
        : (prev[field as keyof typeof prev] as string[]).filter(item => item !== value)
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {initialData ? 'Edit Headache Episode' : 'Log Headache Episode'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Zap className="inline w-4 h-4 mr-1" />
              Headache Type
            </label>
            <select 
              className="input-field"
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'migraine' | 'cluster' }))}
            >
              <option value="migraine">Migraine</option>
              <option value="cluster">Cluster Headache</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline w-4 h-4 mr-1" />
              Date
            </label>
            <input
              type="date"
              className="input-field"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="inline w-4 h-4 mr-1" />
              Start Time
            </label>
            <input
              type="time"
              className="input-field"
              value={formData.startTime}
              onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="inline w-4 h-4 mr-1" />
              End Time (if finished)
            </label>
            <input
              type="time"
              className="input-field"
              value={formData.endTime}
              onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pain Level (1-10)
            </label>
            <input
              type="range"
              min="1"
              max="10"
              className="w-full"
              value={formData.painLevel}
              onChange={(e) => setFormData(prev => ({ ...prev, painLevel: parseInt(e.target.value) }))}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 (Mild)</span>
              <span className="font-medium">{formData.painLevel}</span>
              <span>10 (Severe)</span>
            </div>
          </div>
        </div>

        {/* Pain Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <MapPin className="inline w-4 h-4 mr-1" />
            Pain Location(s)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {LOCATION_OPTIONS.map(location => (
              <label key={location.id} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={formData.location.includes(location.id)}
                  onChange={(e) => handleArrayFieldChange('location', location.id, e.target.checked)}
                  className="rounded"
                />
                <span>{location.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Symptoms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <Heart className="inline w-4 h-4 mr-1" />
            Symptoms
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(
              SYMPTOM_OPTIONS.reduce((acc, symptom) => {
                if (!acc[symptom.category]) acc[symptom.category] = [];
                acc[symptom.category].push(symptom);
                return acc;
              }, {} as Record<string, typeof SYMPTOM_OPTIONS>)
            ).map(([category, symptoms]) => (
              <div key={category} className="space-y-2">
                <h4 className="font-medium text-gray-900 capitalize">{category.replace('-', ' ')}</h4>
                {symptoms.map(symptom => (
                  <label key={symptom.id} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.symptoms.includes(symptom.id)}
                      onChange={(e) => handleArrayFieldChange('symptoms', symptom.id, e.target.checked)}
                      className="rounded"
                    />
                    <span>{symptom.name}</span>
                  </label>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Migraine-specific fields */}
        {formData.type === 'migraine' && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Migraine-Specific Information</h3>
            
            {/* Aura */}
            <div className="mb-4">
              <label className="flex items-center space-x-2 mb-2">
                <input
                  type="checkbox"
                  checked={formData.auraPresent}
                  onChange={(e) => setFormData(prev => ({ ...prev, auraPresent: e.target.checked }))}
                  className="rounded"
                />
                <span className="font-medium">Did you experience an aura?</span>
              </label>
              
              {formData.auraPresent && (
                <div className="ml-6 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Aura Type(s)</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Visual (flashes, zigzags)', 'Sensory (tingling)', 'Speech difficulties', 'Motor weakness'].map(type => (
                        <label key={type} className="flex items-center space-x-2 text-sm">
                          <input
                            type="checkbox"
                            checked={formData.auraType.includes(type)}
                            onChange={(e) => handleArrayFieldChange('auraType', type, e.target.checked)}
                            className="rounded"
                          />
                          <span>{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Aura Duration (minutes)</label>
                    <input
                      type="number"
                      className="input-field w-32"
                      value={formData.auraDuration}
                      onChange={(e) => setFormData(prev => ({ ...prev, auraDuration: e.target.value }))}
                      placeholder="5-60"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Prodrome */}
            <div className="mb-4">
              <label className="flex items-center space-x-2 mb-2">
                <input
                  type="checkbox"
                  checked={formData.prodromePresent}
                  onChange={(e) => setFormData(prev => ({ ...prev, prodromePresent: e.target.checked }))}
                  className="rounded"
                />
                <span className="font-medium">Did you experience prodrome symptoms (warning signs)?</span>
              </label>
              
              {formData.prodromePresent && (
                <div className="ml-6 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prodrome Symptoms</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Mood changes', 'Food cravings', 'Neck stiffness', 'Increased urination', 'Fatigue', 'Yawning'].map(symptom => (
                        <label key={symptom} className="flex items-center space-x-2 text-sm">
                          <input
                            type="checkbox"
                            checked={formData.prodromeSymptoms.includes(symptom)}
                            onChange={(e) => handleArrayFieldChange('prodromeSymptoms', symptom, e.target.checked)}
                            className="rounded"
                          />
                          <span>{symptom}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prodrome Duration (hours)</label>
                    <input
                      type="number"
                      className="input-field w-32"
                      value={formData.prodromeDuration}
                      onChange={(e) => setFormData(prev => ({ ...prev, prodromeDuration: e.target.value }))}
                      placeholder="1-48"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Postdrome */}
            <div>
              <label className="flex items-center space-x-2 mb-2">
                <input
                  type="checkbox"
                  checked={formData.postdromePresent}
                  onChange={(e) => setFormData(prev => ({ ...prev, postdromePresent: e.target.checked }))}
                  className="rounded"
                />
                <span className="font-medium">Did you experience postdrome symptoms (hangover phase)?</span>
              </label>
              
              {formData.postdromePresent && (
                <div className="ml-6 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Postdrome Symptoms</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Fatigue', 'Confusion', 'Mood changes', 'Difficulty concentrating', 'Scalp tenderness'].map(symptom => (
                        <label key={symptom} className="flex items-center space-x-2 text-sm">
                          <input
                            type="checkbox"
                            checked={formData.postdromeSymptoms.includes(symptom)}
                            onChange={(e) => handleArrayFieldChange('postdromeSymptoms', symptom, e.target.checked)}
                            className="rounded"
                          />
                          <span>{symptom}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Postdrome Duration (hours)</label>
                    <input
                      type="number"
                      className="input-field w-32"
                      value={formData.postdromeDuration}
                      onChange={(e) => setFormData(prev => ({ ...prev, postdromeDuration: e.target.value }))}
                      placeholder="1-24"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cluster-specific fields */}
        {formData.type === 'cluster' && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cluster Headache-Specific Information</h3>
            
            <div className="space-y-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.inClusterPeriod}
                  onChange={(e) => setFormData(prev => ({ ...prev, inClusterPeriod: e.target.checked }))}
                  className="rounded"
                />
                <span className="font-medium">Currently in a cluster period?</span>
              </label>

              {formData.inClusterPeriod && (
                <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cluster Period Started</label>
                    <input
                      type="date"
                      className="input-field"
                      value={formData.clusterPeriodStart}
                      onChange={(e) => setFormData(prev => ({ ...prev, clusterPeriodStart: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expected End Date</label>
                    <input
                      type="date"
                      className="input-field"
                      value={formData.expectedClusterEnd}
                      onChange={(e) => setFormData(prev => ({ ...prev, expectedClusterEnd: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Eye-related Symptoms</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Excessive tearing', 'Red/bloodshot eye', 'Droopy eyelid', 'Pupil constriction', 'Eyelid swelling'].map(symptom => (
                    <label key={symptom} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.eyeSymptoms.includes(symptom)}
                        onChange={(e) => handleArrayFieldChange('eyeSymptoms', symptom, e.target.checked)}
                        className="rounded"
                      />
                      <span>{symptom}</span>
                    </label>
                  ))}
                </div>
              </div>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.restlessness}
                  onChange={(e) => setFormData(prev => ({ ...prev, restlessness: e.target.checked }))}
                  className="rounded"
                />
                <span className="font-medium">Restlessness/agitation during attack?</span>
              </label>
            </div>
          </div>
        )}

        {/* Triggers */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <Zap className="inline w-4 h-4 mr-1" />
            Possible Triggers
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(
              TRIGGER_OPTIONS.reduce((acc, trigger) => {
                if (!acc[trigger.category]) acc[trigger.category] = [];
                acc[trigger.category].push(trigger);
                return acc;
              }, {} as Record<string, typeof TRIGGER_OPTIONS>)
            ).map(([category, triggers]) => (
              <div key={category} className="space-y-2">
                <h4 className="font-medium text-gray-900 capitalize">{category.replace('-', ' ')}</h4>
                {triggers.map(trigger => (
                  <label key={trigger.id} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.triggers.includes(trigger.id)}
                      onChange={(e) => handleArrayFieldChange('triggers', trigger.id, e.target.checked)}
                      className="rounded"
                    />
                    <span>{trigger.name}</span>
                  </label>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Medications */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <Pill className="inline w-4 h-4 mr-1" />
            Medications Taken
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(
              MEDICATION_OPTIONS.reduce((acc, med) => {
                if (!acc[med.type]) acc[med.type] = [];
                acc[med.type].push(med);
                return acc;
              }, {} as Record<string, typeof MEDICATION_OPTIONS>)
            ).map(([type, medications]) => (
              <div key={type} className="space-y-2">
                <h4 className="font-medium text-gray-900 capitalize">{type.replace('-', ' ')}</h4>
                {medications.map(medication => (
                  <label key={medication.id} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.medications.includes(medication.id)}
                      onChange={(e) => handleArrayFieldChange('medications', medication.id, e.target.checked)}
                      className="rounded"
                    />
                    <span>{medication.name} {medication.dosage && `(${medication.dosage})`}</span>
                  </label>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Relief Methods */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Relief Methods That Helped
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(
              RELIEF_OPTIONS.reduce((acc, relief) => {
                if (!acc[relief.category]) acc[relief.category] = [];
                acc[relief.category].push(relief);
                return acc;
              }, {} as Record<string, typeof RELIEF_OPTIONS>)
            ).map(([category, reliefOptions]) => (
              <div key={category} className="space-y-2">
                <h4 className="font-medium text-gray-900 capitalize">{category}</h4>
                {reliefOptions.map(relief => (
                  <label key={relief.id} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.relief.includes(relief.id)}
                      onChange={(e) => handleArrayFieldChange('relief', relief.id, e.target.checked)}
                      className="rounded"
                    />
                    <span>{relief.name}</span>
                  </label>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Weather Information */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <Thermometer className="inline w-4 h-4 mr-1" />
            Weather Information (Optional)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Temperature (°F)</label>
              <input
                type="number"
                className="input-field"
                value={formData.weather.temperature}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  weather: { ...prev.weather, temperature: e.target.value }
                }))}
                placeholder="70"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Humidity (%)</label>
              <input
                type="number"
                className="input-field"
                value={formData.weather.humidity}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  weather: { ...prev.weather, humidity: e.target.value }
                }))}
                placeholder="60"
                min="0"
                max="100"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Pressure (inHg)</label>
              <input
                type="number"
                step="0.01"
                className="input-field"
                value={formData.weather.pressure}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  weather: { ...prev.weather, pressure: e.target.value }
                }))}
                placeholder="30.15"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Condition</label>
              <select
                className="input-field"
                value={formData.weather.condition}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  weather: { ...prev.weather, condition: e.target.value }
                }))}
              >
                <option value="">Select...</option>
                <option value="sunny">Sunny</option>
                <option value="cloudy">Cloudy</option>
                <option value="rainy">Rainy</option>
                <option value="stormy">Stormy</option>
                <option value="foggy">Foggy</option>
                <option value="windy">Windy</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <StickyNote className="inline w-4 h-4 mr-1" />
            Additional Notes
          </label>
          <textarea
            className="input-field resize-none"
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Any additional information about this episode..."
          />
        </div>

        <div className="flex space-x-4 pt-6">
          <button type="submit" className="btn-primary flex-1">
            {initialData ? 'Update Headache Entry' : 'Save Headache Entry'}
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
