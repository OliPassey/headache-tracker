'use client';

import { useState } from 'react';
import { HeadacheEntry } from '@/types/headache';
import { TRIGGER_OPTIONS, SYMPTOM_OPTIONS, LOCATION_OPTIONS, MEDICATION_OPTIONS } from '@/data/options';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, Zap, Pill, Heart, Edit3, Trash2, Search, Filter } from 'lucide-react';

interface HeadacheListProps {
  entries: HeadacheEntry[];
  onEdit: (entry: HeadacheEntry) => void;
  onDelete: (id: string) => void;
}

export default function HeadacheList({ entries, onEdit, onDelete }: HeadacheListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'migraine' | 'cluster'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'painLevel' | 'duration'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredAndSortedEntries = entries
    .filter(entry => {
      const matchesSearch = searchTerm === '' || 
        entry.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.triggers.some(trigger => 
          TRIGGER_OPTIONS.find(t => t.id === trigger)?.name.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        entry.symptoms.some(symptom => 
          SYMPTOM_OPTIONS.find(s => s.id === symptom)?.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesFilter = filterType === 'all' || entry.type === filterType;
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = a.date.getTime() - b.date.getTime();
          break;
        case 'painLevel':
          comparison = a.painLevel - b.painLevel;
          break;
        case 'duration':
          comparison = (a.duration || 0) - (b.duration || 0);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const getPainLevelColor = (level: number) => {
    if (level <= 3) return 'text-green-600 bg-green-100';
    if (level <= 6) return 'text-yellow-600 bg-yellow-100';
    if (level <= 8) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getTypeColor = (type: string) => {
    return type === 'migraine' ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800';
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'Ongoing';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const getDisplayName = (id: string, options: any[]) => {
    const option = options.find(opt => opt.id === id);
    return option ? option.name : id.replace('-', ' ');
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Headache History</h1>
        <div className="text-sm text-gray-600">
          {filteredAndSortedEntries.length} of {entries.length} entries
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search notes, triggers, symptoms..."
              className="pl-10 input-field"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <select 
              className="input-field"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'migraine' | 'cluster')}
            >
              <option value="all">All Types</option>
              <option value="migraine">Migraines</option>
              <option value="cluster">Cluster Headaches</option>
            </select>
          </div>

          <div>
            <select 
              className="input-field"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'painLevel' | 'duration')}
            >
              <option value="date">Sort by Date</option>
              <option value="painLevel">Sort by Pain Level</option>
              <option value="duration">Sort by Duration</option>
            </select>
          </div>

          <div>
            <select 
              className="input-field"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Entries List */}
      <div className="space-y-4">
        {filteredAndSortedEntries.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No headache entries found</h3>
            <p className="text-gray-600">
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Start by logging your first headache episode.'
              }
            </p>
          </div>
        ) : (
          filteredAndSortedEntries.map((entry) => (
            <div key={entry.id} className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(entry.type)}`}>
                    {entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
                  </span>
                  <span className={`px-2 py-1 rounded-md text-sm font-semibold ${getPainLevelColor(entry.painLevel)}`}>
                    Pain: {entry.painLevel}/10
                  </span>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-1" />
                    {format(entry.date, 'MMM dd, yyyy')}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-1" />
                    {entry.startTime} {entry.endTime ? `- ${entry.endTime}` : '(ongoing)'}
                  </div>
                  {entry.duration && (
                    <span className="text-sm text-gray-600">
                      Duration: {formatDuration(entry.duration)}
                    </span>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit(entry)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="Edit entry"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(entry.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Location */}
                {entry.location.length > 0 && (
                  <div>
                    <h4 className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      Location
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {entry.location.map(loc => (
                        <span key={loc} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {getDisplayName(loc, LOCATION_OPTIONS)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Triggers */}
                {entry.triggers.length > 0 && (
                  <div>
                    <h4 className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Zap className="w-4 h-4 mr-1" />
                      Triggers
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {entry.triggers.slice(0, 3).map(trigger => (
                        <span key={trigger} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                          {getDisplayName(trigger, TRIGGER_OPTIONS)}
                        </span>
                      ))}
                      {entry.triggers.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          +{entry.triggers.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Symptoms */}
                {entry.symptoms.length > 0 && (
                  <div>
                    <h4 className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Heart className="w-4 h-4 mr-1" />
                      Symptoms
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {entry.symptoms.slice(0, 3).map(symptom => (
                        <span key={symptom} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                          {getDisplayName(symptom, SYMPTOM_OPTIONS)}
                        </span>
                      ))}
                      {entry.symptoms.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          +{entry.symptoms.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Medications */}
                {entry.medications.length > 0 && (
                  <div>
                    <h4 className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Pill className="w-4 h-4 mr-1" />
                      Medications
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {entry.medications.slice(0, 2).map(med => (
                        <span key={med} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {getDisplayName(med, MEDICATION_OPTIONS)}
                        </span>
                      ))}
                      {entry.medications.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          +{entry.medications.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Migraine-specific info */}
              {entry.type === 'migraine' && (entry.aura?.present || entry.prodrome?.present) && (
                <div className="bg-pink-50 rounded-lg p-3 mb-4">
                  <h4 className="text-sm font-medium text-pink-900 mb-2">Migraine Phases</h4>
                  <div className="text-sm text-pink-800 space-y-1">
                    {entry.aura?.present && (
                      <div>
                        <strong>Aura:</strong> {entry.aura.type?.join(', ')} 
                        {entry.aura.duration && ` (${entry.aura.duration} min)`}
                      </div>
                    )}
                    {entry.prodrome?.present && (
                      <div>
                        <strong>Prodrome:</strong> {entry.prodrome.symptoms?.join(', ')}
                        {entry.prodrome.duration && ` (${entry.prodrome.duration} hrs)`}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Cluster-specific info */}
              {entry.type === 'cluster' && (entry.clusterPeriod?.inPeriod || entry.eyeSymptoms?.length) && (
                <div className="bg-blue-50 rounded-lg p-3 mb-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Cluster Information</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    {entry.clusterPeriod?.inPeriod && (
                      <div>
                        <strong>In cluster period</strong>
                        {entry.clusterPeriod.periodStart && 
                          ` since ${format(entry.clusterPeriod.periodStart, 'MMM dd')}`
                        }
                      </div>
                    )}
                    {entry.eyeSymptoms && entry.eyeSymptoms.length > 0 && (
                      <div>
                        <strong>Eye symptoms:</strong> {entry.eyeSymptoms.join(', ')}
                      </div>
                    )}
                    {entry.restlessness && (
                      <div><strong>Restlessness present</strong></div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {entry.notes && (
                <div className="bg-gray-50 rounded-lg p-3 mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Notes</h4>
                  <p className="text-sm text-gray-700">{entry.notes}</p>
                </div>
              )}

              {/* Weather info */}
              {entry.weather && (
                <div className="mt-3 text-xs text-gray-600">
                  <strong>Weather:</strong> {entry.weather.condition} {entry.weather.temperature}°C, 
                  {entry.weather.humidity}% humidity, {entry.weather.pressure} hPa pressure
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
