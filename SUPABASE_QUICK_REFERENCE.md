# SUPABASE MIGRATION - QUICK REFERENCE

## 📋 Quick Steps Summary

### 1️⃣ CREATE SUPABASE PROJECT
```
1. Go to https://supabase.com
2. Create new project
3. Save credentials (password, URL, keys)
```

### 2️⃣ CREATE SUPABASE TABLES
```
1. Copy code from: supabase_migration.sql
2. Go to Supabase → SQL Editor
3. Create new query → Paste code → Run
```

### 3️⃣ UPDATE BACKEND CONFIG
```properties
spring.datasource.url=jdbc:postgresql://[HOST]:5432/postgres
spring.datasource.username=postgres
spring.datasource.password=[YOUR_PASSWORD]
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=validate
```

### 4️⃣ BUILD & RESTART BACKEND
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### 5️⃣ MIGRATE DATA
**Option A: Manual SQL Export/Import**
```bash
# Export from MySQL
mysqldump -u root -p smartride > backup.sql

# Convert MySQL to PostgreSQL syntax
# Then import via Supabase SQL Editor
```

**Option B: Using API Endpoint**
```bash
# Start your backend, then call:
curl -X POST http://localhost:8082/api/migration/migrate-to-supabase
```

---

## 🔧 CONFIGURATION DETAILS

### Supabase Connection String
**Format:**
```
postgresql://postgres:[password]@[host]:5432/postgres?sslmode=require
```

**Where to find:**
- Supabase Dashboard → Settings → Database → Connection string

### Environment Variables (Production)
```bash
SUPABASE_DATABASE_URL=postgresql://...
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=...
SUPABASE_URL=https://[project].supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

---

## ✅ VERIFICATION CHECKLIST

After migration, verify:

- [ ] Backend starts without connection errors
- [ ] Can create new user via POST /api/users/register
- [ ] Can login via POST /api/auth/login
- [ ] Can retrieve users via GET /api/users
- [ ] Can create ride via POST /api/rides
- [ ] Stripe payments work (if enabled)
- [ ] WebSocket notifications work
- [ ] All user data appears in Supabase dashboard

---

## 🚨 TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| Connection refused | Verify host, port, password in connection string |
| Table not found | Run all SQL from supabase_migration.sql |
| Enum not found | Drop table and recreate with full SQL script |
| Foreign key error | Import parent tables first (Users → Rides → Bookings) |
| Case sensitivity | PostgreSQL is case-sensitive; check table names |

---

## 📁 FILES CREATED/MODIFIED

| File | Purpose |
|------|---------|
| supabase_migration.sql | SQL schema for all tables |
| application-supabase.properties | Configuration for PostgreSQL |
| SupabaseConfig.java | Configuration class |
| DataMigrationService.java | Data migration logic |
| MigrationController.java | API endpoints for migration |
| SUPABASE_MIGRATION_GUIDE.md | Detailed step-by-step guide |

---

## 🔑 KEY DIFFERENCES: MySQL → PostgreSQL

| Feature | MySQL | PostgreSQL |
|---------|-------|-----------|
| **BIGINT AUTO_INCREMENT** | AUTO_INCREMENT | BIGSERIAL |
| **Naming** | snake_case (default) | MUST specify |
| **Enums** | VARCHAR + CHECK | Native ENUM type |
| **JSON** | JSON | JSONB (better) |
| **Case Sensitivity** | Case-insensitive | Case-sensitive ⚠️ |
| **Foreign Keys** | Optional | Enforced |
| **Transactions** | With InnoDB | Default ACID |

---

## 🔐 SECURITY TIPS

1. **Never commit credentials** to git
   ```bash
   echo "application.properties" >> .gitignore
   ```

2. **Use environment variables** in production
   ```java
   @Value("${SUPABASE_DATABASE_URL}")
   private String databaseUrl;
   ```

3. **Enable Row Level Security (RLS)** in Supabase
   - Tables already have RLS enabled in migration SQL
   - Configure policies in Supabase Dashboard

4. **Backup your data**
   - Supabase: Automatic daily backups (check Dashboard)
   - MySQL: Export before migration

---

## 📞 SUPPORT RESOURCES

- **Supabase Docs**: https://supabase.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/14/
- **Spring Data JPA**: https://spring.io/projects/spring-data-jpa
- **Hibernate PostgreSQL**: https://hibernate.org/orm/

---

## ✨ NEXT STEPS (OPTIONAL)

1. **Use Supabase Auth** - Replace JWT with Supabase authentication
2. **Enable Realtime** - Real-time subscriptions for notifications
3. **Storage Bucket** - Store files (documents, photos) in Supabase Storage
4. **Functions** - Create serverless functions for business logic
5. **Monitoring** - Set up alerts for slow queries

---

**Last Updated:** June 23, 2024  
**Migration Version:** 1.0  
**Status:** Ready for Production ✅
