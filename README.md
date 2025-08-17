# HeadacheTracker

A comprehensive web application for tracking migraine and cluster headache episodes, identifying patterns, and managing symptoms.

## Features

### 📊 **Analytics Dashboard**
- **GitHub-style headache heatmap** - Visual year-at-a-glance activity calendar
- Comprehensive statistics and insights
- Monthly trend analysis
- Pain level distribution charts
- Most common triggers and symptoms
- Duration analysis and patterns
- Visual charts and graphs for pattern recognition

### 📝 **Detailed Logging**
- Log both migraine and cluster headaches
- Track pain levels (1-10 scale)
- Record detailed symptoms and locations
- Monitor potential triggers
- Document medications and relief methods
- **Automatic weather capture** with location detection
- **Manual weather entry** for offline use
- Migraine-specific features:
  - Aura tracking (visual, sensory, speech)
  - Prodrome symptoms
  - Postdrome symptoms
- Cluster headache-specific features:
  - Cluster period tracking
  - Eye-related symptoms
  - Restlessness indicators

### 📱 **Mobile-Responsive Design**
- Optimized for phone, tablet, and desktop use
- Touch-friendly interface
- Quick access to logging features
- Mobile menu navigation

### 📈 **Pattern Recognition**
- Identify common triggers
- Track symptom patterns
- Monitor medication effectiveness
- Analyze duration trends
- Seasonal pattern detection

## Research-Based Tracking Fields

Based on medical research from Mayo Clinic and headache specialists, the app tracks:

### **Common Triggers**
- Food triggers (aged cheese, chocolate, alcohol, MSG, etc.)
- Environmental factors (bright lights, weather changes, barometric pressure)
- Hormonal changes (menstruation, contraceptives, menopause)
- Lifestyle factors (sleep changes, stress, exercise)
- Physical triggers (neck tension, eye strain)

### **Comprehensive Symptoms**
- Pain characteristics (throbbing, stabbing, burning)
- Neurological symptoms (aura, confusion, coordination issues)
- Autonomic symptoms (nausea, light/sound sensitivity)
- Eye-related symptoms (tearing, redness, droopy eyelid)
- Associated symptoms (mood changes, fatigue)

### **Medications & Relief**
- Acute/rescue medications (triptans, NSAIDs, etc.)
- Preventive medications
- Alternative relief methods
- Effectiveness tracking

## Getting Started

### Prerequisites
- Node.js 16.20.0 or higher (Note: Next.js 13.5.6 requires Node.js 16+)
- Modern web browser

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd headache-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. **(Optional)** Set up automatic weather capture:
   - Get a free API key from [OpenWeatherMap](https://openweathermap.org/api)
   - Create a `.env.local` file in the project root:
     ```
     NEXT_PUBLIC_OPENWEATHER_API_KEY=your_api_key_here
     ```
   - See [WEATHER-SETUP.md](WEATHER-SETUP.md) for detailed instructions

4. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

## Technology Stack

- **Framework**: Next.js 13.5.6 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Database**: SQLite3 with centralized storage
- **Weather API**: OpenWeatherMap integration

## Usage

### 1. Dashboard
- View comprehensive analytics and insights
- Monitor trends and patterns
- Quick overview of recent activity

### 2. Log Headache
- Record new headache episodes
- Fill in detailed information about symptoms, triggers, and treatments
- Choose between migraine and cluster headache types
- Add weather information and notes

### 3. History
- Browse all logged episodes
- Search and filter entries
- Edit or delete existing records
- View detailed information for each episode

## Data Privacy & Storage

**Centralized SQLite Database:**
- All data stored in `data/headache_tracker.db` in the application folder
- Single database file for easy backup and migration
- No data sent to external servers
- Complete privacy of your health information
- Multi-device access when deployed as a service on your local network

**Migration from Browser Storage:**
- Automatic migration from localStorage to database on first use
- All existing data preserved during transition
- Improved data persistence and reliability

## Contributing

This application was designed specifically for migraine and cluster headache sufferers. If you'd like to contribute improvements or additional features, please:

1. Ensure medical accuracy of any new tracking fields
2. Maintain mobile-responsive design
3. Follow existing code patterns and styling
4. Test thoroughly across different devices

## Medical Disclaimer

This application is for personal tracking and pattern identification only. It is not a medical diagnostic tool and should not replace professional medical advice. Always consult with healthcare professionals for proper diagnosis and treatment of headache disorders.

## Future Enhancements

Potential future features:
- Data export functionality (CSV, PDF reports)
- Reminder notifications for medication
- Trigger prediction based on patterns
- Integration with weather APIs
- Sharing capabilities with healthcare providers
- Advanced analytics and machine learning insights

## License

This project is designed for personal use in managing headache conditions.

---

**Important**: If you experience sudden severe headaches, changes in headache patterns, or headaches with fever, confusion, or neurological symptoms, seek immediate medical attention.
