# Weather API Setup

The Headache Tracker can automatically capture current weather conditions during headache logging. This requires a free API key from OpenWeatherMap.

## Setup Instructions

### 1. Get OpenWeatherMap API Key (Free)

1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Click "Sign Up" to create a free account
3. After verification, go to "API Keys" in your account
4. Copy your default API key (or create a new one)

### 2. Configure API Key

**Option A: Environment Variable (Recommended)**
Create a `.env.local` file in your project root:

```bash
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_api_key_here
```

**Option B: Development Setup**
Add to your development environment:

```bash
# Windows PowerShell
$env:NEXT_PUBLIC_OPENWEATHER_API_KEY="your_api_key_here"

# Windows Command Prompt
set NEXT_PUBLIC_OPENWEATHER_API_KEY=your_api_key_here

# Linux/Mac
export NEXT_PUBLIC_OPENWEATHER_API_KEY=your_api_key_here
```

### 3. Restart Application

After setting the API key, restart your development server or Windows service.

## Features Available

### Automatic Weather Capture
- **Location Detection**: Uses browser geolocation to get your current position
- **Real-time Data**: Fetches current temperature, humidity, pressure, and conditions
- **Multiple Locations**: Can capture weather for different locations if you travel

### Manual Entry Fallback
- **No API Key**: Manual weather entry is always available
- **No Location Access**: Enter city name to get weather data
- **Custom Values**: Override any automatically captured values

### Data Captured
- **Temperature**: Current temperature in Celsius
- **Humidity**: Relative humidity percentage
- **Pressure**: Barometric pressure in hPa (hectopascals)
- **Conditions**: Weather description (sunny, cloudy, rainy, etc.)
- **Location**: City and country where weather was captured

## Benefits for Headache Tracking

### Pattern Recognition
Weather changes are a common migraine trigger. Automatic capture helps identify:
- **Pressure Changes**: Barometric pressure drops often trigger migraines
- **Temperature Extremes**: Heat waves or cold fronts as potential triggers
- **Humidity Levels**: High humidity can be a factor for some people
- **Storm Systems**: Approaching weather fronts and their timing

### Accurate Data
- **No Guesswork**: Precise meteorological data instead of estimates
- **Consistent Units**: Standardized measurements for analysis
- **Timestamp Correlation**: Weather data matched to exact headache timing
- **Location Specific**: Relevant weather for where you actually were

## Privacy & Security

### Data Protection
- **Local Storage**: Weather data stored in your local database only
- **No Cloud Sync**: Weather information never leaves your computer
- **API Key Security**: Keep your API key private and secure
- **Location Privacy**: Geolocation used only when you permit it

### API Usage
- **Free Tier**: 1,000 calls per day (more than enough for personal use)
- **Rate Limiting**: Built-in delays to respect API limits
- **Error Handling**: Graceful fallback to manual entry if API fails

## Troubleshooting

### Common Issues

**"Weather API key not configured"**
- Solution: Set the NEXT_PUBLIC_OPENWEATHER_API_KEY environment variable

**"Location access denied"**
- Solution: Allow location access in your browser, or use manual city entry

**"Failed to fetch weather"**
- Check internet connection
- Verify API key is correct and active
- Try manual entry as backup

**Weather data seems wrong**
- OpenWeatherMap data updates every 10 minutes
- Location detection might be imprecise - use city name instead
- Check if you're using a VPN that affects location

### Getting Help

1. **Check API Key**: Verify it's correctly set and active
2. **Test Connection**: Try manual city lookup first
3. **Browser Console**: Check for error messages in developer tools
4. **Fallback**: Manual entry always works regardless of API status

---

**Note**: Weather tracking is completely optional. The headache tracker works perfectly without any weather data if you prefer not to set up the API.
