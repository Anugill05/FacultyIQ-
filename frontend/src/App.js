import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import OtpPage from './pages/auth/OtpPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTeachers from './pages/admin/AdminTeachers';
import AdminStudents from './pages/admin/AdminStudents';
import AdminWorkshops from './pages/admin/AdminWorkshops';
import AdminPerformance from './pages/admin/AdminPerformance';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import AdminAchievements from './pages/admin/AdminAchievements';

// Teacher
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherProfile from './pages/teacher/TeacherProfile';
import TeacherFeedback from './pages/teacher/TeacherFeedback';
import TeacherAchievements from './pages/teacher/TeacherAchievements';
import TeacherWorkshops from './pages/teacher/TeacherWorkshops';
import TeacherPerformance from './pages/teacher/TeacherPerformance';

// Student
import StudentDashboard from './pages/student/StudentDashboard';
import StudentTeachers from './pages/student/StudentTeachers';
import StudentTeacherProfile from './pages/student/StudentTeacherProfile';
import StudentFeedback from './pages/student/StudentFeedback';
import StudentMyFeedbacks from './pages/student/StudentMyFeedbacks';

import './styles/globals.css';

// ========== Protected Route ==========
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            border: '3px solid #e2e8f0',
            borderTopColor: '#1e3a8a',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#64748b', fontFamily: 'DM Sans, sans-serif' }}>Loading FacultyUp...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    const redirectMap = { admin: '/admin/dashboard', teacher: '/teacher/dashboard', student: '/student/dashboard' };
    return <Navigate to={redirectMap[user?.role] || '/login'} replace />;
  }

  return children;
};

// ========== Public Route (redirect if logged in) ==========
const PublicRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return null;

  if (isAuthenticated) {
    const redirectMap = { admin: '/admin/dashboard', teacher: '/teacher/dashboard', student: '/student/dashboard' };
    return <Navigate to={redirectMap[user?.role] || '/'} replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/verify-otp" element={<OtpPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Admin */}
      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/teachers" element={<ProtectedRoute allowedRoles={['admin']}><AdminTeachers /></ProtectedRoute>} />
      <Route path="/admin/students" element={<ProtectedRoute allowedRoles={['admin']}><AdminStudents /></ProtectedRoute>} />
      <Route path="/admin/workshops" element={<ProtectedRoute allowedRoles={['admin']}><AdminWorkshops /></ProtectedRoute>} />
      <Route path="/admin/performance" element={<ProtectedRoute allowedRoles={['admin']}><AdminPerformance /></ProtectedRoute>} />
      <Route path="/admin/announcements" element={<ProtectedRoute allowedRoles={['admin']}><AdminAnnouncements /></ProtectedRoute>} />
      <Route path="/admin/achievements" element={<ProtectedRoute allowedRoles={['admin']}><AdminAchievements /></ProtectedRoute>} />

      {/* Teacher */}
      <Route path="/teacher/dashboard" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />
      <Route path="/teacher/profile" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherProfile /></ProtectedRoute>} />
      <Route path="/teacher/feedback" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherFeedback /></ProtectedRoute>} />
      <Route path="/teacher/achievements" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherAchievements /></ProtectedRoute>} />
      <Route path="/teacher/workshops" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherWorkshops /></ProtectedRoute>} />
      <Route path="/teacher/performance" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherPerformance /></ProtectedRoute>} />

      {/* Student */}
      <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/teachers" element={<ProtectedRoute allowedRoles={['student']}><StudentTeachers /></ProtectedRoute>} />
      <Route path="/student/teachers/:id" element={<ProtectedRoute allowedRoles={['student']}><StudentTeacherProfile /></ProtectedRoute>} />
      <Route path="/student/feedback" element={<ProtectedRoute allowedRoles={['student']}><StudentFeedback /></ProtectedRoute>} />
      <Route path="/student/my-feedbacks" element={<ProtectedRoute allowedRoles={['student']}><StudentMyFeedbacks /></ProtectedRoute>} />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '14px',
              borderRadius: '10px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            },
            success: {
              style: { background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' },
              iconTheme: { primary: '#22c55e', secondary: '#fff' }
            },
            error: {
              style: { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' },
              iconTheme: { primary: '#ef4444', secondary: '#fff' }
            }
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
