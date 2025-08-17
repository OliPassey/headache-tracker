// Weather service for fetching current weather data
// Supports multiple weather APIs and location detection

interface WeatherData {
  condition: string;
  temperature: number;
  humidity: number;
  pressure: number; // Just the number, units handled in UI
  location?: {
    city: string;
    country: string;
    lat: number;
    lon: number;
  };
}

interface LocationData {
  lat: number;
  lon: number;
  city?: string;
  country?: string;
}

class WeatherService {
  private apiKey: string | null = null;
  private baseUrl = 'https://api.openweathermap.org/data/2.5';
  
  constructor() {
    // API key should be set via environment variable or user settings
    this.apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || null;
  }

  // Get user's current location using browser geolocation API
  async getCurrentLocation(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Get city name from coordinates using reverse geocoding
            const cityData = await this.reverseGeocode(latitude, longitude);
            resolve({
              lat: latitude,
              lon: longitude,
              city: cityData.city,
              country: cityData.country
            });
          } catch (error) {
            // Return coordinates even if city lookup fails
            resolve({
              lat: latitude,
              lon: longitude
            });
          }
        },
        (error) => {
          reject(new Error(`Location access denied: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // Cache for 5 minutes
        }
      );
    });
  }

  // Reverse geocode coordinates to city name
  private async reverseGeocode(lat: number, lon: number): Promise<{city: string, country: string}> {
    if (!this.apiKey) {
      throw new Error('Weather API key not configured');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch location data');
      }
      
      const data = await response.json();
      return {
        city: data.name || 'Unknown',
        country: data.sys?.country || 'Unknown'
      };
    } catch (error) {
      console.warn('Reverse geocoding failed:', error);
      return { city: 'Unknown', country: 'Unknown' };
    }
  }

  // Get weather by coordinates
  async getWeatherByCoordinates(lat: number, lon: number): Promise<WeatherData> {
    if (!this.apiKey) {
      throw new Error('Weather API key not configured. Please set NEXT_PUBLIC_OPENWEATHER_API_KEY environment variable.');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        condition: data.weather[0]?.description || 'Unknown',
        temperature: Math.round(data.main?.temp || 0),
        humidity: data.main?.humidity || 0,
        pressure: data.main?.pressure || 0,
        location: {
          city: data.name || 'Unknown',
          country: data.sys?.country || 'Unknown',
          lat,
          lon
        }
      };
    } catch (error) {
      console.error('Weather fetch failed:', error);
      throw error;
    }
  }

  // Get weather by city name
  async getWeatherByCity(city: string, country?: string): Promise<WeatherData> {
    if (!this.apiKey) {
      throw new Error('Weather API key not configured');
    }

    const query = country ? `${city},${country}` : city;
    
    try {
      const response = await fetch(
        `${this.baseUrl}/weather?q=${encodeURIComponent(query)}&appid=${this.apiKey}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        condition: data.weather[0]?.description || 'Unknown',
        temperature: Math.round(data.main?.temp || 0),
        humidity: data.main?.humidity || 0,
        pressure: data.main?.pressure || 0,
        location: {
          city: data.name || city,
          country: data.sys?.country || country || 'Unknown',
          lat: data.coord?.lat || 0,
          lon: data.coord?.lon || 0
        }
      };
    } catch (error) {
      console.error('Weather fetch failed:', error);
      throw error;
    }
  }

  // Get current weather for user's location
  async getCurrentWeather(): Promise<WeatherData> {
    try {
      const location = await this.getCurrentLocation();
      return await this.getWeatherByCoordinates(location.lat, location.lon);
    } catch (error) {
      console.error('Failed to get current weather:', error);
      throw error;
    }
  }

  // Fallback weather data when API is unavailable
  getManualWeatherEntry(): WeatherData {
    return {
      condition: '',
      temperature: 0,
      humidity: 0,
      pressure: 0
    };
  }

  // Check if weather service is available
  isAvailable(): boolean {
    return this.apiKey !== null && typeof navigator !== 'undefined' && !!navigator.geolocation;
  }
}

// Export singleton instance
export const weatherService = new WeatherService();
export default weatherService;
export type { WeatherData, LocationData };
