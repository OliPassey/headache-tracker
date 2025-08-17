'use client';

import React, { useState, useEffect } from 'react';
import { Cloud, MapPin, Thermometer, Droplets, Gauge, RefreshCw, AlertCircle } from 'lucide-react';
import weatherService, { WeatherData } from '@/services/weatherService';

interface WeatherCaptureProps {
  onWeatherChange: (weather: WeatherData | undefined) => void;
  initialWeather?: WeatherData;
  disabled?: boolean;
}

const WeatherCapture: React.FC<WeatherCaptureProps> = ({
  onWeatherChange,
  initialWeather,
  disabled = false
}) => {
  const [weather, setWeather] = useState<WeatherData | undefined>(initialWeather);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualEntry, setManualEntry] = useState(false);
  const [customLocation, setCustomLocation] = useState('');

  // Auto-fetch weather on component mount
  useEffect(() => {
    if (!initialWeather && !disabled) {
      fetchCurrentWeather();
    }
  }, [initialWeather, disabled]);

  const fetchCurrentWeather = async () => {
    if (disabled) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const currentWeather = await weatherService.getCurrentWeather();
      setWeather(currentWeather);
      onWeatherChange(currentWeather);
      setManualEntry(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch weather';
      setError(errorMessage);
      
      // If geolocation fails, switch to manual entry
      if (errorMessage.includes('Location access denied')) {
        setManualEntry(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByLocation = async () => {
    if (!customLocation.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const locationWeather = await weatherService.getWeatherByCity(customLocation);
      setWeather(locationWeather);
      onWeatherChange(locationWeather);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather for location');
    } finally {
      setLoading(false);
    }
  };

  const handleManualWeatherChange = (field: keyof WeatherData, value: any) => {
    const updatedWeather = {
      ...weather,
      [field]: value
    } as WeatherData;
    
    setWeather(updatedWeather);
    onWeatherChange(updatedWeather);
  };

  const clearWeather = () => {
    setWeather(undefined);
    onWeatherChange(undefined);
    setError(null);
  };

  if (disabled) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <Cloud className="h-5 w-5" />
          Weather Conditions
        </h3>
        
        <div className="flex gap-2">
          {!manualEntry && weatherService.isAvailable() && (
            <button
              type="button"
              onClick={fetchCurrentWeather}
              disabled={loading}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 disabled:opacity-50 flex items-center gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Getting...' : 'Get Current'}
            </button>
          )}
          
          <button
            type="button"
            onClick={() => setManualEntry(!manualEntry)}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            {manualEntry ? 'Auto Detect' : 'Manual Entry'}
          </button>
          
          {weather && (
            <button
              type="button"
              onClick={clearWeather}
              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-red-700">{error}</p>
            {error.includes('API key') && (
              <p className="text-xs text-red-600 mt-1">
                To enable automatic weather capture, configure an OpenWeatherMap API key.
              </p>
            )}
          </div>
        </div>
      )}

      {manualEntry && (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location (optional)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                placeholder="Enter city name..."
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={fetchWeatherByLocation}
                disabled={loading || !customLocation.trim()}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Get Weather
              </button>
            </div>
          </div>
        </div>
      )}

      {weather && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">Location</p>
                <p className="text-sm font-medium">
                  {weather.location ? `${weather.location.city}, ${weather.location.country}` : 'Unknown'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-xs text-gray-600">Temperature</p>
                {manualEntry ? (
                  <input
                    type="number"
                    value={weather.temperature}
                    onChange={(e) => handleManualWeatherChange('temperature', parseInt(e.target.value) || 0)}
                    className="w-16 text-sm border-0 bg-transparent font-medium p-0 focus:ring-0"
                    placeholder="°C"
                  />
                ) : (
                  <p className="text-sm font-medium">{weather.temperature}°C</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-xs text-gray-600">Humidity</p>
                {manualEntry ? (
                  <input
                    type="number"
                    value={weather.humidity}
                    onChange={(e) => handleManualWeatherChange('humidity', parseInt(e.target.value) || 0)}
                    className="w-16 text-sm border-0 bg-transparent font-medium p-0 focus:ring-0"
                    placeholder="%"
                  />
                ) : (
                  <p className="text-sm font-medium">{weather.humidity}%</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-xs text-gray-600">Pressure</p>
                {manualEntry ? (
                  <input
                    type="number"
                    value={weather.pressure}
                    onChange={(e) => handleManualWeatherChange('pressure', parseInt(e.target.value) || 0)}
                    className="w-20 text-sm border-0 bg-transparent font-medium p-0 focus:ring-0"
                    placeholder="hPa"
                  />
                ) : (
                  <p className="text-sm font-medium">{weather.pressure} hPa</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-3">
            <p className="text-xs text-gray-600">Conditions</p>
            {manualEntry ? (
              <input
                type="text"
                value={weather.condition}
                onChange={(e) => handleManualWeatherChange('condition', e.target.value)}
                className="w-full text-sm border-0 bg-transparent font-medium p-0 focus:ring-0"
                placeholder="Describe weather conditions..."
              />
            ) : (
              <p className="text-sm font-medium capitalize">{weather.condition}</p>
            )}
          </div>
        </div>
      )}

      {!weather && !loading && !error && (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-center">
          <Cloud className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            {manualEntry ? 'Enter weather information manually' : 'Click "Get Current" to capture weather data'}
          </p>
        </div>
      )}
    </div>
  );
};

export default WeatherCapture;
