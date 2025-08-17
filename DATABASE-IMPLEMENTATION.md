# Database Implementation - SQLite Backend

The Headache Tracker now uses a centralized SQLite database instead of browser localStorage for better data persistence and multi-device access.

## Architecture Overview

### **Database Layer**
- **SQLite Database**: `data/headache_tracker.db`
- **ORM**: Direct SQL with sqlite3 package
- **Schema**: Single table with all headache entry fields
- **Location**: Project root `/data` directory

### **API Layer**
- **REST API**: Next.js API routes in `/src/app/api/headaches/`
- **CRUD Operations**: GET, POST, PUT, DELETE
- **Data Validation**: Type checking with TypeScript interfaces
- **Error Handling**: Consistent error responses

### **Service Layer**
- **Data Service**: `HeadacheDataService` in `/src/services/`
- **API Client**: Handles HTTP requests to backend
- **Data Transformation**: Date parsing and type conversion
- **Migration**: localStorage to database migration tools

## Database Schema

```sql
CREATE TABLE headache_entries (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  type TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT,
  duration INTEGER,
  pain_level INTEGER NOT NULL,
  location TEXT,           -- JSON array
  triggers TEXT,           -- JSON array
  symptoms TEXT,           -- JSON array
  medications TEXT,        -- JSON array
  notes TEXT,
  relief TEXT,             -- JSON array
  weather TEXT,            -- JSON object
  
  -- Migraine specific fields
  aura_present BOOLEAN,
  aura_type TEXT,          -- JSON array
  aura_duration INTEGER,
  prodrome_present BOOLEAN,
  prodrome_symptoms TEXT,  -- JSON array
  prodrome_duration INTEGER,
  postdrome_present BOOLEAN,
  postdrome_symptoms TEXT, -- JSON array
  postdrome_duration INTEGER,
  
  -- Cluster headache specific fields
  cluster_in_period BOOLEAN,
  cluster_period_start TEXT,
  cluster_expected_end TEXT,
  eye_symptoms TEXT,       -- JSON array
  restlessness BOOLEAN,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Benefits of Database Implementation

### **Data Persistence**
✅ **Permanent Storage**: Data survives browser clearing, reinstalls  
✅ **Centralized**: Single source of truth for all devices  
✅ **Backup-able**: File-based database easy to backup  
✅ **Queryable**: Advanced filtering and analytics possible  

### **Multi-Device Access**
✅ **Network Sharing**: Access from phone, tablet, PC  
✅ **Real-time Sync**: All devices see latest data  
✅ **Concurrent Use**: Multiple users can access safely  
✅ **Consistent State**: No data conflicts between devices  

### **Performance & Reliability**
✅ **Fast Queries**: Indexed database queries  
✅ **ACID Compliance**: Data integrity guaranteed  
✅ **Concurrent Access**: Multiple connections supported  
✅ **Error Recovery**: Database-level error handling  

## Data Migration from localStorage

The application includes automatic migration from localStorage to database:

```typescript
// Automatic migration on first load
const migratedCount = await headacheDataService.migrateLocalStorageData();
```

### Migration Process:
1. **Detection**: Check for existing localStorage data
2. **Validation**: Parse and validate data structure
3. **Transfer**: Insert records into database
4. **Backup**: Keep localStorage backup for safety
5. **Cleanup**: Clear localStorage after successful migration

## API Endpoints

### **GET /api/headaches**
- Returns all headache entries
- Sorted by date (newest first)
- Includes all related data

### **POST /api/headaches**
- Creates new headache entry
- Validates required fields
- Returns created entry with ID

### **PUT /api/headaches/[id]**
- Updates existing entry
- Validates entry exists
- Returns updated entry

### **DELETE /api/headaches/[id]**
- Deletes entry by ID
- Returns success/error status

## Error Handling

### **Database Errors**
- Connection failures gracefully handled
- Transaction rollback on errors
- User-friendly error messages
- Fallback to cached data where possible

### **API Errors**
- HTTP status codes for different error types
- Detailed error messages in development
- Generic messages in production
- Client-side retry logic

## Backup & Recovery

### **Automatic Backups**
- Database file can be copied directly
- Export API for JSON backups
- Import functionality for data restoration

### **Manual Backup Process**
```bash
# Copy database file
cp data/headache_tracker.db backup/headache_backup_$(date +%Y%m%d).db

# Or use export feature in app
# Data Management → Export Data
```

### **Recovery Process**
1. Replace database file, OR
2. Use Import Data feature in app
3. Restart application service

## Windows Service Integration

### **Database Location**
- **Development**: `./data/headache_tracker.db`
- **Production**: Same location (persistent across restarts)
- **Permissions**: Service user needs read/write access

### **Service Benefits**
- Database always available
- No browser dependency
- Network accessible to all devices
- Automatic startup with Windows

## Security Considerations

### **Data Privacy**
✅ **Local Only**: Database stays on your machine  
✅ **No Cloud**: No external data transmission  
✅ **File Permissions**: Database secured by OS permissions  
✅ **Network Access**: Limited to local network only  

### **Access Control**
- No authentication required (single-user medical app)
- Network access can be restricted by firewall
- Database file encryption possible if needed

## Performance Optimization

### **Query Optimization**
- Indexed on date for fast sorting
- JSON fields for complex data without joins
- Prepared statements for security and speed

### **Memory Management**
- Connection pooling not needed (single-user)
- Automatic garbage collection of old connections
- Efficient JSON parsing and serialization

## Troubleshooting

### **Database Won't Create**
- Check write permissions in project directory
- Ensure `data/` folder exists
- Verify Node.js sqlite3 module installed

### **Migration Issues**
- Check browser console for localStorage errors
- Verify data format matches expected schema
- Use manual export/import if automatic fails

### **Performance Issues**
- Check database file size (should be small for personal use)
- Restart service if queries seem slow
- Consider vacuum command for large deletions

### **Data Loss Prevention**
- Regular exports via Data Management tab
- Copy database file manually for backup
- Test restoration process periodically

---

**Note**: This database implementation provides enterprise-level data management for your personal medical tracking needs while maintaining complete privacy and local control.
