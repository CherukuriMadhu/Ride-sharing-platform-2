# Smart Ride Sharing and Car Pooling Platform - Setup & Run Guide

## 📋 Prerequisites

Before running the application, ensure you have the following installed:

1. **Java Development Kit (JDK) 17 or higher**
   - Download from: https://www.oracle.com/java/technologies/downloads/
   - Verify: `java -version`

2. **Maven 3.6+**
   - Download from: https://maven.apache.org/download.cgi
   - Verify: `mvn -version`

3. **Node.js 18+ and npm**
   - Download from: https://nodejs.org/
   - Verify: `node -version` and `npm -version`

4. **MySQL 8.0+**
   - Download from: https://dev.mysql.com/downloads/mysql/
   - Verify: `mysql --version`

---

## 🗄️ Database Setup

### Step 1: Create Database

Open MySQL command line or MySQL Workbench and run:

```sql
CREATE DATABASE smartride;
```

### Step 2: Configure Database Connection

Edit `backend/src/main/resources/application.properties`:

```properties
# Update these with your MySQL credentials
spring.datasource.url=jdbc:mysql://localhost:3306/smartride
spring.datasource.username=YOUR_MYSQL_USERNAME
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

### Step 3: Configure Email (Optional but Recommended)

Update email settings in `application.properties`:

```properties
# Gmail SMTP Configuration
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=YOUR_EMAIL@gmail.com
spring.mail.password=YOUR_APP_PASSWORD
```

**Note:** For Gmail, you need to generate an App Password:
1. Go to Google Account Settings
2. Security → 2-Step Verification → App Passwords
3. Generate a new app password for "Mail"
4. Use that password in the configuration

---

## 🚀 Running the Application

### Option 1: Run Backend and Frontend Separately (Recommended for Development)

#### **Backend (Spring Boot)**

1. Open terminal in the project root directory
2. Navigate to backend folder:
   ```bash
   cd backend
   ```

3. Run the backend:
   ```bash
   mvn spring-boot:run
   ```

   **Alternative (if Maven is not in PATH):**
   ```bash
   ./mvnw spring-boot:run    # Linux/Mac
   .\mvnw.cmd spring-boot:run # Windows
   ```

4. Backend will start on: **http://localhost:8082**
5. Swagger API Docs: **http://localhost:8082/swagger-ui.html**

#### **Frontend (React + Vite)**

1. Open a **new terminal** in the project root
2. Navigate to frontend folder:
   ```bash
   cd frontend
   ```

3. Install dependencies (first time only):
   ```bash
   npm install
   ```

4. Run the frontend:
   ```bash
   npm run dev
   ```

5. Frontend will start on: **http://localhost:5173**

6. Open your browser and go to: **http://localhost:5173**

---

### Option 2: Production Build

#### **Backend**

```bash
cd backend
mvn clean package
java -jar target/smartride-0.0.1-SNAPSHOT.jar
```

#### **Frontend**

```bash
cd frontend
npm run build
npm run preview
```

---

## 🧪 Testing the Application

### 1. **Access the Homepage**
- Open: http://localhost:5173
- You should see the 7-section homepage with auto-slideshow

### 2. **Register as a Passenger**
- Click "Get Started" or "Register"
- Select "Passenger" role
- Complete the 4-step wizard:
  - Step 1: Personal Details
  - Step 2: Address
  - Step 3: Education
  - Step 4: Documents
- Submit and login

### 3. **Register as a Driver**
- Register with "Driver" role
- Complete all 4 steps including driver-specific documents
- **Note:** Driver accounts require admin approval

### 4. **Admin Access**
- **Default Admin Credentials** (created automatically):
  - Email: `admin@smartride.com`
  - Password: `admin123`
- Login and access Admin Dashboard
- Approve pending driver registrations

### 5. **Test Dashboards**
- **Admin Dashboard:** View analytics with graphs
- **Driver Dashboard:** Post rides, view earnings
- **Passenger Dashboard:** Search rides, view bookings

---

## 📊 API Documentation

Once the backend is running, access Swagger UI:

**URL:** http://localhost:8082/swagger-ui.html

Here you can:
- View all API endpoints
- Test endpoints directly
- See request/response schemas

---

## 🔧 Troubleshooting

### Backend Issues

**Problem:** `mvn: command not found`
- **Solution:** Use Maven Wrapper: `./mvnw spring-boot:run` (Linux/Mac) or `.\mvnw.cmd spring-boot:run` (Windows)

**Problem:** Database connection error
- **Solution:** 
  - Verify MySQL is running
  - Check database name, username, and password in `application.properties`
  - Ensure database `smartride` exists

**Problem:** Port 8082 already in use
- **Solution:** Change port in `application.properties`:
  ```properties
  server.port=8083
  ```
  Then update frontend API URL in `frontend/src/` files

### Frontend Issues

**Problem:** `npm: command not found`
- **Solution:** Install Node.js from https://nodejs.org/

**Problem:** Dependencies installation fails
- **Solution:** 
  ```bash
  npm cache clean --force
  npm install
  ```

**Problem:** CORS errors
- **Solution:** Backend CORS is configured for `http://localhost:5173`. If using different port, update `@CrossOrigin` in backend controllers

### Email Issues

**Problem:** Emails not sending
- **Solution:** 
  - Verify email credentials in `application.properties`
  - For Gmail, use App Password (not regular password)
  - Check spam folder
  - Email functionality is optional; app works without it

---

## 🎯 Quick Start Commands

**Terminal 1 (Backend):**
```bash
cd backend
mvn spring-boot:run
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm install
npm run dev
```

**Browser:**
```
http://localhost:5173
```

---

## 📱 Default Accounts

### Admin Account (Pre-created)
- **Email:** admin@smartride.com
- **Password:** admin123
- **Role:** ADMIN

### Test Accounts (Create via Registration)
- Register as Passenger (instant access)
- Register as Driver (requires admin approval)

---

## 🌐 Application URLs

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | React application |
| Backend API | http://localhost:8082 | Spring Boot REST API |
| Swagger Docs | http://localhost:8082/swagger-ui.html | API documentation |
| H2 Console | http://localhost:8082/h2-console | Database console (if H2 enabled) |

---

## ✅ Verification Checklist

After starting the application, verify:

- [ ] Backend running on port 8082
- [ ] Frontend running on port 5173
- [ ] Homepage loads with auto-slideshow
- [ ] Can register new user
- [ ] Can login with credentials
- [ ] Admin can access admin dashboard
- [ ] Dashboards show graphs
- [ ] Email notifications working (optional)

---

## 🎉 You're All Set!

The Smart Ride Sharing Platform is now running. Enjoy exploring all the features:

✅ 7-section homepage with animations  
✅ Role-based dashboards with real-time graphs  
✅ 4-step registration wizard  
✅ Admin approval workflows  
✅ Email notifications  
✅ Responsive design  

**Need help?** Contact: cherukurimadhu52@gmail.com

