# Supabase Migration Guide - Smart Ride Sharing Platform

## Overview
This guide walks you through migrating your Smart Ride Sharing application from MySQL to Supabase (PostgreSQL).

---

## STEP 1: Create Supabase Project

1. **Sign Up / Login to Supabase**
   - Go to https://supabase.com
   - Click "Start your project"
   - Sign in with GitHub or email

2. **Create New Project**
   - Click "New Project"
   - **Project Name**: smartride-platform
   - **Password**: Create a strong database password (save it!)
   - **Region**: Choose closest to your location
   - Click "Create new project"

3. **Get Your Credentials**
   - Go to Settings → Database → Connection String
   - Copy the PostgreSQL connection string
   - You'll also get:
     - **SUPABASE_URL**: Settings → API
     - **SUPABASE_ANON_KEY**: Settings → API
     - **SUPABASE_SERVICE_ROLE_KEY**: Settings → API

---

## STEP 2: Create Tables in Supabase

1. **Access Supabase SQL Editor**
   - Go to your Supabase project dashboard
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

2. **Run the Migration SQL**
   - Copy all content from `supabase_migration.sql` file
   - Paste into the SQL editor
   - Click "Run" (RUN button)
   - Wait for success message

---

## STEP 3: Update Backend Configuration

### Option A: Update application.properties

1. **Replace Database Configuration**
   ```properties
   # OLD MySQL config (REMOVE THESE):
   spring.datasource.url=jdbc:mysql://127.0.0.1:3306/smartride
   spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
   
   # NEW Supabase config (ADD THESE):
   spring.datasource.url=jdbc:postgresql://[HOST]:[PORT]/[DATABASE]
   spring.datasource.username=[USERNAME]
   spring.datasource.password=[PASSWORD]
   spring.datasource.driver-class-name=org.postgresql.Driver
   
   # Disable auto schema updates (important!)
   spring.jpa.hibernate.ddl-auto=validate
   spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
   ```

2. **Get Connection Details from Supabase**
   - Go to Settings → Database → Connection string
   - Copy the connection string and extract:
     - HOST: db.xxxxxxxxxxxx.supabase.co
     - PORT: 5432
     - DATABASE: postgres
     - USERNAME: postgres
     - PASSWORD: (your password)

### Option B: Use Environment Variables (Recommended)

```properties
spring.datasource.url=${SUPABASE_DATABASE_URL:jdbc:postgresql://localhost:5432/smartride}
spring.datasource.username=${SUPABASE_DB_USER:postgres}
spring.datasource.password=${SUPABASE_DB_PASSWORD:password}
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=validate
```

---

## STEP 4: Update Database Dialect in Entities

PostgreSQL uses different column name conventions. Update your entity mappings:

**Before (MySQL):**
```java
@Column(name = "wallet_balance")
private Double walletBalance;
```

**After (PostgreSQL - no change needed, but ensure consistent)**
PostgreSQL will convert camelCase to snake_case automatically with proper JPA naming strategy.

Add this to `application.properties`:
```properties
spring.jpa.hibernate.naming.physical-strategy=org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl
spring.jpa.hibernate.naming.implicit-strategy=org.hibernate.boot.model.naming.ImplicitNamingStrategyLegacyJpaImpl
```

---

## STEP 5: Migrate Data from MySQL to Supabase

### Option A: Using MySQL Workbench / Command Line

1. **Export from MySQL:**
   ```bash
   mysqldump -u root -p smartride > backup.sql
   ```

2. **Convert MySQL to PostgreSQL:**
   - Open backup.sql in a text editor
   - Replace:
     - `AUTO_INCREMENT` → `SERIAL`
     - Remove `CHARSET` and `COLLATE` statements
     - Replace backticks (`) with quotes (")
     - Save as `backup_postgres.sql`

3. **Import to Supabase:**
   - Go to Supabase SQL Editor
   - Create new query
   - Paste content from `backup_postgres.sql`
   - Click "Run"

### Option B: Using DataGrip or DBeaver

1. **Open DBeaver**
2. **Create MySQL connection** (if not exists)
3. **Create PostgreSQL connection** to Supabase
4. **Right-click MySQL database → Export → PostgreSQL**
5. **Select all tables**
6. **Export and save**
7. **Import to PostgreSQL** via DBeaver

### Option C: Using Java Data Migration Script

Create `DataMigration.java` in your project and run it:

```java
// See example in backend/DataMigrationService.java (created separately)
```

---

## STEP 6: Update Frontend Configuration (Optional)

If you're using Supabase Auth for frontend:

1. **Install Supabase client** (already done)
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Create Supabase config** in `frontend/src/utils/supabase.js`:
   ```javascript
   import { createClient } from '@supabase/supabase-js'
   
   const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
   const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
   
   export const supabase = createClient(supabaseUrl, supabaseAnonKey)
   ```

3. **Update frontend .env**:
   ```
   VITE_SUPABASE_URL=https://[project-id].supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

---

## STEP 7: Testing & Validation

### Test Database Connection

1. **Start your Spring Boot app**
   ```bash
   mvn spring-boot:run
   ```

2. **Check logs for errors**
   - Should see: "HikariPool started"
   - Should NOT see connection errors

3. **Test API endpoints**
   ```bash
   curl http://localhost:8082/api/users
   ```

### Verify Data Migration

```sql
-- Run in Supabase SQL Editor
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM rides;
SELECT COUNT(*) FROM bookings;
```

### Test CRUD Operations

1. Create a test user (POST)
2. Retrieve user (GET)
3. Update user (PUT)
4. Delete user (DELETE)

---

## STEP 8: Enum Handling in PostgreSQL

PostgreSQL uses ENUM types. If you get enum errors:

1. **Check enum creation** in Supabase SQL Editor:
   ```sql
   SELECT * FROM pg_enum;
   ```

2. **If enums exist, update Entity**:
   - JPA will automatically map Java ENUMs to PostgreSQL ENUMs
   - Ensure `@Enumerated(EnumType.STRING)` is used

---

## Important Differences: MySQL vs PostgreSQL

| Feature | MySQL | PostgreSQL |
|---------|-------|-----------|
| **Auto Increment** | AUTO_INCREMENT | SERIAL or GENERATED ALWAYS |
| **Boolean** | TINYINT(1) | BOOLEAN |
| **JSON** | JSON | JSONB |
| **Full Text Search** | FULLTEXT | tsvector |
| **Case Sensitivity** | Case-insensitive by default | Case-sensitive |
| **Transactions** | InnoDB required | Default ACID |

---

## Troubleshooting

### Issue: "Cannot connect to Supabase"
**Solution:**
- Verify connection string in application.properties
- Check IP whitelist in Supabase (Settings → Database → Connection pooling)
- Add your IP to allowed connections

### Issue: "Enum type not found"
**Solution:**
- Run all SQL from `supabase_migration.sql` again
- Check that enums are created in Supabase

### Issue: "Foreign key constraint fails"
**Solution:**
- Ensure all related tables exist before inserting data
- Insert parent table data first (Users → Rides → Bookings)

### Issue: "Column name not found"
**Solution:**
- Check naming strategy in application.properties
- Verify table names match exactly (PostgreSQL is case-sensitive)

---

## Configuration Files Changed

1. **pom.xml** - Added PostgreSQL dependency
2. **application.properties** - Updated database connection
3. **supabase_migration.sql** - Schema creation script

---

## Next Steps After Migration

1. **Set up Supabase Auth** (optional) - Replace JWT with Supabase Auth
2. **Enable Row Level Security (RLS)** - Secure data access
3. **Set up Supabase Realtime** - Real-time notifications
4. **Backup Strategy** - Configure daily backups in Supabase
5. **Monitor Performance** - Check query performance in Supabase dashboard

---

## Rollback Plan

If you need to rollback to MySQL:

1. Keep original MySQL database
2. Update connection string back to MySQL
3. Restart application
4. Data remains in both databases

---

## Support & Documentation

- **Supabase Docs**: https://supabase.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Spring Data JPA**: https://spring.io/projects/spring-data-jpa
