# Supabase Migration Checklist ✅

## Pre-Migration Phase

### [ ] 1. Backup Current MySQL Database
- [ ] Run: `mysqldump -u root -p smartride > backup_$(date +%Y%m%d).sql`
- [ ] Verify backup file created and has size > 0
- [ ] Store backup in safe location

### [ ] 2. Create Supabase Account
- [ ] Go to https://supabase.com
- [ ] Sign up / Login
- [ ] Verify email
- [ ] Create new organization

### [ ] 3. Create Supabase Project
- [ ] Click "New Project"
- [ ] **Project Name:** smartride-platform
- [ ] **Database Password:** Create strong password (save it!)
- [ ] **Region:** Select closest region
- [ ] Click "Create new project"
- [ ] ⏳ Wait 5-10 minutes for setup

### [ ] 4. Get Supabase Credentials
In Supabase Dashboard:
- [ ] **Settings → Database → Connection String:** Copy URL
- [ ] **Settings → API → Project URL:** Copy Supabase URL
- [ ] **Settings → API → anon public:** Copy Anon Key
- [ ] **Settings → API → service_role secret:** Copy Service Role Key

Store these securely:
```
Host: db.XXXXXXXXXXXXX.supabase.co
Port: 5432
Database: postgres
Username: postgres
Password: YOUR_PASSWORD
Supabase URL: https://XXXXXXXXXXXXX.supabase.co
Anon Key: ey...
Service Role Key: ey...
```

---

## Schema Creation Phase

### [ ] 5. Create Tables in Supabase
- [ ] Open Supabase Dashboard → SQL Editor
- [ ] Click "New Query"
- [ ] Open `backend/supabase_migration.sql`
- [ ] Copy ALL content
- [ ] Paste into SQL Editor
- [ ] Click "Run"
- [ ] ✅ Verify: No errors, all tables created
- [ ] Refresh Supabase Tables panel
- [ ] Verify all tables appear:
  - [ ] users
  - [ ] vehicles
  - [ ] rides
  - [ ] pickup_points
  - [ ] drop_points
  - [ ] bookings
  - [ ] reviews
  - [ ] payments
  - [ ] notifications

---

## Backend Configuration Phase

### [ ] 6. Update pom.xml
- [ ] Open `backend/pom.xml`
- [ ] Verify PostgreSQL dependency added:
  ```xml
  <dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
  </dependency>
  ```

### [ ] 7. Update application.properties
- [ ] Open `backend/src/main/resources/application.properties`
- [ ] Add new Supabase config:
  ```properties
  spring.datasource.url=jdbc:postgresql://[HOST]:5432/postgres
  spring.datasource.username=postgres
  spring.datasource.password=[PASSWORD]
  spring.datasource.driver-class-name=org.postgresql.Driver
  spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
  spring.jpa.hibernate.ddl-auto=validate
  ```

### [ ] 8. Verify Configuration Files
- [ ] Open `backend/src/main/resources/application-supabase.properties`
- [ ] Verify file exists
- [ ] Update placeholders with real Supabase credentials

### [ ] 9. Verify New Classes Exist
- [ ] `backend/src/main/java/com/smartride/config/SupabaseConfig.java`
- [ ] `backend/src/main/java/com/smartride/service/DataMigrationService.java`
- [ ] `backend/src/main/java/com/smartride/controller/MigrationController.java`

---

## Build Phase

### [ ] 10. Clean and Build Backend
- [ ] Open terminal in `backend` folder
- [ ] Run: `mvn clean install`
- [ ] ✅ Wait for "BUILD SUCCESS"
- [ ] ❌ If errors: Check Java version (should be 17+)
  ```bash
  java -version  # Should show Java 17 or higher
  ```

### [ ] 11. Verify Build
- [ ] Run: `mvn compile`
- [ ] ✅ No compilation errors

---

## Data Migration Phase

### [ ] 12. Choose Migration Method

**Option A: Manual SQL (Recommended for small datasets)**
- [ ] Export from MySQL: `mysqldump -u root -p smartride > export.sql`
- [ ] Convert MySQL to PostgreSQL syntax:
  - [ ] Replace `AUTO_INCREMENT` with `SERIAL`
  - [ ] Replace backticks (`) with quotes (")
  - [ ] Save as `export_postgres.sql`
- [ ] In Supabase SQL Editor:
  - [ ] Create new query
  - [ ] Paste `export_postgres.sql`
  - [ ] Run and verify
- [ ] Go to step 14

**Option B: Automated Java Migration (Recommended for large datasets)**
- [ ] Continue to step 13
- [ ] Keep MySQL running during migration

### [ ] 13. Run Automated Migration (If Option B)
- [ ] Open terminal in workspace root
- [ ] Start backend: `mvn spring-boot:run` (from backend folder)
- [ ] Wait for: "Tomcat initialized with port 8082"
- [ ] In another terminal, run migration:
  ```bash
  curl -X POST http://localhost:8082/api/migration/migrate-to-supabase
  ```
- [ ] ✅ Response should show: `"status": "success"`
- [ ] Check logs for:
  - [ ] "✓ Users migration completed"
  - [ ] "✓ Rides migration completed"
  - [ ] "✓ Bookings migration completed"
  - [ ] "✅ All data migration completed successfully!"
- [ ] ❌ If errors: Check foreign key constraints

---

## Verification Phase

### [ ] 14. Verify Data in Supabase
In Supabase SQL Editor, run:
```sql
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as ride_count FROM rides;
SELECT COUNT(*) as booking_count FROM bookings;
SELECT COUNT(*) as payment_count FROM payments;
```
- [ ] Record counts:
  - Users: ____
  - Rides: ____
  - Bookings: ____
  - Payments: ____

### [ ] 15. Verify API Endpoints
- [ ] Backend still running on port 8082
- [ ] Test endpoints:

```bash
# Test user endpoint
curl http://localhost:8082/api/users
# Should return list (can be empty if no users migrated)

# Test health check
curl http://localhost:8082/api/admin/dashboard
# Should return dashboard data
```

### [ ] 16. Verify CRUD Operations
- [ ] **CREATE**: Register new user
  ```bash
  curl -X POST http://localhost:8082/api/users/register \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"123456","role":"PASSENGER"}'
  ```
  - [ ] ✅ User created (check Supabase)

- [ ] **READ**: Get user
  ```bash
  curl http://localhost:8082/api/users/1
  ```
  - [ ] ✅ Returns user data

- [ ] **UPDATE**: Update user profile
  - [ ] ✅ Changes reflected in Supabase

- [ ] **DELETE**: (optional)
  - [ ] ✅ Data removed from Supabase

### [ ] 17. Test Key Features
- [ ] Login/Registration working
- [ ] Create ride (driver)
- [ ] Browse rides (passenger)
- [ ] Book ride
- [ ] Payment processing (if enabled)
- [ ] Notifications appearing
- [ ] WebSocket connections active

---

## Post-Migration Phase

### [ ] 18. Documentation Updates
- [ ] Update README.md with Supabase info
- [ ] Update DEPLOYMENT.md (if exists)
- [ ] Document any custom configurations
- [ ] Save all credentials securely:
  - [ ] Use `.env` file (in .gitignore)
  - [ ] Or environment variables

### [ ] 19. Environment Variables (Production)
- [ ] Create `.env` file in backend folder:
  ```
  SUPABASE_DATABASE_URL=jdbc:postgresql://...
  SUPABASE_DB_USER=postgres
  SUPABASE_DB_PASSWORD=...
  SUPABASE_URL=https://...
  SUPABASE_ANON_KEY=...
  SUPABASE_SERVICE_ROLE_KEY=...
  ```
- [ ] Add `.env` to `.gitignore`

### [ ] 20. Backup Strategy
- [ ] Verify Supabase auto-backups enabled
  - [ ] Settings → Backups
  - [ ] Should show recent backups
- [ ] Schedule regular backups:
  - [ ] Daily at specific time
  - [ ] Export weekly to safe storage

### [ ] 21. Performance Tuning (Optional)
- [ ] Create indexes for frequently queried columns:
  ```sql
  CREATE INDEX idx_rides_departure ON rides(departure_time);
  CREATE INDEX idx_bookings_status ON bookings(status);
  ```
- [ ] Monitor query performance in Supabase
- [ ] Set up query alerts if needed

### [ ] 22. Frontend Configuration (Optional)
- [ ] If using Supabase Auth:
  - [ ] Install: `npm install @supabase/supabase-js`
  - [ ] Create `src/utils/supabase.js`:
    ```javascript
    import { createClient } from '@supabase/supabase-js'
    const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
    ```
  - [ ] Update `.env`:
    ```
    VITE_SUPABASE_URL=https://...
    VITE_SUPABASE_ANON_KEY=...
    ```

---

## Final Checklist

### [ ] 23. Pre-Deployment Verification
- [ ] All migrations completed successfully
- [ ] No errors in backend logs
- [ ] All API endpoints tested
- [ ] Database connection stable
- [ ] Data counts match expected
- [ ] Backups available
- [ ] Environment variables set
- [ ] Security credentials not in code

### [ ] 24. Documentation Complete
- [ ] [x] SUPABASE_MIGRATION_GUIDE.md (detailed)
- [ ] [x] SUPABASE_QUICK_REFERENCE.md (quick steps)
- [ ] [x] SUPABASE_DETAILED_EXPLANATION.md (explanations)
- [ ] [x] supabase_migration.sql (schema)
- [ ] [x] application-supabase.properties (config)

### [ ] 25. Ready for Deployment
- [ ] Backend builds without errors
- [ ] All migrations successful
- [ ] Data verified in Supabase
- [ ] API endpoints working
- [ ] Team notified
- [ ] Deployment plan ready
- [ ] Rollback plan documented

---

## Troubleshooting Checklist

If something goes wrong:

### Connection Issues
- [ ] Verify Supabase credentials
- [ ] Check connection string format
- [ ] Verify PostgreSQL port (5432)
- [ ] Check IP whitelist in Supabase

### Data Issues
- [ ] Verify all tables created in step 5
- [ ] Check for foreign key constraint errors
- [ ] Ensure data types match
- [ ] Check for duplicate keys

### Build Issues
- [ ] Verify Java 17+ installed
- [ ] Delete `target` folder: `rm -rf target`
- [ ] Rebuild: `mvn clean install`
- [ ] Check for missing dependencies

### API Issues
- [ ] Restart backend
- [ ] Check application.properties
- [ ] Look at error logs
- [ ] Verify database connection

---

## Sign-Off

- [ ] Prepared by: _________________ Date: _______
- [ ] Reviewed by: _________________ Date: _______
- [ ] Approved for production: _________________ Date: _______

---

**Total Time Estimate:** 2-4 hours (depending on data size)  
**Risk Level:** LOW (with backup in place)  
**Rollback Time:** 10-15 minutes (if needed)

✨ **You're all set! Start with Pre-Migration Phase.** ✨
