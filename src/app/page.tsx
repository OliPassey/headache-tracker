'use client';

import { useState, useEffect } from 'react';
import { HeadacheEntry } from '@/types/headache';
import HeadacheForm from '@/components/HeadacheForm';
import Dashboard from '@/components/Dashboard';
import HeadacheList from '@/components/HeadacheList';
import DataManagement from '@/components/DataManagement';
import { headacheDataService } from '@/services/headacheDataService';
import { BarChart3, Plus, List, Menu, X, Brain, Activity, Database } from 'lucide-react';

type View = 'dashboard' | 'log' | 'history' | 'data';

export default function Home() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [entries, setEntries] = useState<HeadacheEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<HeadacheEntry | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load entries from database on component mount
  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await headacheDataService.getAllEntries();
      setEntries(data);
    } catch (err) {
      console.error('Error loading entries:', err);
      setError('Failed to load headache entries');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEntry = async (newEntry: Omit<HeadacheEntry, 'id'>) => {
    try {
      if (editingEntry) {
        // Update existing entry
        await headacheDataService.updateEntry(editingEntry.id, newEntry);
        setEditingEntry(null);
      } else {
        // Add new entry
        await headacheDataService.createEntry(newEntry);
      }
      
      // Reload entries from database
      await loadEntries();
      setCurrentView('dashboard');
    } catch (error) {
      console.error('Error saving entry:', error);
      setError('Failed to save headache entry');
    }
  };

  const handleEditEntry = (entry: HeadacheEntry) => {
    setEditingEntry(entry);
    setCurrentView('log');
  };

  const handleDeleteEntry = async (id: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      try {
        await headacheDataService.deleteEntry(id);
        // Reload entries from database
        await loadEntries();
      } catch (error) {
        console.error('Error deleting entry:', error);
        setError('Failed to delete headache entry');
      }
    }
  };

  const handleCancelForm = () => {
    setEditingEntry(null);
    setCurrentView('dashboard');
  };

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'log', name: 'Log Headache', icon: Plus },
    { id: 'history', name: 'History', icon: List },
    { id: 'data', name: 'Data Management', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-primary-600" />
            <h1 className="text-xl font-bold text-gray-900">HeadacheTracker</h1>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="mt-8">
          <div className="px-4 space-y-2">
            {navigation.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id as View);
                    setMobileMenuOpen(false);
                    if (item.id !== 'log') setEditingEntry(null);
                  }}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Stats Summary in Sidebar */}
        <div className="mt-8 px-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Stats</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Episodes:</span>
                <span className="font-medium text-gray-900">{entries.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">This Month:</span>
                <span className="font-medium text-gray-900">
                  {entries.filter(e => {
                    const now = new Date();
                    return e.date.getMonth() === now.getMonth() && e.date.getFullYear() === now.getFullYear();
                  }).length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Avg Pain:</span>
                <span className="font-medium text-gray-900">
                  {entries.length > 0 
                    ? (entries.reduce((sum, e) => sum + e.painLevel, 0) / entries.length).toFixed(1)
                    : '0'
                  }/10
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* App Info */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="text-xs text-gray-500 text-center">
            <p>Track patterns • Identify triggers</p>
            <p>Manage your headaches better</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-2">
              <Activity className="h-6 w-6 text-primary-600" />
              <span className="text-lg font-semibold text-gray-900">HeadacheTracker</span>
            </div>
            <div className="w-8" /> {/* Spacer for centering */}
          </div>
        </div>

        {/* Page Content */}
        <main className="min-h-screen">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-6">
              <div className="text-red-700">{error}</div>
              <button 
                onClick={() => setError(null)}
                className="mt-2 text-sm text-red-600 underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center min-h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading headache data...</p>
              </div>
            </div>
          )}

          {/* Main Content */}
          {!loading && (
            <>
              {currentView === 'dashboard' && <Dashboard entries={entries} />}
              {currentView === 'log' && (
                <div className="p-6">
                  <HeadacheForm 
                    onSubmit={handleSubmitEntry} 
                    onCancel={handleCancelForm}
                    initialData={editingEntry || undefined}
                  />
                </div>
              )}
              {currentView === 'history' && (
                <HeadacheList 
                  entries={entries} 
                  onEdit={handleEditEntry} 
                  onDelete={handleDeleteEntry} 
                />
              )}
              {currentView === 'data' && (
                <DataManagement 
                  entries={entries} 
                  onDataImported={(newEntries) => {
                    setEntries(newEntries);
                    loadEntries(); // Refresh from database
                  }} 
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
