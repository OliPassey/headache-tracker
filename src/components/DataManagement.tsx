import React, { useState } from 'react';
import { HeadacheEntry } from '@/types/headache';
import { dataStorage } from '@/utils/dataStorage';
import { Download, Upload, Database, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface DataManagementProps {
  entries: HeadacheEntry[];
  onDataImported: (entries: HeadacheEntry[]) => void;
}

export default function DataManagement({ entries, onDataImported }: DataManagementProps) {
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  
  const storageInfo = dataStorage.getStorageInfo();

  const handleExport = () => {
    try {
      dataStorage.exportData(entries);
      setMessage({ type: 'success', text: 'Data exported successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to export data.' });
    }
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const importedEntries = await dataStorage.importData(file);
      
      // Ask user if they want to merge or replace
      const merge = window.confirm(
        `Found ${importedEntries.length} entries in the file.\n\n` +
        `Click OK to MERGE with existing data (${entries.length} entries).\n` +
        `Click Cancel to REPLACE all existing data.`
      );

      if (merge) {
        // Merge data, avoiding duplicates based on timestamp
        const existingIds = new Set(entries.map(e => e.id));
        const newEntries = importedEntries.filter(e => !existingIds.has(e.id));
        const mergedEntries = [...entries, ...newEntries];
        onDataImported(mergedEntries);
        setMessage({ 
          type: 'success', 
          text: `Successfully merged ${newEntries.length} new entries. Total: ${mergedEntries.length} entries.` 
        });
      } else {
        // Replace all data
        onDataImported(importedEntries);
        setMessage({ 
          type: 'success', 
          text: `Successfully imported ${importedEntries.length} entries (replaced all existing data).` 
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to import data. Please check the file format.' });
    } finally {
      setImporting(false);
      event.target.value = ''; // Reset file input
    }
  };

  const handleRestoreBackup = () => {
    try {
      const backupEntries = dataStorage.restoreFromBackup();
      if (!backupEntries) {
        setMessage({ type: 'info', text: 'No automatic backup found.' });
        return;
      }

      const confirm = window.confirm(
        `Found automatic backup with ${backupEntries.length} entries.\n\n` +
        `This will replace your current data. Continue?`
      );

      if (confirm) {
        onDataImported(backupEntries);
        setMessage({ type: 'success', text: 'Data restored from automatic backup.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to restore from backup.' });
    }
  };

  const handleClearAll = () => {
    const confirm = window.confirm(
      'Are you sure you want to delete ALL headache data?\n\n' +
      'This action cannot be undone. Consider exporting your data first.'
    );

    if (confirm) {
      const doubleConfirm = window.confirm(
        'This will permanently delete all your headache tracking data.\n\n' +
        'Are you absolutely sure?'
      );

      if (doubleConfirm) {
        dataStorage.clearAllData();
        onDataImported([]);
        setMessage({ type: 'success', text: 'All data has been cleared.' });
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Database className="mr-2" size={24} />
          Data Management
        </h2>

        {/* Status Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
            message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
            message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
            'bg-blue-50 text-blue-700 border border-blue-200'
          }`}>
            {message.type === 'success' && <CheckCircle className="mr-2" size={20} />}
            {message.type === 'error' && <AlertTriangle className="mr-2" size={20} />}
            {message.type === 'info' && <Info className="mr-2" size={20} />}
            {message.text}
          </div>
        )}

        {/* Storage Information */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Storage Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total Entries:</span>
              <div className="font-semibold text-lg">{storageInfo.entryCount}</div>
            </div>
            <div>
              <span className="text-gray-600">Storage Used:</span>
              <div className="font-semibold text-lg">{storageInfo.sizeInKB} KB</div>
            </div>
            <div>
              <span className="text-gray-600">Last Saved:</span>
              <div className="font-semibold text-sm">
                {storageInfo.lastSaved !== 'Never' 
                  ? new Date(storageInfo.lastSaved).toLocaleString()
                  : 'Never'
                }
              </div>
            </div>
            <div>
              <span className="text-gray-600">Data Location:</span>
              <div className="font-semibold text-sm">Browser Storage</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Export Data */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
              <Download className="mr-2" size={20} />
              Export Data
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Download all your headache data as a JSON file for backup or transfer.
            </p>
            <button
              onClick={handleExport}
              disabled={entries.length === 0}
              className="w-full btn-primary disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Export {entries.length} Entries
            </button>
          </div>

          {/* Import Data */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
              <Upload className="mr-2" size={20} />
              Import Data
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Import headache data from a previously exported JSON file.
            </p>
            <label className="w-full btn-secondary cursor-pointer block text-center">
              {importing ? 'Importing...' : 'Choose File to Import'}
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                disabled={importing}
                className="hidden"
              />
            </label>
          </div>

          {/* Restore Backup */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Restore Backup
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Restore from automatic backup if your data was accidentally lost.
            </p>
            <button
              onClick={handleRestoreBackup}
              className="w-full btn-secondary"
            >
              Restore from Backup
            </button>
          </div>

          {/* Clear All Data */}
          <div className="border rounded-lg p-4 border-red-200">
            <h3 className="text-lg font-medium text-red-700 mb-2 flex items-center">
              <AlertTriangle className="mr-2" size={20} />
              Clear All Data
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Permanently delete all headache data. This cannot be undone.
            </p>
            <button
              onClick={handleClearAll}
              className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
            >
              Clear All Data
            </button>
          </div>
        </div>

        {/* Data Persistence Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-blue-900 mb-2 flex items-center">
            <Info className="mr-2" size={20} />
            About Data Storage
          </h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>• Your data is stored locally in your browser and never sent to external servers</p>
            <p>• Data persists between browser sessions and computer restarts</p>
            <p>• Each browser (Chrome, Edge, Firefox) maintains separate data</p>
            <p>• Regular exports are recommended for backup purposes</p>
            <p>• In Windows Service mode, data behavior is identical to development mode</p>
          </div>
        </div>
      </div>
    </div>
  );
}
