# 🎓 FacultyUp — Capacity Building, Performance Assessment & Motivation Driven Tool for Faculty Upgradation

**Lovely Professional University (LPU) | Major Project**

A full-stack web application built with **Laravel 11** (backend), **React.js** (frontend), and **MongoDB** (database) for managing faculty performance, capacity building, and student feedback.

---

## 📸 Screenshots

| Landing Page | Admin Dashboard | Teacher Dashboard | Feedback Form |
|---|---|---|---|
| Hero with stats, features | Analytics with charts | Performance radar | Multi-criteria rating |

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Laravel 11, PHP 8.2+ |
| Frontend | React.js 18, React Router 6 |
| Database | MongoDB 7.x |
| Auth | JWT (tymon/jwt-auth) |
| Email | Laravel Mailer (SMTP/Gmail) |
| Charts | Recharts |
| Styling | Custom CSS Modules (no Tailwind) |

---

## 📁 Project Structure

```
facultyup/
├── backend/                    # Laravel 11 API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── Api/
│   │   │   │   │   ├── Auth/AuthController.php
│   │   │   │   │   ├── AdminController.php
│   │   │   │   │   ├── TeacherController.php
│   │   │   │   │   ├── StudentController.php
│   │   │   │   │   ├── AttendanceController.php
│   │   │   │   └── └──
│   │   │   └── Middleware/
│   │   │       ├── JwtMiddleware.php
│   │   │       └── RoleMiddleware.php
│   │   ├── Models/
│   │   │   ├── User.php
│   │   │   ├── Feedback.php
│   │   │   ├── Achievement.php
│   │   │   ├── Workshop.php
│   │   │   ├── WorkshopParticipant.php
│   │   │   ├── Attendance.php
│   │   │   ├── PerformanceScore.php
│   │   │   └── Announcement.php
│   │   └── Services/
│   │       ├── OtpService.php
│   │       ├── MailService.php
│   │       └── PerformanceService.php
│   ├── config/
│   │   ├── auth.php
│   │   ├── cors.php
│   │   ├── database.php
│   │   └── jwt.php
│   ├── database/seeders/
│   │   └── DatabaseSeeder.php
│   ├── routes/
│   │   ├── api.php
│   │   └── web.php
│   ├── bootstrap/app.php
│   ├── composer.json
│   └── .env.example
│
└── frontend/                   # React.js SPA
    ├── public/index.html
    └── src/
        ├── App.js
        ├── index.js
        ├── context/AuthContext.js
        ├── services/api.js
        ├── hooks/index.js
        ├── utils/helpers.js
        ├── styles/globals.css
        ├── components/
        │   ├── layout/
        │   │   ├── DashboardLayout.js
        │   │   ├── Sidebar.js
        │   │   └── Header.js
        │   └── common/
        │       ├── StatCard.js
        │       ├── Modal.js
        │       └── Common.js
        └── pages/
            ├── LandingPage.js
            ├── auth/
            │   ├── LoginPage.js
            │   ├── RegisterPage.js
            │   ├── OtpPage.js
            │   └── ForgotPasswordPage.js
            ├── admin/
            │   ├── AdminDashboard.js
            │   ├── AdminTeachers.js
            │   ├── AdminStudents.js
            │   ├── AdminWorkshops.js
            │   ├── AdminPerformance.js
            │   ├── AdminAnnouncements.js
            │   └── AdminAchievements.js
            ├── teacher/
            │   ├── TeacherDashboard.js
            │   ├── TeacherProfile.js
            │   ├── TeacherFeedback.js
            │   ├── TeacherAchievements.js
            │   ├── TeacherWorkshops.js
            │   └── TeacherPerformance.js
            └── student/
                ├── StudentDashboard.js
                ├── StudentTeachers.js
                ├── StudentTeacherProfile.js
                ├── StudentFeedback.js
                └── StudentMyFeedbacks.js
```

---

## ⚙️ Prerequisites

- **PHP** 8.2+
- **Composer** 2.x
- **Node.js** 18+ & **npm** 9+
- **MongoDB** 7.x (running locally or Atlas URI)
- **Git**

---

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-repo/facultyup.git
cd facultyup
```

---

### 2. Backend Setup (Laravel 11)

```bash
cd backend

# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Generate JWT secret
php artisan jwt:secret
```

#### Configure `.env`

```env
APP_NAME=FacultyUp
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

# MongoDB
DB_CONNECTION=mongodb
DB_HOST=127.0.0.1
DB_PORT=27017
DB_DATABASE=facultyup_db

# Gmail SMTP (create App Password in Google Account)
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-16-char-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@facultyup.lpu.in
MAIL_FROM_NAME="FacultyUp LPU"

OTP_EXPIRY=10
```

#### Seed the Database

```bash
# Make sure MongoDB is running, then:
php artisan db:seed

# This creates:
# - 1 Admin account
# - 6 Teacher accounts
# - 20 Student accounts
# - 5 Workshops
# - Achievements, Feedback, Attendance, Performance scores
# - Announcements
```

#### Start Backend Server

```bash
php artisan serve
# Runs at http://localhost:8000
```

#### Create Storage Link (for file uploads)

```bash
php artisan storage:link
```

---

### 3. Frontend Setup (React.js)

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env
echo "REACT_APP_API_URL=http://localhost:8000/api/v1" > .env

# Start development server
npm start
# Runs at http://localhost:3000
```

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | admin@lpu.in | Admin@123 |
| **Teacher** | priya.sharma@lpu.in | Teacher@123 |
| **Teacher** | amit.verma@lpu.in | Teacher@123 |
| **Student** | student1@lpu.in | Student@123 |

---

## 📊 Performance Score Formula

```
Overall Score = (Student Rating × 30%) +
                (Attendance     × 20%) +
                (Achievements   × 25%) +
                (Workshops      × 15%) +
                (Feedback Sent. × 10%)
```

| Score Range | Grade | Badge |
|---|---|---|
| 90–100 | A+ | ⭐ Star Performer |
| 80–89  | A  | 🏆 Excellence |
| 70–79  | B+ | 🚀 Rising Star |
| 60–69  | B  | ✅ Consistent |
| < 60   | C/D | 📈 Needs Improvement |

---

## 🌐 API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Student registration (sends OTP) |
| POST | `/api/v1/auth/verify-otp` | Verify OTP, activate account |
| POST | `/api/v1/auth/login` | Login (all roles) |
| POST | `/api/v1/auth/resend-otp` | Resend OTP |
| POST | `/api/v1/auth/forgot-password` | Send password reset OTP |
| POST | `/api/v1/auth/reset-password` | Reset password with OTP |
| GET  | `/api/v1/auth/me` | Get current user |
| POST | `/api/v1/auth/logout` | Logout |

### Admin (requires `role:admin`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/admin/dashboard` | Analytics overview |
| GET/POST | `/api/v1/admin/teachers` | List / Create teachers |
| PUT/DELETE | `/api/v1/admin/teachers/{id}` | Update / Delete teacher |
| GET | `/api/v1/admin/students` | List students |
| GET/POST | `/api/v1/admin/workshops` | List / Create workshops |
| POST | `/api/v1/admin/performance/generate` | Calculate performance scores |
| GET | `/api/v1/admin/performance/reports` | View performance reports |
| GET | `/api/v1/admin/achievements/pending` | Pending verifications |
| PUT | `/api/v1/admin/achievements/{id}/verify` | Verify achievement |
| GET/POST | `/api/v1/admin/announcements` | Manage announcements |

### Teacher (requires `role:teacher`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/teacher/dashboard` | Teacher dashboard data |
| GET/POST | `/api/v1/teacher/profile` | View / Update profile |
| GET | `/api/v1/teacher/feedbacks` | View received feedback |
| GET/POST | `/api/v1/teacher/achievements` | View / Upload achievements |
| POST | `/api/v1/teacher/workshops/{id}/join` | Join a workshop |
| GET | `/api/v1/teacher/workshops` | My workshops |
| GET | `/api/v1/teacher/performance` | Performance history |

### Student (requires `role:student`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/student/dashboard` | Student dashboard |
| GET | `/api/v1/student/teachers` | Browse teachers |
| GET | `/api/v1/student/teachers/{id}` | Teacher profile & reviews |
| POST | `/api/v1/student/feedback` | Submit feedback |
| GET | `/api/v1/student/feedbacks` | My submitted feedbacks |

---

## 🔧 Key Features

### 🔐 Authentication
- Email OTP verification using SMTP/Gmail (Nodemailer-equivalent)
- JWT-based stateless authentication
- Role-based access control (Admin / Teacher / Student)
- Forgot password via OTP flow

### 📊 Performance Assessment
- Weighted scoring: Student Rating (30%), Attendance (20%), Achievements (25%), Workshops (15%), Feedback Sentiment (10%)
- Automated grade assignment (A+, A, B+, B, C, D)
- Department-wise ranking
- Historical performance tracking with Recharts visualisations

### 💬 Feedback System
- Multi-dimensional rating (Teaching Quality, Communication, Subject Knowledge, Student Interaction, Punctuality)
- Anonymous submission option
- Sentiment analysis for comments
- One feedback per teacher per semester per student

### 🏅 Achievement Portfolio
- Category-wise uploads: Publications, Awards, Certifications, Conferences, Patents, Projects
- File uploads (PDF/images) to Laravel storage
- Admin verification workflow
- Point-based scoring system

### 🎯 Workshop Management
- Full CRUD by admin
- Online/Offline/Hybrid modes
- Participant capacity management
- Certificate and points tracking

---

## 🛠️ Development Notes

### Adding a New API Route
1. Add route in `backend/routes/api.php`
2. Create/update controller in `backend/app/Http/Controllers/Api/`
3. Add API function in `frontend/src/services/api.js`
4. Create React page/component

### MongoDB Collections
- `users` — All users (admin, teacher, student)
- `feedbacks` — Student feedback records
- `achievements` — Faculty achievement uploads
- `workshops` — Workshop listings
- `workshop_participants` — Join records
- `attendances` — Monthly attendance
- `performance_scores` — Calculated scores
- `announcements` — Admin announcements

---

## 📧 Email Setup (Gmail)

1. Enable 2-Step Verification on your Google account
2. Go to **Google Account → Security → App Passwords**
3. Create an App Password for "Mail"
4. Use the 16-character password in `.env` as `MAIL_PASSWORD`

---

## 🐛 Troubleshooting

| Issue | Fix |
|---|---|
| `MongoDB connection refused` | Ensure MongoDB is running: `mongod --dbpath /data/db` |
| `JWT Secret not set` | Run `php artisan jwt:secret` |
| `CORS error` | Check `FRONTEND_URL` in `.env` matches your React port |
| `OTP not received` | Check Gmail App Password and spam folder |
| `Storage link broken` | Run `php artisan storage:link` |
| `npm start fails` | Delete `node_modules` and run `npm install` again |

---

## 👥 Roles Overview

### 🔴 Admin
- Full dashboard with analytics (bar charts, pie charts, department stats)
- Create/edit/delete faculty accounts (auto-sends welcome email)
- Manage workshops and training programs
- Generate performance reports for all faculty
- Verify achievement submissions
- Post announcements to faculty/students

### 🟡 Teacher
- Personal performance dashboard with radar chart
- View student feedback with sentiment breakdown
- Upload achievements (publications, awards, certifications, patents)
- Join/track workshops
- Performance history with trend charts
- Motivation badges (Star Performer, Excellence, Rising Star, etc.)

### 🟢 Student
- Browse faculty directory with search/filter
- View detailed teacher profiles with rating breakdown
- Submit structured multi-criteria feedback
- Anonymous feedback option
- View own feedback history
- See announcements and upcoming events

---

## 📝 License

MIT License — Lovely Professional University, 2024

---

## 🙏 Acknowledgements

Built for the LPU major project requirement on **Capacity Building, Performance Assessment and Motivation Driven Tool for Faculty Upgradation**.

Technologies used: Laravel 11, React 18, MongoDB, JWT Auth, Recharts, CSS Modules.
